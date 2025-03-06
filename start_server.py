import subprocess
import time
import os
import sys

def start_server():
    print("Starting the server...")
    # Adjust the path to your server script as needed
    server_process = subprocess.Popen(
        ["node", "ts-client/dist/server/unifiedServer.js"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # Wait a bit for the server to start
    time.sleep(2)
    
    # Check if the server started successfully
    if server_process.poll() is not None:
        # Server exited prematurely
        stdout, stderr = server_process.communicate()
        print("Server failed to start:")
        print(stderr.decode())
        return None
    
    print("Server started successfully!")
    return server_process

def start_streamlit():
    print("Starting Streamlit app...")
    streamlit_process = subprocess.Popen(
        ["streamlit", "run", "app.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    return streamlit_process

if __name__ == "__main__":
    server_process = start_server()
    if server_process:
        streamlit_process = start_streamlit()
        
        try:
            # Keep the script running until Ctrl+C
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("Shutting down...")
            streamlit_process.terminate()
            server_process.terminate()
            print("Done!")