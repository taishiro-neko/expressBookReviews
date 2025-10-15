const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    //console.log(`Register: username=${username} password=${password}`);
    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: `User ${username} successfully registered. Now you can login.`});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user: need both username and password."});

});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
   res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn]); 
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;

  let filteredBooks = Object.entries(books)
    .filter(([id, book]) => book.author.toLowerCase() === author.toLowerCase())
    .map(([id, book]) => ({ id, ...book }));

    // Object.entries converts dictionary to array so filter works
    // map converts the array back to dictionary
    // lowercase is so it's easier to test

  res.send(filteredBooks);  

});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;

  let filteredBooks = Object.entries(books)
    .filter(([id, book]) => book.title.toLowerCase() === title.toLowerCase())
    .map(([id, book]) => ({ id, ...book }));

  res.send(filteredBooks);  
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;
