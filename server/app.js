const express = require('express');
const path = require('path');
const fs = require('fs');

// Create an instance of express
const app = express();

// Define the path to books.json
const booksFilePath = path.join(__dirname, 'books.json');

// Middleware for parsing JSON request bodies
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '../html')));
app.use(express.static(path.join(__dirname, '../css')));
app.use(express.static(path.join(__dirname, '../script')));

// Serve the HTML file at the root route
app.get('/', (req, res) => {
    const filePath = path.join(__dirname, '../html/index.html');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Error reading HTML file');
        } else {
            res.send(data);
        }
    });
});

// Route to serve books.json
app.get('/books', (req, res) => {
    fs.readFile(booksFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading books data:", err);
            return res.status(500).send("Error reading books data.");
        }

        try {
            const books = JSON.parse(data);
            res.json(books);
        } catch (parseError) {
            console.error("Error parsing books data:", parseError);
            res.status(500).send("Error parsing books data.");
        }
    });
});


// Add a new book
app.post('/books', (req, res) => {
    const newBook = req.body;

    fs.readFile(booksFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send("Error reading books data.");
        }

        let books = JSON.parse(data);

        // Create a new ID for the book
        const newBookId = books.length > 0 ? books[books.length - 1].ID + 1 : 1;

        // Reorder keys to ensure ID comes first
        const orderedBook = {
            ID: newBookId,
            Title: newBook.Title,
            Genre: newBook.Genre,
            Author: newBook.Author,
            PublicationDate: newBook.PublicationDate,
            Status: newBook.Status
        };

        // Add the ordered book to the array
        books.push(orderedBook);

        // Save the updated books array
        fs.writeFile(booksFilePath, JSON.stringify(books, null, 2), (err) => {
            if (err) {
                return res.status(500).send("Error saving new book data.");
            }
            res.status(201).json(books); // Send updated book list as response
        });
    });
});

// Update an existing book
app.put('/books/:id', (req, res) => {
    const bookId = parseInt(req.params.id);
    const updatedBook = req.body;
    console.log(`Updating Book with ID ${bookId}:`, updatedBook);

    fs.readFile(booksFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading books data:", err);
            return res.status(500).send("Error reading books data.");
        }

        let books;
        try {
            books = JSON.parse(data);
        } catch (parseError) {
            console.error("Error parsing books data:", parseError);
            return res.status(500).send("Error parsing books data.");
        }

        const bookIndex = books.findIndex(book => book.ID === bookId);
        if (bookIndex === -1) {
            return res.status(404).json({ error: "Book not found" });
        }

        // Update book fields
        books[bookIndex] = {
            ...books[bookIndex],
            ...updatedBook
        };

        fs.writeFile(booksFilePath, JSON.stringify(books, null, 2), (err) => {
            if (err) {
                console.error("Error updating books data:", err);
                return res.status(500).send("Error updating books data.");
            }
            res.status(200).json(books[bookIndex]);
        });
    });
});

// Route to delete a book by ID
app.delete('/books/:id', (req, res) => {
    const bookId = parseInt(req.params.id, 10);

    fs.readFile(booksFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send("Error reading books data.");
        }

        let books = JSON.parse(data);
        const bookIndex = books.findIndex(b => b.ID === bookId);

        if (bookIndex !== -1) {
            books.splice(bookIndex, 1); // Remove the book from the array

            fs.writeFile(booksFilePath, JSON.stringify(books, null, 2), (err) => {
                if (err) {
                    return res.status(500).send("Error saving updated books data.");
                }
                res.status(200).send("Book deleted successfully.");
            });
        } else {
            res.status(404).send("Book not found.");
        }
    });
});


// Start the server
app.listen(3000, () => {
    console.log('Server is running at http://localhost:3000');
});
