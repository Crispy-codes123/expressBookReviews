const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
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

// --- MODULAR REUSABLE FUNCTIONS ---
// These functions encapsulate the core logic to keep the routing code clean and maintainable.

// Task 10 logic: Simulate fetching all books asynchronously
// This function returns a Promise that resolves with the entire books database
const fetchAllBooks = () => {
    return new Promise((resolve, reject) => {
        // Resolve the promise successfully with the complete books dataset
        resolve(books);
    });
};

// Task 11 logic: Simulate fetching a specific book by its ISBN asynchronously
const fetchBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        // Check if the provided ISBN exists as a key in the books object
        if (books[isbn]) {
            // If a match is found, resolve the Promise with the specific book's details
            resolve(books[isbn]);
        } else {
            // If no match is found, reject the Promise with a clear error message
            reject("Book not found");
        }
    });
};

// Task 12 logic: Simulate fetching multiple books by a specific Author asynchronously
const fetchBooksByAuthor = (authorSearch) => {
    return new Promise((resolve, reject) => {
        // Initialize an empty array to collect all books written by the requested author
        let booksByAuthor = [];
        // Extract all ISBNs (keys) from the books object to iterate over them
        const isbns = Object.keys(books);
        
        // Iterate through each ISBN to filter the books
        isbns.forEach((isbn) => {
            // Check for a match between the current book's author and the search term
            if (books[isbn].author === authorSearch) {
                // Push the matching book into our collection array
                booksByAuthor.push(books[isbn]);
            }
        });
        
        // Evaluate if any books were found during the iteration process
        if (booksByAuthor.length > 0) {
            // Resolve the Promise with the populated array
            resolve(booksByAuthor);
        } else {
            // Reject the Promise if the array remains empty (author not found)
            reject("Author not found");
        }
    });
};

// Task 13 logic: Simulate fetching books by a specific Title asynchronously
const fetchBooksByTitle = (titleSearch) => {
    return new Promise((resolve, reject) => {
        // Initialize an array to hold books that match the requested title
        let booksByTitle = [];
        // Retrieve all keys (ISBNs) from the database
        const isbns = Object.keys(books);
        
        // Loop through the database to find matching titles
        isbns.forEach((isbn) => {
            // Filter logic: compare the title of the current book with the search query
            if (books[isbn].title === titleSearch) {
                // Add the matched book to our results
                booksByTitle.push(books[isbn]);
            }
        });
        
        // Check if our filtering logic yielded any results
        if (booksByTitle.length > 0) {
            // Resolve the Promise with the found book(s)
            resolve(booksByTitle);
        } else {
            // Reject the Promise if no book matches the given title
            reject("Title not found");
        }
    });
};

// --- EXPRESS ROUTES ---

// Task 10: Get the book list available in the shop using Promise callbacks
public_users.get('/', async function (req, res) {
    try {
        // Await the resolution of our modular fetchAllBooks function
        const allBooks = await fetchAllBooks();
        // Return the successfully retrieved data with a 200 OK HTTP status
        return res.status(200).send(JSON.stringify(allBooks, null, 4));
    } catch (error) {
        // Handle unexpected server errors
        return res.status(500).json({ message: "Error fetching books" });
    }
});

// Task 11: Get book details based on ISBN using Promise callbacks
public_users.get('/isbn/:isbn', async function (req, res) {
    // Extract the target ISBN from the request URL parameters
    const requestedIsbn = req.params.isbn;
    try {
        // Call the helper function and wait for it to find the book
        const book = await fetchBookByISBN(requestedIsbn);
        // Send the found book back to the client
        return res.status(200).send(JSON.stringify(book, null, 4));
    } catch (error) {
        // Catch the rejection and return a 404 Not Found status
        return res.status(404).json({ message: error });
    }
});
  
// Task 12: Get book details based on author using Promise callbacks
public_users.get('/author/:author', async function (req, res) {
    // Safely decode the author name from the URL string
    const authorSearch = decodeURIComponent(req.params.author);
    try {
        // Delegate the filtering logic to the modular fetchBooksByAuthor function
        const booksByAuthor = await fetchBooksByAuthor(authorSearch);
        // Send the filtered array of books as a formatted JSON string
        return res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
    } catch (error) {
        // Return a 404 error if the modular function rejects the Promise
        return res.status(404).json({ message: error });
    }
});

// Task 13: Get all books based on title using Promise callbacks
public_users.get('/title/:title', async function (req, res) {
    // Decode the title parameter to handle spaces and special characters correctly
    const titleSearch = decodeURIComponent(req.params.title);
    try {
        // Retrieve the filtered data from our asynchronous helper function
        const booksByTitle = await fetchBooksByTitle(titleSearch);
        // Respond with the matching book(s)
        return res.status(200).send(JSON.stringify(booksByTitle, null, 4));
    } catch (error) {
        // Properly handle the error case if the title does not exist in the database
        return res.status(404).json({ message: error });
    }
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