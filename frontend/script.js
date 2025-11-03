const API = "http://127.0.0.1:5000";

// ----------------- BOOKS -----------------
function fetchBooks() {
    fetch(`${API}/books`)
    .then(res => res.json())
    .then(data => {
        const table = document.getElementById("booksTable");
        if (!table) return;
        table.innerHTML = "";
        data.forEach(b => {
            table.innerHTML += `<tr>
                <td>${b.id}</td><td>${b.title}</td><td>${b.authors}</td>
                <td>${b.publisher}</td><td>${b.pages}</td><td>${b.stock}</td>
            </tr>`;
        });
    });
}

function addBook() {
    const book = {
        title: document.getElementById("bookTitle").value,
        authors: document.getElementById("bookAuthors").value,
        publisher: document.getElementById("bookPublisher").value,
        pages: parseInt(document.getElementById("bookPages").value),
        stock: parseInt(document.getElementById("bookStock").value)
    };
    fetch(`${API}/books`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(book)
    }).then(res => res.json())
      .then(msg => {
        alert(msg.message);
        fetchBooks();
        document.getElementById("bookTitle").value = "";
        document.getElementById("bookAuthors").value = "";
        document.getElementById("bookPublisher").value = "";
        document.getElementById("bookPages").value = "";
        document.getElementById("bookStock").value = 1;
      });
}

// ----------------- MEMBERS -----------------
function fetchMembers() {
    fetch(`${API}/members`)
    .then(res => res.json())
    .then(data => {
        const table = document.getElementById("membersTable");
        if (!table) return;
        table.innerHTML = "";
        data.forEach(m => {
            table.innerHTML += `<tr>
                <td>${m.id}</td><td>${m.name}</td><td>${m.email}</td><td>${m.outstanding_fee}</td>
            </tr>`;
        });
    });
}

function addMember() {
    const member = {
        name: document.getElementById("memberName").value,
        email: document.getElementById("memberEmail").value
    };
    fetch(`${API}/members`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(member)
    }).then(res => res.json())
      .then(msg => {
        alert(msg.message);
        fetchMembers();
        document.getElementById("memberName").value = "";
        document.getElementById("memberEmail").value = "";
      });
}

// ----------------- TRANSACTIONS -----------------
function issueReturn() {
    const data = {
        book_id: parseInt(document.getElementById("transBookId").value),
        member_id: parseInt(document.getElementById("transMemberId").value),
        return: document.getElementById("returnBook").checked
    };
    fetch(`${API}/transactions`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(msg => {
        alert(msg.message || msg.error);
        fetchBooks();
        fetchMembers();
        document.getElementById("transBookId").value = "";
        document.getElementById("transMemberId").value = "";
        document.getElementById("returnBook").checked = false;
    });
}

// ----------------- IMPORT BOOKS -----------------
function importBooks() {
    const data = {
        title: document.getElementById("importTitle").value,
        page: parseInt(document.getElementById("importPage").value)
    };
    fetch(`${API}/import_books`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(msg => {
        alert(msg.message || msg.error);
        fetchBooks();
        document.getElementById("importTitle").value = "";
        document.getElementById("importPage").value = 1;
    });
}

// ----------------- AUTO FETCH ON LOAD -----------------
window.onload = () => {
    fetchBooks();
    fetchMembers();
};
