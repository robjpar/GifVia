var currentPlayer = {
    nickName: "Player1032",
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
var textArray = [$("#answer-1"), $("#answer-2"), $("#answer-3"), $("#answer-4")];
var category = "";
var allowClicks = false;

var gif = $("#trivia-gif");

var winLoss = "win";

var topics = "";
var topicNumber = 0;
var difficulty = "";
var giphyAPIKey = "pUpYuVe3td58u23oogHLM1T2pHFENVTJ&limit=10";
var gifQueryURL = "https://api.giphy.com/v1/gifs/random?api_key=" + giphyAPIKey + "&tag=" + currentPlayer.category;


var pastPlayer = {
    nickName: currentPlayer.nickName,
    category: currentPlayer.category,
    score: score
}

database.ref("past-players").push(pastPlayer, function (error) {
    if (error) {
        console.log("The write failed, error code: " + error.code);
    } else {
        console.log("The write successful");
    }
});

$(document).ready(function() {
    $("#username").html(currentPlayer.nickName);
    $("#topic").html(currentPlayer.category);
    timerRunning = false;
});

$("#trivia-gif").one("click", function() {
    questionGenerator();
})


function questionGenerator() {
    userSelection = null;
    timer = 10;
    timerRunning = true;
    allowClicks = true;
    if (count < 3) {
        difficulty = "easy";
        allowGamePlay();
    } else if (count > 2 && count < 5) {
        difficulty = "medium";
        allowGamePlay();
    } else if (count > 4 && count < 7) {
        difficulty = "hard";
        allowGamePlay();
    } else if (count >= 6) {
        gameOver();
    }
    // console.log(difficulty);
    function allowGamePlay() {
        getAjax();
        intervalId = setInterval(countDown, 1000);
    }


    function getAjax() {
        var triviaQueryURL = "https://opentdb.com/api.php?amount=1&category=" + currentPlayer.categoryId + "&difficulty=" + difficulty + "&type=multiple";
        // console.log(triviaQueryURL);
        $.ajax({
            url: triviaQueryURL,
            method: "GET"
        }).then(function(response) {
            question = response.results[0].question;
            // console.log(question);
            wordArray = question.split(" ");
            // pickWord();
            $("#question-display").html(question);
            var short = response.results[0];
            answerArray = [];
            answerArray.push(short.correct_answer, short.incorrect_answers[0], short.incorrect_answers[1], short.incorrect_answers[2]);
            shuffleAnswers();
            generateTriviaGif(this.category);
        });
    };
};

function generateTriviaGif() {
    $.ajax({
        url: gifQueryURL, 
        method: "GET"
    }).then(function(response) {
        var imageURL = response.data.fixed_height_small_url;
        gif.attr("src", imageURL).attr("alt", "trivia image");
    })
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
        var button = $(`<button type="button" class="btn btn-light answer" style="color:purple">${answerArray[i]}</button>`);
        textArray[i].append(button).css("color", "purple");
    }
};

$(".answer").on("click", function() {
    // console.log("Answer[0] = "+answerArray[0]);
    //         console.log("1 = "+ $("#answer-1").text());
    if (allowClicks) {
        userSelection = $(this).text();
        if (userSelection === answerArray[0]) {
            $("#question-display").text("Yes! You are correct!");
            $(this).css("color", "green");
            winsCounter++;
            $("#wins").text(winsCounter);
            if (difficulty === "easy") {
                score = score +1;
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
            $(this).css("color", "red");
            showRightAnswer();
            $("#losses").text(lossesCounter);
            winLoss = "loser";
            results();
        }
        function showRightAnswer() {
            if ($("#answer-1").text() === answerArray[0]) {
                $("#answer-1").css("color", "green")
            } else if ($("#answer-2").text() === answerArray[0]) {
                $("#answer-2").css("color", "green")
            } else if ($("#answer-3").text() === answerArray[0]) {
                $("#answer-3").css("color", "green")
            } else if ($("#answer-4").text() === answerArray[0]) {
                $("#answer-4").css("color", "green")
            }
        }
        function results() {
            allowClicks = false;
            generateWinLossGif();
            count++;
            timerRunning = false;
        }
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
    // console.log(timer)
};

function gameOver() {
    clearInterval(intervalId);
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
    finalWinLoss();
    $("#try-again").html('<a class="btn btn-primary" href="index.html" role="button">Try Again?</a>');
    function finalWinLoss() {
        $.ajax({
            url: gifQueryURL + winLoss,
            method: "GET"
        }).then(function(response) {
            var imageURL = response.data.image_original_url;
            gif.attr("src", imageURL);
        });
    }
};

//need to finish/check code for removing html description of ' and "
//do we want gif to be related to word from question or topic?
//is there an easier way to pick a "focal point" word from question?

function pickWord() {
    var item = Math.floor(Math.random()*wordArray.length);
    // console.log(wordArray[item]);
    if (wordArray[item].length < 6) {
        pickWord();
    } else if (wordArray[item].indexOf("$#039")) {
        wordArray.splice(item, 1, " ");
        console.log("yes" + wordArray[item]);
    } else if (wordArray[i].indexOf("&quot;")) {
        ("$&quot;").replace("$&quot;", " ");
    } else {
        console.log("pick me!");
        word = wordArray[item];
        console.log(word);
        generateTriviaGif();
    }
};

//re-write database push for current player?