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
        return res.status(200).json({ message: "User successfully registered!" });

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
        const getBookByIsbn = new Promise((resolve, reject) => {
            const book = books[requestedIsbn];
            
            if (book) {
                resolve(book);
            } else {
                reject("The book hasn't been found");
            }
        });
        const foundBook = await getBookByIsbn;
        return res.status(200).send(JSON.stringify(foundBook, null, 4));

    } catch (error) {
        return res.status(404).json({ message: error });
    }
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const authorSearch = decodeURIComponent(req.params.author);

    try {
        const getBooksByAuthor = new Promise((resolve, reject) => {
            const isbns = Object.keys(books);
            let booksByAuthor = [];
            
            isbns.forEach((isbn) => {
                let currentBook = books[isbn];
                
                if (currentBook.author === authorSearch) {
                    booksByAuthor.push(currentBook);
                }
            });

            if (booksByAuthor.length > 0) {
                resolve(booksByAuthor);
            } else {
                reject("The book hasn't been found");
            }
        });
        const booksFound = await getBooksByAuthor;
        return res.status(200).send(JSON.stringify(booksFound, null, 4));

    } catch (error) {
        return res.status(404).json({ message: error });
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const titleSearch = decodeURIComponent(req.params.title);

    try {
        const getBookByTitle = new Promise((resolve, reject) => {
            const isbns = Object.keys(books);
            let foundBook = null;
            
            isbns.forEach((isbn) => {
                if (books[isbn].title === titleSearch) {
                    foundBook = books[isbn];
                }
            });

            if (foundBook) {
                resolve(foundBook);
            } else {
                reject("The book hasn't been found");
            }
        });
        const book = await getBookByTitle;
        return res.status(200).send(JSON.stringify(book, null, 4));

    } catch (error) {
        return res.status(404).json({ message: error });
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