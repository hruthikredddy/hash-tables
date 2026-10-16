import React from 'react';
import { X, Hash, Phone, Mail, Tag, Calendar, Edit3, Trash2, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { Contact } from '../types/contact';
import { computePolynomialHash, normalizeKey, normalizePhone } from '../utils/hashTable';

interface ContactDetailModalProps {
  contact: Contact | null;
  capacity: number;
  onClose: () => void;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onTraceInExplorer: (key: string) => void;
}

export const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
  contact,
  capacity,
  onClose,
  onEdit,
  onDelete,
  onTraceInExplorer,
}) => {
  if (!contact) return null;

  const nameNorm = normalizeKey(contact.name);
  const nameHash = computePolynomialHash(nameNorm, capacity);

  const phoneNorm = normalizePhone(contact.phone);
  const phoneHash = phoneNorm ? computePolynomialHash(phoneNorm, capacity) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-detail-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm border border-indigo-200">
              {contact.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 id="contact-detail-title" className="text-base font-semibold text-slate-900">
                  {contact.name}
                </h2>
                {contact.isSample && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200 text-slate-700 font-medium">
                    Sample
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">{contact.group || 'General'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Contact Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 flex items-center mb-1">
                <Phone className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                Phone Number
              </span>
              <p className="font-mono font-medium text-slate-900">
                {contact.phone || 'Not specified'}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 flex items-center mb-1">
                <Mail className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                Email Address
              </span>
              <p className="font-mono font-medium text-slate-900 truncate">
                {contact.email || 'Not specified'}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 flex items-center mb-1">
                <Tag className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                Category / Group
              </span>
              <p className="font-medium text-slate-900">{contact.group || 'General'}</p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 flex items-center mb-1">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                Record Created
              </span>
              <p className="font-mono text-slate-900">
                {new Date(contact.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {contact.notes && (
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <span className="text-slate-500 font-medium block mb-1">Notes / Description:</span>
              <p className="text-slate-700 leading-relaxed">{contact.notes}</p>
            </div>
          )}

          {/* Mathematical Hash Telemetry Card */}
          <div className="p-4 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Hash className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-white">
                  Hash Table Memory Telemetry
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                O(1) Direct Indexed
              </span>
            </div>

            {/* Name Hash Inspection */}
            <div className="p-2.5 rounded bg-slate-800/80 border border-slate-700/60 font-mono text-[11px] space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Key (Normalized):</span>
                <span className="text-white">"{nameNorm}"</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Raw Polynomial Hash:</span>
                <span className="text-indigo-300 truncate max-w-[200px]">
                  {nameHash.rawHashBigInt}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Bucket Formula:</span>
                <span className="text-slate-300">
                  {nameHash.rawHashBigInt} mod {capacity}
                </span>
              </div>
              <div className="flex justify-between text-emerald-400 font-semibold pt-1 border-t border-slate-700">
                <span>Assigned Bucket:</span>
                <span className="text-emerald-300">Bucket [{nameHash.bucketIndex}]</span>
              </div>
            </div>

            {/* Phone Hash Inspection if available */}
            {phoneHash && (
              <div className="p-2.5 rounded bg-slate-800/80 border border-slate-700/60 font-mono text-[11px] space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Phone Index Key:</span>
                  <span className="text-white">"{phoneNorm}"</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Phone Bucket:</span>
                  <span className="text-emerald-300">Bucket [{phoneHash.bucketIndex}]</span>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                onTraceInExplorer(contact.name);
                onClose();
              }}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>Trace Key in Hash Table Explorer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete ${contact.name}?`)) {
                  onDelete(contact.id);
                  onClose();
                }
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Contact</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  onEdit(contact);
                  onClose();
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Edit Record</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
