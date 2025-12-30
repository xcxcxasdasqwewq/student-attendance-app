"""
Simple script to initialize database without starting the server
"""
from app import init_db

if __name__ == '__main__':
    print("Initializing database...")
    init_db()
    print("✅ Database initialized successfully!")

