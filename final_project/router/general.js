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
/* Original sync function
public_users.get('/',function (req, res) {
   res.send(JSON.stringify(books,null,4));
});
*/

// async version
public_users.get("/", async function (req, res) {
  try {
    const data = await Promise.resolve(books);
    res.send(JSON.stringify(data, null, 4));
  } catch (err) {
    console.error("Error fetching books:", err);
    res.status(500).json({ message: "Error fetching books" });
  }
});


// Get book details based on ISBN
// Original sync function
/*
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }
  res.send(book); 
 });
*/

// async version
public_users.get('/isbn/:isbn',async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const data = await Promise.resolve(books[isbn]);
    if (!book) {
      return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }
    res.send(JSON.stringify(data, null, 4));
  } catch (err) {
    console.error(`Error fetching book ${isbn} :`, err);
    res.status(500).json({ message: `Error fetching book ${isbn}` });
  }
 });

  
// Get book details based on author
/* original version
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
*/

// async version
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    const filteredBooks = await Promise.resolve(
      Object.entries(books)
        .filter(([id, book]) => book.author.toLowerCase() === author.toLowerCase())
        .map(([id, book]) => ({ id, ...book }))
    );

    if (filteredBooks.length === 0) {
      return res.status(404).json({ message: `No books found for author '${author}'.` });
    }

    res.json(filteredBooks);
  } catch (err) {
    console.error(`Error fetching author ${author}:`, err);
    res.status(500).json({ message: `Error fetching author ${author}` });
  }
});



// Get all books based on title
/* the original version
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;

  let filteredBooks = Object.entries(books)
    .filter(([id, book]) => book.title.toLowerCase() === title.toLowerCase())
    .map(([id, book]) => ({ id, ...book }));

  res.send(filteredBooks);  
});
*/

// async version
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;

  try {
    const filteredBooks = await Promise.resolve(
      Object.entries(books)
        .filter(([id, book]) => book.title.toLowerCase() === title.toLowerCase())
        .map(([id, book]) => ({ id, ...book }))
    );

    if (filteredBooks.length === 0) {
      return res.status(404).json({ message: `No books found with title '${title}'.` });
    }

    res.json(filteredBooks);
  } catch (err) {
    console.error(`Error fetching title ${title}:`, err);
    res.status(500).json({ message: `Error fetching title ${title}` });
  }
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  res.send(JSON.stringify(books[isbn].reviews,null,4));   
});

module.exports.general = public_users;
