import type { Contact, HashTableStats } from '../types/contact';
import { CustomHashTable, normalizeKey, normalizePhone } from './hashTable';
import { INITIAL_SAMPLE_CONTACTS } from './sampleContacts';

export interface SearchResult {
  exactNameHit?: Contact;
  exactPhoneHit?: Contact;
  partialMatches: Contact[];
  lookupDurationUs: number;
  lookupMethod: 'O(1) Hash Table Name Index' | 'O(1) Hash Table Phone Index' | 'Fuzzy / Substring Fallback Scan' | 'None';
  bucketIndex?: number;
  chainSteps?: number;
  rawHash?: number;
}

export class ContactDirectory {
  private nameTable: CustomHashTable<Contact>;
  private phoneTable: CustomHashTable<Contact>;
  private contactList: Contact[];

  constructor(initialCapacity = 16) {
    this.nameTable = new CustomHashTable<Contact>(initialCapacity);
    this.phoneTable = new CustomHashTable<Contact>(initialCapacity);
    this.contactList = [];

    // Load initial samples
    this.loadSampleData();
  }

  public loadSampleData(): void {
    this.clearAll();
    for (const c of INITIAL_SAMPLE_CONTACTS) {
      this.addContact({ ...c });
    }
  }

  public clearAll(): void {
    this.nameTable.clear();
    this.phoneTable.clear();
    this.contactList = [];
  }

  public getAllContacts(): Contact[] {
    return [...this.contactList];
  }

  public getNameTable(): CustomHashTable<Contact> {
    return this.nameTable;
  }

  public getPhoneTable(): CustomHashTable<Contact> {
    return this.phoneTable;
  }

  public getStats(): {
    nameTableStats: HashTableStats;
    phoneTableStats: HashTableStats;
    totalContacts: number;
    sampleCount: number;
    userCount: number;
  } {
    const nameStats = this.nameTable.getStats();
    const phoneStats = this.phoneTable.getStats();
    const sampleCount = this.contactList.filter(c => c.isSample).length;

    return {
      nameTableStats: nameStats,
      phoneTableStats: phoneStats,
      totalContacts: this.contactList.length,
      sampleCount,
      userCount: this.contactList.length - sampleCount,
    };
  }

  /**
   * Add a contact with primary key checks and dual hash indexing
   */
  public addContact(contact: Contact): { success: boolean; error?: string } {
    const trimmedName = contact.name.trim();
    if (!trimmedName) {
      return { success: false, error: 'Full name is required.' };
    }

    // Check duplicate name
    const existingByName = this.nameTable.search(trimmedName);
    if (existingByName.found && existingByName.value?.id !== contact.id) {
      return { success: false, error: `A contact with name "${trimmedName}" already exists in the hash table.` };
    }

    // Check duplicate phone if provided
    const normPhone = normalizePhone(contact.phone);
    if (normPhone) {
      const existingByPhone = this.phoneTable.search(normPhone);
      if (existingByPhone.found && existingByPhone.value?.id !== contact.id) {
        return { success: false, error: `A contact with phone "${contact.phone}" already exists in the hash table.` };
      }
    }

    const newContact: Contact = {
      ...contact,
      name: trimmedName,
      phone: contact.phone.trim(),
      email: contact.email.trim(),
      group: contact.group.trim() || 'General',
      updatedAt: Date.now(),
      createdAt: contact.createdAt || Date.now(),
    };

    // Insert into Primary Name Hash Table
    this.nameTable.insert(trimmedName, newContact);

    // Insert into Phone Hash Table if phone exists
    if (normPhone) {
      this.phoneTable.insert(normPhone, newContact);
    }

    // Add or update in flat list
    const existingIdx = this.contactList.findIndex(c => c.id === newContact.id);
    if (existingIdx >= 0) {
      this.contactList[existingIdx] = newContact;
    } else {
      this.contactList.unshift(newContact);
    }

    return { success: true };
  }

  /**
   * Update an existing contact, properly re-indexing if key changed
   */
  public updateContact(updated: Contact): { success: boolean; error?: string } {
    const oldIndex = this.contactList.findIndex(c => c.id === updated.id);
    if (oldIndex === -1) {
      return { success: false, error: 'Contact ID not found.' };
    }

    const oldContact = this.contactList[oldIndex];
    const oldNameNorm = normalizeKey(oldContact.name);
    const newNameNorm = normalizeKey(updated.name);

    const oldPhoneNorm = normalizePhone(oldContact.phone);
    const newPhoneNorm = normalizePhone(updated.phone);

    // If name changed, check uniqueness
    if (oldNameNorm !== newNameNorm) {
      const existing = this.nameTable.search(updated.name);
      if (existing.found && existing.value?.id !== updated.id) {
        return { success: false, error: `Name "${updated.name}" is already used by another contact.` };
      }
    }

    // If phone changed, check uniqueness
    if (newPhoneNorm && oldPhoneNorm !== newPhoneNorm) {
      const existing = this.phoneTable.search(newPhoneNorm);
      if (existing.found && existing.value?.id !== updated.id) {
        return { success: false, error: `Phone "${updated.phone}" is already used by another contact.` };
      }
    }

    // Remove old keys from hash tables
    if (oldNameNorm) {
      this.nameTable.delete(oldContact.name);
    }
    if (oldPhoneNorm) {
      this.phoneTable.delete(oldPhoneNorm);
    }

    const finalized: Contact = {
      ...updated,
      name: updated.name.trim(),
      phone: updated.phone.trim(),
      email: updated.email.trim(),
      group: updated.group.trim() || 'General',
      updatedAt: Date.now(),
    };

    // Re-insert into hash tables with new keys
    this.nameTable.insert(finalized.name, finalized);
    if (newPhoneNorm) {
      this.phoneTable.insert(newPhoneNorm, finalized);
    }

    this.contactList[oldIndex] = finalized;
    return { success: true };
  }

  /**
   * Delete contact by ID
   */
  public deleteContact(id: string): boolean {
    const index = this.contactList.findIndex(c => c.id === id);
    if (index === -1) return false;

    const contact = this.contactList[index];
    this.nameTable.delete(contact.name);

    const normPhone = normalizePhone(contact.phone);
    if (normPhone) {
      this.phoneTable.delete(normPhone);
    }

    this.contactList.splice(index, 1);
    return true;
  }

  /**
   * Batch deletion
   */
  public batchDelete(ids: string[]): number {
    let deletedCount = 0;
    for (const id of ids) {
      if (this.deleteContact(id)) {
        deletedCount++;
      }
    }
    return deletedCount;
  }

  /**
   * Search contact: first attempts O(1) custom Hash Table search (Name then Phone),
   * then falls back to substring / fuzzy match on email/group.
   */
  public search(rawQuery: string): SearchResult {
    const query = rawQuery.trim();
    if (!query) {
      return {
        partialMatches: this.contactList,
        lookupDurationUs: 0,
        lookupMethod: 'None',
      };
    }

    const t0 = performance.now();

    // 1. Try exact match in Name Hash Table (O(1))
    const nameSearch = this.nameTable.search(query);
    if (nameSearch.found && nameSearch.value) {
      const t1 = performance.now();
      return {
        exactNameHit: nameSearch.value,
        partialMatches: [nameSearch.value],
        lookupDurationUs: Number(((t1 - t0) * 1000).toFixed(2)),
        lookupMethod: 'O(1) Hash Table Name Index',
        bucketIndex: nameSearch.bucketIndex,
        chainSteps: nameSearch.chainSteps,
        rawHash: nameSearch.rawHash,
      };
    }

    // 2. Try exact match in Phone Hash Table (O(1))
    const phoneNorm = normalizePhone(query);
    if (phoneNorm) {
      const phoneSearch = this.phoneTable.search(phoneNorm);
      if (phoneSearch.found && phoneSearch.value) {
        const t1 = performance.now();
        return {
          exactPhoneHit: phoneSearch.value,
          partialMatches: [phoneSearch.value],
          lookupDurationUs: Number(((t1 - t0) * 1000).toFixed(2)),
          lookupMethod: 'O(1) Hash Table Phone Index',
          bucketIndex: phoneSearch.bucketIndex,
          chainSteps: phoneSearch.chainSteps,
          rawHash: phoneSearch.rawHash,
        };
      }
    }

    // 3. Fallback: Linear substring match across name, phone, email, group (Phase 3 Roadmap feature)
    const lowerQ = query.toLowerCase();
    const partials = this.contactList.filter(
      c =>
        c.name.toLowerCase().includes(lowerQ) ||
        c.phone.toLowerCase().includes(lowerQ) ||
        c.email.toLowerCase().includes(lowerQ) ||
        c.group.toLowerCase().includes(lowerQ)
    );
    const t1 = performance.now();

    return {
      partialMatches: partials,
      lookupDurationUs: Number(((t1 - t0) * 1000).toFixed(2)),
      lookupMethod: 'Fuzzy / Substring Fallback Scan',
    };
  }

  /**
   * Bulk import contacts
   */
  public importContacts(incoming: Contact[]): { added: number; duplicates: number } {
    let added = 0;
    let duplicates = 0;

    for (const c of incoming) {
      const res = this.addContact(c);
      if (res.success) {
        added++;
      } else {
        duplicates++;
      }
    }

    return { added, duplicates };
  }
}
