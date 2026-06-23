const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

    if(!username || !password){
        return res.status(400).json({ message: "Username and password are mandatory!" });
    }

    const userExists = users.filter((user) => user.username === username);

    if (userExists.length > 0) {
        return res.status(409).json({ message: "Username already exists" });
    }
    users.push({ "username": username, "password": password });
        return res.status(200).json({ message: "User successfully registered. Now you can login" });

});

// Task 10: Get the book list available in the shop using Promise callbacks
public_users.get('/', function (req, res) {
    let getBooksPromise = new Promise((resolve, reject) => {
        resolve(books);
    });

    getBooksPromise
        .then((bookList) => {
            return res.status(200).send(JSON.stringify(bookList, null, 4));
        })
        .catch((error) => {
            return res.status(500).json({ message: "Error obtaining book list" });
        });
});

// Task 11: Get book details based on ISBN using Promise callbacks
public_users.get('/isbn/:isbn', function (req, res) {
    let getBookPromise = new Promise((resolve, reject) => {
        const isbn = req.params.isbn;
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject("Book not found");
        }
    });

    getBookPromise
        .then((book) => {
            return res.status(200).send(JSON.stringify(book, null, 4));
        })
        .catch((error) => {
            return res.status(404).json({ message: error });
        });
});
  
// Task 12: Get book details based on author using Promise callbacks
public_users.get('/author/:author', function (req, res) {
    let getBooksByAuthorPromise = new Promise((resolve, reject) => {
        const authorSearch = decodeURIComponent(req.params.author);
        let booksByAuthor = [];
        const isbns = Object.keys(books);
        isbns.forEach((isbn) => {
            if (books[isbn].author === authorSearch) {
                booksByAuthor.push(books[isbn]);
            }
        });

        if (booksByAuthor.length > 0) {
            resolve(booksByAuthor);
        } else {
            reject("Author not found");
        }
    });

    getBooksByAuthorPromise
        .then((booksByAuthor) => {
            return res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
        })
        .catch((error) => {
            return res.status(404).json({ message: error });
        });
});

// Task 13: Get all books based on title using Promise callbacks
public_users.get('/title/:title', function (req, res) {
    let getBooksByTitlePromise = new Promise((resolve, reject) => {
        const titleSearch = decodeURIComponent(req.params.title);
        let foundBook = null;
        const isbns = Object.keys(books);
        isbns.forEach((isbn) => {
            if (books[isbn].title === titleSearch) {
                foundBook = books[isbn];
            }
        });

        if (foundBook) {
            resolve(foundBook);
        } else {
            reject("Title not found");
        }
    });

    getBooksByTitlePromise
        .then((book) => {
            return res.status(200).send(JSON.stringify(book, null, 4));
        })
        .catch((error) => {
            return res.status(404).json({ message: error });
        });
});

// Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbnSearch = req.params.isbn;
    const book = books[isbnSearch];
    
    if(book){
        return res.status(200).send(JSON.stringify(book.reviews, null, 4));
      }else{
      return res.status(404).json({message: "The book hasn't been found"});
    }
});

module.exports.general = public_users;