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
function populateTable(bookList) {
    const tableBody = document.getElementById("bookTableList");
    tableBody.innerHTML = ""; // Clear existing rows

    if (bookList.length > 0) {
        bookList.forEach(book => {
            const row = document.createElement("tr");

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
    } else {
        const emptyRow = document.createElement("tr");
        emptyRow.innerHTML = `<td colspan="6" style="text-align: center;">No books to display</td>`;
        tableBody.appendChild(emptyRow);
    }
}

function toggleFormAdd() {
    const buttonAdd = document.querySelector("#addBtn");
    const toggleAdd = document.querySelector(".book-form");
    const otherSections = document.querySelectorAll(".updateSection, .deleteSection, .filterSection");

    if (toggleAdd.classList.contains("active")) {
        toggleAdd.classList.remove("active");
        buttonAdd.classList.remove("active");
    } else {
        otherSections.forEach(section => section.classList.remove("active"));
        toggleAdd.classList.add("active");
        buttonAdd.classList.add("active");
    }
}



function toggleFormFilter() {
    var buttonFilter = document.querySelector("#filterBtn");
    var toggleFilter = document.querySelector(".filterSection");
    const otherSections = document.querySelectorAll(".updateSection, .deleteSection, .book-form");

    if (toggleFilter.classList.contains("active")) {
        toggleFilter.classList.remove("active");
        buttonFilter.classList.remove("active");
    } else {
        otherSections.forEach(section => section.classList.remove("active"));
        toggleFilter.classList.add("active");
        buttonFilter.classList.add("active");
    }
}

function toggleFormUpdate() {
    const updateSection = document.querySelector(".updateSection");
    const otherSections = document.querySelectorAll(".filterSection, .deleteSection, .book-form");

    if (updateSection.classList.contains("active")) {
        updateSection.classList.remove("active");
    } else {
        otherSections.forEach(section => section.classList.remove("active"));
        updateSection.classList.add("active");
    }
}

function toggleFormDelete() {
    const deleteSection = document.querySelector(".deleteSection");
    const otherSections = document.querySelectorAll(".filterSection, .updateSection, .book-form");

    if (deleteSection.classList.contains("active")) {
        deleteSection.classList.remove("active");
    } else {
        otherSections.forEach(section => section.classList.remove("active"));
        deleteSection.classList.add("active");
    }
}


// Delete Book
function deleteBook() {
    const bookIdInput = document.getElementById("deleteId").value.trim();
    const bookId = isNaN(bookIdInput) ? null : parseInt(bookIdInput, 10);

    // Debugging: Log the ID from input
    console.log("Book ID entered:", bookId);

    if (!bookId) {
        alert("Invalid ID! Please enter a valid numeric ID.");
        return;
    }

    // Send a DELETE request to the server
    fetch(`/books/${bookId}`, { method: 'DELETE' })
        .then(response => {
            if (response.ok) {
                alert('Book deleted successfully!');
                // Fetch updated data from the server
                fetch('/books')
                    .then(res => res.json())
                    .then(updatedBooks => {
                        books = updatedBooks; // Update local `books` array
                        populateTable(books); // Refresh table with updated books
                    })
                    .catch(error => {
                        console.error("Error fetching updated books:", error);
                    });
            } else if (response.status === 404) {
                alert('Book not found on the server.');
            } else {
                alert('Failed to delete book.');
            }
        })
        .catch(error => {
            console.error("Error deleting book on server:", error);
        });
}

//Filter Books by Genre
function filterBooks() {
    // Get the selected genre from the radio buttons
    const selectedGenre = document.querySelector('input[name="genre"]:checked');
    
    if (selectedGenre) {
        const genreValue = selectedGenre.value.trim(); // Get the value of the selected genre
        
        // Filter the books array based on the selected genre
        const filteredBooks = books.filter(book => book.Genre === genreValue);

        if (filteredBooks.length > 0) {
            populateTable(filteredBooks); // Display only the filtered books in the table
        } else {
            alert("No books found for the selected genre!");
            populateTable([]); // Clear the table if no books are found
        }
    } else {
        alert("Please select a genre to filter!");
    }
}

//reset table
function resetFilter() {
    populateTable(books); // Display all books
}

//search function with search bar
function searchBooks() {
    // Get the search input value
    const searchInput = document.getElementById("searchInput").value.trim().toLowerCase();

    if (searchInput === "") {
        alert("Please enter a search term!");
        return;
    }

    // Filter books matching the search input in any field
    const filteredBooks = books.filter(book =>
        book.Title.toLowerCase().includes(searchInput) ||
        book.Genre.toLowerCase().includes(searchInput) ||
        book.Author.toLowerCase().includes(searchInput)
    );

    if (filteredBooks.length > 0) {
        populateTable(filteredBooks); // Display matched books in the table
    } else {
        alert("No books found matching the search term.");
        populateTable([]); // Clear table if no matches are found
    }
}


// Update book details dinamically
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
        PublicationDate: document.getElementById('publicationDate').value,
        Status: document.getElementById('status').value || 'Available'
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





