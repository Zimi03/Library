from flask import request, jsonify, Blueprint, g
from definitions import User, BookList, BookCopies
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import aliased
from sqlalchemy import case, exists, and_

routes_blueprint = Blueprint('routes', __name__)

@routes_blueprint.route('/')
def hello_world():  # put application's code here
    return 'Hello World!'

@routes_blueprint.post('/users')
def registerUser():
    data = request.get_json()
    print(data)

    if not data:
        return jsonify({'error' : 'No data provided'}), 400

    db = g.db
    existing_user = db.query(User).filter((User.username == data['username']) | (User.email == data['email'])).first()
    if existing_user:
        return jsonify({'error' : 'User already exists'}), 400
    hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256', salt_length=8)
    new_user = User(username=data['username'],
                    password=hashed_password,
                    role=0,
                    email=data['email'],
                    phone_number=data['phone_number'])
    db.add(new_user)
    db.commit()

    return '', 200


@routes_blueprint.post('/login')
def login():
    data = request.get_json()

    # Validate that data exists
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400

    # Query user by username
    db = g.db
    user = db.query(User).filter_by(username=data['username']).first()

    if user is None:
        return jsonify({'error': 'User not found'}), 404

    # Check if the entered password matches the stored hashed password
    if not check_password_hash(user.password, data['password']):
        return jsonify({'error': 'Invalid password'}), 401

    # If password matches, return a success message or token
    return jsonify({'message': 'Login successful'}), 200

@routes_blueprint.post('/books')
def addBook():
    data = request.get_json()
    print(data)

    db = g.db
    existing_book = db.query(BookList).filter((BookList.title == data['title']) & (BookList.author == data['author'])).first()

    new_book = None
    if not existing_book:
        new_book = BookList(title=data['title'], author=data['author'], genre=data['genre'])
        db.add(new_book)
        db.commit()

    book_id = existing_book.book_id if existing_book else new_book.book_id
    new_copy = BookCopies(book_id=book_id, status=1)
    db.add(new_copy)
    db.commit()

    return jsonify({'message': 'Book added successfully'}), 200

@routes_blueprint.get('/books')
def getBooks():
    title = request.args.get('title')
    author = request.args.get('author')
    genre = request.args.get('genre')
    print(title, author, genre)

    db = g.db

    book_copies = aliased(BookCopies)

    query = db.query(
            BookList.title,
            BookList.author,
            BookList.genre,
            case(
                (
                    db.query(book_copies.copy_id)
                    .filter(
                        and_(
                            book_copies.book_id == BookList.book_id,
                            book_copies.status == 1
                        )
                    )
                    .exists(),
                    'dostępna'
                ),
                else_='niedostępna'
            ).label('status')
        )

    if title:
        query = query.filter(BookList.title == title)
    if author:
        query = query.filter(BookList.author == author)
    if genre:
        query = query.filter(BookList.genre == genre)

    books = query.all()

    print(books)

    return ""

@routes_blueprint.post('/deleteBook')
def deleteBook():
    data = request.get_json()
    print(data)
    db = g.db
    copy_id = data['copy_id']
    db.query(BookCopies).filter(BookCopies.copy_id==copy_id).update({BookCopies.status: 0})
    db.commit()
    return jsonify({'message': 'Book deleted successfully'}), 200