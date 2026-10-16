"""
Smart Contact Management Using Hash Tables
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

# Initialize Session State
if "manager" not in st.session_state:
    st.session_state.manager = ContactManager(initial_capacity=16)
    # Seed default demonstration records
    st.session_state.manager.add_contact(Contact("Alice Smith", "+1 555-0142", "alice@datacore.io", "Work"))
    st.session_state.manager.add_contact(Contact("Bob Johnson", "+1 555-0189", "bob@telecom.org", "Work"))
    st.session_state.manager.add_contact(Contact("Charlie Brown", "+1 555-0123", "charlie@network.net", "Friends"))
    st.session_state.manager.add_contact(Contact("David Miller", "+1 555-0167", "david@telecom.org", "VIP"))

mgr: ContactManager = st.session_state.manager

st.title("Smart Contact Management Using Hash Tables")
st.caption("A 100% In-Memory Contact Management System Powered by Python, Hash Maps & Streamlit")

# Sidebar navigation & metrics
st.sidebar.header("Hash Table Metrics")
stats = mgr.name_table.get_stats()
st.sidebar.metric("Total Contacts", stats["size"])
st.sidebar.metric("Table Capacity (m)", stats["capacity"])
st.sidebar.metric("Load Factor (α)", f"{stats['load_factor']:.2f} / 0.75")
st.sidebar.metric("Collision Count", stats["collision_count"])

# Instant O(1) Search Bar
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

# Contact Directory View
st.subheader("Directory Table")
if mgr.contacts:
    df = pd.DataFrame([c.to_dict() for c in mgr.contacts])
    st.dataframe(df, use_container_width=True)
else:
    st.info("No contacts in directory. Add one below.")
