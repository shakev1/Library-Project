from flask import Flask, jsonify, request, session
from flask_cors import CORS
from models import db
from models.user import Admin, Customer
from models.Game import Game
from models.loans import Loan
from config import Config
from datetime import datetime

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
db.init_app(app)

# Authentication routes
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    admin = Admin.query.filter_by(username=data['username']).first()
    
    if admin and admin.check_password(data['password']):
        session['admin_id'] = admin.id
        return jsonify({'message': 'Login successful'}), 200
    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('admin_id', None)
    return jsonify({'message': 'Logout successful'}), 200

# Game routes
@app.route('/api/games', methods=['GET'])
def get_games():
    games = Game.query.all()
    return jsonify([game.to_dict() for game in games])

@app.route('/api/games', methods=['POST'])
def add_game():
    data = request.get_json()
    new_game = Game(
        title=data['title'],
        genre=data['genre'],
        price=data['price'],
        quantity=data['quantity']
    )
    db.session.add(new_game)
    db.session.commit()
    return jsonify(new_game.to_dict()), 201

@app.route('/api/games/<int:game_id>', methods=['DELETE'])
def delete_game(game_id):
    game = Game.query.get_or_404(game_id)
    db.session.delete(game)
    db.session.commit()
    return jsonify({'message': 'Game deleted'}), 200

# Customer routes
@app.route('/api/customers', methods=['POST'])
def add_customer():
    data = request.get_json()
    new_customer = Customer(
        name=data['name'],
        email=data['email'],
        phone=data['phone']
    )
    db.session.add(new_customer)
    db.session.commit()
    return jsonify({'id': new_customer.id, 'name': new_customer.name}), 201

# Loan routes
@app.route('/api/loans', methods=['POST'])
def create_loan():
    data = request.get_json()
    game = Game.query.get_or_404(data['game_id'])
    
    if game.loan_status:
        return jsonify({'message': 'Game is already loaned'}), 400
    
    new_loan = Loan(
        game_id=data['game_id'],
        customer_id=data['customer_id'],
        loan_date=datetime.utcnow()
    )
    
    game.loan_status = True
    game.customer_id = data['customer_id']
    game.loan_date = datetime.utcnow()
    
    db.session.add(new_loan)
    db.session.commit()
    return jsonify({'message': 'Loan created successfully'}), 201

@app.route('/api/loans', methods=['GET'])
def get_loans():
    loans = Loan.query.filter_by(return_date=None).all()
    return jsonify([{
        'id': loan.id,
        'game_title': loan.game.title,
        'customer_name': loan.customer.name,
        'loan_date': loan.loan_date.isoformat()
    } for loan in loans])

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)