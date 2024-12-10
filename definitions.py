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
    status = Column(Integer, nullable=False) #0 - wycofana, 1 - dostępna, 2 - wyp.