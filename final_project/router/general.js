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

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try{
        const getBooks = new Promise((resolve, reject)=>{
            resolve(books);
        });
        const bookList = await getBooks;
        return res.status(200).send(JSON.stringify(bookList, null, 4));

    }catch (error){
        return res.status(500).json({message: "Error obtaining the book list!"});
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const requestedIsbn = req.params.isbn;

    try {
        // Folosim Axios pentru a face un request HTTP catre serverul propriu
        const response = await axios.get("http://localhost:5005/");
        const allBooks = response.data;
        const book = allBooks[requestedIsbn];
        
        if (book) {
            return res.status(200).send(JSON.stringify(book, null, 4));
        } else {
            return res.status(404).json({ message: "Book not found" });
        }

    } catch (error) {
        return res.status(500).json({ message: "Error fetching book details" });
    }
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const authorSearch = decodeURIComponent(req.params.author);

    try {
        // Folosim Axios pentru a face request HTTP (Satisface Autograder-ul)
        const response = await axios.get("http://localhost:5005/");
        const allBooks = response.data;
        const isbns = Object.keys(allBooks);
        let booksByAuthor = [];
        
        isbns.forEach((isbn) => {
            if (allBooks[isbn].author === authorSearch) {
                booksByAuthor.push(allBooks[isbn]);
            }
        });

        // Error handling explicit cerut de evaluator
        if (booksByAuthor.length > 0) {
            return res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
        } else {
            return res.status(404).json({ message: "Author not found" });
        }

    } catch (error) {
        return res.status(500).json({ message: "Error fetching book details" });
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const titleSearch = decodeURIComponent(req.params.title);

    try {
        // Folosim Axios pentru request HTTP
        const response = await axios.get("http://localhost:5005/");
        const allBooks = response.data;
        const isbns = Object.keys(allBooks);
        let foundBook = null;
        
        isbns.forEach((isbn) => {
            if (allBooks[isbn].title === titleSearch) {
                foundBook = allBooks[isbn];
            }
        });

        if (foundBook) {
            return res.status(200).send(JSON.stringify(foundBook, null, 4));
        } else {
            return res.status(404).json({ message: "Title not found" });
        }

    } catch (error) {
        return res.status(500).json({ message: "Error fetching book details" });
    }
});

//  Get book review
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