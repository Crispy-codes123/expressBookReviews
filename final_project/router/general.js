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

// Task 10: Get the book list available in the shop using Promises
public_users.get('/', async function (req, res) {
    try {
        // Create a new Promise to handle the asynchronous operation
        const getBooks = new Promise((resolve, reject) => {
            // Resolve the promise with the books object
            resolve(books);
        });
        // Wait for the promise to resolve
        const bookList = await getBooks;
        // Return the book list with a 200 OK HTTP status
        return res.status(200).send(JSON.stringify(bookList, null, 4));

    } catch (error) {
        // Handle any errors that might occur during retrieval
        return res.status(500).json({message: "Error obtaining the book list!"});
    }
});

// Task 11: Get book details based on ISBN using Axios and Async/Await
public_users.get('/isbn/:isbn', async function (req, res) {
    // Retrieve the ISBN from the request parameters
    const requestedIsbn = req.params.isbn;

    try {
        // Use Axios to make an HTTP GET request to our own base URL
        const response = await axios.get("http://localhost:5005/");
        // Extract the data object containing all books
        const allBooks = response.data;
        // Find the specific book by its ISBN
        const book = allBooks[requestedIsbn];
        
        // If the book exists, send it in the response
        if (book) {
            return res.status(200).send(JSON.stringify(book, null, 4));
        } else {
            // Return a 404 Not Found error if the ISBN doesn't exist
            return res.status(404).json({ message: "Book not found" });
        }

    } catch (error) {
        // Catch any potential network or server issues
        return res.status(500).json({ message: "Error fetching book details" });
    }
});
  
// Task 12: Get book details based on author using Axios and Async/Await
public_users.get('/author/:author', async function (req, res) {
    // Decode the author name from the URL parameters
    const authorSearch = decodeURIComponent(req.params.author);

    try {
        // Use Axios to make an HTTP GET request to fetch all books
        const response = await axios.get("http://localhost:5005/");
        // Extract the data object
        const allBooks = response.data;
        // Retrieve all the keys (ISBNs)
        const isbns = Object.keys(allBooks);
        // Initialize an empty array to collect filtered books
        let booksByAuthor = []; 
        
        // Loop through the array of ISBNs
        isbns.forEach((isbn) => {
            // Check if the author matches the requested author
            if (allBooks[isbn].author === authorSearch) {
                // Push the book details into our array
                booksByAuthor.push(allBooks[isbn]);
            }
        });

        // Evaluate if our filtered array has any matching books
        if (booksByAuthor.length > 0) {
            // Return the filtered list with a 200 OK status
            return res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
        } else {
            // Return a 404 error if not found
            return res.status(404).json({ message: "Author not found" });
        }

    } catch (error) {
        // Catch network or server errors
        return res.status(500).json({ message: "Error fetching book details" });
    }
});

// Task 13: Get all books based on title using Axios and Async/Await
public_users.get('/title/:title', async function (req, res) {
    // Decode the title parameter from the URL
    const titleSearch = decodeURIComponent(req.params.title);

    try {
        // Use Axios to make an HTTP request
        const response = await axios.get("http://localhost:5005/");
        // Extract the data object
        const allBooks = response.data;
        // Retrieve all the keys (ISBNs)
        const isbns = Object.keys(allBooks);
        // Initialize a variable for the found book
        let foundBook = null;
        
        // Filter logic to find book by title
        isbns.forEach((isbn) => {
            // Check if the title matches
            if (allBooks[isbn].title === titleSearch) {
                // Assign the found book
                foundBook = allBooks[isbn];
            }
        });

        // Response handling
        if (foundBook) {
            // Return the book details
            return res.status(200).send(JSON.stringify(foundBook, null, 4));
        } else {
            // Return a 404 error if not found
            return res.status(404).json({ message: "Title not found" });
        }

    } catch (error) {
        // Catch any errors during the process
        return res.status(500).json({ message: "Error fetching book details" });
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