import type { Contact } from '../types/contact';

export interface ParseResult {
  contacts: Contact[];
  errors: string[];
  totalParsed: number;
}

/**
 * Parse CSV text into validated Contact records
 */
export function parseCSVContacts(csvContent: string): ParseResult {
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  const contacts: Contact[] = [];
  const errors: string[] = [];

  if (lines.length === 0) {
    return { contacts: [], errors: ['CSV content is empty'], totalParsed: 0 };
  }

  // Header parsing
  const headerLine = lines[0].toLowerCase();
  const headers = headerLine.split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));

  const nameIdx = headers.findIndex(h => h.includes('name'));
  const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('mobile') || h.includes('tel'));
  const emailIdx = headers.findIndex(h => h.includes('email') || h.includes('mail'));
  const groupIdx = headers.findIndex(h => h.includes('group') || h.includes('category') || h.includes('tag'));
  const notesIdx = headers.findIndex(h => h.includes('note') || h.includes('desc'));

  if (nameIdx === -1 && phoneIdx === -1) {
    errors.push('CSV header must contain at least a "name" or "phone" column.');
    return { contacts: [], errors, totalParsed: 0 };
  }

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    // Handle standard CSV commas with basic quote escaping
    const cols: string[] = [];
    let insideQuotes = false;
    let currentCol = '';

    for (let c = 0; c < rawLine.length; c++) {
      const ch = rawLine[c];
      if (ch === '"' || ch === "'") {
        insideQuotes = !insideQuotes;
      } else if (ch === ',' && !insideQuotes) {
        cols.push(currentCol.trim().replace(/^["']|["']$/g, ''));
        currentCol = '';
      } else {
        currentCol += ch;
      }
    }
    cols.push(currentCol.trim().replace(/^["']|["']$/g, ''));

    const name = nameIdx !== -1 && cols[nameIdx] ? cols[nameIdx] : `Contact ${i}`;
    const phone = phoneIdx !== -1 && cols[phoneIdx] ? cols[phoneIdx] : '';
    const email = emailIdx !== -1 && cols[emailIdx] ? cols[emailIdx] : '';
    const group = groupIdx !== -1 && cols[groupIdx] ? cols[groupIdx] : 'General';
    const notes = notesIdx !== -1 && cols[notesIdx] ? cols[notesIdx] : '';

    if (!name.trim() && !phone.trim()) {
      errors.push(`Row ${i + 1}: Skipped row because both Name and Phone are empty.`);
      continue;
    }

    contacts.push({
      id: `imported_csv_${Date.now()}_${i}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      group: group.trim() || 'General',
      notes: notes.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isSample: false,
    });
  }

  return {
    contacts,
    errors,
    totalParsed: contacts.length,
  };
}

/**
 * Parse VCF (vCard format) into validated Contact records
 */
export function parseVCFContacts(vcfContent: string): ParseResult {
  const cards = vcfContent.split(/BEGIN:VCARD/i).filter(c => c.trim().length > 0);
  const contacts: Contact[] = [];
  const errors: string[] = [];

  cards.forEach((card, idx) => {
    const lines = card.split(/\r?\n/);
    let name = '';
    let phone = '';
    let email = '';
    let group = 'General';
    let notes = '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('FN:') || trimmed.startsWith('FN;')) {
        name = trimmed.replace(/^FN[^:]*:/i, '').trim();
      } else if (trimmed.startsWith('TEL') && !phone) {
        phone = trimmed.replace(/^TEL[^:]*:/i, '').trim();
      } else if (trimmed.startsWith('EMAIL') && !email) {
        email = trimmed.replace(/^EMAIL[^:]*:/i, '').trim();
      } else if (trimmed.startsWith('CATEGORIES:') || trimmed.startsWith('ORG:')) {
        group = trimmed.replace(/^(CATEGORIES|ORG)[^:]*:/i, '').trim();
      } else if (trimmed.startsWith('NOTE:')) {
        notes = trimmed.replace(/^NOTE[^:]*:/i, '').trim();
      }
    }

    if (!name && !phone) {
      errors.push(`Card ${idx + 1}: Skipped vCard because missing both Full Name (FN) and Telephone (TEL).`);
    } else {
      contacts.push({
        id: `imported_vcf_${Date.now()}_${idx}`,
        name: name || phone || `Contact ${idx + 1}`,
        phone,
        email,
        group: group || 'General',
        notes,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isSample: false,
      });
    }
  });

  return {
    contacts,
    errors,
    totalParsed: contacts.length,
  };
}

/**
 * Export contacts to standard CSV format
 */
export function exportContactsToCSV(contacts: Contact[]): string {
  const headers = ['Name', 'Phone', 'Email', 'Group', 'Notes'];
  const rows = contacts.map(c => [
    `"${(c.name || '').replace(/"/g, '""')}"`,
    `"${(c.phone || '').replace(/"/g, '""')}"`,
    `"${(c.email || '').replace(/"/g, '""')}"`,
    `"${(c.group || '').replace(/"/g, '""')}"`,
    `"${(c.notes || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

/**
 * Export contacts to standard VCF (vCard 3.0) format
 */
export function exportContactsToVCF(contacts: Contact[]): string {
  return contacts
    .map(c => {
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${c.name}`,
        c.phone ? `TEL;TYPE=CELL:${c.phone}` : '',
        c.email ? `EMAIL;TYPE=INTERNET:${c.email}` : '',
        `CATEGORIES:${c.group || 'General'}`,
        c.notes ? `NOTE:${c.notes}` : '',
        'END:VCARD',
      ]
        .filter(Boolean)
        .join('\r\n');
    })
    .join('\r\n\r\n');
}
