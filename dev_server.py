import os
import sys
import debugpy
import subprocess
from pathlib import Path

def run_dev_server():
    # Enable debugging
    debugpy.listen(('0.0.0.0', 5678))
    print("Debugger is listening on port 5678")
    debugpy.wait_for_client()
    print("Debugger attached")
    
    # Set development mode
    os.environ['DLMM_DEV_MODE'] = 'true'
    
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
        process.wait()

if __name__ == '__main__':
    run_dev_server()