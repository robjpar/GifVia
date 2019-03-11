var currentPlayer = {
    nickName: "Player2",
    category: "books",
    categoryId: 10
}

sessionStorage.setItem("currentPlayer", JSON.stringify(currentPlayer));

var currentPlayer = JSON.parse(sessionStorage.getItem("currentPlayer"));

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
var count = 1;
var timer = 0;
var intervalId;
var timerRunning = false;
var userSelection = null;
var questions = [];
var answerArray = [];
var textArray = [$("#answer-1"), $("#answer-2"), $("#answer-3"), $("#answer-4")];
var category = "";

var gif = $("#trivia-gif");

var winLoss = "win";

var topics = "";
var topicNumber = 0;
var difficulty = "";
var giphyAPIKey = "pUpYuVe3td58u23oogHLM1T2pHFENVTJ&limit=10";
var gifQueryURL = "https://api.giphy.com/v1/gifs/random?api_key=" + giphyAPIKey + "&tag=";


var pastPlayer = {
    nickName: currentPlayer.nickName,
    category: currentPlayer.category,
    score: winsCounter
}

database.ref("past-players").push(pastPlayer, function (error) {
    if (error) {
        console.log("The write failed, error code: " + error.code);
    } else {
        console.log("The write successful");
    }
});

$( document ).ready(function() {
    $("#username").html(currentPlayer.nickName);
    $("#topic").html(currentPlayer.category);
    questionGenerator();
});


function questionGenerator() {
    userSelection = null;
    timer = 10;
    timerRunning = true;
    if (count < 3) {
        difficulty = "easy";
        getAjax();
        intervalId = setInterval(countDown, 1000);
    } else if (count > 2 && count < 5) {
        difficulty = "medium";
        getAjax();
        intervalId = setInterval(countDown, 1000);
    } else if (count > 4 && count < 7) {
        difficulty = "hard";
        getAjax();
        intervalId = setInterval(countDown, 1000);
    } else if (count >= 6) {
        gameOver();
    }


    function getAjax() {
        var triviaQueryURL = "https://opentdb.com/api.php?amount=1&category=" + currentPlayer.categoryId + "&difficulty=" + difficulty + "&type=multiple";
        $.ajax({
            url: triviaQueryURL,
            method: "GET"
        }).then(function(response) {
            $("#question-display").html(response.results[0].question);
            var short = response.results[0];
            answerArray = [];
            answerArray.push(short.correct_answer, short.incorrect_answers[0], short.incorrect_answers[1], short.incorrect_answers[2]);
            shuffleAnswers();
            generateTriviaGif(this.category);
        });
    };

    function generateTriviaGif() {
        $.ajax({
            url: gifQueryURL+currentPlayer.category, 
            method: "GET"
        }).then(function(response) {
            var imageURL = response.data.image_original_url;
            gif.attr("src", imageURL).attr("alt", "trivia image");
        })
    };
};

function shuffleAnswers() {
    var ctr = textArray.length, temp, index;
    while (ctr > 0) {
        index = Math.floor(Math.random() * ctr);
        ctr--;
        temp = textArray[ctr];
        textArray[ctr] = textArray[index];
        textArray[index] = temp;
    }
    for (var i = 0; i < textArray.length; i++) {
        textArray[i].html(answerArray[i]).css("color", "black");
    }
};

$(".answer").one("click", function() {
    userSelection = $(this).text();
    if (userSelection === answerArray[0]) {
        $("#question-display").text("Yes! You are correct!");
        $(this).css("color", "green");
        winsCounter++;
        $("#wins").text(winsCounter);
        winLoss = "winner";
        results();
    } else {
        $("#question-display").text("Sorry, that was not right");
        lossesCounter++;
        $(this).css("color", "red");
        $("#losses").text(lossesCounter);
        winLoss = "loser";
        results();
    }
    function results() {
        generateWinLossGif();
        count++;
        timerRunning = false;
    }
});

function generateWinLossGif() {
    $.ajax({
        url: gifQueryURL + winLoss,
        method: "GET"
    }).then(function(response) {
        var imageURL = response.data.image_original_url;
        gif.attr("src", imageURL);
    });
    clearInterval(intervalId);
    setTimeout(questionGenerator, 3000);
}

function countDown() {
    if (timerRunning) {
        $("#timer").text(timer);
        timer--;
        if (timer < 0) {
            $("#question-display").text("You are out of time");
            lossesCounter++;
            $("#losses").text(lossesCounter)
            winLoss = "loser";
            timerRunning = false;
            generateWinLossGif();
        }
    }
    console.log(timer)
};

function gameOver() {
    timerRunning = false;
    $(".answer").text("");
    if (winsCounter > lossesCounter) {
        $("#question-display").text("You won! Great job");
        winLoss = "winner";
    } else if (lossesCounter > winsCounter) {
        $("#question-display").text("You lose :(");
        winLoss = "loser";
    } else if (lossesCounter === winsCounter) {
        $("#question-display").text("You tied!");
        winLoss = "tie";
    };
    generateWinLossGif();
    $(".answers").html('<a class="btn btn-primary" href="" role="button">Try Again!</a>')
};