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

// Get the book list available in the shop using Promises
public_users.get('/', async function (req, res) {
    try{
        const getBooks = new Promise((resolve, reject)=>{
            resolve(books);
        });
        const bookList = await getBooks;
        return res.status(200).send(JSON.stringify(bookList, null, 4));

    }catch (error){
        // Error handling for book list retrieval
        return res.status(500).json({message: "Error obtaining the book list!"});
    }
});

// Get book details based on ISBN using Axios and Async/Await
public_users.get('/isbn/:isbn', async function (req, res) {
    const requestedIsbn = req.params.isbn;

    try {
        // Fetch the data from the base endpoint using Axios
        const response = await axios.get("http://localhost:5005/");
        const allBooks = response.data;
        const book = allBooks[requestedIsbn];
        
        if (book) {
            return res.status(200).send(JSON.stringify(book, null, 4));
        } else {
            return res.status(404).json({ message: "Book not found" });
        }

    } catch (error) {
        // Comprehensive error handling
        return res.status(500).json({ message: "Error fetching book details" });
    }
});
  
// Get book details based on author using Axios and Async/Await
public_users.get('/author/:author', async function (req, res) {
    // Decode the author name from the URL parameters
    const authorSearch = decodeURIComponent(req.params.author);

    try {
        // Use Axios to make an HTTP GET request to our own base URL to fetch all books
        const response = await axios.get("http://localhost:5005/");
        // Extract the data object containing all books from the Axios response
        const allBooks = response.data;
        // Retrieve all the keys (ISBNs) from the allBooks object
        const isbns = Object.keys(allBooks);
        // Initialize an empty array to collect all books written by the specific author
        let booksByAuthor = []; 
        
        // Loop through the array of ISBNs to iterate over each book
        isbns.forEach((isbn) => {
            // Check if the author of the current book matches the requested author
            // This is the logic behind filtering books by author
            if (allBooks[isbn].author === authorSearch) {
                // If there is a match, push the book details into our filtering array
                booksByAuthor.push(allBooks[isbn]);
            }
        });

        // Evaluate if our filtered array has any matching books
        if (booksByAuthor.length > 0) {
            // Return the filtered list of books with a 200 OK HTTP status
            return res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
        } else {
            // If no books correspond to the author, return a 404 Not Found error
            return res.status(404).json({ message: "Author not found" });
        }

    } catch (error) {
        // Catch any potential network or server issues during the Axios request
        return res.status(500).json({ message: "Error fetching book details" });
    }
});

// Get all books based on title using Axios and Async/Await
public_users.get('/title/:title', async function (req, res) {
    const titleSearch = decodeURIComponent(req.params.title);

    try {
        // Use Axios to retrieve books
        const response = await axios.get("http://localhost:5005/");
        const allBooks = response.data;
        const isbns = Object.keys(allBooks);
        let foundBook = null;
        
        // Filter logic to find book by title
        isbns.forEach((isbn) => {
            if (allBooks[isbn].title === titleSearch) {
                foundBook = allBooks[isbn];
            }
        });

        // Response handling
        if (foundBook) {
            return res.status(200).send(JSON.stringify(foundBook, null, 4));
        } else {
            return res.status(404).json({ message: "Title not found" });
        }

    } catch (error) {
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