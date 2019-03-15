// var currentPlayer = {
//     nickName: "",
//     category: "",
//     categoryId: 0,
//     score = 0
// }

// sessionStorage.setItem("currentPlayer", JSON.stringify(currentPlayer));

var currentPlayer = JSON.parse(sessionStorage.getItem("currentPlayer"));
console.log(currentPlayer);

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

// var topics = "";
// var topicNumber = 0;
var difficulty = "";
var giphyAPIKey = "pUpYuVe3td58u23oogHLM1T2pHFENVTJ";
var gifQueryURL = "https://api.giphy.com/v1/gifs/random?api_key=" + giphyAPIKey + "&rating=g&tag=";



$(document).ready(function() {
    $("#username").html(currentPlayer.nickname);
    $("#topic").html(currentPlayer.category);
    timerRunning = false;
    $("#question-display").text("Click the image to get started!");
});

$("#trivia-gif").one("click", function() {
    questionGenerator();
})


function questionGenerator() {
    clearInterval(intervalId);
    userSelection = null;
    timer = 10;
    timerRunning = true;
    allowClicks = true;
    if (count < 2) {
        difficulty = "easy";
        allowGamePlay();
    } else if (count > 1 && count < 3) {
        difficulty = "medium";
        allowGamePlay();
    } else if (count > 2 && count < 4) {
        difficulty = "hard";
        allowGamePlay();
    } else if (count > 3) {
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
            correctAnswer = answerArray[0];
            shuffleAnswers();
            generateTriviaGif(this.category);
        });
    };
};

function generateTriviaGif() {
    $.ajax({
        url: gifQueryURL + currentPlayer.category, 
        method: "GET"
    }).then(function(response) {
        createCORSRequest();
        var imageURL = response.data.fixed_height_small_url;
        gif.attr("src", imageURL).attr("alt", "trivia image").css("max-height", "200px");
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
        textArray[i].text("");
        var button = $(`<button type="button" class="btn btn-light answer" id="button-${i+1}" style="color:black">${answerArray[i]}</button>`);
        textArray[i].append(button).css("color", "purple");
    }
};

function decodeHtml(html) {
    return $('<div>').html(html).text();
};

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

function generateWinLossGif() {
    $.ajax({
        url: gifQueryURL + winLoss,
        method: "GET"
    }).then(function(response) {
        createCORSRequest();
        var imageURL = response.data.fixed_height_small_url;
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
            count++;
            lossesCounter++;
            $("#losses").text(lossesCounter);
            showRightAnswer();
            winLoss = "crying";
            timerRunning = false;
            generateWinLossGif();
        }
    }
    // console.log(timer)
};

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
    database.ref("past-players").push(pastPlayer, function (error) {
        if (error) {
            console.log("The write failed, error code: " + error.code);
        } else {
            console.log("The write successful");
        }
    });
    function finalWinLoss() {
        $.ajax({
            url: gifQueryURL + winLoss,
            method: "GET"
        }).then(function(response) {
            createCORSRequest();
            var imageURL = response.data.fixed_height_small_url;
            gif.attr("src", imageURL);
        });
    }
};

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

$(document).on("click", ".answer", selectAnswer);
$(document).on("click", "#more-questions", moreQuestions);

//re-write database push for current player?

// Create the XHR object.
function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
      // XHR for Chrome/Firefox/Opera/Safari.
      xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
      // XDomainRequest for IE.
      xhr = new XDomainRequest();
      xhr.open(method, url);
    } else {
      // CORS not supported.
      xhr = null;
    }
    return xhr;
  }
  
  // Helper method to parse the title tag from the response.
  function getTitle(text) {
    return text.match('<title>(.*)?</title>')[1];
  }
  
  // Make the actual CORS request.
  function makeCorsRequest() {
    // This is a sample server that supports CORS.
     
    var xhr = createCORSRequest('GET', url);
    if (!xhr) {
      alert('CORS not supported');
      return;
    }
  
    // Response handlers.
    xhr.onload = function() {
      var text = xhr.responseText;
      var title = getTitle(text);
      alert('Response from CORS request to ' + url + ': ' + title);
    };
  
    xhr.onerror = function() {
      alert('Woops, there was an error making the request.');
    };
  
    xhr.send();
  }