import React, { useState } from 'react';
import {
  X,
  Upload,
  Download,
  FileText,
  AlertCircle,
  CheckCircle2,
  FileCode,
  Copy,
  Check,
} from 'lucide-react';
import type { Contact } from '../types/contact';
import {
  parseCSVContacts,
  parseVCFContacts,
  exportContactsToCSV,
  exportContactsToVCF,
} from '../utils/csvVcfParser';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  onImportContacts: (incoming: Contact[]) => { added: number; duplicates: number };
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  contacts,
  onImportContacts,
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [format, setFormat] = useState<'csv' | 'vcf'>('csv');
  const [rawText, setRawText] = useState('');
  const [importNotice, setImportNotice] = useState<{
    success: boolean;
    message: string;
    errors?: string[];
  } | null>(null);

  if (!isOpen) return null;

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImportNotice(null);

    if (!rawText.trim()) {
      setImportNotice({
        success: false,
        message: 'Please paste or type CSV/VCF contact text.',
      });
      return;
    }

    const parseRes = format === 'csv' ? parseCSVContacts(rawText) : parseVCFContacts(rawText);

    if (parseRes.contacts.length === 0) {
      setImportNotice({
        success: false,
        message: 'No valid contacts could be extracted from the provided text.',
        errors: parseRes.errors,
      });
      return;
    }

    const { added, duplicates } = onImportContacts(parseRes.contacts);
    setImportNotice({
      success: true,
      message: `Successfully ingested ${added} contact(s) into the Hash Table.${
        duplicates > 0 ? ` (${duplicates} duplicate names skipped)` : ''
      }`,
      errors: parseRes.errors.length > 0 ? parseRes.errors : undefined,
    });

    if (added > 0) {
      setRawText('');
    }
  };

  const handleDownloadCSV = () => {
    const csvContent = exportContactsToCSV(contacts);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `contacts_hash_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadVCF = () => {
    const vcfContent = exportContactsToVCF(contacts);
    const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `contacts_hash_export_${Date.now()}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadSampleCSVTemplate = () => {
    const sample = `Name,Phone,Email,Group,Notes
"Nikola Tesla","+1 555-0891","nikola@alternating.io","VIP","AC polyphase system inventor"
"Ada Lovelace","+1 555-0722","ada@analytical.net","Work","Pioneered computer algorithm theory"
"Claude Shannon","+1 555-0433","shannon@infotheory.org","Work","Father of digital information theory"
"Margaret Hamilton","+1 555-0944","margaret@apollo.nasa.gov","VIP","Software engineering pioneer"`;
    setRawText(sample);
    setFormat('csv');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-export-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 id="import-export-title" className="text-base font-semibold text-slate-900">
              Stage 1 Data Ingestion & Export
            </h2>
            <p className="text-xs text-slate-500">
              CSV/VCF file ingestion into standardized Contact objects (Slide 11 Pipeline)
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

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('import')}
            className={`py-3 text-xs font-semibold border-b-2 mr-6 transition-colors ${
              activeTab === 'import'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Import Ingestion (CSV / VCF)
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'export'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Export Directory ({contacts.length} records)
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {activeTab === 'import' ? (
            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-slate-700">Format:</span>
                  <button
                    type="button"
                    onClick={() => setFormat('csv')}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-medium ${
                      format === 'csv'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('vcf')}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-medium ${
                      format === 'vcf'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    VCF (vCard)
                  </button>
                </div>

                {format === 'csv' && (
                  <button
                    type="button"
                    onClick={loadSampleCSVTemplate}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium underline"
                  >
                    Load Sample CSV Template
                  </button>
                )}
              </div>

              <div>
                <label htmlFor="raw-import" className="block text-xs font-medium text-slate-700 mb-1">
                  Paste {format.toUpperCase()} Contact Data:
                </label>
                <textarea
                  id="raw-import"
                  rows={6}
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  placeholder={
                    format === 'csv'
                      ? 'Name,Phone,Email,Group,Notes\n"Alice Smith","+1 555-0142","alice@example.com","Work","Lead"'
                      : 'BEGIN:VCARD\nVERSION:3.0\nFN:Alice Smith\nTEL;TYPE=CELL:+1 555-0142\nEMAIL:alice@example.com\nCATEGORIES:Work\nEND:VCARD'
                  }
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {importNotice && (
                <div
                  className={`p-3 rounded-lg border text-xs ${
                    importNotice.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 font-medium">
                    {importNotice.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{importNotice.message}</span>
                  </div>
                  {importNotice.errors && importNotice.errors.length > 0 && (
                    <ul className="list-disc list-inside mt-2 text-[11px] space-y-0.5 text-slate-600">
                      {importNotice.errors.slice(0, 3).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Parse & Ingest Contacts</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Export all {contacts.length} currently stored contact records. Exported files can be
                imported into standard email clients, phones, CRM tools, or re-ingested into this
                system.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-slate-900 font-semibold text-xs mb-1">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span>Comma-Separated (CSV)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-4">
                      Standard tabular CSV with Name, Phone, Email, Group, and Notes headers.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadCSV}
                    className="w-full inline-flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-medium shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Download CSV File</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-slate-900 font-semibold text-xs mb-1">
                      <FileCode className="w-4 h-4 text-emerald-600" />
                      <span>vCard File (VCF 3.0)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-4">
                      Standard contact card format compatible with iOS, Android, and Outlook.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadVCF}
                    className="w-full inline-flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-medium shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Download VCF File</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
