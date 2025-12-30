#!/usr/bin/env python3
"""
Simple Python script to start both backend and frontend servers
"""
import subprocess
import sys
import os
import time
import signal
import platform

def check_requirements():
    """Check if Python and Node.js are installed"""
    try:
        subprocess.run(['python3', '--version'], check=True, capture_output=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Python 3 is not installed. Please install Python 3 first.")
        sys.exit(1)
    
    try:
        subprocess.run(['node', '--version'], check=True, capture_output=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Node.js is not installed. Please install Node.js first.")
        sys.exit(1)

def setup_backend():
    """Setup and start backend"""
    backend_dir = os.path.join(os.getcwd(), 'backend')
    os.chdir(backend_dir)
    
    # Create venv if not exists
    venv_path = os.path.join(backend_dir, 'venv')
    if not os.path.exists(venv_path):
        print("📦 Creating Python virtual environment...")
        subprocess.run([sys.executable, '-m', 'venv', 'venv'], check=True, cwd=backend_dir)
    
    # Determine activation script based on OS
    if platform.system() == 'Windows':
        pip_path = os.path.join(venv_path, 'Scripts', 'pip.exe')
        python_path = os.path.join(venv_path, 'Scripts', 'python.exe')
    else:
        pip_path = os.path.join(venv_path, 'bin', 'pip')
        python_path = os.path.join(venv_path, 'bin', 'python')
    
    # Install dependencies
    print("📥 Installing Python dependencies...")
    try:
        subprocess.run([pip_path, 'install', '-q', '-r', 'requirements.txt'], 
                      check=True, cwd=backend_dir, timeout=120)
    except subprocess.TimeoutExpired:
        print("⚠️  Installation taking longer than expected, continuing...")
    except Exception as e:
        print(f"⚠️  Warning: {e}")
    
    # Initialize database
    print("🗄️  Initializing database...")
    try:
        subprocess.run([python_path, 'init_db.py'], 
                      check=True, cwd=backend_dir, timeout=10,
                      stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print("✅ Database initialized!")
    except Exception as e:
        print(f"⚠️  Database init: {e}")
    
    # Create mock data
    print("📊 Creating mock data...")
    try:
        result = subprocess.run([python_path, 'create_mock_data.py'], 
                              check=True, cwd=backend_dir, timeout=30,
                              capture_output=True, text=True)
        print("✅ Mock data created!")
    except subprocess.TimeoutExpired:
        print("⚠️  Mock data creation timed out")
    except Exception as e:
        print(f"⚠️  Mock data warning: {e}")
    
    # Start backend
    print("🔙 Starting backend server...")
    if platform.system() == 'Windows':
        backend_process = subprocess.Popen([python_path, 'app.py'], 
                                          cwd=backend_dir,
                                          creationflags=subprocess.CREATE_NEW_CONSOLE)
    else:
        backend_process = subprocess.Popen([python_path, 'app.py'], 
                                          cwd=backend_dir,
                                          stdout=subprocess.PIPE,
                                          stderr=subprocess.PIPE)
    
    os.chdir('..')
    return backend_process

def setup_frontend():
    """Setup and start frontend"""
    frontend_dir = os.path.join(os.getcwd(), 'frontend')
    os.chdir(frontend_dir)
    
    # Install dependencies if needed
    node_modules_path = os.path.join(frontend_dir, 'node_modules')
    react_scripts_path = os.path.join(node_modules_path, '.bin', 'react-scripts')
    
    if not os.path.exists(node_modules_path) or not os.path.exists(react_scripts_path):
        print("📦 Installing Node.js dependencies (this may take a few minutes)...")
        try:
            result = subprocess.run(['npm', 'install'], 
                                  check=True, 
                                  cwd=frontend_dir, 
                                  timeout=300,
                                  capture_output=True,
                                  text=True)
            print("✅ Node modules installed!")
        except subprocess.TimeoutExpired:
            print("⚠️  Installation taking longer, continuing anyway...")
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install npm dependencies: {e.stderr}")
            print("Please run 'npm install' manually in the frontend directory.")
            raise
        except Exception as e:
            print(f"⚠️  Warning: {e}")
    
    # Start frontend
    print("🎨 Starting frontend server...")
    if platform.system() == 'Windows':
        frontend_process = subprocess.Popen(['npm', 'start'], 
                                           cwd=frontend_dir,
                                           creationflags=subprocess.CREATE_NEW_CONSOLE)
    else:
        frontend_process = subprocess.Popen(['npm', 'start'], 
                                           cwd=frontend_dir,
                                           stdout=subprocess.PIPE,
                                           stderr=subprocess.PIPE)
    
    os.chdir('..')
    return frontend_process

def main():
    """Main function"""
    print("🚀 Starting Attendance Management System...")
    print("")
    
    # Store original directory
    original_dir = os.getcwd()
    
    check_requirements()
    
    backend_process = None
    frontend_process = None
    
    try:
        backend_process = setup_backend()
        print("⏳ Waiting for backend to start...")
        time.sleep(3)
        
        frontend_process = setup_frontend()
        print("⏳ Waiting for frontend to start...")
        time.sleep(5)
        
        print("")
        print("=" * 50)
        print("✅ System is starting up!")
        print("=" * 50)
        print("")
        print("📊 Backend API: http://localhost:5001")
        print("🎨 Frontend App: http://localhost:3000")
        print("")
        print("⚠️  Note: Frontend may take 30-60 seconds to compile")
        print("")
        print("Press Ctrl+C to stop all servers")
        print("")
        
        # Keep script running
        try:
            while True:
                time.sleep(1)
                # Check if processes are still alive
                if backend_process and backend_process.poll() is not None:
                    print("⚠️  Backend process ended unexpectedly")
                if frontend_process and frontend_process.poll() is not None:
                    print("⚠️  Frontend process ended unexpectedly")
        except KeyboardInterrupt:
            pass
        
    except KeyboardInterrupt:
        print("\n🛑 Stopping servers...")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Cleanup
        print("\n🛑 Stopping servers...")
        if backend_process:
            try:
                if platform.system() == 'Windows':
                    backend_process.terminate()
                    time.sleep(1)
                    backend_process.kill()
                else:
                    backend_process.terminate()
                    time.sleep(1)
                    backend_process.kill()
            except:
                pass
        if frontend_process:
            try:
                if platform.system() == 'Windows':
                    frontend_process.terminate()
                    time.sleep(1)
                    frontend_process.kill()
                else:
                    frontend_process.terminate()
                    time.sleep(1)
                    frontend_process.kill()
            except:
                pass
        os.chdir(original_dir)
        print("✅ Servers stopped.")

if __name__ == '__main__':
    main()

