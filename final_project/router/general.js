const express = require('express');
let books = require('./booksdb.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;
const public_users = express.Router();

public_users.post('/register', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (isValid(username)) {
      users.push({ username, password });
      return res.status(200).send('Registration successful.');
    }
    return res.status(404).json({ message: 'Username already in use.' });
  }
  return res.status(404).json({
    message: 'Registration failed. Please provide both username and password',
  });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  const result = new Promise((resolve, reject) => {
    resolve(JSON.stringify(books, null, 4));
  });
  result.then((data) => {
    return res.send(data);
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const result = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject('No book with this isbn');
    }
  });
  result.then((data) => res.send(data)).catch((err) => res.send(err));
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const result = new Promise((resolve, reject) => {
    let selectedBooks = [];
    for (const [key, value] of Object.entries(books)) {
      if (value.author === author) {
        selectedBooks.push({ ...value });
      }
    }
    if (selectedBooks.length > 0) {
      resolve(JSON.stringify(selectedBooks, null, 4));
    } else {
      reject('No books for this author');
    }
  });
  result.then((data) => res.send(data)).catch((err) => res.send(err));
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const result = new Promise((resolve, reject) => {
    let selectedBooks = [];
    for (const [key, value] of Object.entries(books)) {
      if (value.title === title) {
        selectedBooks.push({ ...value });
      }
    }
    if (selectedBooks.length > 0) {
      resolve(JSON.stringify(selectedBooks, null, 4));
    } else {
      reject('No books with this title');
    }
  });
  result.then((data) => res.send(data)).catch((err) => res.send(err));
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  return res.send(books[isbn] ? books[isbn].reviews : 'No book with this isbn');
});

module.exports.general = public_users;
