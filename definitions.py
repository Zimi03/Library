from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Date, DECIMAL, create_engine
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = 'Users'

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(255), nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(Integer, nullable=False)
    email = Column(String(255), nullable=False)
    phone_number = Column(String(255), nullable=False)

class BookList(Base):
    __tablename__ = 'Books_List'

    book_id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    author = Column(String(255), nullable=False)
    genre = Column(String(255), nullable=False)

class BookCopies(Base):
    __tablename__ = 'Books_Copies'

    copy_id = Column(Integer, primary_key=True, autoincrement=True)
    book_id = Column(Integer, ForeignKey('Books_List.book_id'), nullable=False)
    status = Column(Integer, nullable=False) #0 - wycofana, 1 - dostępna, 2 - wyp., 3 - zarezerwowana

class Reservation_item(Base):
    __tablename__ = 'reservation_item'

    reservation_item_id = Column(Integer, primary_key=True, autoincrement=True)
    reservation_id = Column(Integer, ForeignKey('Reservations.reservation_id'), nullable=False)
    copy_id = Column(Integer, ForeignKey('Books_Copies.copy_id'), nullable=False)

class Reservation(Base):
    __tablename__ = 'Reservations'

    reservation_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('Users.user_id'), nullable=False)
    reservation_date = Column(Date, nullable=False)

class Loans(Base):
    __tablename__ = 'Loans'

    loan_id = Column(Integer, primary_key=True, autoincrement=True)
    Reader_user_id = Column(Integer, ForeignKey('Users.user_id'), nullable=False)
    Librarian_user_id = Column(Integer, ForeignKey('Users.user_id'), nullable=False)
    loan_date = Column(Date, nullable=False)
    copy_id = Column(Integer, ForeignKey('Books_Copies.copy_id'), nullable=False)
    expected_return_date = Column(Date, nullable=False)
    actual_return_date = Column(Date, nullable=True)

class Fines(Base):
    __tablename__ = 'Fines'

    fine_id = Column(Integer, primary_key=True, autoincrement=True)
    loan_id = Column(Integer, ForeignKey('Loans.loan_id'), nullable=False)
    amount = Column(DECIMAL(10,2), nullable=False)
    paid = Column(Boolean, nullable=False)