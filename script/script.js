let books = []; // Store the fetched JSON data globally

//adding my json into my table
fetch('/books')
    .then(response => response.json())
    .then(data => {
        books = data; // Save fetched books into the global array
        populateTable(books); // Populate the table with books
    })
    .catch(error => {
        console.error("Error loading JSON data:", error);
    });

// Function to populate the table
function populateTable(books) {
    const tableBody = document.getElementById('bookTableList');
    tableBody.innerHTML = ''; // Clear existing rows

    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.ID}</td>
            <td>${book.Title}</td>
            <td>${book.Genre}</td>
            <td>${book.Author}</td>
            <td>${book.PublicationDate}</td>
            <td>${book.Status}</td>
        `;
        tableBody.appendChild(row);
    });
}


function toggleFormAdd() {
    var button = document.getElementsByClassName("btn")[0]; // Get the button element
    var form = document.getElementsByClassName("book-form")[0]; // Get the form element
    //click to show form
    if (button.classList.contains("active")) {
        form.classList.add("hidden");
        button.classList.remove("active");
    } else { //click to hide form
        form.classList.remove("hidden");
        button.classList.add("active");
    }
}

function toggleFormFilter() {
    // Get the filter section
    var toggleFilter = document.querySelector(".filterSection");
    var buttonFilter = document.getElementsByClassName("btn")[1];

    // Toggle the 'active' class for the filter section
    if (toggleFilter.classList.contains("active")) {
        toggleFilter.classList.remove("active");
        buttonFilter.classList.remove("active");
    } else {
        toggleFilter.classList.add("active");
        buttonFilter.classList.add("active");
    }
}

//UPDATE TOGGLE
function toggleFormUpdate() {
    const updateSection = document.querySelector(".updateSection");
    const otherSections = document.querySelectorAll(".filterSection, .deleteSection");

    if (updateSection.classList.contains("active")) {
        updateSection.classList.remove("active");
    } else {
        otherSections.forEach(section => section.classList.remove("active"));
        updateSection.classList.add("active");
    }
}

//DELETE toggle
function toggleFormDelete() {
    const deleteSection = document.querySelector(".deleteSection");
    const otherSections = document.querySelectorAll(".filterSection, .updateSection");

    if (deleteSection.classList.contains("active")) {
        deleteSection.classList.remove("active");
    } else {
        otherSections.forEach(section => section.classList.remove("active"));
        deleteSection.classList.add("active");
    }
}

// Delete Book
function deleteBook() {
    const bookId = parseInt(document.getElementById("updateId").value.trim(), 10);
    const bookIndex = books.findIndex(b => b.ID === bookId); // Use parseInt to ensure correct type comparison

    if (bookIndex !== -1) {
        const book = books[bookIndex]; // Get the book object using the index
        books.splice(bookIndex, 1); // Remove the book from the local array

        // Send a DELETE request to the server to remove the book from the database
        fetch(`/books/${bookId}`, { method: 'DELETE' })
            .then(response => {
                if (response.ok) {
                    alert('Book deleted successfully!');
                    populateTable(books); // Refresh table with updated books
                } else {
                    console.error('Failed to delete book on the server.');
                }
            })
            .catch(error => {
                console.error("Error deleting book on server:", error);
            });
    } else {
        alert('Book not found!');
    }
}




function searchBook() {
    const bookId = parseInt(document.getElementById("updateId").value.trim(), 10);
    const bookIndex = books.findIndex(b => b.ID === bookId);

    if (book) {
        document.getElementById("updateForm").classList.remove("hidden");
        document.getElementById("updateTitle").value = book.title;
        document.getElementById("updateGenre").value = book.genre;
        document.getElementById("updateAuthor").value = book.author;
        document.getElementById("updateDate").value = book.dateOfPublication;
    } else {
        alert("Book not found!");
    }
}

// Update book details
function updateBook() {
    const bookId = parseInt(document.getElementById("updateId").value.trim(), 10);
    const bookTitle = document.getElementById("updateTitle").value.trim();
    const bookGenre = document.getElementById("updateGenre").value.trim();
    const bookAuthor = document.getElementById("updateAuthor").value.trim();
    const bookDate = document.getElementById("updateDate").value.trim();

    fetch(`/books/${bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            Title: bookTitle,
            Genre: bookGenre,
            Author: bookAuthor,
            PublicationDate: bookDate
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        return response.json(); // Parse JSON only if response is ok
    })
    .then(updatedBook => {
        const bookIndex = books.findIndex(b => b.ID === bookId);
        if (bookIndex !== -1) {
            books[bookIndex] = updatedBook; // Update local book
            populateTable(books); // Refresh table
            alert("Book updated successfully!");
        }
    })
    .catch(error => {
        console.error("Error updating book:", error);
        alert(`Error updating book: ${error.message}`);
    });
}

//add Book
async function addBook() {
    const newBook = {
        Title: document.getElementById('title').value,
        Genre: document.getElementById('genre').value,
        Author: document.getElementById('author').value,
        PublicationDate: document.getElementById('publicationDate').value
    };

    try {
        const response = await fetch('/books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newBook)
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage);
        }

        const addedBook = await response.json();
        console.log('Book added successfully:', addedBook);
        alert('Book added successfully!');
    } catch (error) {
        console.error('Error adding book:', error);
        alert('Error adding book: ' + error.message);
    }
}





