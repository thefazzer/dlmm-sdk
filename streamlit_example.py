import streamlit as st
import requests
import json
import pandas as pd
import plotly.express as px
import websocket
import threading
import time
from typing import List, Dict, Any

# Configure page
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

# API configuration
API_BASE_URL = "http://localhost:5000"
WS_URL = "ws://localhost:5000"

# Sidebar
st.sidebar.title("DLMM Pool Explorer")
rpc_url = st.sidebar.text_input("RPC URL", "https://api.devnet.solana.com")
cluster = st.sidebar.selectbox("Cluster", ["devnet", "mainnet-beta", "testnet"])
batch_size = st.sidebar.slider("Batch Size", 5, 50, 10)
concurrency = st.sidebar.slider("Concurrency", 1, 10, 5)

# Function to fetch pools via REST API
def fetch_pools_rest():
    st.session_state.processing = True
    st.session_state.pools = []
    
    try:
        with st.spinner("Fetching pools..."):
            response = requests.get(
                f"{API_BASE_URL}/get_pools",
                params={
                    "rpc_url": rpc_url,
                    "batch_size": batch_size,
                    "concurrency": concurrency,
                    "cluster": cluster
                }
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

# Function to handle WebSocket messages
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

# Function to handle WebSocket connection
def on_ws_open(ws):
    st.session_state.ws_connected = True
    ws.send(json.dumps({
        "action": "fetch_pools_streaming",
        "rpc_url": rpc_url,
        "batch_size": batch_size,
        "concurrency": concurrency,
        "cluster": cluster
    }))

# Function to fetch pools via WebSocket
def fetch_pools_ws():
    st.session_state.processing = True
    st.session_state.pools = []
    st.session_state.progress = 0
    
    # Create WebSocket connection in a separate thread
    def ws_thread():
        ws = websocket.WebSocketApp(
            WS_URL,
            on_message=on_ws_message,
            on_open=lambda ws: on_ws_open(ws),
            on_error=lambda ws, error: st.error(f"WebSocket error: {error}"),
            on_close=lambda ws, close_status_code, close_msg: None
        )
        ws.run_forever()
    
    threading.Thread(target=ws_thread, daemon=True).start()

# Main content
st.title("DLMM Pool Explorer")

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
    
    # Display filtered data
    st.dataframe(filtered_df[['pubkey', 'tokenX.mint', 'tokenY.mint', 'binStep', 
                             'activeId', 'activePriceUI', 'dynamicFee']], 
                 use_container_width=True)
    
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
else:
    st.info("No pools loaded. Use the buttons above to fetch pool data.")

# Footer
st.markdown("---")
st.markdown("DLMM Pool Explorer - Data refreshed at: " + 
            time.strftime('%Y-%m-%d %H:%M:%S'))