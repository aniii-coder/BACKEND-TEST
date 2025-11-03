from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# Initialize the database
db = SQLAlchemy()

# Book model
class Book(db.Model):
    __tablename__ = "book"
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    authors = db.Column(db.String(200))
    isbn = db.Column(db.String(50))
    publisher = db.Column(db.String(100))
    pages = db.Column(db.Integer)
    stock = db.Column(db.Integer, default=1)
    rent_fee = db.Column(db.Float, default=10.0)  # Fee per return

    def __repr__(self):
        return f"<Book {self.title}>"

# Member model
class Member(db.Model):
    __tablename__ = "member"
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True)
    outstanding_fee = db.Column(db.Float, default=0.0)

    def __repr__(self):
        return f"<Member {self.name}>"

# Transaction model
class Transaction(db.Model):
    __tablename__ = "transaction"
    
    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey('book.id'))
    member_id = db.Column(db.Integer, db.ForeignKey('member.id'))
    issue_date = db.Column(db.DateTime, default=datetime.utcnow)
    return_date = db.Column(db.DateTime, nullable=True)
    fee_charged = db.Column(db.Float, default=0.0)

    book = db.relationship("Book", backref="transactions")
    member = db.relationship("Member", backref="transactions")

    def __repr__(self):
        return f"<Transaction Book:{self.book_id} Member:{self.member_id}>"
