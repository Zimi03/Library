from flask import request, jsonify, Blueprint, g
from definitions import *
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import aliased
from sqlalchemy import case, and_, tuple_
from datetime import datetime, timedelta
from helpers import get_user_unpaid_fines
routes_blueprint = Blueprint('routes', __name__)

@routes_blueprint.route('/')
def hello_world():  # put application's code here
    return 'Super fajna aplikacja do obslugi biblioteki'

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

@routes_blueprint.post("/reserveBook")
def reserveBook():
    data = request.get_json()
    print(data)
    db = g.db

    username = data['username']

    user = db.query(User).filter(User.username == username).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    user_id = user.user_id
    current_date = datetime.today()
    reservation_date = current_date + timedelta(days=8)

    reserved_books = []

    books = data['books']

    for book in books:
        title = book['title']
        author = book['author']

        book_entry = db.query(BookList).filter(BookList.author == author, BookList.title == title).first()
        if not book_entry:
            continue

        copy = db.query(BookCopies).filter(
            (BookCopies.book_id == book_entry.book_id) & (BookCopies.status == 1)).first()
        if not copy:
            continue

        # existing_reservation_item = db.query(Reservation_item).filter(Reservation_item.copy_id == copy.copy_id).first()
        # if existing_reservation_item:
        #     continue

        reserved_books.append(copy.copy_id)  # Track the reserved copy

    if not reserved_books:
        return jsonify({'error': 'None of the selected books are available for reservation'}), 400

    reservation = Reservation(user_id=user_id, reservation_date=reservation_date)
    db.add(reservation)
    db.commit()

    reservation_id = db.query(Reservation).filter(Reservation.user_id == user_id).order_by(
        Reservation.reservation_id.desc()).first().reservation_id

    for copy_id in reserved_books:
        reservation_item = Reservation_item(reservation_id=reservation_id, copy_id=copy_id)
        db.add(reservation_item)

        db.query(BookCopies).filter(BookCopies.copy_id == copy_id).update({BookCopies.status: 3})

    db.commit()

    return jsonify({'message': 'Books reserved successfully'}), 200


@routes_blueprint.post('/loanBook')
def loanBook():
    data = request.get_json()
    print(data)
    db = g.db

    librarian_username = data['librarian_username']
    user_username = data['user_username']

    user_fines=get_user_unpaid_fines(db, user_username)

    for fine in user_fines:
        if not fine["paid"]:
            return jsonify({'error': 'Fine not paid'}), 404

    user1 = db.query(User).filter(User.username == user_username).first()
    user2 = db.query(User).filter(User.username == librarian_username).first()

    if not user1 or not user2:
        return jsonify({'error': 'User not found'}), 404

    user1_id = user1.user_id
    user2_id = user2.user_id

    title = data['title']
    author = data['author']

    book_record = db.query(BookList).filter(BookList.author == author, BookList.title == title).first()
    if not book_record:
        return jsonify({'error': 'Book not found'}), 404

    copy = (
        db.query(BookCopies)
        .join(Reservation_item, BookCopies.copy_id == Reservation_item.copy_id, isouter=True)
        .join(Reservation, Reservation_item.reservation_id == Reservation.reservation_id, isouter=True)
        .filter((BookCopies.book_id == book_record.book_id) &
                ((BookCopies.status == 1) |
                 ((BookCopies.status == 3) &
                  (Reservation.user_id == user1_id))))
        .first()
    )

    if not copy:
        return jsonify({'error': 'Book not available for loan'}), 404

    loan = Loans(Reader_user_id=user1_id,
                Librarian_user_id=user2_id,
                copy_id=copy.copy_id,
                loan_date=datetime.today(),
                expected_return_date=datetime.today()+timedelta(days=30))

    db.query(BookCopies).filter(BookCopies.copy_id == copy.copy_id).update({BookCopies.status: 2})

    db.add(loan)
    db.commit()
    return jsonify({'message': 'Book loaned successfully'}), 200

@routes_blueprint.post('/returnBook')
def returnBook():
    data = request.get_json()
    print(data)
    db = g.db

    username = data['username']
    title = data['title']
    author = data['author']

    book_record = db.query(BookList).filter(BookList.author == author, BookList.title == title).first()
    if not book_record:
        return jsonify({'error': 'Book not found'}), 404
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    user1_id = user.user_id
    book_id = book_record.book_id

    loan = (
            db.query(Loans)
            .join(BookCopies, BookCopies.copy_id == Loans.copy_id, isouter=True)
            .filter((BookCopies.book_id == book_id) &
                    (Loans.Reader_user_id == user1_id) &
                    (BookCopies.copy_id == Loans.copy_id) &
                    (Loans.actual_return_date == None)
                    )
                    .first()
            )

    if not loan:
        return jsonify({'error': 'loan not found'}), 404

    copy_id = loan.copy_id
    loan_id = loan.loan_id
    if datetime.today().date() <= loan.expected_return_date:
        fine_amount = abs((datetime.today().date() - loan.expected_return_date).days) * 0.3
        fine = Fines(loan_id = loan_id,
                    amount = fine_amount,
                    paid = False
                    )

        db.add(fine)

    db.query(BookCopies).filter(BookCopies.copy_id == copy_id).update({BookCopies.status: 1})
    db.query(Loans).filter(Loans.loan_id == loan_id).update({Loans.actual_return_date: datetime.today()})
    db.commit()
    return jsonify({'message': 'Book returned successfully'}), 200
@routes_blueprint.get('/getFines')
def get_fines():
    db = g.db
    username = request.args.get('username')

    user = db.query(User).filter(User.username == username).first()
    fines = get_user_unpaid_fines(db, username)
    if not fines:
        return jsonify({'error': 'No fines found'}), 404
    else:
        print(fines)
        return jsonify({'fines': fines}), 200

@routes_blueprint.post('/payFine')
def pay_fine():
    data = request.get_json()
    print(data)
    db = g.db

    username = data['username']

    user_fines=get_user_unpaid_fines(db, username)
    if not user_fines:
        return jsonify({'error': 'No fines found'}), 404
    fine_id= None
    for fine in user_fines:
        if not fine["paid"]:
            fine_id = fine["fine_id"]
    if not fine_id:
        return jsonify({'error': 'No unpaid fines found'}), 404

    db.query(Fines).filter(Fines.fine_id == fine_id).update({Fines.paid: True})
    db.commit()
    return jsonify({'message': 'Fine paid successfully'}), 200
