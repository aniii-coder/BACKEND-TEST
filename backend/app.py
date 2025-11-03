from flask import Flask, request, jsonify
from models import db, Book, Member, Transaction
from dotenv import load_dotenv
import os, requests

from flask_cors import CORS

app = Flask(__name__)
CORS(app)  

load_dotenv()

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")

db.init_app(app)

with app.app_context():
    db.create_all()

    if Book.query.count() == 0:
        sample_books = [
            Book(title="Harry Potter and the Sorcerer's Stone", authors="J.K. Rowling", isbn="9780747532699", publisher="Bloomsbury", pages=223, stock=5),
            Book(title="The Hobbit", authors="J.R.R. Tolkien", isbn="9780261102217", publisher="HarperCollins", pages=310, stock=3),
            Book(title="1984", authors="George Orwell", isbn="9780451524935", publisher="Signet Classic", pages=328, stock=4),
        ]
        db.session.add_all(sample_books)
        db.session.commit()
        print("Sample books added.")

    # Seed sample members if none exist
    if Member.query.count() == 0:
        sample_members = [
            Member(name="Alice Johnson", email="alice@example.com"),
            Member(name="Bob Smith", email="bob@example.com"),
            Member(name="Charlie Brown", email="charlie@example.com"),
        ]
        db.session.add_all(sample_members)
        db.session.commit()
        print("Sample members added.")


# ----------------- CRUD and Transactions -----------------

@app.route("/books", methods=["GET", "POST"])
def books():
    if request.method == "GET":
        all_books = Book.query.all()
        return jsonify([{
            "id": b.id,
            "title": b.title,
            "authors": b.authors,
            "isbn": b.isbn,
            "publisher": b.publisher,
            "pages": b.pages,
            "stock": b.stock
        } for b in all_books])
    elif request.method == "POST":
        data = request.json
        book = Book(
            title=data["title"], authors=data.get("authors"),
            isbn=data.get("isbn"), publisher=data.get("publisher"),
            pages=data.get("pages"), stock=data.get("stock", 1)
        )
        db.session.add(book)
        db.session.commit()
        return jsonify({"message": "Book added successfully"})


@app.route("/members", methods=["GET", "POST"])
def members():
    if request.method == "GET":
        all_members = Member.query.all()
        return jsonify([{
            "id": m.id,
            "name": m.name,
            "email": m.email,
            "outstanding_fee": m.outstanding_fee
        } for m in all_members])
    elif request.method == "POST":
        data = request.json
        member = Member(name=data["name"], email=data.get("email"))
        db.session.add(member)
        db.session.commit()
        return jsonify({"message": "Member added successfully"})


@app.route("/members/<int:member_id>", methods=["GET"])
def get_member(member_id):
    m = Member.query.get_or_404(member_id)
    return jsonify({
         "id": m.id,
            "name": m.name,
            "email": m.email,
            "outstanding_fee": m.outstanding_fee
    })


    # @app.route("/members/<int:member_id>", methods=["DELETE"])
    #     def delete_member(member_id):
    #         member = Member.query.get_or_404(member_id)  # Get member or 404 if not found
    #         db.session.delete(member)                    # Delete from the session
    #         db.session.commit()                          # Commit changes to DB
    #         return jsonify({"message": f"Member '{member.name}' deleted successfully"})


@app.route("/transactions", methods=["POST"])
def issue_return():
    data = request.json
    book = Book.query.get_or_404(data["book_id"])
    member = Member.query.get_or_404(data["member_id"])

    # Check if returning book
    if data.get("return"):
        transaction = Transaction.query.filter_by(
            book_id=book.id, member_id=member.id, return_date=None
        ).first()
        if not transaction:
            return jsonify({"error": "No active transaction found"}), 400

        transaction.return_date = db.func.current_timestamp()
        transaction.fee_charged = book.rent_fee
        member.outstanding_fee += book.rent_fee
        if member.outstanding_fee > 500:
            return jsonify({"error": "Outstanding fee exceeds Rs.500"}), 400
        book.stock += 1
        db.session.commit()
        return jsonify({"message": "Book returned successfully"})

    # Issue book
    if book.stock < 1:
        return jsonify({"error": "Book out of stock"}), 400
    if member.outstanding_fee > 500:
        return jsonify({"error": "Member outstanding fee > Rs.500"}), 400

    transaction = Transaction(book_id=book.id, member_id=member.id)
    db.session.add(transaction)
    book.stock -= 1
    db.session.commit()
    return jsonify({"message": "Book issued successfully"})


@app.route("/import_books", methods=["POST"])
def import_books():
    params = request.json
    page = params.get("page", 1)
    title = params.get("title", "")
    url = f"{os.getenv('FRAPPE_API')}?page={page}&title={title}"
    resp = requests.get(url)
    if resp.status_code != 200:
        return jsonify({"error": "Failed to fetch books"}), 400

    books = resp.json().get("message", [])
    for b in books:
        book = Book.query.filter_by(title=b['title']).first()
        if not book:
            book = Book(
                title=b['title'],
                authors=b.get("authors"),
                isbn=b.get("isbn"),
                publisher=b.get("publisher"),
                pages=int(b.get("num_pages", 0)),
                stock=1
            )
            db.session.add(book)
    db.session.commit()
    return jsonify({"message": f"{len(books)} books imported successfully"})





@app.route("/books/<int:book_id>", methods=["GET", "PUT", "DELETE"])
def book_detail(book_id):
    book = Book.query.get_or_404(book_id)

    if request.method == "GET":
        return jsonify({
            "id": book.id,
            "title": book.title,
            "authors": book.authors,
            "isbn": book.isbn,
            "publisher": book.publisher,
            "pages": book.pages,
            "stock": book.stock
        })

    elif request.method == "PUT":
        data = request.json
        # Update fields only if they are present in the request data
        book.title = data.get("title", book.title)
        book.authors = data.get("authors", book.authors)
        book.isbn = data.get("isbn", book.isbn)
        book.publisher = data.get("publisher", book.publisher)
        book.pages = data.get("pages", book.pages)
        book.stock = data.get("stock", book.stock)
        
        db.session.commit()
        return jsonify({"message": f"Book '{book.title}' updated successfully"})
    
    elif request.method == "DELETE":
        db.session.delete(book)
        db.session.commit()
        return jsonify({"message": f"Book '{book.title}' deleted successfully"})

@app.route("/members/<int:member_id>", methods=["GET", "PUT", "DELETE"])
def member_detail(member_id):
    member = Member.query.get_or_404(member_id)

    if request.method == "GET":
        return jsonify({
            "id": member.id,
            "name": member.name,
            "email": member.email,
            "outstanding_fee": member.outstanding_fee
        })

    elif request.method == "PUT":
        data = request.json
        member.name = data.get("name", member.name)
        member.email = data.get("email", member.email)
        
        db.session.commit()
        return jsonify({"message": f"Member '{member.name}' updated successfully"})

    elif request.method == "DELETE":
        db.session.delete(member)
        db.session.commit()
        return jsonify({"message": f"Member '{member.name}' deleted successfully"})



if __name__ == "__main__":
    app.run(debug=True)
