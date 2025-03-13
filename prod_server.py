import os
import sys
import subprocess
from pathlib import Path

def run_prod_server():
    # Set production mode
    os.environ['DLMM_DEV_MODE'] = 'false'
    
    # Get the absolute path to app.py
    app_path = Path(__file__).parent / 'app.py'
    
    # Run streamlit
    cmd = [
        sys.executable,
        '-m', 'streamlit',
        'run',
        str(app_path),
        '--server.headless', 'true'
    ]
    
    try:
        process = subprocess.Popen(cmd)
        process.wait()
    except KeyboardInterrupt:
        print("Shutting down gracefully...")
        process.terminate()
        process.wait()

if __name__ == '__main__':
    run_prod_server()