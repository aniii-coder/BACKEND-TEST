import React, { useState, useEffect } from "react";

const apiBase = "http://127.0.0.1:5000";

function App() {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [bookForm, setBookForm] = useState({});
  const [memberForm, setMemberForm] = useState({});
  const [transactionForm, setTransactionForm] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBooks = async () => {
    const res = await fetch(`${apiBase}/books`);
    const data = await res.json();
    setBooks(data);
  };

  const fetchMembers = async () => {
    const res = await fetch(`${apiBase}/members`);
    const data = await res.json();
    setMembers(data);
  };

  useEffect(() => {
    fetchBooks();
    fetchMembers();
  }, []);

  const addBook = async (e) => {
    e.preventDefault();
    const res = await fetch(`${apiBase}/books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookForm),
    });
    const result = await res.json();
    alert(result.message);
    setBookForm({});
    fetchBooks();
  };

  const deleteBook = async (id) => {
    if (!window.confirm("Delete this book?")) return;
    const res = await fetch(`${apiBase}/books/${id}`, { method: "DELETE" });
    const result = await res.json();
    alert(result.message);
    fetchBooks();
  };

  const addMember = async (e) => {
    e.preventDefault();
    const res = await fetch(`${apiBase}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(memberForm),
    });
    const result = await res.json();
    alert(result.message);
    setMemberForm({});
    fetchMembers();
  };

  const deleteMember = async (id) => {
    if (!window.confirm("Delete this member?")) return;
    const res = await fetch(`${apiBase}/members/${id}`, { method: "DELETE" });
    const result = await res.json();
    alert(result.message);
    fetchMembers();
  };

  const issueOrReturnBook = async (e) => {
    e.preventDefault();

    const member = members.find(
      (m) => m.id === parseInt(transactionForm.member_id)
    );
    if (!member) {
      alert("Member not found!");
      return;
    }
    if (!transactionForm.return && member.outstanding_fee > 500) {
      alert("Member's outstanding debt exceeds Rs.500. Cannot issue new book.");
      return;
    }

    const res = await fetch(`${apiBase}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transactionForm),
    });
    const result = await res.json();
    if (result.error) alert("Error: " + result.error);
    else alert(result.message);
    setTransactionForm({});
    fetchBooks();
    fetchMembers();
  };

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.authors && b.authors.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const importBooks = async () => {
    const title = prompt("Enter book title to search:");
    const res = await fetch(`${apiBase}/import_books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    const result = await res.json();
    alert(result.message);
    fetchBooks();
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "30px",
        backgroundColor: "#eef2f7",
      }}
    >
      <h1
        style={{ textAlign: "center", color: "#2c3e50", marginBottom: "40px" }}
      >
        Library Management System
      </h1>
      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="Search books by title or author"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ ...inputStyle, width: "300px" }}
        />
      </div>
      <div
        style={{
          display: "flex",
          gap: "50px",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <div style={cardStyle}>
          <h2 style={{ ...headerStyle, borderBottomColor: "#3498db" }}>
            Books
          </h2>
          <button style={importButtonStyle} onClick={importBooks}>
            📚 Import Books
          </button>

          <div
            style={{ marginTop: "15px", maxHeight: "300px", overflowY: "auto" }}
          >
            {filteredBooks.map((b) => (
              <div key={b.id} style={itemStyle}>
                <div>
                  <span style={{ color: "#888", fontSize: "12px" }}>
                    ID: {b.id}
                  </span>{" "}
                  <br />
                  <strong>{b.title}</strong> by {b.authors || "N/A"} <br />
                  Stock: {b.stock} | ISBN: {b.isbn || "N/A"}
                </div>
                <button onClick={() => deleteBook(b.id)} style={deleteBtnStyle}>
                  Delete
                </button>
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: "20px" }}>Add Book</h3>
          <form onSubmit={addBook} style={formStyle}>
            <input
              placeholder="Title"
              value={bookForm.title || ""}
              onChange={(e) =>
                setBookForm({ ...bookForm, title: e.target.value })
              }
              style={inputStyle}
              required
            />
            <input
              placeholder="Authors"
              value={bookForm.authors || ""}
              onChange={(e) =>
                setBookForm({ ...bookForm, authors: e.target.value })
              }
              style={inputStyle}
            />
            <input
              placeholder="ISBN"
              value={bookForm.isbn || ""}
              onChange={(e) =>
                setBookForm({ ...bookForm, isbn: e.target.value })
              }
              style={inputStyle}
            />
            <input
              placeholder="Publisher"
              value={bookForm.publisher || ""}
              onChange={(e) =>
                setBookForm({ ...bookForm, publisher: e.target.value })
              }
              style={inputStyle}
            />
            <input
              placeholder="Pages"
              type="number"
              value={bookForm.pages || ""}
              onChange={(e) =>
                setBookForm({ ...bookForm, pages: e.target.value })
              }
              style={inputStyle}
            />
            <input
              placeholder="Stock"
              type="number"
              value={bookForm.stock || ""}
              onChange={(e) =>
                setBookForm({ ...bookForm, stock: e.target.value })
              }
              style={inputStyle}
            />
            <button type="submit" style={submitButtonStyle("#3498db")}>
              Add
            </button>
          </form>

          {/* Dropdown for transactions */}
          <h3 style={{ marginTop: "20px" }}>Select Book for Transaction</h3>
          <select
            value={transactionForm.book_id || ""}
            onChange={(e) =>
              setTransactionForm({
                ...transactionForm,
                book_id: e.target.value,
              })
            }
            style={inputStyle}
          >
            <option value="">-- Select Book --</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title} by {b.authors || "N/A"} (Stock: {b.stock})
              </option>
            ))}
          </select>
        </div>

        {/* Members Section */}
        <div style={cardStyle}>
          <h2 style={{ ...headerStyle, borderBottomColor: "#27ae60" }}>
            Members
          </h2>
          <div style={{ marginTop: "15px" }}>
            {members.map((m) => (
              <div key={m.id} style={itemStyle}>
                <div>
                  <span style={{ color: "#888", fontSize: "12px" }}>
                    ID: {m.id}
                  </span>{" "}
                  <br />
                  <strong>{m.name}</strong> ({m.email || "N/A"}) — Fee: Rs.
                  {m.outstanding_fee}
                </div>
                <button
                  onClick={() => deleteMember(m.id)}
                  style={deleteBtnStyle}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: "20px" }}>Add Member</h3>
          <form onSubmit={addMember} style={formStyle}>
            <input
              placeholder="Name"
              value={memberForm.name || ""}
              onChange={(e) =>
                setMemberForm({ ...memberForm, name: e.target.value })
              }
              style={inputStyle}
              required
            />
            <input
              placeholder="Email"
              value={memberForm.email || ""}
              onChange={(e) =>
                setMemberForm({ ...memberForm, email: e.target.value })
              }
              style={inputStyle}
            />
            <button type="submit" style={submitButtonStyle("#27ae60")}>
              Add
            </button>
          </form>

          <h3 style={{ marginTop: "20px" }}>Issue/Return Book</h3>
          <form onSubmit={issueOrReturnBook} style={formStyle}>
            <input
              placeholder="Book ID"
              value={transactionForm.book_id || ""}
              onChange={(e) =>
                setTransactionForm({
                  ...transactionForm,
                  book_id: e.target.value,
                })
              }
              style={inputStyle}
              required
            />
            <input
              placeholder="Member ID"
              value={transactionForm.member_id || ""}
              onChange={(e) =>
                setTransactionForm({
                  ...transactionForm,
                  member_id: e.target.value,
                })
              }
              style={inputStyle}
              required
            />
            <select
              value={transactionForm.return || false}
              onChange={(e) =>
                setTransactionForm({
                  ...transactionForm,
                  return: e.target.value === "true",
                })
              }
              style={inputStyle}
            >
              <option value="false">Issue</option>
              <option value="true">Return</option>
            </select>
            <button type="submit" style={submitButtonStyle("#f39c12")}>
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  flex: "1 1 450px",
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
};
const headerStyle = {
  borderBottom: "3px solid",
  paddingBottom: "8px",
  color: "#2c3e50",
  fontSize: "20px",
};
const itemStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px",
  borderBottom: "1px solid #ddd",
  borderRadius: "6px",
  marginBottom: "8px",
  backgroundColor: "#f9f9f9",
};
const deleteBtnStyle = {
  backgroundColor: "#e74c3c",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  transition: "all 0.2s",
  fontWeight: "bold",
};
const importButtonStyle = {
  backgroundColor: "#8e44ad",
  color: "#fff",
  padding: "10px 15px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold",
  marginBottom: "10px",
  transition: "all 0.3s",
};
const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  marginTop: "10px",
};
const inputStyle = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "14px",
  width: "100%",
};
const submitButtonStyle = (color) => ({
  padding: "10px",
  backgroundColor: color,
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "14px",
  transition: "all 0.2s",
});

export default App;
