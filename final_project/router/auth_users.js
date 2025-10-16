const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];


const isValid = (username)=>{ //returns boolean
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return false if any user with the same username is found, otherwise true
    if (userswithsamename.length > 0) {
        return false;
    } else {
        return true;
    }

}

const authenticatedUser = (username,password)=>{ //returns boolean
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    console.log(`Login: username=${username} password=${password}`);

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in: need both username and password" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            username: username
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send(`User ${username} successfully logged in!`);
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }	
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

  const isbn = req.params.isbn;
  const reviewText = req.query.review;

  if (!reviewText) {
    return res.status(400).json({ message: "Review text is required!" });
  }

  const username = req.user.username;
  const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  // I decided to also add date because it's important for reviews

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found!` });
  }

  // Add or update review
  books[isbn].reviews[username] = {
    text: reviewText,
    date: currentDate
  };


  console.log(JSON.stringify(req.user));
  console.log(`Update review for ${isbn} by ${username} : ${reviewText} ${currentDate}`);


  return res.status(200).json({
    message: `Review for ${isbn} by ${username} posted successfully on ${currentDate}.`,
    review: books[isbn].reviews[username]
  });

});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }

  const reviews = books[isbn].reviews;

  // Check if this user has a review to delete
  if (!reviews || !reviews[username]) {
    return res.status(404).json({ message: `No review found for user ${username} on ISBN ${isbn}.` });
  }

  delete reviews[username];

  console.log(`Deleted review for ${isbn} by ${username}`);

  return res.status(200).json({
    message: `Review by ${username} on ISBN ${isbn} was successfully deleted.`
  });
});



module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
