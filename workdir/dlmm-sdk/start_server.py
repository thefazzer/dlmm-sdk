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
    server_file_path = 'ts-client/dist/server/serverMain.js'
    if not os.path.exists(server_file_path):
        # Look for the file in alternative locations
        possible_locations = [
            'ts-client/dist/src/server/serverMain.js',
            'ts-client/dist/serverMain.js',
            'ts-client/dist/server/serverMain.cjs',
            'ts-client/dist/src/server/serverMain.cjs'
        ]
        
        for location in possible_locations:
            if os.path.exists(location):
                print(f"Found compiled file at {location}")
                server_file_path = location
                break
        else:
            print("Could not find the compiled server file!")
            print("Available files in ts-client/dist:")
            for root, dirs, files in os.walk('ts-client/dist'):
                for file in files:
                    print(os.path.join(root, file))
            return False, None
    
    return True, server_file_path

def start_server(server_file_path):
    print(f"Starting the server using {server_file_path}...")
    server_process = subprocess.Popen(
        ["node", server_file_path],
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
    success, server_file_path = compile_typescript()
    if success:
        server_process = start_server(server_file_path)
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