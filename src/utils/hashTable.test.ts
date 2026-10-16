import test from 'node:test';
import assert from 'node:assert/strict';
import { computePolynomialHash, CustomHashTable, normalizeKey } from './hashTable.ts';
import { BinarySearchTree } from './bst.ts';
import { ContactDirectory } from './contactDirectory.ts';
import { parseCSVContacts, exportContactsToCSV } from './csvVcfParser.ts';

test('Slide 8 Example: CAT polynomial hash with m=8 yields 82806 and Bucket [6]', () => {
  const result = computePolynomialHash('CAT', 8);

  assert.equal(result.terms.length, 3);
  assert.equal(result.terms[0].char, 'C');
  assert.equal(result.terms[0].ascii, 67);
  assert.equal(result.terms[0].termValue, '67');

  assert.equal(result.terms[1].char, 'A');
  assert.equal(result.terms[1].ascii, 65);
  assert.equal(result.terms[1].termValue, '2015'); // 65 * 31

  assert.equal(result.terms[2].char, 'T');
  assert.equal(result.terms[2].ascii, 84);
  assert.equal(result.terms[2].termValue, '80724'); // 84 * 961

  assert.equal(result.rawHashBigInt, '82806');
  assert.equal(result.bucketIndex, 6); // 82806 mod 8 = 6
});

test('CustomHashTable: Insert, Search, and Update', () => {
  const table = new CustomHashTable<string>(8);
  assert.equal(table.getCapacity(), 8);
  assert.equal(table.size(), 0);

  // Insert Alice
  const res1 = table.insert('Alice', '555-0101');
  assert.equal(table.size(), 1);
  assert.equal(res1.replaced, false);

  // Search Alice
  const s1 = table.search('Alice');
  assert.equal(s1.found, true);
  assert.equal(s1.value, '555-0101');

  // Search case insensitive normalization
  const s1Lower = table.search('alice');
  assert.equal(s1Lower.found, true);
  assert.equal(s1Lower.value, '555-0101');

  // Search non-existent
  const s2 = table.search('NonExistent');
  assert.equal(s2.found, false);

  // Update Alice
  const resUpdate = table.insert('Alice', '555-9999');
  assert.equal(resUpdate.replaced, true);
  assert.equal(table.size(), 1);
  assert.equal(table.search('Alice').value, '555-9999');
});

test('CustomHashTable: Collision resolution via separate chaining', () => {
  const table = new CustomHashTable<string>(16);

  // Find two keys that map to the same bucket
  const key1 = 'alpha';
  const h1 = computePolynomialHash(normalizeKey(key1), 16).bucketIndex;

  // Let's insert multiple keys
  table.insert('alpha', 'val_alpha');
  table.insert('beta', 'val_beta');
  table.insert('gamma', 'val_gamma');
  table.insert('delta', 'val_delta');

  assert.equal(table.search('alpha').value, 'val_alpha');
  assert.equal(table.search('beta').value, 'val_beta');
  assert.equal(table.search('gamma').value, 'val_gamma');
  assert.equal(table.search('delta').value, 'val_delta');
});

test('CustomHashTable: Dynamic auto-resizing when load factor reaches 0.75', () => {
  // Start with capacity 8. Threshold 0.75 means at 6 items (6/8 = 0.75), it must double to 16
  const table = new CustomHashTable<number>(8, 0.75);
  assert.equal(table.getCapacity(), 8);

  const keys = ['K1', 'K2', 'K3', 'K4', 'K5'];
  for (let i = 0; i < keys.length; i++) {
    table.insert(keys[i], i);
  }
  // 5 items in cap 8: load factor = 5/8 = 0.625 < 0.75
  assert.equal(table.getCapacity(), 8);
  assert.equal(table.size(), 5);

  // Inserting 6th item: projected load factor = 6/8 = 0.75 -> triggers rehash!
  const res6 = table.insert('K6', 6);
  assert.equal(res6.rehashed, true);
  assert.equal(table.getCapacity(), 16);
  assert.equal(table.size(), 6);
  assert.equal(table.getRehashCount(), 1);

  // Verify all previously inserted items are still retrievable
  for (let i = 0; i < keys.length; i++) {
    const s = table.search(keys[i]);
    assert.equal(s.found, true);
    assert.equal(s.value, i);
  }
  assert.equal(table.search('K6').value, 6);
});

test('CustomHashTable: Deletion properly removes node and unlinks chain', () => {
  const table = new CustomHashTable<string>(8);
  table.insert('ItemA', 'A');
  table.insert('ItemB', 'B');
  assert.equal(table.size(), 2);

  const delRes = table.delete('ItemA');
  assert.equal(delRes.deleted, true);
  assert.equal(table.size(), 1);

  const sA = table.search('ItemA');
  assert.equal(sA.found, false);

  const sB = table.search('ItemB');
  assert.equal(sB.found, true);
  assert.equal(sB.value, 'B');
});

test('BinarySearchTree: Insert and Search', () => {
  const bst = new BinarySearchTree<string>();
  bst.insert('David', 'val_david');
  bst.insert('Alice', 'val_alice');
  bst.insert('Frank', 'val_frank');

  assert.equal(bst.size(), 3);
  const sAlice = bst.search('Alice');
  assert.equal(sAlice.found, true);
  assert.equal(sAlice.value, 'val_alice');
  assert.ok(sAlice.comparisons >= 1);

  const sMissing = bst.search('Zach');
  assert.equal(sMissing.found, false);
});

test('ContactDirectory: Dual-index lookups and CRUD consistency', () => {
  const dir = new ContactDirectory(16);
  const initialCount = dir.getAllContacts().length;
  assert.ok(initialCount >= 7);

  // Search by exact name
  const nameSearch = dir.search('Alice Smith');
  assert.equal(nameSearch.lookupMethod, 'O(1) Hash Table Name Index');
  assert.equal(nameSearch.exactNameHit?.name, 'Alice Smith');

  // Search by phone
  const phoneSearch = dir.search('+1 555-0142');
  assert.equal(phoneSearch.lookupMethod, 'O(1) Hash Table Phone Index');
  assert.equal(phoneSearch.exactPhoneHit?.name, 'Alice Smith');

  // Add new contact
  const addRes = dir.addContact({
    id: 'test_new_1',
    name: 'Ada Lovelace',
    phone: '+1 555-9001',
    email: 'ada@computing.org',
    group: 'VIP',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  assert.equal(addRes.success, true);
  assert.equal(dir.getAllContacts().length, initialCount + 1);

  // Verify lookup of new contact
  const searchAda = dir.search('Ada Lovelace');
  assert.equal(searchAda.exactNameHit?.name, 'Ada Lovelace');

  // Update contact name
  const updateRes = dir.updateContact({
    id: 'test_new_1',
    name: 'Augusta Ada King',
    phone: '+1 555-9001',
    email: 'ada@computing.org',
    group: 'VIP',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  assert.equal(updateRes.success, true);

  // Old name should no longer be in hash table
  const searchOld = dir.search('Ada Lovelace');
  assert.equal(searchOld.exactNameHit, undefined);

  // New name is found
  const searchNew = dir.search('Augusta Ada King');
  assert.equal(searchNew.exactNameHit?.name, 'Augusta Ada King');

  // Delete contact
  const delSuccess = dir.deleteContact('test_new_1');
  assert.equal(delSuccess, true);
  assert.equal(dir.getAllContacts().length, initialCount);
});

test('CSV Parser and Exporter', () => {
  const csvData = `Name,Phone,Email,Group,Notes
"Test User","+1 555-7788","test@domain.com","Work","VIP Lead"`;

  const parsed = parseCSVContacts(csvData);
  assert.equal(parsed.errors.length, 0);
  assert.equal(parsed.contacts.length, 1);
  assert.equal(parsed.contacts[0].name, 'Test User');
  assert.equal(parsed.contacts[0].phone, '+1 555-7788');

  const exported = exportContactsToCSV(parsed.contacts);
  assert.ok(exported.includes('Test User'));
  assert.ok(exported.includes('+1 555-7788'));
});
