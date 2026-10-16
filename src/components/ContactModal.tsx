import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import type { Contact } from '../types/contact';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    success: boolean;
    error?: string;
  };
  contactToEdit?: Contact | null;
}

const DEFAULT_GROUPS = ['Work', 'Family', 'Friends', 'VIP', 'Emergency', 'General', 'Clients'];

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  onSave,
  contactToEdit,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [group, setGroup] = useState('General');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (contactToEdit) {
      setName(contactToEdit.name);
      setPhone(contactToEdit.phone);
      setEmail(contactToEdit.email);
      setGroup(contactToEdit.group || 'General');
      setNotes(contactToEdit.notes || '');
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setGroup('General');
      setNotes('');
    }
    setValidationError(null);
  }, [contactToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setValidationError('Full Name is required for hash indexing.');
      return;
    }

    if (!phone.trim() && !email.trim()) {
      setValidationError('Please provide either a Phone number or an Email address.');
      return;
    }

    const res = onSave({
      id: contactToEdit ? contactToEdit.id : undefined,
      name: trimmedName,
      phone: phone.trim(),
      email: email.trim(),
      group: group.trim() || 'General',
      notes: notes.trim(),
    });

    if (res.success) {
      onClose();
    } else if (res.error) {
      setValidationError(res.error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 id="contact-modal-title" className="text-base font-semibold text-slate-900">
              {contactToEdit ? 'Edit Contact Record' : 'Add New Contact'}
            </h2>
            <p className="text-xs text-slate-500">
              {contactToEdit
                ? 'Updates will automatically re-index the Polynomial Hash Tables'
                : 'Key will be hashed using h(key) = (Σ s[i]·31^i) mod m'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {validationError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label htmlFor="contact-name" className="block text-xs font-medium text-slate-700 mb-1">
              Full Name <span className="text-red-500">*</span> (Primary Search Key)
            </label>
            <input
              id="contact-name"
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Alice Smith"
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Phone & Email Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact-phone" className="block text-xs font-medium text-slate-700 mb-1">
                Phone Number (Secondary Hash Index)
              </label>
              <input
                id="contact-phone"
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. +1 555-0142"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="contact-email" className="block text-xs font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <input
                id="contact-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. alice@datacore.io"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Group */}
          <div>
            <label htmlFor="contact-group" className="block text-xs font-medium text-slate-700 mb-1">
              Category / Group Tag
            </label>
            <select
              id="contact-group"
              value={group}
              onChange={e => setGroup(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {DEFAULT_GROUPS.map(g => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="contact-notes" className="block text-xs font-medium text-slate-700 mb-1">
              Notes / Metadata (Optional)
            </label>
            <textarea
              id="contact-notes"
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. System architect, emergency contact, or routing notes"
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{contactToEdit ? 'Save Changes' : 'Insert into Hash Table'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
