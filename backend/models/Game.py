from . import db
from datetime import datetime

class Game(db.Model):
    __tablename__ = 'games'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    genre = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    loan_status = db.Column(db.Boolean, default=False)
    
    # Foreign key for customer relationship
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=True)
    loan_date = db.Column(db.DateTime, nullable=True)