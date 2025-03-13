import os
import sys
import debugpy
from app import main

def run_dev_server():
    # Enable debugging
    debugpy.listen(('0.0.0.0', 5678))
    print("Debugger is listening on port 5678")
    
    # Set development mode
    os.environ['DLMM_DEV_MODE'] = 'true'
    
    # Run the app
    main()

if __name__ == '__main__':
    run_dev_server()