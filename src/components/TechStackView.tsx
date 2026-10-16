import React, { useState } from 'react';
import {
  Cpu,
  Database,
  Monitor,
  Code2,
  Copy,
  Check,
  Download,
  FileCode,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

const PYTHON_HASH_TABLE_CODE = `"""
Smart Contact Management Using Hash Tables
Core Engine: Custom Hash Table Implementation
Algorithm: Polynomial Rolling Hash Function with Separate Chaining
Formula: h(key) = ( Σ s[i] * p^i ) mod m, where p = 31, m = table capacity
Auto-resizing: α >= 0.75 doubles capacity and rehashes all elements
"""

from typing import Any, Optional, List, Tuple

P_BASE = 31
LOAD_FACTOR_THRESHOLD = 0.75
DEFAULT_CAPACITY = 16


class HashNode:
    """Represents a node in a separate chaining linked list."""
    def __init__(self, key: str, value: Any, raw_hash: int, bucket_index: int):
        self.key: str = key
        self.value: Any = value
        self.raw_hash: int = raw_hash
        self.bucket_index: int = bucket_index
        self.next: Optional['HashNode'] = None


class CustomHashTable:
    """High-performance in-memory hash table for contact storage."""

    def __init__(self, initial_capacity: int = DEFAULT_CAPACITY, threshold: float = LOAD_FACTOR_THRESHOLD):
        self.capacity: int = max(4, initial_capacity)
        self.threshold: float = threshold
        self.size_count: int = 0
        self.rehash_counter: int = 0
        self.buckets: List[Optional[HashNode]] = [None] * self.capacity

    @staticmethod
    def normalize_key(key: str) -> str:
        return key.strip().lower() if key else ""

    @staticmethod
    def compute_polynomial_hash(key: str, capacity: int) -> Tuple[int, int]:
        total_hash = 0
        p_power = 1
        for char in key:
            total_hash += ord(char) * p_power
            p_power *= P_BASE
        bucket_index = total_hash % capacity
        return total_hash, bucket_index

    def insert(self, raw_key: str, value: Any) -> bool:
        key = self.normalize_key(raw_key)
        if not key:
            raise ValueError("Key cannot be empty")

        if (self.size_count + 1) / self.capacity >= self.threshold:
            self._resize(self.capacity * 2)

        raw_hash, bucket_index = self.compute_polynomial_hash(key, self.capacity)
        current = self.buckets[bucket_index]
        prev = None

        while current is not None:
            if current.key == key:
                current.value = value
                current.raw_hash = raw_hash
                return True
            prev = current
            current = current.next

        new_node = HashNode(key, value, raw_hash, bucket_index)
        if prev is None:
            self.buckets[bucket_index] = new_node
        else:
            prev.next = new_node

        self.size_count += 1
        return False

    def search(self, raw_key: str) -> Tuple[bool, Optional[Any], int, int]:
        key = self.normalize_key(raw_key)
        if not key or self.capacity == 0:
            return False, None, -1, 0

        raw_hash, bucket_index = self.compute_polynomial_hash(key, self.capacity)
        current = self.buckets[bucket_index]
        steps = 0

        while current is not None:
            steps += 1
            if current.key == key:
                return True, current.value, bucket_index, steps
            current = current.next

        return False, None, bucket_index, steps

    def delete(self, raw_key: str) -> bool:
        key = self.normalize_key(raw_key)
        if not key or self.capacity == 0:
            return False

        _, bucket_index = self.compute_polynomial_hash(key, self.capacity)
        current = self.buckets[bucket_index]
        prev = None

        while current is not None:
            if current.key == key:
                if prev is None:
                    self.buckets[bucket_index] = current.next
                else:
                    prev.next = current.next
                self.size_count -= 1
                return True
            prev = current
            current = current.next

        return False

    def _resize(self, new_capacity: int) -> None:
        old_buckets = self.buckets
        self.capacity = max(4, new_capacity)
        self.buckets = [None] * self.capacity
        self.size_count = 0
        self.rehash_counter += 1

        for head in old_buckets:
            current = head
            while current is not None:
                next_node = current.next
                current.next = None
                raw_hash, bucket_index = self.compute_polynomial_hash(current.key, self.capacity)
                current.raw_hash = raw_hash
                current.bucket_index = bucket_index

                if self.buckets[bucket_index] is None:
                    self.buckets[bucket_index] = current
                else:
                    current.next = self.buckets[bucket_index]
                    self.buckets[bucket_index] = current

                self.size_count += 1
                current = next_node`;

const PYTHON_CONTACT_MANAGER_CODE = `"""
Contact Model & Dual Index Manager
Ingestion: Supports CSV and VCF formats
Indexing: Dual Custom Hash Tables for Name and Phone lookups
"""

import csv
import re
from typing import Dict, List, Optional
from hash_table import CustomHashTable


class Contact:
    def __init__(self, name: str, phone: str, email: str = "", group: str = "General", notes: str = ""):
        self.name = name.strip()
        self.phone = phone.strip()
        self.email = email.strip()
        self.group = group.strip() or "General"
        self.notes = notes.strip()

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "phone": self.phone,
            "email": self.email,
            "group": self.group,
            "notes": self.notes,
        }


class ContactManager:
    """Manages contacts using dual polynomial hash tables for O(1) retrieval."""

    def __init__(self, initial_capacity: int = 16):
        self.name_table = CustomHashTable(initial_capacity)
        self.phone_table = CustomHashTable(initial_capacity)
        self.contacts: List[Contact] = []

    @staticmethod
    def normalize_phone(phone: str) -> str:
        return re.sub(r"[^0-9+]", "", phone)

    def add_contact(self, contact: Contact) -> bool:
        if not contact.name:
            return False

        found, _, _, _ = self.name_table.search(contact.name)
        if found:
            return False

        self.name_table.insert(contact.name, contact)
        norm_phone = self.normalize_phone(contact.phone)
        if norm_phone:
            self.phone_table.insert(norm_phone, contact)

        self.contacts.append(contact)
        return True

    def search_by_name(self, name: str) -> Optional[Contact]:
        found, contact, bucket_idx, steps = self.name_table.search(name)
        return contact if found else None

    def search_by_phone(self, phone: str) -> Optional[Contact]:
        norm_phone = self.normalize_phone(phone)
        found, contact, bucket_idx, steps = self.phone_table.search(norm_phone)
        return contact if found else None

    def delete_contact(self, name: str) -> bool:
        contact = self.search_by_name(name)
        if not contact:
            return False

        self.name_table.delete(contact.name)
        norm_phone = self.normalize_phone(contact.phone)
        if norm_phone:
            self.phone_table.delete(norm_phone)

        self.contacts = [c for c in self.contacts if c.name.lower() != name.lower()]
        return True`;

const PYTHON_STREAMLIT_CODE = `"""
Streamlit Interactive Web Dashboard (Original Proposed Architecture)
Stack: Pure Python, Custom Hash Map, Streamlit, Pandas ($0 Software Cost)
"""

import time
import pandas as pd
import streamlit as st
from contact_manager import Contact, ContactManager

st.set_page_config(
    page_title="Smart Contact Management Using Hash Tables",
    layout="wide",
    initial_sidebar_state="expanded",
)

if "manager" not in st.session_state:
    st.session_state.manager = ContactManager(initial_capacity=16)
    st.session_state.manager.add_contact(Contact("Alice Smith", "+1 555-0142", "alice@datacore.io", "Work"))
    st.session_state.manager.add_contact(Contact("Bob Johnson", "+1 555-0189", "bob@telecom.org", "Work"))
    st.session_state.manager.add_contact(Contact("Charlie Brown", "+1 555-0123", "charlie@network.net", "Friends"))
    st.session_state.manager.add_contact(Contact("David Miller", "+1 555-0167", "david@telecom.org", "VIP"))

mgr: ContactManager = st.session_state.manager

st.title("Smart Contact Management Using Hash Tables")
st.caption("A 100% In-Memory Contact Management System Powered by Python, Hash Maps & Streamlit")

# Sidebar metrics
st.sidebar.header("Hash Table Metrics")
stats = mgr.name_table.get_stats()
st.sidebar.metric("Total Contacts", stats["size"])
st.sidebar.metric("Table Capacity (m)", stats["capacity"])
st.sidebar.metric("Load Factor (α)", f"{stats['load_factor']:.2f} / 0.75")
st.sidebar.metric("Collision Count", stats["collision_count"])

# Instant O(1) Search
st.subheader("Instant O(1) Contact Search")
query = st.text_input("Enter contact Name or Phone:", placeholder="e.g. Alice Smith or +1 555-0142")

if query:
    t0 = time.perf_counter()
    contact = mgr.search_by_name(query) or mgr.search_by_phone(query)
    duration_ms = (time.perf_counter() - t0) * 1000

    if contact:
        st.success(f"O(1) Match Found in {duration_ms:.4f} ms!")
        st.json(contact.to_dict())
    else:
        st.warning(f"Contact '{query}' not found.")

st.subheader("Directory Table")
if mgr.contacts:
    df = pd.DataFrame([c.to_dict() for c in mgr.contacts])
    st.dataframe(df, use_container_width=True)
else:
    st.info("No contacts in directory. Add one below.")`;

export const TechStackView: React.FC = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<'hash_table' | 'contact_manager' | 'streamlit'>('hash_table');
  const [copied, setCopied] = useState<boolean>(false);

  const getActiveCode = () => {
    switch (activeCodeTab) {
      case 'hash_table':
        return { filename: 'hash_table.py', code: PYTHON_HASH_TABLE_CODE };
      case 'contact_manager':
        return { filename: 'contact_manager.py', code: PYTHON_CONTACT_MANAGER_CODE };
      case 'streamlit':
        return { filename: 'streamlit_app.py', code: PYTHON_STREAMLIT_CODE };
    }
  };

  const { filename, code } = getActiveCode();

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([code], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Slide 12: 100% Free & Open-Source Software Stack ($0 Cost)</span>
        </div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Technology Stack & Source Architecture
        </h2>
        <p className="text-xs text-slate-500">
          Pure Python runtime, custom mathematical data structures, Streamlit dashboard, and
          Pandas tabular workflows.
        </p>
      </div>

      {/* 3 Core Pillars matching Slide 12 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Pillar 1: Python */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Python & Standard Libraries</h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium inline-block mb-3">
              Core Engine
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              High-efficiency pure Python runtime for memory management, object definitions,
              mathematical rolling hash execution, and automated latency benchmarking suites.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
            License: Open Source (PSF)
          </div>
        </div>

        {/* Pillar 2: Custom Hash Map */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Custom Hash Map & Chaining</h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 font-medium inline-block mb-3">
              Data Structure
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Custom mathematical implementation of polynomial rolling hash (base p = 31),
              separate chaining linked lists, and automatic capacity doubling when load factor
              α ≥ 0.75.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
            Complexity: O(1) Average
          </div>
        </div>

        {/* Pillar 3: Streamlit & Pandas */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Monitor className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Streamlit & Pandas</h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 font-medium inline-block mb-3">
              UI & Tabular Processing
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Rapid Python dashboard framework enabling instant contact search, CSV data
              import/export, live bucket telemetry inspection, and latency metric graphs.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
            Cost: $0 Software License
          </div>
        </div>
      </div>

      {/* Interactive Python Source Code Viewer */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 shadow-md overflow-hidden text-white">
        {/* Header Tabs */}
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-200">
              Documented Python Source Repository
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveCodeTab('hash_table')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                activeCodeTab === 'hash_table'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              hash_table.py
            </button>
            <button
              onClick={() => setActiveCodeTab('contact_manager')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                activeCodeTab === 'contact_manager'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              contact_manager.py
            </button>
            <button
              onClick={() => setActiveCodeTab('streamlit')}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                activeCodeTab === 'streamlit'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              streamlit_app.py
            </button>

            <div className="h-4 w-px bg-slate-700 hidden sm:block mx-1" />

            <button
              onClick={handleCopyCode}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs inline-flex items-center space-x-1"
              title="Copy code"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadFile}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs inline-flex items-center space-x-1"
              title="Download file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="text-[10px]">Download</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <pre className="p-5 text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto max-h-[480px]">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
