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

    console.log('Received New Book:', newBook); // Debugging

    fs.readFile(booksFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading books.json:', err);
            return res.status(500).send('Error reading books data.');
        }

        let books = [];
        try {
            // If the file is empty, start with an empty array
            books = data ? JSON.parse(data) : [];
        } catch (parseError) {
            console.error('Error parsing books.json:', parseError);
            return res.status(500).send('Error parsing books data.');
        }

        // Assign a new ID to the book
        const newBookId = books.length > 0 ? books[books.length - 1].ID + 1 : 1;
        newBook.ID = newBookId;

        books.push(newBook);

        fs.writeFile(booksFilePath, JSON.stringify(books, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error writing to books.json:', writeErr);
                return res.status(500).send('Error saving books data.');
            }
            console.log('New Book Added:', newBook); // Debugging
            res.status(201).json(newBook);
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
    const bookId = parseInt(req.params.id);

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

        // Remove the book from the array
        books.splice(bookIndex, 1);

        fs.writeFile(booksFilePath, JSON.stringify(books, null, 2), (err) => {
            if (err) {
                console.error("Error updating books data:", err);
                return res.status(500).send("Error updating books data.");
            }
            res.status(200).send('Book deleted successfully');
        });
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running at http://localhost:3000');
});
