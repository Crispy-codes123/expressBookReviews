const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username and password are provided
    if(!username || !password){
        return res.status(400).json({ message: "Username and password are mandatory!" });
    }

    // Filter the users array to check if the username is already taken
    const userExists = users.filter((user) => user.username === username);

    if (userExists.length > 0) {
        return res.status(409).json({ message: "Username already exists" });
    }
    
    // Add the new user to the database
    users.push({ "username": username, "password": password });
    return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Task 10: Get the book list available in the shop using Promise callbacks
public_users.get('/', function (req, res) {
    // Create a new Promise to handle the asynchronous-like retrieval
    let getBooksPromise = new Promise((resolve, reject) => {
        // Resolve the promise successfully with the books object
        resolve(books);
    });

    // Use .then() callback to handle the resolved promise
    getBooksPromise
        .then((bookList) => {
            return res.status(200).send(JSON.stringify(bookList, null, 4));
        })
        // Use .catch() callback to handle any potential errors
        .catch((error) => {
            return res.status(500).json({ message: "Error obtaining book list" });
        });
});

// Task 11: Get book details based on ISBN using Promise callbacks
public_users.get('/isbn/:isbn', function (req, res) {
    // Create a Promise to search for a specific book
    let getBookPromise = new Promise((resolve, reject) => {
        const isbn = req.params.isbn;
        // Check if the requested ISBN exists in the books object
        if (books[isbn]) {
            // Resolve with the found book
            resolve(books[isbn]);
        } else {
            // Reject the promise if the book is not found
            reject("Book not found");
        }
    });

    // Handle the Promise callbacks
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
    // Create a Promise to encapsulate the filtering logic
    let getBooksByAuthorPromise = new Promise((resolve, reject) => {
        const authorSearch = decodeURIComponent(req.params.author);
        let booksByAuthor = [];
        // Extract all keys (ISBNs) to iterate through the object
        const isbns = Object.keys(books);
        
        // Iterate through each book to match the author
        isbns.forEach((isbn) => {
            // Filter logic: if the author matches the search query
            if (books[isbn].author === authorSearch) {
                booksByAuthor.push(books[isbn]);
            }
        });

        // Resolve if at least one book matches, otherwise reject
        if (booksByAuthor.length > 0) {
            resolve(booksByAuthor);
        } else {
            reject("Author not found");
        }
    });

    // Process the results using .then() and .catch() callbacks
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
    // Wrap the title search logic inside a Promise
    let getBooksByTitlePromise = new Promise((resolve, reject) => {
        const titleSearch = decodeURIComponent(req.params.title);
        let foundBook = null;
        // Get all ISBNs to prepare for iteration
        const isbns = Object.keys(books);
        
        // Iterate and filter the database to find the exact title match
        isbns.forEach((isbn) => {
            if (books[isbn].title === titleSearch) {
                foundBook = books[isbn];
            }
        });

        // Resolve the promise if the title is found, else reject
        if (foundBook) {
            resolve(foundBook);
        } else {
            reject("Title not found");
        }
    });

    // Handle success or failure using callback chaining
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
