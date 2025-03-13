import streamlit as st
import requests
import pandas as pd
import plotly.express as px
import time
from datetime import datetime
import os
import debugpy

# Enable remote debugging if in dev mode
if os.environ.get('DLMM_DEV_MODE', 'false').lower() == 'true':
    try:
        debugpy.connect(('localhost', 5678))
        print("Connected to debugger")
    except:
        print("Debugger not available")

# Initialize session state
if 'pools' not in st.session_state:
    st.session_state.pools = []
if 'last_refresh' not in st.session_state:
    st.session_state.last_refresh = 0

# API configuration
API_BASE_URL = "http://localhost:5000"

# Sidebar
st.sidebar.title("DLMM Pool Explorer")
rpc_url = st.sidebar.text_input("RPC URL", "https://api.devnet.solana.com")
cluster = st.sidebar.selectbox("Cluster", ["devnet", "mainnet-beta", "testnet"])
pool_limit = st.sidebar.slider("Number of Pools to Fetch", 1, 20, 5)
auto_refresh = st.sidebar.checkbox("Auto-refresh data", value=False)
refresh_interval = st.sidebar.slider("Refresh interval (seconds)", 10, 300, 60)

# Main content
# col1, col2 = st.columns([1, 10])
# with col1:
st.image("ts-client/deltalon-logo.png", width=150)
st.title("Deltalon DLMM Pool Explorer")
st.write("Fetching and displaying DLMM pools from Solana blockchain.")

# Function to fetch pools
def fetch_pools():
    st.session_state.last_refresh = time.time()
    with st.spinner("Fetching pool data..."):
        try:
            response = requests.get(
                f"{API_BASE_URL}/get_test_pools",
                params={
                    "rpc_url": rpc_url,
                    "limit": pool_limit,
                    "cluster": cluster
                },
                timeout=60
            )

            if response.status_code == 200:
                pools = response.json()
                if len(pools) == 0:
                    st.warning("No pools found.")
                    return []
                else:
                    st.success(f"Successfully fetched {len(pools)} pools")
                    return pools
            else:
                st.error(f"Failed to fetch pool data: {response.text}")
                return []
        except Exception as e:
            st.error(f"Error fetching pools: {str(e)}")
            return []

# Check if we need to auto-refresh
current_time = time.time()
if auto_refresh and (current_time - st.session_state.last_refresh > refresh_interval):
    st.session_state.pools = fetch_pools()

# Fetch button
if st.button("Fetch Pools"):
    st.session_state.pools = fetch_pools()

# Display pool data
if st.session_state.pools:
    # Convert to DataFrame and flatten nested dictionaries
    df = pd.json_normalize(st.session_state.pools)
    
    # Display summary stats
    st.header("Summary Statistics")
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Total Pools", len(df))
    col2.metric("Unique Token X", df['tokenX.mint'].nunique())
    col3.metric("Unique Token Y", df['tokenY.mint'].nunique())
    
    try:
        col4.metric("Average Dynamic Fee", f"{pd.to_numeric(df['dynamicFee'], errors='coerce').mean():.2f}%")
    except:
        col4.metric("Average Dynamic Fee", "N/A")

    # Distribution of bin steps
    st.subheader("Distribution of Bin Steps")
    bin_step_counts = df['binStep'].value_counts().reset_index()
    bin_step_counts.columns = ['Bin Step', 'Count']
    fig = px.bar(bin_step_counts, x='Bin Step', y='Count')
    st.plotly_chart(fig, use_container_width=True)
    
    # Pool explorer
    st.header("Pool Explorer")
    
    # Display all pools in a table
    st.dataframe(
        df[[
            'pubkey', 
            'binStep', 
            'activeId', 
            'activePriceUI', 
            'dynamicFee',
            'tokenX.mint',  # Use flattened column names
            'tokenY.mint'   # Use flattened column names
        ]],
        use_container_width=True
    )
    
    # Pool details
    st.header("Pool Details")
    selected_pool = st.selectbox("Select a pool", df['pubkey'].tolist())
    
    if selected_pool:
        pool_data = df[df['pubkey'] == selected_pool].iloc[0]
        
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
        col1.metric("Base Fee Rate", f"{pool_data['feeInfo.baseFeeRatePercentage']}%")
        col2.metric("Max Fee Rate", f"{pool_data['feeInfo.maxFeeRatePercentage']}%")
        col3.metric("Protocol Fee", f"{pool_data['feeInfo.protocolFeePercentage']}%")
        
        # Show raw JSON
        with st.expander("View Raw JSON"):
            st.json(pool_data.to_dict())
else:
    st.info("No pools loaded. Use the button above to fetch pool data.")

# Footer
st.markdown("---")
st.markdown("DLMM Pool Explorer - Data refreshed at: " + 
            datetime.fromtimestamp(st.session_state.last_refresh).strftime('%Y-%m-%d %H:%M:%S') if st.session_state.last_refresh > 0 else "Never")