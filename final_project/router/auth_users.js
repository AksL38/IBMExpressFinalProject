const express = require('express');
const jwt = require('jsonwebtoken');
let books = require('./booksdb.js');
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  const matchingUsers = users.filter((user) => user.username === username);

  return !matchingUsers.length > 0;
};

const authenticatedUser = (username, password) => {
  //returns boolean
  const matchingUsers = users.filter(
    (user) => user.username === username && user.password === password
  );

  return matchingUsers.length > 0;
};

//only registered users can login
regd_users.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (authenticatedUser(username, password)) {
      const accessToken = jwt.sign({ data: username }, 'access', {
        expiresIn: 60 * 60,
      });
      req.session.authorization = { accessToken, username };
      return res.status(200).send('Log in successful.');
    } else {
      return res.status(404).send('Either username or password is incorrect.');
    }
  } else {
    return res.status(404).json({ message: 'Error logging in.' });
  }
});

// Add a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const user = req.user;

  if (review) {
    if (books[isbn]) {
      books[isbn].reviews[user] = review;
      return res.status(200).json('Review updated successfully.');
    }
    return res.status(404).json({ message: 'No book with this isbn.' });
  }
  return res.status(404).json({ message: 'No review found in query' });
});

// Delete user's own review
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const user = req.user;

  if (books[isbn]) {
    if (books[isbn].reviews[user]) {
      delete books[isbn].reviews[user];
      return res.status(200).json('Review deleted successfully.');
    } else {
      return res
        .status(404)
        .json({ message: 'You do not have review on this book to delete.' });
    }
  } else {
    return res.status(404).json({ message: 'No book with this isbn.' });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
