import streamlit as st
import requests
import pandas as pd
import plotly.express as px
import time
from datetime import datetime

# Configuration
st.set_page_config(
    page_title="DLMM Pool Explorer",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Constants
DEFAULT_RPC_URL = "https://api.devnet.solana.com"
DEFAULT_POOL_LIMIT = 5
DEFAULT_REFRESH_INTERVAL = 60
API_TIMEOUT = 60  # seconds

# Initialize session state with defaults
if 'pools' not in st.session_state:
    st.session_state.pools = []
if 'last_refresh' not in st.session_state:
    st.session_state.last_refresh = 0
if 'error_message' not in st.session_state:
    st.session_state.error_message = None

# API configuration
API_BASE_URL = "http://localhost:5000"

# Sidebar
st.sidebar.title("DLMM Pool Explorer")
rpc_url = st.sidebar.text_input("RPC URL", DEFAULT_RPC_URL)
cluster = st.sidebar.selectbox("Cluster", ["devnet", "mainnet-beta", "testnet"])
pool_limit = st.sidebar.slider("Number of Pools to Fetch", 1, 50, DEFAULT_POOL_LIMIT)
auto_refresh = st.sidebar.checkbox("Auto-refresh data", value=False)
refresh_interval = st.sidebar.slider("Refresh interval (seconds)", 10, 300, DEFAULT_REFRESH_INTERVAL)

# Main content
st.title("DLMM Pool Explorer")
st.write("Fetching and displaying DLMM pools from Solana blockchain.")

def safe_numeric_conversion(value, default=0.0):
    """Safely convert string to numeric value"""
    try:
        return float(value) if value is not None else default
    except (ValueError, TypeError):
        return default

# Function to fetch pools with error handling
def fetch_pools():
    st.session_state.last_refresh = time.time()
    st.session_state.error_message = None
    
    with st.spinner("Fetching pool data..."):
        try:
            response = requests.get(
                f"{API_BASE_URL}/get_test_pools",
                params={
                    "rpc_url": rpc_url,
                    "limit": pool_limit,
                    "cluster": cluster
                },
                timeout=API_TIMEOUT
            )
            
            response.raise_for_status()  # Raise exception for bad status codes
            
            pools = response.json()
            if not pools:
                st.warning("No pools found.")
                return []
                
            st.success(f"Successfully fetched {len(pools)} pools")
            return pools
            
        except requests.exceptions.ConnectionError:
            error_msg = "Failed to connect to API server. Please check if the server is running."
            st.error(error_msg)
            st.session_state.error_message = error_msg
            return []
        except requests.exceptions.Timeout:
            error_msg = f"Request timed out after {API_TIMEOUT} seconds"
            st.error(error_msg)
            st.session_state.error_message = error_msg
            return []
        except requests.exceptions.RequestException as e:
            error_msg = f"Error fetching pools: {str(e)}"
            st.error(error_msg)
            st.session_state.error_message = error_msg
            return []
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            st.error(error_msg)
            st.session_state.error_message = error_msg
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
    try:
        # Convert to DataFrame for easier manipulation
        df = pd.DataFrame(st.session_state.pools)
        
        # Display summary stats
        st.header("Summary Statistics")
        col1, col2, col3, col4 = st.columns(4)
        col1.metric("Total Pools", len(df))
        col2.metric("Unique Token X", df['tokenX.mint'].nunique())
        col3.metric("Unique Token Y", df['tokenY.mint'].nunique())
        
        # Safe conversion of dynamic fee
        avg_fee = pd.to_numeric(df['dynamicFee'], errors='coerce').mean()
        col4.metric("Average Dynamic Fee", f"{avg_fee:.2f}%" if pd.notnull(avg_fee) else "N/A")
        
        # Distribution of bin steps
        if 'binStep' in df.columns and not df['binStep'].empty:
            st.subheader("Distribution of Bin Steps")
            bin_step_counts = df['binStep'].value_counts().reset_index()
            bin_step_counts.columns = ['Bin Step', 'Count']
            fig = px.bar(bin_step_counts, x='Bin Step', y='Count')
            st.plotly_chart(fig, use_container_width=True)
        
        # Pool explorer
        st.header("Pool Explorer")
        
        # Display all pools in a table with safe column access
        display_columns = [
            'pubkey', 
            'binStep', 
            'activeId', 
            'activePriceUI', 
            'dynamicFee',
            'tokenX.mint',
            'tokenY.mint'
        ]
        
        # Only show columns that exist in the dataframe
        valid_columns = [col for col in display_columns if col in df.columns]
        if valid_columns:
            st.dataframe(df[valid_columns], use_container_width=True)
        
        # Pool details
        st.header("Pool Details")
        if 'pubkey' in df.columns:
            selected_pool = st.selectbox("Select a pool", df['pubkey'].tolist())
            
            if selected_pool:
                pool_data = df[df['pubkey'] == selected_pool].iloc[0]
                
                col1, col2 = st.columns(2)
                with col1:
                    st.subheader("Basic Information")
                    st.write(f"**Pool Address:** {pool_data.get('pubkey', 'N/A')}")
                    st.write(f"**Bin Step:** {pool_data.get('binStep', 'N/A')}")
                    st.write(f"**Active Bin ID:** {pool_data.get('activeId', 'N/A')}")
                    st.write(f"**Active Price:** {pool_data.get('activePriceUI', 'N/A')}")
                    st.write(f"**Dynamic Fee:** {pool_data.get('dynamicFee', 'N/A')}%")
                
                with col2:
                    st.subheader("Token Information")
                    st.write("**Token X**")
                    st.write(f"Mint: {pool_data.get('tokenX.mint', 'N/A')}")
                    st.write(f"Decimal: {pool_data.get('tokenX.decimal', 'N/A')}")
                    st.write(f"Amount: {pool_data.get('tokenX.amount', 'N/A')}")
                    
                    st.write("**Token Y**")
                    st.write(f"Mint: {pool_data.get('tokenY.mint', 'N/A')}")
                    st.write(f"Decimal: {pool_data.get('tokenY.decimal', 'N/A')}")
                    st.write(f"Amount: {pool_data.get('tokenY.amount', 'N/A')}")
                
                st.subheader("Fee Information")
                col1, col2, col3 = st.columns(3)
                col1.metric("Base Fee Rate", f"{pool_data.get('feeInfo.baseFeeRatePercentage', 'N/A')}%")
                col2.metric("Max Fee Rate", f"{pool_data.get('feeInfo.maxFeeRatePercentage', 'N/A')}%")
                col3.metric("Protocol Fee", f"{pool_data.get('feeInfo.protocolFeePercentage', 'N/A')}%")
                
                # Show raw JSON
                with st.expander("View Raw JSON"):
                    st.json(pool_data.to_dict())
    except Exception as e:
        st.error(f"Error processing pool data: {str(e)}")
else:
    st.info("No pools loaded. Use the button above to fetch pool data.")

# Footer with error message if any
st.markdown("---")
if st.session_state.error_message:
    st.error(st.session_state.error_message)

refresh_time = datetime.fromtimestamp(st.session_state.last_refresh).strftime('%Y-%m-%d %H:%M:%S') if st.session_state.last_refresh > 0 else "Never"
st.markdown(f"DLMM Pool Explorer - Data refreshed at: {refresh_time}")