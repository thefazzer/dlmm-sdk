import streamlit as st
import pandas as pd
import json
import time
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime

st.set_page_config(
    page_title="DLMM Pool Explorer",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Function to load data
@st.cache_data(ttl=300)  # Cache for 5 minutes
def load_data(file_path='dlmm_pools.json'):
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
        return pd.DataFrame(data)
    except Exception as e:
        st.error(f"Error loading data: {e}")
        return pd.DataFrame()

# Main app
st.title("DLMM Pool Explorer")

# Sidebar
st.sidebar.header("Controls")
auto_refresh = st.sidebar.checkbox("Auto-refresh data", value=False)
refresh_interval = st.sidebar.slider("Refresh interval (seconds)", 10, 300, 60)

# Load data
if 'last_refresh' not in st.session_state:
    st.session_state.last_refresh = 0

current_time = time.time()
if auto_refresh and (current_time - st.session_state.last_refresh > refresh_interval):
    st.session_state.last_refresh = current_time
    st.experimental_rerun()

data = load_data()

if data.empty:
    st.warning("No data available. Please run the batch query script first.")
else:
    st.session_state.last_refresh = current_time
    
    # Display summary stats
    st.header("Summary Statistics")
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Total Pools", len(data))
    col2.metric("Unique Token X", data['tokenX.mint'].nunique())
    col3.metric("Unique Token Y", data['tokenY.mint'].nunique())
    col4.metric("Average Dynamic Fee", f"{data['dynamicFee'].astype(float).mean():.2f}%")
    
    # Convert price to numeric for analysis
    data['activePriceUI_numeric'] = pd.to_numeric(data['activePriceUI'], errors='coerce')
    
    # Distribution of bin steps
    st.subheader("Distribution of Bin Steps")
    bin_step_counts = data['binStep'].value_counts().reset_index()
    bin_step_counts.columns = ['Bin Step', 'Count']
    fig = px.bar(bin_step_counts, x='Bin Step', y='Count')
    st.plotly_chart(fig, use_container_width=True)
    
    # Price distribution
    st.subheader("Price Distribution")
    # Filter out extreme values for better visualization
    price_data = data[(data['activePriceUI_numeric'] > 0) & 
                      (data['activePriceUI_numeric'] < data['activePriceUI_numeric'].quantile(0.95))]
    fig = px.histogram(price_data, x='activePriceUI_numeric', nbins=50,
                       title="Distribution of Active Prices (excluding outliers)")
    st.plotly_chart(fig, use_container_width=True)
    
    # Dynamic fee vs bin step
    st.subheader("Dynamic Fee vs Bin Step")
    data['dynamicFee_numeric'] = pd.to_numeric(data['dynamicFee'], errors='coerce')
    fig = px.scatter(data, x='binStep', y='dynamicFee_numeric',
                     title="Relationship between Bin Step and Dynamic Fee")
    st.plotly_chart(fig, use_container_width=True)
    
    # Pool explorer
    st.header("Pool Explorer")
    
    # Filters
    col1, col2 = st.columns(2)
    with col1:
        min_bin_step = st.slider("Min Bin Step", 
                                int(data['binStep'].min()), 
                                int(data['binStep'].max()), 
                                int(data['binStep'].min()))
    with col2:
        max_bin_step = st.slider("Max Bin Step", 
                                int(data['binStep'].min()), 
                                int(data['binStep'].max()), 
                                int(data['binStep'].max()))
    
    # Apply filters
    filtered_data = data[(data['binStep'] >= min_bin_step) & (data['binStep'] <= max_bin_step)]
    
    # Display filtered data
    st.dataframe(filtered_data[['pubkey', 'tokenX.mint', 'tokenY.mint', 'binStep', 
                               'activeId', 'activePriceUI', 'dynamicFee']], 
                 use_container_width=True)
    
    # Pool details
    st.header("Pool Details")
    selected_pool = st.selectbox("Select a pool", filtered_data['pubkey'].tolist())
    
    if selected_pool:
        pool_data = filtered_data[filtered_data['pubkey'] == selected_pool].iloc[0]
        
        col1, col2 = st.columns(2)
        with col1:
            st.subheader("Basic Information")
            st.write(f"**Pool Address:** {pool_data['pubkey']}")
            st.write(f"**Bin Step:** {pool_data['binStep']}")
            st.write(f"**Active Bin ID:** {pool_data['activeId']}")
            st.write(f"**Active Price:** {pool_data['activePriceUI']}")
            st.write(f"**Dynamic Fee:** {pool_data['dynamicFee']}%")
            
        with col2:
            st.subheader("Token Information")
            st.write("**Token X**")
            st.write(f"Mint: {pool_data['tokenX.mint']}")
            st.write(f"Decimal: {pool_data['tokenX.decimal']}")
            st.write(f"Amount: {pool_data['tokenX.amount']}")
            
            st.write("**Token Y**")
            st.write(f"Mint: {pool_data['tokenY.mint']}")
            st.write(f"Decimal: {pool_data['tokenY.decimal']}")
            st.write(f"Amount: {pool_data['tokenY.amount']}")
            
        st.subheader("Fee Information")
        col1, col2, col3 = st.columns(3)
        col1.metric("Base Fee Rate", f"{pool_data['feeInfo.baseFeeRatePercent']}%")
        col2.metric("Max Fee Rate", f"{pool_data['feeInfo.maxFeeRatePercentage']}%")
        col3.metric("Protocol Fee", f"{pool_data['feeInfo.protocolFeePercentage']}%")

# Footer
st.markdown("---")
st.markdown("DLMM Pool Explorer - Data refreshed at: " + 
            datetime.fromtimestamp(st.session_state.last_refresh).strftime('%Y-%m-%d %H:%M:%S'))