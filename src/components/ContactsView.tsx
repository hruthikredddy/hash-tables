import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Upload,
  Download,
  Trash2,
  Edit3,
  Hash,
  Filter,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Zap,
  Info,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import type { Contact } from '../types/contact';
import type { SearchResult } from '../utils/contactDirectory';

interface ContactsViewProps {
  contacts: Contact[];
  searchResult: SearchResult;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
  onBatchDelete: (ids: string[]) => void;
  onOpenDetailModal: (contact: Contact) => void;
  onOpenImportModal: () => void;
  onResetSamples: () => void;
  capacity: number;
}

const ITEMS_PER_PAGE = 8;

export const ContactsView: React.FC<ContactsViewProps> = ({
  contacts,
  searchResult,
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteContact,
  onBatchDelete,
  onOpenDetailModal,
  onOpenImportModal,
  onResetSamples,
  capacity,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [sortField, setSortField] = useState<'name' | 'phone' | 'group' | 'createdAt'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Extract distinct groups
  const allGroups = useMemo(() => {
    const set = new Set<string>();
    contacts.forEach(c => {
      if (c.group) set.add(c.group);
    });
    return ['All', ...Array.from(set).sort()];
  }, [contacts]);

  // Filter & sort
  const filteredContacts = useMemo(() => {
    let list = searchResult.partialMatches;

    if (selectedGroup !== 'All') {
      list = list.filter(c => c.group.toLowerCase() === selectedGroup.toLowerCase());
    }

    return [...list].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [searchResult.partialMatches, selectedGroup, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredContacts.length / ITEMS_PER_PAGE));
  const paginatedContacts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredContacts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredContacts, currentPage]);

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedContacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedContacts.map(c => c.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleBatchDeleteClick = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Delete ${selectedIds.size} selected contact(s)?`)) {
      onBatchDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        {/* Search Bar & Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                onSearchChange(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by full name, phone number, email, or category..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            {selectedIds.size > 0 && (
              <button
                onClick={handleBatchDeleteClick}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-medium shadow-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedIds.size})</span>
              </button>
            )}

            <button
              onClick={onOpenImportModal}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Import / Export</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Contact</span>
            </button>
          </div>
        </div>

        {/* Group Filter Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 text-xs font-medium shrink-0 flex items-center mr-1">
            <Filter className="w-3.5 h-3.5 mr-1 text-slate-500" />
            Filter:
          </span>
          {allGroups.map(grp => (
            <button
              key={grp}
              onClick={() => {
                setSelectedGroup(grp);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                selectedGroup === grp
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {grp}
            </button>
          ))}
        </div>

        {/* Search Engine Feedback Banner */}
        {searchQuery && (
          <div
            className={`p-3 rounded-lg border text-xs flex items-center justify-between font-mono ${
              searchResult.lookupMethod.includes('O(1)')
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-indigo-50 border-indigo-200 text-indigo-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Search Engine: <strong>{searchResult.lookupMethod}</strong>
                {searchResult.bucketIndex !== undefined && (
                  <span className="ml-2 font-semibold">
                    → Bucket [{searchResult.bucketIndex}]
                  </span>
                )}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-700">
                Duration: {searchResult.lookupDurationUs} µs
              </span>
              <span className="text-slate-500 ml-2">
                ({filteredContacts.length} record{filteredContacts.length === 1 ? '' : 's'})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Contacts Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {paginatedContacts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-10 text-center">
                    <button
                      onClick={toggleSelectAll}
                      aria-label="Select all contacts on page"
                      className="text-slate-400 hover:text-slate-600"
                    >
                      {selectedIds.size > 0 && selectedIds.size === paginatedContacts.length ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                    onClick={() => {
                      if (sortField === 'name') {
                        setSortDirection(d => (d === 'asc' ? 'desc' : 'asc'));
                      } else {
                        setSortField('name');
                        setSortDirection('asc');
                      }
                    }}
                  >
                    Contact Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                    onClick={() => {
                      if (sortField === 'phone') {
                        setSortDirection(d => (d === 'asc' ? 'desc' : 'asc'));
                      } else {
                        setSortField('phone');
                        setSortDirection('asc');
                      }
                    }}
                  >
                    Phone Key {sortField === 'phone' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-3 px-4">Email</th>
                  <th
                    className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                    onClick={() => {
                      if (sortField === 'group') {
                        setSortDirection(d => (d === 'asc' ? 'desc' : 'asc'));
                      } else {
                        setSortField('group');
                        setSortDirection('asc');
                      }
                    }}
                  >
                    Group {sortField === 'group' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-3 px-4 text-right">Actions & Hash Trace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedContacts.map(contact => {
                  const isSelected = selectedIds.has(contact.id);

                  return (
                    <tr
                      key={contact.id}
                      className={`hover:bg-indigo-50/30 transition-colors ${
                        isSelected ? 'bg-indigo-50/50' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => toggleSelectOne(contact.id)}
                          aria-label={`Select contact ${contact.name}`}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0 border border-slate-200">
                            {contact.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <button
                              onClick={() => onOpenDetailModal(contact)}
                              className="font-medium text-slate-900 hover:text-indigo-600 text-left transition-colors"
                            >
                              {contact.name}
                            </button>
                            {contact.isSample && (
                              <span className="ml-2 text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-500">
                                PPT Sample
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {contact.phone || '—'}
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] truncate max-w-[180px]">
                        {contact.email || '—'}
                      </td>

                      {/* Group */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            contact.group === 'Work'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : contact.group === 'VIP'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : contact.group === 'Family'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : contact.group === 'Emergency'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {contact.group || 'General'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center space-x-1">
                          <button
                            onClick={() => onOpenDetailModal(contact)}
                            title="Inspect Hash Bucket Telemetry"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded"
                            aria-label={`Inspect hash for ${contact.name}`}
                          >
                            <Hash className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenEditModal(contact)}
                            title="Edit Contact"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                            aria-label={`Edit ${contact.name}`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete contact ${contact.name}?`)) {
                                onDeleteContact(contact.id);
                              }
                            }}
                            title="Delete Contact"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                            aria-label={`Delete ${contact.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-900 mb-1">No contacts found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              {searchQuery
                ? `No contact record in the hash table matched query "${searchQuery}".`
                : 'The contact directory is currently empty.'}
            </p>
            <div className="flex items-center justify-center space-x-3">
              {searchQuery ? (
                <button
                  onClick={() => onSearchChange('')}
                  className="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200"
                >
                  Clear Search
                </button>
              ) : (
                <button
                  onClick={onResetSamples}
                  className="px-3.5 py-1.5 text-xs bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
                >
                  Load PPT Demonstration Contacts
                </button>
              )}
            </div>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <div>
            Showing{' '}
            <span className="font-medium text-slate-700">
              {filteredContacts.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium text-slate-700">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredContacts.length)}
            </span>{' '}
            of <span className="font-medium text-slate-700">{filteredContacts.length}</span>{' '}
            contacts
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="p-1.5 rounded border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-mono text-xs font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className="p-1.5 rounded border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
