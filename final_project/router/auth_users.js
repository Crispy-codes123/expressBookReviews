const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are mandatory!" });
}

    const validUser = users.filter((user) => user.username === username && user.password === password);

    if (validUser.length > 0) {
        
        let accessToken = jwt.sign({
            data: password
        }, "Key"); 

        req.session.authorization = {
            accessToken,
            username
        };
        return res.status(200).send("Customer successfully logged in");
    } else {
        return res.status(401).json({ message: "Login failed"});
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

    const username = req.session.authorization['username'];
    const review = req.query.review;
    const isbn = req.params.isbn;

    if (!review) {
        return res.status(400).json({ message: "Include review body!" });
    }

    if (books[isbn]) {
        books[isbn].reviews[username] = review;
        
        return res.status(200).json({ 
            message: `Review for the book: ${isbn} has been successfully submited/modified by ${username}.` 
        });
        
    } else {
        return res.status(404).json({ message: "The book hasn't been found!" });
    }
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    const username = req.session.authorization['username'];

    if (books[isbn]) {
        let book = books[isbn];

        if (book.reviews && book.reviews[username]) {
                delete book.reviews[username];
            
            return res.status(200).json({ 
                message: `Review by ${username} for ISBN ${isbn} deleted.` 
            });
        } else {
            return res.status(404).json({ message: "User has no reviews" });
        }
    } else {
        return res.status(404).json({ message: "The book hasn't been found!" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
