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
const PAST_PLAYERS_REF = "past-players";
const PAST_NICKNAMES_REF = "past-nicknames";

// Info for the current player
var currentPlayer = {
    nickname: "",
    category: "",
    categoryId: 0,
    score: 0
}

// Read the info for the current player from the session storage if exists
var savedCurrentPlayer = JSON.parse(sessionStorage.getItem("currentPlayer"));
if (savedCurrentPlayer) {
    $("#nickname").val(savedCurrentPlayer.nickname);
    $("#quiz-category").val(savedCurrentPlayer.category);
}

// Read the login info from the Firebase
var pastNicknames = {};
database.ref(PAST_NICKNAMES_REF).on('value', function (snapshot) {
    if (snapshot.val()) {
        pastNicknames = snapshot.val();
    }
});

// Login info validation
function getLoginInfo(nickname, secretNumber) {

    if (nickname in pastNicknames && secretNumber === "") {
        return "nickname used";
    }
    if (nickname in pastNicknames && pastNicknames[nickname] !== secretNumber) {
        return "secret does not match";
    }
}

// Save the login info in Firebase
function saveLoginInfo(nickname, secretNumber) {

    pastNicknames[nickname] = secretNumber;
    database.ref(PAST_NICKNAMES_REF).set(pastNicknames, function (error) {
        if (error) {
            console.log(`The write failed: ${PAST_NICKNAMES_REF}: error code: ${error.code}`);
        } else {
            console.log(`The write successful: ${PAST_NICKNAMES_REF}`);
        }
    });
}

// Functionality of the login button
$("#register-button").click(function (event) {

    var nickname = $("#nickname").val().trim();
    var validNickname = /^[a-zA-Z0-9_]*$/.test(nickname) && nickname.length >= 8;

    var secretNumber = $("#secret-number").val().trim();
    var validSecretNumber = /^[0-9]*$/.test(secretNumber) && (secretNumber.length === 0 || secretNumber.length >= 4);

    // Login info validation
    if (!validNickname) {
        $("#nickname-message").text("Nickname invalid!");

    } else if (!validSecretNumber) {
        $("#secret-number-message").text("Secret # invalid!");

    } else if (getLoginInfo(nickname, secretNumber) === "nickname used") {

        $("#nickname-message").text("Nickname already used!");

    } else if (getLoginInfo(nickname, secretNumber) === "secret does not match") {

        $("#secret-number-message").text("Secret # doesn't match!");

    } else {
        currentPlayer.nickname = nickname;
        currentPlayer.secretNumber = parseInt(secretNumber);

        currentPlayer.category = $("#quiz-category").val();
        currentPlayer.categoryId = parseInt($("#quiz-category").find(':selected').data("category-id"));

        // Save the login info in the session storage
        sessionStorage.setItem("currentPlayer", JSON.stringify(currentPlayer));

        $("#secret-number").val("");

        saveLoginInfo(nickname, secretNumber);

        window.open("Quiz.html", "_self");
    }
});

// Get the quiz categories
function getQuizCategories() {
    var queryURL = "https://opentdb.com/api_category.php";

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {

        var quizCategories = response.trivia_categories;

        quizCategories.forEach(function (category) {

            $("#quiz-category").append(`<option data-category-id=${category.id}>${category.name}</option>`);

        });
    });
}
getQuizCategories();

// Get the login page gif
function getGif(term, count) {
    var queryURL = "https://api.giphy.com/v1/gifs/search?";

    var queryParams = {
        api_key: "jxBgxQmHV64xddo6bKl1HZdb0xtgNSZc",
        q: term,
        rating: "g",
        limit: count
    };

    $.ajax({
        url: queryURL + $.param(queryParams),
        method: "GET"
    }).then(function (response) {

        var gif = response.data[Math.floor(Math.random() * count)];

        var title = gif.title;
        var rating = gif.rating;
        var url = gif.images.fixed_height.url;

        $("#gif-img").attr("src", url).attr("alt", title);
    });
}
const GIF_TERM = "good work";
const GIF_COUNT = 10;
getGif(GIF_TERM, GIF_COUNT);

// Simulation of adding past players to the firebase============================
// Used only for testing and debugging
const COUNT = 0;
for (let i = 0; i < COUNT; i++) {
    var pastPlayer = {
        nickname: "Player-" + Math.floor(Math.random() * 100000),
        category: [
            "Entertainment: Books",
            "General Knowledge",
            "Science: Computers",
            "Entertainment: Musicals & Theatres"
        ][Math.floor(Math.random() * 3)],
        score: Math.floor(Math.random() * 100),
    }
    database.ref(PAST_PLAYERS_REF).push(pastPlayer, function (error) {
        if (error) {
            console.log(`The write failed: ${PAST_PLAYERS_REF}, error code: ` + error.code);
        } else {
            console.log(`The write successful: ${PAST_PLAYERS_REF}`);
        }
    });
}
// =============================================================================

var pastPlayers = [];

// Render the scoreboard
function renderScoreboard() {
    pastPlayers.forEach(function (player) {
        $("#scoreboard-body").prepend(`<tr><td>${player.nickname}</td><td>${player.category}</td><td>${player.score}</td></tr>`);
    });
}

// Render the highest score info
function renderHighestScore() {
    var player = pastPlayers[pastPlayers.length - 1];

    $("#highest-score-message").html(`Nickname: ${player.nickname} <br> Topic: ${player.category} <br> Highest Score: ${player.score}`);
}

// Get the scoreboard info from Firebase
const PLAYER_COUNT = 5;
database.ref(PAST_PLAYERS_REF).orderByChild('score').limitToLast(PLAYER_COUNT).on('value', function (snapshot) {
    if (snapshot.val()) {
        pastPlayers = [];

        snapshot.forEach(function (childSnapshot) {
            pastPlayers.push(childSnapshot.val());
        });

        renderScoreboard();
        renderHighestScore();

    } else {
        console.log(`There is no data: ${PAST_PLAYERS_REF}`);
    }
});

// This runs in quiz.js=========================================================
// Used only for testing and debugging
// var score = 14; // example

// var pastPlayer = {
//     nickname: currentPlayer.nickname,
//     category: currentPlayer.category,
//     score: score
// }

// database.ref("past-players").push(pastPlayer, function (error) {
//     if (error) {
//         console.log("The write failed, error code: " + error.code);
//     } else {
//         console.log("The write successful");
//     }
// });
// =============================================================================