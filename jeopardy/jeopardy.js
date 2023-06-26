$(document).ready(function() {
    // Define constants
    const apiUrl = 'https://jservice.io/api/';
    const numCategories = 6;
    const numQuestions = 5;

    // Fetch random categories from the API
    function fetchCategories() {
        return $.ajax({
            url: `${apiUrl}categories?count=${numCategories}`,
            method: 'GET'
        });
    }

    // Fetch random questions for each category from the API
    function fetchQuestions(categoryId) {
        return $.ajax({
            url: `${apiUrl}clues?category=${categoryId}`,
            method: 'GET'
        });
    }

    // Populate the categories table
    function populateCategories(categories) {
        const categoriesTable = $('#categories');
        const headerRow = $('<tr></tr>');
        categories.forEach(category => {
            const headerCell = $('<th></th>').addClass('category').text(category.title);
            headerRow.append(headerCell);
        });
        categoriesTable.append(headerRow);
    }

    // Populate the questions table with hidden question marks
    function populateQuestions() {
        const questionsTable = $('#questions');
        for (let i = 0; i < numQuestions; i++) {
            const questionRow = $('<tr></tr>');
            for (let j = 0; j < numCategories; j++) {
                const questionCell = $('<td></td>')
                    .addClass('question')
                    .attr('data-amount', (i + 1) * 100)
                    .text(`$${(i + 1) * 100}`);
                questionRow.append(questionCell);
            }
            questionsTable.append(questionRow);
        }
    }

    // Handle click event on question cell
    function handleClick() {
        const questionCell = $(this);
        const question = questionCell.data('question');
        const answer = questionCell.data('answer');
        if (question) {
            questionCell.text(question).data('question', '');
            questionCell.data('answer', question);
        } else if (answer) {
            questionCell.text(answer);
        }
    }

    // Handle restart button click event
    function handleRestart() {
        $('#categories').empty();
        $('#questions').empty();
        startGame();
    }

    // Initialize the game
    function startGame() {
        fetchCategories()
            .done(categories => {
                populateCategories(categories);
                return categories;
            })
            .then(categories => {
                const promises = categories.map(category => fetchQuestions(category.id));
                return $.when(...promises);
            })
            .then((...responses) => {
                const questions = responses.map(response => response[0]);
                populateQuestions();
                questions.forEach((categoryQuestions, index) => {
                    const questionCells = $(`#questions tr:nth-child(n+2) td:nth-child(${index + 1})`);
                    questionCells.each(function(i) {
                        const { question, answer } = categoryQuestions[i];
                        $(this).data('question', question);
                        $(this).data('answer', answer);
                        if ($(this).data('amount') === '100') {// WHY WONT YOU WORK?!?!?!
                            const categoryId = categories[index].id;
                            fetchQuestions(categoryId)
                                .done(categoryQuestions => {
                                    const { question, answer } = categoryQuestions[0];
                                    $(this).data('question', question);
                                    $(this).data('answer', answer);
                                })
                                .fail(error => console.log(error));
                        }
                    });
                });
            })
            .fail(error => console.log(error));
    }

    // Attach event listeners
    $(document).on('click', '.question', handleClick);
    $('#restart-btn').on('click', handleRestart);

    // Start the game
    startGame();
});
