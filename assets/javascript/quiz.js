// This runs in index.js========================================================
// Used only for testing and debugging
// var currentPlayer = {
//     nickName: "",
//     category: "",
//     categoryId: 0,
//     score = 0
// }
// sessionStorage.setItem("currentPlayer", JSON.stringify(currentPlayer));
// =============================================================================

// read login info from session storage
var currentPlayer = JSON.parse(sessionStorage.getItem("currentPlayer"));
console.log(currentPlayer);

// Initialize Firebase
var config = {
    apiKey: "AIzaSyAh9csQszjYRTf32OYxyoalMqw1fIusxac",
    authDomain: "gifvia-b45c0.firebaseapp.com",
    databaseURL: "https://gifvia-b45c0.firebaseio.com",
    projectId: "gifvia-b45c0",
    storageBucket: "gifvia-b45c0.appspot.com",
    messagingSenderId: "160762099816"
};
firebase.initializeApp(config);

var database = firebase.database();

var winsCounter = 0;
var lossesCounter = 0;
var score = 0;
var count = 1;
var timer = 0;
var intervalId;
var timerRunning = false;
var userSelection = null;
var question = "";
var word = "";
var wordArray = [];
var answerArray = [];
var correctAnswer = "";
var textArray = [$("#answer-1"), $("#answer-2"), $("#answer-3"), $("#answer-4")];
var category = "";
var allowClicks = false;
var gif = $("#trivia-gif");
var winLoss = "win";
var difficulty = "";
var giphyAPIKey = "pUpYuVe3td58u23oogHLM1T2pHFENVTJ";
var gifQueryURL = "https://api.giphy.com/v1/gifs/random?api_key=" + giphyAPIKey + "&rating=g&tag=";

//function to display username and category selected
$(document).ready(function () {
    $("#username").html(currentPlayer.nickname);
    $("#topic").html(currentPlayer.category);
    timerRunning = false;
    $("#question-display").text("Click the image to get started!");
});

//function to start gameplay
$("#trivia-gif").one("click", function () {
    questionGenerator();
})

//function that references trivia question API to select questions based on category
function questionGenerator() {
    clearInterval(intervalId);
    userSelection = null;
    timer = 10;
    timerRunning = true;
    allowClicks = true;
    //assigns difficulty based on the number of questions and ends the game when 12 questions has been reached
    if (count < 5) {
        difficulty = "easy";
        allowGamePlay();
    } else if (count > 4 && count < 9) {
        difficulty = "medium";
        allowGamePlay();
    } else if (count > 8 && count < 13) {
        difficulty = "hard";
        allowGamePlay();
    } else if (count > 12) {
        gameOver();
    }

    //function that references API and also starts timer function
    function allowGamePlay() {
        getAjax();
        intervalId = setInterval(countDown, 1000);
    }

    function getAjax() {
        var triviaQueryURL = "https://opentdb.com/api.php?amount=1&category=" + currentPlayer.categoryId + "&difficulty=" + difficulty + "&type=multiple";
        $.ajax({
            url: triviaQueryURL,
            method: "GET"
        }).then(function (response) {
            question = response.results[0].question;
            wordArray = question.split(" ");
            $("#question-display").html(question);
            var short = response.results[0];
            answerArray = [];
            answerArray.push(short.correct_answer, short.incorrect_answers[0], short.incorrect_answers[1], short.incorrect_answers[2]);
            correctAnswer = answerArray[0];
            shuffleAnswers();
            generateTriviaGif(this.category);
        });
    };
};

//function that generated gif based on trivia topic
function generateTriviaGif() {
    $.ajax({
        url: gifQueryURL + currentPlayer.category,
        method: "GET"
    }).then(function (response) {
        createCORSRequest();
        var imageURL = response.data.fixed_height_small_url;
        gif.attr("src", imageURL).attr("alt", "trivia image").css("max-height", "200px");
    })
};

//function to store answers from API in an array and shuffle div elements to append answers to
function shuffleAnswers() {
    var ctr = textArray.length,
        temp, index;
    while (ctr > 0) {
        index = Math.floor(Math.random() * ctr);
        ctr--;
        temp = textArray[ctr];
        textArray[ctr] = textArray[index];
        textArray[index] = temp;
    }
    for (var i = 0; i < textArray.length; i++) {
        textArray[i].text("");
        var button = $(`<button type="button" class="btn btn-light answer" id="button-${i+1}" style="color:black">${answerArray[i]}</button>`);
        textArray[i].append(button).css("color", "purple");
    }
};

//function to verify answers from array can be adequately compared to HTML interpretation of raw JSON data
function decodeHtml(html) {
    return $('<div>').html(html).text();
};

//function that allows user to select an answer and evaluate if answer is correct
function selectAnswer() {
    if (allowClicks) {
        clearInterval(intervalId);
        userSelection = ($(this).html());
        correctAnswer = decodeHtml(answerArray[0]);
        if (userSelection === correctAnswer) {
            $("#question-display").text("Yes! You are correct!");
            $(this).css("color", "green").css("background-color", "greenyellow");
            winsCounter++;
            $("#wins").text(winsCounter);
            if (difficulty === "easy") {
                score = score + 1;
            } else if (difficulty === "medium") {
                score = score + 2;
            } else if (difficulty === "hard") {
                score = score + 3;
            }
            $("#score").html(score);
            winLoss = "winner";
            results();
        } else {
            $("#question-display").text("Sorry, that was not right");
            lossesCounter++;
            $(this).css("color", "red").css("background-color", "pink");
            showRightAnswer();
            $("#losses").text(lossesCounter);
            winLoss = "crying";
            results();
        }
        var questionInformation = {
            question: question,
            outcome: winLoss,
            correctAnswer: correctAnswer,
            userSelection: userSelection,
            category: currentPlayer.category,
            difficulty: difficulty
        }
        //function to push question results to Firebase to be used in data analysis
        database.ref("questions").push(questionInformation, function (error) {
            if (error) {
                console.log("The write failed, error code: " + error.code);
            } else {
                console.log("The write successful");
            }
        });

        function results() {
            allowClicks = false;
            generateWinLossGif();
            count++;
            timerRunning = false;
        }
    }
};

//if user selection is incorrect, this function shows correct answer
function showRightAnswer() {
    if ($("#button-1").text() === answerArray[0]) {
        $("#button-1").css("color", "green").css("background-color", "greenyellow");
    } else if ($("#button-2").text() === answerArray[0]) {
        $("#button-2").css("color", "green")
    } else if ($("#button-3").text() === answerArray[0]) {
        $("#button-3").css("color", "green")
    } else if ($("#button-4").text() === answerArray[0]) {
        $("#button-4").css("color", "green")
    }
};

//generates a gif based on outcome of game
function generateWinLossGif() {
    $.ajax({
        url: gifQueryURL + winLoss,
        method: "GET"
    }).then(function (response) {
        createCORSRequest();
        var imageURL = response.data.fixed_height_small_url;
        gif.attr("src", imageURL);
    });
    clearInterval(intervalId);
    setTimeout(questionGenerator, 3000);
}

//timer function
function countDown() {
    if (timerRunning) {
        $("#timer").text(timer);
        timer--;
        if (timer < 0) {
            $("#question-display").text("You are out of time");
            count++;
            lossesCounter++;
            $("#losses").text(lossesCounter);
            showRightAnswer();
            winLoss = "crying";
            timerRunning = false;
            generateWinLossGif();
        }
    }
};

//function at the end of the game to evaluate if player won, lost, or tied
function gameOver() {
    clearInterval(intervalId);
    timerRunning = false;
    for (var i = 0; i < textArray.length; i++) {
        textArray[i].text("");
    }
    if (winsCounter > lossesCounter) {
        $("#question-display").text("You won! Great job");
        winLoss = "winner";
    } else if (lossesCounter > winsCounter) {
        $("#question-display").text("You lose :(");
        winLoss = "crying";
    } else if (lossesCounter === winsCounter) {
        $("#question-display").text("You tied!");
        winLoss = "tie";
    };
    finalWinLoss();
    $("#try-again").html('<a class="btn btn-primary" href="index.html" role="button" id="new-topic" style="margin:10px">Pick a new topic!</a>').append('<a class="btn btn-primary" role="button" id="more-questions">Get another 12 questions</a>');
    var pastPlayer = {
        nickname: currentPlayer.nickname,
        category: currentPlayer.category,
        score: score
    }
    //function that pushes player information to Firebase
    database.ref("past-players").push(pastPlayer, function (error) {
        if (error) {
            console.log("The write failed, error code: " + error.code);
        } else {
            console.log("The write successful");
        }
    });
    //generate gif based on final outcome of game
    function finalWinLoss() {
        $.ajax({
            url: gifQueryURL + winLoss,
            method: "GET"
        }).then(function (response) {
            createCORSRequest();
            var imageURL = response.data.fixed_height_small_url;
            gif.attr("src", imageURL);
        });
    }
};

//function related to button that generates more questions

function moreQuestions() {
    clearInterval(intervalId);
    count = 1;
    winsCounter = 0;
    lossesCounter = 0;
    $("#wins").text(winsCounter);
    $("#losses").text(lossesCounter);
    $("#try-again").text("");
    questionGenerator();
};

//on-click functions to allow user selection and more questions to be loaded
$(document).on("click", ".answer", selectAnswer);
$(document).on("click", "#more-questions", moreQuestions);

//CORS request to allow same API for giphy.com to be referenced both from index.html and quiz.html
function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        xhr = null;
    }
    return xhr;
}

function getTitle(text) {
    return text.match('<title>(.*)?</title>')[1];
}

function makeCorsRequest() {

    var xhr = createCORSRequest('GET', url);
    if (!xhr) {
        alert('CORS not supported');
        return;
    }

    xhr.onload = function () {
        var text = xhr.responseText;
        var title = getTitle(text);
        alert('Response from CORS request to ' + url + ': ' + title);
    };

    xhr.onerror = function () {
        alert('Woops, there was an error making the request.');
    };

    xhr.send();
}