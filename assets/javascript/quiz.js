// data sent from index.js
var currentPlayer = JSON.parse(sessionStorage.getItem("currentPlayer"));
console.log(currentPlayer);
// ==================

var winsCounter = 0;
var lossesCounter = 0;
var count = 0;
var timer = 0;
var intervalId;
var timerRunning = false;
var userSelection = null;
var questions;
var newArray = [];

var gif = $("<img>");

var winLoss = "win";

var topic = $("#user-input").text();
var topicNumber = $("#user-input").val();
var difficulty = $("#difficulty-input").val();
var giphyAPIKey = "";

//API only generates a few topics, so these will have to be input on front end
//there are 32 categories--this is how they are pulled based on number
//do we also want to include difficulty?

var triviaQueryURL = "https://opentdb.com/api.php?amount=10&category=" + topicNumber + "&difficulty=" + difficulty + "&type=multiple";
var gifQueryURL = "https://api.gifphy.com/v1/gifs/random?api_key=" + giphyAPIKey + "&tag=";

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

$("submit").on("click", function() {
    $.ajax({
        url: triviaQueryURL,
        method: "GET"
    }).then(function(response) {
        console.log(response);
        display();
    });
})

function display() {
    questions = response;
    $("#question-display").text(questions.results[count].question);
    randomizeAnswers();
    $("#answer-display").text(newArray);
    generateTriviaGif();
    $("#gif-display").text(gif);
    gamePlay();
    checkCount();

    function randomizeAnswers() {
        //write a function that takes correct answer and places it randomly in incorrect answer array while maintaining
        //data point that it is the correct answer
        newArray = [];
    }
    //how do we identify save this data? Into a variable?
    //for (var i = 0; i < response.length; i++)
};



function generateTriviaGif() {
    $.ajax({
        url: gifQueryURL + topic, //is this the correct syntax?
        method: "GET"
    }).then(function(response) {
        var imageURL = response.data.image_original_url;
        console.log(imageURL);
        gif.attr("src", imageURL).attr("alt", "trivia image");
    })
};

function generateWinLossGif() {
    $.ajax({
        url: gifQueryURL + winLoss, //is this the correct syntax? -- I don't think this will work since result is a string that includes "" --this might not be cohesive with giphy's API documentation
        method: "GET"
    }).then(function(response) {
        var imageURL = response.data.image_original_url;
        console.log(imageURL);
        gif.attr("src", imageURL);
        $("#gif-display").text(gif);
    })
    if (count <= 10) {
        setTimeout(display, 5000);
    } else {
        setTimeout(gameOver, 5000);
    }
    userSelection = null;
    timerRunning = false;
    clearInterval(intervalId);
}

//in function gamePlay make sure count++

function gamePlay() {
    $("input[type=radio]").click(function() {
        userSelection = this.text;
        if (userSelection === questions.results[count].correct_answer) {
            winsCounter++;
            winLoss = "win";
            generateWinLossGif();
        } else if (userSelection !== questions.results[count].correct_answer) {
            lossesCounter++;
            winLoss = "loss";
            generateWinLossGif();
        }
    })
};

function checkCount() {
    timer = 15;
    timerRunning = ture;
    intervalId = setInterval(countDown, 1000);
}

function countDown() {
    if (timerRunning) {
        $("#timer").text = timer;
        timer--;
        if (timer < 0 || userSelection !== null) {
            count++;
            lossesCounter++;
            clearInterval(intervalId);
            winLoss = "time over";
            generateWinLossGif();
            timerRunning=false;
        }
    }
};

function gameOver() {
    $("#wins-counter").text(winsCounter);
    $("#losses-counter").text(lossesCounter);
    if (winsCounter > lossesCounter) {
        winsLoss = "win";
    } else if (lossesCounter > winsCounter) {
        winsLoss = "loss";
    } else if (winsCounter === lossesCounter) {
        winsLoss = "tie";
    }
    database.ref().push({
        username: username,
        outcome: winsLoss,
        winsCounter: winsCounter,
        lossesCounter: lossesCounter,
        //add in functionality to each question that pushes results to firebase? or focus solely on user outcome?
    })
    $("#question-display-div").html(generateWinLossGif());
}