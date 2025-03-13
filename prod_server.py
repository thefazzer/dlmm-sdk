import os
from app import main

def run_prod_server():
    # Set production mode
    os.environ['DLMM_DEV_MODE'] = 'false'
    
    # Run the app
    process = main()
    
    try:
        # Keep the main process running
        process.join()
    except KeyboardInterrupt:
        print("Shutting down gracefully...")
        process.terminate()
        process.join()

if __name__ == '__main__':
    run_prod_server()