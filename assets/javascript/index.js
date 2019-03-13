// Initialize Firebase
var config = {
    apiKey: "AIzaSyBwE9yjpyz60Le4j6krVBvHU9Yk3wyCIjg",
    authDomain: "gifvia-7b161.firebaseapp.com",
    databaseURL: "https://gifvia-7b161.firebaseio.com",
    projectId: "gifvia-7b161",
    storageBucket: "gifvia-7b161.appspot.com",
    messagingSenderId: "400561292234"
};
// var config = {
//     apiKey: "AIzaSyAh9csQszjYRTf32OYxyoalMqw1fIusxac",
//     authDomain: "gifvia-b45c0.firebaseapp.com",
//     databaseURL: "https://gifvia-b45c0.firebaseio.com",
//     projectId: "gifvia-b45c0",
//     storageBucket: "gifvia-b45c0.appspot.com",
//     messagingSenderId: "160762099816"
// };
firebase.initializeApp(config);
var database = firebase.database();
const PAST_PLAYERS_REF = "past-players";
const PAST_NICKNAMES_REF = "past-nicknames";

var currentPlayer = {
    nickname: "",
    category: "",
    categoryId: 0,
    score: 0
}

var savedCurrentPlayer = JSON.parse(sessionStorage.getItem("currentPlayer"));
if (savedCurrentPlayer) {
    $("#nickname").val(savedCurrentPlayer.nickname);
    $("#quiz-category").val(savedCurrentPlayer.category);
}

var pastNicknames = {};
database.ref(PAST_NICKNAMES_REF).on('value', function (snapshot) {
    if (snapshot.val()) {
        pastNicknames = snapshot.val();

        ////
        console.log("past nicknames:");
        console.log(pastNicknames);
    }
});

function getLoginInfo(nickname, secretNumber) {

    if (nickname in pastNicknames && secretNumber === "") {
        return "nickname used";
    }

    if (nickname in pastNicknames && pastNicknames[nickname] !== secretNumber) {
        return "secret does not match";
    }
}

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

$("#register-button").click(function (event) {

    var nickname = $("#nickname").val().trim();
    var validNickname = /^[a-zA-Z0-9_]*$/.test(nickname) && nickname.length >= 8;


    var secretNumber = $("#secret-number").val().trim();
    var validSecretNumber = /^[0-9]*$/.test(secretNumber) && (secretNumber.length === 0 || secretNumber.length >= 4);

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

        sessionStorage.setItem("currentPlayer", JSON.stringify(currentPlayer));

        $("#secret-number").val("");

        saveLoginInfo(nickname, secretNumber);

        window.open("Quiz.html", "_self");
    }
});

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

function getGif(term, number) {
    var queryURL = "https://api.giphy.com/v1/gifs/search?";

    var queryParams = {
        api_key: "dc6zaTOxFJmzC",
        q: term,
        limit: number
    };

    $.ajax({
        url: queryURL + $.param(queryParams),
        method: "GET"
    }).then(function (response) {

        var gif = response.data[Math.floor(Math.random() * number)];

        var title = gif.title;
        var rating = gif.rating;
        var url = gif.images.fixed_height.url;

        console.log("rating: " + rating);

        $("#gif-img").attr("src", url).attr("alt", title);

    });
}
const GIF_TERM = "winner";
const GIF_COUNT = 10;
getGif(GIF_TERM, GIF_COUNT);

// Simulation of adding past players to the firebase
for (let i = 0; i < 0; i++) {
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
// =================================================

var pastPlayers = [];

function renderScoreboard() {
    pastPlayers.forEach(function (player) {
        $("#scoreboard-body").prepend(`<tr><td>${player.nickname}</td><td>${player.category}</td><td>${player.score}</td></tr>`);
    });
}

function renderHighestScore() {
    var player = pastPlayers[pastPlayers.length - 1];

    $("#highest-score-message").html(`Nickname: ${player.nickname} <br> Topic: ${player.category} <br> Highest Score: ${player.score}`);
}
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





// this runs in quiz.js
// var score = 14; // example

// var pastPlayer = {
//     nickname: currentPlayer.nickname,
//     category: currentPlayer.category,
//     score: score
// }

// // database.ref("past-players").set("");

// database.ref("past-players").push(pastPlayer, function (error) {
//     if (error) {
//         console.log("The write failed, error code: " + error.code);
//     } else {
//         console.log("The write successful");
//     }
// });
// =================