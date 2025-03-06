import subprocess
import time
import os
import sys
import shutil

def compile_typescript():
    print("Compiling TypeScript code...")
    # Navigate to ts-client directory
    os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ts-client'))
    
    # Check if node_modules exists, if not run npm install
    if not os.path.exists('node_modules'):
        print("Installing dependencies...")
        subprocess.run(["npm", "install"], check=True)
    
    # Compile TypeScript
    result = subprocess.run(["npm", "run", "build"], check=True)
    
    # Go back to the original directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Check if the compiled file exists
    if not os.path.exists('ts-client/dist/server/unifiedServer.js'):
        # Check if the file exists in a different location
        possible_locations = [
            'ts-client/dist/src/server/unifiedServer.js',
            'ts-client/lib/server/unifiedServer.js',
            'ts-client/build/server/unifiedServer.js'
        ]
        
        for location in possible_locations:
            if os.path.exists(location):
                print(f"Found compiled file at {location}")
                # Create the directory structure if it doesn't exist
                os.makedirs(os.path.dirname('ts-client/dist/server/unifiedServer.js'), exist_ok=True)
                # Copy the file to the expected location
                shutil.copy(location, 'ts-client/dist/server/unifiedServer.js')
                break
        else:
            print("Could not find the compiled unifiedServer.js file!")
            print("Available files in ts-client/dist:")
            for root, dirs, files in os.walk('ts-client/dist'):
                for file in files:
                    print(os.path.join(root, file))
            return False
    
    return True

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
    # First compile the TypeScript code
    if compile_typescript():
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
    else:
        print("Failed to compile TypeScript code. Cannot start server.")