import os

class Config:
    # Generate a secure key for sessions
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    
    # SQLite database configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(os.path.abspath(os.path.dirname(__file__)), 'game_store.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False