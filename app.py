import streamlit as st
import requests
import pandas as pd
import plotly.express as px
import time
from datetime import datetime
from websocket import WebSocketApp
import threading
import json

st.set_page_config(
    page_title="DLMM Pool Explorer",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Initialize session state
if 'pools' not in st.session_state:
    st.session_state.pools = []
if 'last_refresh' not in st.session_state:
    st.session_state.last_refresh = 0
if 'processing' not in st.session_state:
    st.session_state.processing = False
if 'progress' not in st.session_state:
    st.session_state.progress = 0

# API configuration
API_BASE_URL = "http://localhost:5000"
WS_URL = "ws://localhost:5000"

# Sidebar
st.sidebar.title("DLMM Pool Explorer")
rpc_url = st.sidebar.text_input("RPC URL", "https://api.devnet.solana.com")
cluster = st.sidebar.selectbox("Cluster", ["devnet", "mainnet-beta", "testnet"])
pool_limit = st.sidebar.slider("Number of Pools to Fetch", 1, 20, 5)
auto_refresh = st.sidebar.checkbox("Auto-refresh data", value=False)
refresh_interval = st.sidebar.slider("Refresh interval (seconds)", 10, 300, 60)

# Main content
st.title("DLMM Pool Explorer")
st.write("Fetching and displaying DLMM pools from Solana blockchain.")

# Function to fetch pools
def fetch_pools_rest():
    st.session_state.processing = True
    st.session_state.pools = []
    st.session_state.last_refresh = time.time()
    
    try:
        with st.spinner("Fetching pools..."):
            endpoint = "/get_test_pools" if pool_limit <= 20 else "/get_pools"
            try:
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
            except requests.exceptions.ConnectionError:
                st.error(f"Connection refused. Make sure the server is running at {API_BASE_URL}")
            except Exception as e:
                st.error(f"Request error: {str(e)}")
    except Exception as e:
        st.error(f"Error: {str(e)}")
    finally:
        st.session_state.processing = False

# Function to fetch pools via WebSocket
def fetch_pools_ws():
    st.session_state.processing = True
    st.session_state.pools = []
    st.session_state.progress = 0
    st.session_state.last_refresh = time.time()
    
    # Create WebSocket connection in a separate thread
    def ws_thread():
        try:
            # Use the correct import for WebSocketApp
            from websocket import WebSocketApp
            
            ws = WebSocketApp(
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
        except Exception as e:
            st.error(f"WebSocket connection error: {str(e)}")
            st.session_state.processing = False
    
    threading.Thread(target=ws_thread, daemon=True).start()

# Check if we need to auto-refresh
current_time = time.time()
if auto_refresh and (current_time - st.session_state.last_refresh > refresh_interval):
    fetch_pools_rest()

# Fetch button
if st.button("Fetch Pools"):
    fetch_pools_rest()

# Display pool data
if st.session_state.pools:
    # Convert to DataFrame for easier manipulation
    df = pd.DataFrame(st.session_state.pools)
    
    # Display summary stats
    st.header("Summary Statistics")
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Total Pools", len(df))
    col2.metric("Unique Token X", df['tokenX']['mint'].nunique())
    col3.metric("Unique Token Y", df['tokenY']['mint'].nunique())
    
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
            'dynamicFee'
        ]].assign(
            tokenX=df['tokenX'].apply(lambda x: x['mint']),
            tokenY=df['tokenY'].apply(lambda x: x['mint'])
        ),
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
            st.write(f"Mint: {pool_data['tokenX']['mint']}")
            st.write(f"Decimal: {pool_data['tokenX']['decimal']}")
            st.write(f"Amount: {pool_data['tokenX']['amount']}")
            
            st.write("**Token Y**")
            st.write(f"Mint: {pool_data['tokenY']['mint']}")
            st.write(f"Decimal: {pool_data['tokenY']['decimal']}")
            st.write(f"Amount: {pool_data['tokenY']['amount']}")
            
        st.subheader("Fee Information")
        col1, col2, col3 = st.columns(3)
        col1.metric("Base Fee Rate", f"{pool_data['feeInfo']['baseFeeRatePercentage']}%")
        col2.metric("Max Fee Rate", f"{pool_data['feeInfo']['maxFeeRatePercentage']}%")
        col3.metric("Protocol Fee", f"{pool_data['feeInfo']['protocolFeePercentage']}%")
        
        # Show raw JSON
        with st.expander("View Raw JSON"):
            st.json(pool_data.to_dict())
else:
    st.info("No pools loaded. Use the button above to fetch pool data.")

# Footer
st.markdown("---")
st.markdown("DLMM Pool Explorer - Data refreshed at: " + 
            datetime.fromtimestamp(st.session_state.last_refresh).strftime('%Y-%m-%d %H:%M:%S') if st.session_state.last_refresh > 0 else "Never")