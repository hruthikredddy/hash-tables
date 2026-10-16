import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar, type NavTab } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { OverviewView } from './components/OverviewView';
import { ContactsView } from './components/ContactsView';
import { ExplorerView } from './components/ExplorerView';
import { BenchmarkView } from './components/BenchmarkView';
import { ArchitectureView } from './components/ArchitectureView';
import { TechStackView } from './components/TechStackView';
import { RoadmapView } from './components/RoadmapView';
import { RiskView } from './components/RiskView';
import { DeliverablesView } from './components/DeliverablesView';
import { AboutView } from './components/AboutView';
import { ContactModal } from './components/ContactModal';
import { ContactDetailModal } from './components/ContactDetailModal';
import { ImportExportModal } from './components/ImportExportModal';
import { ContactDirectory } from './utils/contactDirectory';
import type { Contact } from './types/contact';

interface ActivityItem {
  id: string;
  timestamp: number;
  type: 'insert' | 'search' | 'delete' | 'rehash' | 'import';
  description: string;
  details?: string;
}

export default function App() {
  // Initialize in-memory Contact Directory with dual hash tables
  const [directory] = useState<ContactDirectory>(() => new ContactDirectory(16));
  const [version, setVersion] = useState<number>(0); // bump to trigger re-renders on mutations

  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lastSearchMetric, setLastSearchMetric] = useState<{
    query: string;
    durationUs: number;
    bucketIndex?: number;
    isHit: boolean;
    chainSteps?: number;
  } | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
  const [contactToDetail, setContactToDetail] = useState<Contact | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [explorerTargetKey, setExplorerTargetKey] = useState<string>('CAT');

  // Activity log
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: 'act_1',
      timestamp: Date.now() - 3600000,
      type: 'insert',
      description: 'Initialized in-memory Dual Hash Tables',
      details: 'Name Index & Phone Index with capacity m = 16',
    },
    {
      id: 'act_2',
      timestamp: Date.now() - 3500000,
      type: 'import',
      description: 'Loaded PPT Demonstration Contacts',
      details: 'Alice Smith, Bob Johnson, Charlie Brown, David Miller',
    },
  ]);

  const addActivity = (
    type: ActivityItem['type'],
    description: string,
    details?: string
  ) => {
    const newItem: ActivityItem = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      type,
      description,
      details,
    };
    setActivities(prev => [newItem, ...prev.slice(0, 19)]);
  };

  // Re-fetch current contacts and search result
  const contacts = useMemo(() => {
    // depend on version
    return directory.getAllContacts();
  }, [directory, version]);

  const searchResult = useMemo(() => {
    const res = directory.search(searchQuery);

    if (searchQuery.trim()) {
      const isHit = !!(res.exactNameHit || res.exactPhoneHit || res.partialMatches.length > 0);
      setLastSearchMetric({
        query: searchQuery,
        durationUs: res.lookupDurationUs,
        bucketIndex: res.bucketIndex,
        isHit,
        chainSteps: res.chainSteps,
      });
    }

    return res;
  }, [directory, searchQuery, version]);

  const stats = useMemo(() => {
    return directory.getStats();
  }, [directory, version]);

  // Handler: Add or update contact
  const handleSaveContact = (
    contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => {
    if (contactData.id) {
      // Update
      const res = directory.updateContact(contactData as Contact);
      if (res.success) {
        setVersion(v => v + 1);
        addActivity(
          'insert',
          `Updated contact "${contactData.name}"`,
          `Re-registered hash indices for Name and Phone`
        );
      }
      return res;
    } else {
      // Add
      const newContact: Contact = {
        ...contactData,
        id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const res = directory.addContact(newContact);
      if (res.success) {
        setVersion(v => v + 1);
        addActivity(
          'insert',
          `Added new contact "${newContact.name}"`,
          `Hashed into Bucket [${directory.getNameTable().search(newContact.name).bucketIndex}]`
        );
      }
      return res;
    }
  };

  // Handler: Delete single contact
  const handleDeleteContact = (id: string) => {
    const contact = contacts.find(c => c.id === id);
    const success = directory.deleteContact(id);
    if (success) {
      setVersion(v => v + 1);
      addActivity(
        'delete',
        `Deleted contact "${contact?.name || id}"`,
        `Unlinked node from separate chaining bucket`
      );
    }
  };

  // Handler: Batch delete
  const handleBatchDelete = (ids: string[]) => {
    const count = directory.batchDelete(ids);
    setVersion(v => v + 1);
    addActivity('delete', `Batch deleted ${count} contact(s) from Hash Table`);
  };

  // Handler: Reset to PPT samples
  const handleResetSampleData = () => {
    directory.loadSampleData();
    setVersion(v => v + 1);
    addActivity('import', 'Reset directory to original PPT sample contacts');
  };

  // Handler: Ingest contacts from CSV/VCF
  const handleImportContacts = (incoming: Contact[]) => {
    const res = directory.importContacts(incoming);
    setVersion(v => v + 1);
    addActivity(
      'import',
      `Imported ${res.added} contact(s) into Hash Table`,
      res.duplicates > 0 ? `${res.duplicates} duplicate keys skipped` : undefined
    );
    return res;
  };

  // Handler: Quick search from Overview
  const handleQuickSearchFromOverview = (query: string) => {
    setSearchQuery(query);
    setCurrentTab('contacts');
  };

  // Handler: Trace key in Explorer
  const handleTraceInExplorer = (key: string) => {
    setExplorerTargetKey(key);
    setCurrentTab('explorer');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900 antialiased">
      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-30 md:hidden backdrop-blur-xs"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main Sidebar (Desktop & Mobile Drawer) */}
      <div
        className={`fixed md:relative inset-y-0 left-0 z-40 transform transition-transform duration-300 md:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } flex`}
      >
        <Sidebar
          currentTab={currentTab}
          onSelectTab={tab => {
            setCurrentTab(tab);
            setMobileSidebarOpen(false);
          }}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          contactCount={stats.totalContacts}
          loadFactor={stats.nameTableStats.loadFactor}
        />
      </div>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          currentTab={currentTab}
          onOpenAddModal={() => {
            setContactToEdit(null);
            setIsAddModalOpen(true);
          }}
          onResetSampleData={handleResetSampleData}
          onSearchQuery={q => setSearchQuery(q)}
          searchResultNotice={
            searchQuery.trim() && lastSearchMetric
              ? {
                  text: lastSearchMetric.isHit
                    ? `Bucket [${lastSearchMetric.bucketIndex ?? 0}] Hit`
                    : 'Not Found',
                  durationUs: lastSearchMetric.durationUs,
                  bucketIndex: lastSearchMetric.bucketIndex,
                  isHit: lastSearchMetric.isHit,
                }
              : null
          }
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          sampleCount={stats.sampleCount}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-slate-50/70" role="main">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'overview' && (
              <OverviewView
                stats={stats}
                recentActivities={activities}
                lastSearchMetric={lastSearchMetric}
                onNavigateTab={setCurrentTab}
                onOpenAddModal={() => {
                  setContactToEdit(null);
                  setIsAddModalOpen(true);
                }}
                onOpenImportModal={() => setIsImportModalOpen(true)}
                onQuickSearch={handleQuickSearchFromOverview}
              />
            )}

            {currentTab === 'contacts' && (
              <ContactsView
                contacts={contacts}
                searchResult={searchResult}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onOpenAddModal={() => {
                  setContactToEdit(null);
                  setIsAddModalOpen(true);
                }}
                onOpenEditModal={contact => {
                  setContactToEdit(contact);
                  setIsAddModalOpen(true);
                }}
                onDeleteContact={handleDeleteContact}
                onBatchDelete={handleBatchDelete}
                onOpenDetailModal={contact => setContactToDetail(contact)}
                onOpenImportModal={() => setIsImportModalOpen(true)}
                onResetSamples={handleResetSampleData}
                capacity={stats.nameTableStats.capacity}
              />
            )}

            {currentTab === 'explorer' && (
              <ExplorerView
                initialKeyToTrace={explorerTargetKey}
                nameTable={directory.getNameTable()}
                onContactCountChanged={() => setVersion(v => v + 1)}
              />
            )}

            {currentTab === 'benchmark' && <BenchmarkView />}

            {currentTab === 'architecture' && <ArchitectureView />}

            {currentTab === 'techstack' && <TechStackView />}

            {currentTab === 'roadmap' && <RoadmapView />}

            {currentTab === 'risk' && <RiskView />}

            {currentTab === 'deliverables' && <DeliverablesView />}

            {currentTab === 'about' && <AboutView />}
          </div>
        </main>
      </div>

      {/* Add / Edit Contact Modal */}
      <ContactModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveContact}
        contactToEdit={contactToEdit}
      />

      {/* Contact Detail & Mathematical Hash Telemetry Modal */}
      <ContactDetailModal
        contact={contactToDetail}
        capacity={stats.nameTableStats.capacity}
        onClose={() => setContactToDetail(null)}
        onEdit={contact => {
          setContactToEdit(contact);
          setIsAddModalOpen(true);
        }}
        onDelete={handleDeleteContact}
        onTraceInExplorer={handleTraceInExplorer}
      />

      {/* CSV / VCF Import & Export Modal */}
      <ImportExportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        contacts={contacts}
        onImportContacts={handleImportContacts}
      />
    </div>
  );
}
