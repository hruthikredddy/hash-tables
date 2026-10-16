"""
Smart Contact Management System
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

        # Prevent duplicate names
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
        return True

    def import_csv(self, file_path: str) -> int:
        imported = 0
        with open(file_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                c = Contact(
                    name=row.get("Name", "") or row.get("name", ""),
                    phone=row.get("Phone", "") or row.get("phone", ""),
                    email=row.get("Email", "") or row.get("email", ""),
                    group=row.get("Group", "General") or row.get("group", "General"),
                    notes=row.get("Notes", "") or row.get("notes", ""),
                )
                if self.add_contact(c):
                    imported += 1
        return imported
