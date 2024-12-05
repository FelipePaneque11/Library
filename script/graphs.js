//graphs in dashboard section
function dashboard(){
    // Hide the main content
    document.querySelector('main').classList.add('hidden');

    // Create charts
    createStatusPieChart();
    createGenreChart();
}


// Function to create a pie chart
function createStatusPieChart(books) {
    // Count the number of books for each status
    const statusCount = books.reduce((acc, book) => {
        acc[book.Status] = (acc[book.Status] || 0) + 1;
        return acc;
    }, {});

    // Prepare data for the pie chart
    const data = {
        labels: Object.keys(statusCount),
        datasets: [{
            label: 'Book Status',
            data: Object.values(statusCount),
            backgroundColor: ['#28a745', '#dc3545', '#17a2b8'], // Green, Red, Blue
            borderColor: ['#1e7e34', '#c82333', '#117a8b'], // Darker shades for borders
            borderWidth: 1
        }]
    };

    // Create the chart
    const ctx = document.getElementById('statusPieChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            return `${tooltipItem.label}: ${tooltipItem.raw}`;
                        }
                    }
                }
            }
        }
    });
}


// Function to count books by genre
function getGenreCounts(books) {
    const genreCounts = {};

    books.forEach(book => {
        const genre = book.Genre;
        if (genre in genreCounts) {
            genreCounts[genre]++;
        } else {
            genreCounts[genre] = 1;
        }
    });

    return genreCounts;
}

// Function to create the genre bar graph using the genre data from the JSON
function createGenreChart() {
    const genreCounts = getGenreCounts(books);
    const ctx = document.getElementById('genreBarChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(genreCounts),
            datasets: [{
                label: 'Number of Books',
                data: Object.values(genreCounts),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Genre'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Books'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false // Hide legend for this bar chart
                }
            }
        }
    });
}


// Fetch the books data and create the chart
fetch('/books')
    .then(response => response.json())
    .then(data => {
        createStatusPieChart(data);
        createGenreChart(data)
    })
    .catch(error => {
        console.error("Error loading books data:", error);
    });