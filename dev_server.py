import os
import sys
import debugpy
import subprocess
from pathlib import Path

def start_server():
    print("Starting the server...")
    server_process = subprocess.Popen(
        ["node", "ts-client/dist/ts-client/src/server/unifiedServer.js"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    # Wait a bit for the server to start
    import time
    time.sleep(2)
    
    # Check if the server started successfully
    if server_process.poll() is not None:
        stdout, stderr = server_process.communicate()
        print("Server failed to start:")
        print(stderr.decode())
        return None
        
    print("Server started successfully!")
    return server_process

def run_dev_server():
    # Enable debugging
    debugpy.listen(('0.0.0.0', 5678))
    print("Debugger is listening on port 5678")
    debugpy.wait_for_client()
    print("Debugger attached")
    
    # Set development mode
    os.environ['DLMM_DEV_MODE'] = 'true'
    
    # Start the unified server first
    server_process = start_server()
    if not server_process:
        print("Failed to start unified server")
        return
    
    # Get the absolute path to app.py
    app_path = Path(__file__).parent / 'app.py'
    
    # Run streamlit with the debugger enabled
    cmd = [
        sys.executable, 
        '-m', 'streamlit',
        'run',
        str(app_path),
        '--server.headless', 'true',
        '--server.runOnSave', 'true'
    ]
    
    try:
        process = subprocess.Popen(cmd)
        process.wait()
    except KeyboardInterrupt:
        print("Shutting down gracefully...")
        process.terminate()
        server_process.terminate()
        process.wait()
        server_process.wait()

if __name__ == '__main__':
    run_dev_server()