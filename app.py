import streamlit as st
import requests
import pandas as pd
import plotly.express as px
import websocket
import json
import threading
import time
from datetime import datetime

st.set_page_config(
    page_title="DLMM Pool Explorer",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Initialize session state
if 'pools' not in st.session_state:
    st.session_state.pools = []
if 'progress' not in st.session_state:
    st.session_state.progress = 0
if 'ws_connected' not in st.session_state:
    st.session_state.ws_connected = False
if 'processing' not in st.session_state:
    st.session_state.processing = False
if 'last_refresh' not in st.session_state:
    st.session_state.last_refresh = 0

# API configuration
API_BASE_URL = "http://localhost:5000"
WS_URL = "ws://localhost:5000"

# Sidebar
st.sidebar.title("DLMM Pool Explorer")
rpc_url = st.sidebar.text_input("RPC URL", "https://api.devnet.solana.com")
cluster = st.sidebar.selectbox("Cluster", ["devnet", "mainnet-beta", "testnet"])
pool_limit = st.sidebar.slider("Number of Pools to Fetch", 1, 50, 10)
auto_refresh = st.sidebar.checkbox("Auto-refresh data", value=False)
refresh_interval = st.sidebar.slider("Refresh interval (seconds)", 10, 300, 60)
use_websocket = st.sidebar.checkbox("Use WebSocket (streaming)", value=True)

# Main content
st.title("DLMM Pool Explorer")
st.write("Fetching and displaying DLMM pools from Solana blockchain.")

# Function to fetch pools via REST API
def fetch_pools_rest():
    st.session_state.processing = True
    st.session_state.pools = []
    st.session_state.last_refresh = time.time()
    
    try:
        with st.spinner("Fetching pools..."):
            endpoint = "/get_test_pools" if pool_limit <= 20 else "/get_pools"
            response = requests.get(
                f"{API_BASE_URL}{endpoint}",
                params={
                    "rpc_url": rpc_url,
                    "limit": pool_limit,
                    "batch_size": pool_limit,
                    "concurrency": 5,
                    "cluster": cluster
                },
                timeout=120
            )
            
            if response.status_code == 200:
                st.session_state.pools = response.json()
                st.success(f"Successfully fetched {len(st.session_state.pools)} pools")
            else:
                st.error(f"Failed to fetch pools: {response.text}")
    except Exception as e:
        st.error(f"Error: {str(e)}")
    finally:
        st.session_state.processing = False

# WebSocket message handler
def on_ws_message(ws, message):
    data = json.loads(message)
    
    if data['type'] == 'pool_data':
        st.session_state.pools.append(data['data'])
        st.session_state.progress = data['progress']
    elif data['type'] == 'complete':
        st.session_state.processing = False
    elif data['type'] == 'error':
        st.error(f"Error: {data['message']}")
        st.session_state.processing = False

# Function to fetch pools via WebSocket
def fetch_pools_ws():
    st.session_state.processing = True
    st.session_state.pools = []
    st.session_state.progress = 0
    st.session_state.last_refresh = time.time()
    
    # Create WebSocket connection in a separate thread
    def ws_thread():
        ws = websocket.WebSocketApp(
            WS_URL,
            on_message=on_ws_message,
            on_error=lambda ws, error: st.error(f"WebSocket error: {error}"),
            on_close=lambda ws, close_status_code, close_msg: None
        )
        
        def on_open(ws):
            ws.send(json.dumps({
                "action": "fetch_pools_streaming",
                "rpc_url": rpc_url,
                "batch_size": pool_limit,
                "concurrency": 5,
                "cluster": cluster
            }))
        
        ws.on_open = on_open
        ws.run_forever()
    
    threading.Thread(target=ws_thread, daemon=True).start()

# Check if we need to auto-refresh
current_time = time.time()
if auto_refresh and (current_time - st.session_state.last_refresh > refresh_interval):
    if use_websocket:
        fetch_pools_ws()
    else:
        fetch_pools_rest()

# Fetch buttons
col1, col2 = st.columns(2)
with col1:
    if st.button("Fetch Pools (REST)", disabled=st.session_state.processing):
        fetch_pools_rest()
with col2:
    if st.button("Fetch Pools (WebSocket)", disabled=st.session_state.processing):
        fetch_pools_ws()

# Show progress if processing
if st.session_state.processing:
    st.progress(st.session_state.progress / 100)
    st.write(f"Processed {len(st.session_state.pools)} pools so far...")

# Display pool data
if st.session_state.pools:
    # Convert to DataFrame for easier manipulation
    df = pd.DataFrame(st.session_state.pools)
    
    # Display summary stats
    st.header("Summary Statistics")
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Total Pools", len(df))
    
    # Handle different data structures (nested vs flat)
    if 'tokenX.mint' in df.columns:
        # Flat structure
        col2.metric("Unique Token X", df['tokenX.mint'].nunique())
        col3.metric("Unique Token Y", df['tokenY.mint'].nunique())
    else:
        # Nested structure
        col2.metric("Unique Token X", df['tokenX'].apply(lambda x: x['mint']).nunique())
        col3.metric("Unique Token Y", df['tokenY'].apply(lambda x: x['mint']).nunique())
    
    try:
        if 'dynamicFee' in df.columns:
            col4.metric("Average Dynamic Fee", f"{pd.to_numeric(df['dynamicFee'], errors='coerce').mean():.2f}%")
        else:
            col4.metric("Average Dynamic Fee", "N/A")
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
    
    # Filters
    col1, col2 = st.columns(2)
    with col1:
        min_bin_step = st.slider("Min Bin Step", 
                                int(df['binStep'].min()), 
                                int(df['binStep'].max()), 
                                int(df['binStep'].min()))
    with col2:
        max_bin_step = st.slider("Max Bin Step", 
                                int(df['binStep'].min()), 
                                int(df['binStep'].max()), 
                                int(df['binStep'].max()))
    
    # Apply filters
    filtered_df = df[(df['binStep'] >= min_bin_step) & (df['binStep'] <= max_bin_step)]
    
    # Prepare dataframe for display based on structure
    if 'tokenX.mint' in df.columns:
        # Flat structure
        display_df = filtered_df[['pubkey', 'tokenX.mint', 'tokenY.mint', 'binStep', 
                                'activeId', 'activePriceUI', 'dynamicFee']]
    else:
        # Nested structure
        display_df = filtered_df[['pubkey', 'binStep', 'activeId', 'activePriceUI', 'dynamicFee']].copy()
        display_df['tokenX'] = filtered_df['tokenX'].apply(lambda x: x['mint'])
        display_df['tokenY'] = filtered_df['tokenY'].apply(lambda x: x['mint'])
    
    # Display filtered data
    st.dataframe(display_df, use_container_width=True)
    
    # Pool details
    st.header("Pool Details")
    selected_pool = st.selectbox("Select a pool", filtered_df['pubkey'].tolist())
    
    if selected_pool:
        pool_data = filtered_df[filtered_df['pubkey'] == selected_pool].iloc[0]
        
        col1, col2 = st.columns(2)
        with col1:
            st.subheader("Basic Information")
            st.write(f"**Pool Address:** {pool_data['pubkey']}")
            st.write(f"**Bin Step:** {pool_data['binStep']}")
            st.write(f"**Active Bin ID:** {pool_data['activeId']}")
            st.write(f"**Active Price:** {pool_data['activePriceUI']}")
            st.write(f"**Dynamic Fee:** {pool_data.get('dynamicFee', 'N/A')}%")
            
        with col2:
            st.subheader("Token Information")
            st.write("**Token X**")
            if 'tokenX.mint' in df.columns:
                # Flat structure
                st.write(f"Mint: {pool_data['tokenX.mint']}")
                st.write(f"Decimal: {pool_data['tokenX.decimal']}")
                st.write(f"Amount: {pool_data['tokenX.amount']}")
            else:
                # Nested structure
                st.write(f"Mint: {pool_data['tokenX']['mint']}")
                st.write(f"Decimal: {pool_data['tokenX']['decimal']}")
                st.write(f"Amount: {pool_data['tokenX']['amount']}")
            
            st.write("**Token Y**")
            if 'tokenY.mint' in df.columns:
                # Flat structure
                st.write(f"Mint: {pool_data['tokenY.mint']}")
                st.write(f"Decimal: {pool_data['tokenY.decimal']}")
                st.write(f"Amount: {pool_data['tokenY.amount']}")
            else:
                # Nested structure
                st.write(f"Mint: {pool_data['tokenY']['mint']}")
                st.write(f"Decimal: {pool_data['tokenY']['decimal']}")
                st.write(f"Amount: {pool_data['tokenY']['amount']}")
            
        st.subheader("Fee Information")
        col1, col2, col3 = st.columns(3)
        
        if 'feeInfo.baseFeeRatePercentage' in df.columns:
            # Flat structure
            col1.metric("Base Fee Rate", f"{pool_data['feeInfo.baseFeeRatePercentage']}%")
            col2.metric("Max Fee Rate", f"{pool_data['feeInfo.maxFeeRatePercentage']}%")
            col3.metric("Protocol Fee", f"{pool_data['feeInfo.protocolFeePercentage']}%")
        else:
            # Nested structure
            col1.metric("Base Fee Rate", f"{pool_data['feeInfo']['baseFeeRatePercentage']}%")
            col2.metric("Max Fee Rate", f"{pool_data['feeInfo']['maxFeeRatePercentage']}%")
            col3.metric("Protocol Fee", f"{pool_data['feeInfo']['protocolFeePercentage']}%")
        
        # Show raw JSON
        with st.expander("View Raw JSON"):
            st.json(pool_data.to_dict())
else:
    st.info("No pools loaded. Use the buttons above to fetch pool data.")

# Footer
st.markdown("---")
st.markdown("DLMM Pool Explorer - Data refreshed at: " + 
            datetime.fromtimestamp(st.session_state.last_refresh).strftime('%Y-%m-%d %H:%M:%S') if st.session_state.last_refresh > 0 else "Never")