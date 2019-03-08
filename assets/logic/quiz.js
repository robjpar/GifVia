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
var count = 0;
var timer = 0;
var intervalId;
var timerRunning = false;
var userSelection = null;
var questions = [];
var answerArray = [];
var textArray = [$("#answer-1"), $("#answer-2"), $("#answer-3"), $("#answer-4")];
var category = "";

var gif = $("<img>");

var winLoss = "win";

var topics = "";
var topicNumber = 0;
var difficulty = "";
var giphyAPIKey = "pUpYuVe3td58u23oogHLM1T2pHFENVTJ&limit=10";


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


function questionGenerator() {
    if (count < 5) {
        difficulty = "easy";
        getAjax();
    } else if (count > 4 && count < 9) {
        difficulty = "medium";
        getAjax();
    } else if (count > 8) {
        difficulty = "hard";
        getAjax();
    }

    function getAjax() {
        var triviaQueryURL = "https://opentdb.com/api.php?amount=1&category=" + currentPlayer.categoryId + "&difficulty=" + difficulty + "&type=multiple";
        $.ajax({
            url: triviaQueryURL,
            method: "GET"
        }).then(function(response) {
            $("#question-display").html(response.results[0].question);
            var short = response.results[0];
            answerArray.push(short.correct_answer, short.incorrect_answers[0], short.incorrect_answers[1], short.incorrect_answers[2]);
            shuffleAnswers();
            generateTriviaGif(this.category);
        });
    };

    function generateTriviaGif() {
        var gifQueryURL = "https://api.giphy.com/v1/gifs/random?api_key=" + giphyAPIKey + "&tag=" + currentPlayer.category;
        $.ajax({
            url: gifQueryURL, 
            method: "GET"
        }).then(function(response) {
            console.log(response);
            var imageURL = response.data.image_original_url;
            $("#trivia-gif").attr("src", imageURL).attr("alt", "trivia image");
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
        textArray[i].text(answerArray[i])
    }
    console.log(textArray);
};
