var currentPlayer = {
    nickName: "Player1",
    category: "Art",
    categoryId: 25
}


// data sent to quiz.js

localStorage.setItem("currentPlayer", JSON.stringify(currentPlayer));

// ===============


// this run in quiz.js
var currentPlayer = JSON.parse(localStorage.getItem("currentPlayer"));
console.log(currentPlayer);
console.log(currentPlayer.nickName);
console.log(currentPlayer.category);
console.log(currentPlayer.categoryId);
// ===============


// Initialize Firebase
var config = {
    apiKey: "AIzaSyBwE9yjpyz60Le4j6krVBvHU9Yk3wyCIjg",
    authDomain: "gifvia-7b161.firebaseapp.com",
    databaseURL: "https://gifvia-7b161.firebaseio.com",
    projectId: "gifvia-7b161",
    storageBucket: "gifvia-7b161.appspot.com",
    messagingSenderId: "400561292234"
};
firebase.initializeApp(config);

var database = firebase.database();

// this runs in quiz.js
var highestScore = 14; // example

var pastPlayer = {
    nickName: currentPlayer.nickName,
    category: currentPlayer.category,
    highestScore: highestScore
}

database.ref("past-players").push(pastPlayer, function (error) {
    if (error) {
        console.log("The write failed: past-players, error code: " + error.code);
    } else {
        console.log("The write successful: past-players");
    }
});
// =================


// Simulation of adding past players to the firebase

const PAST_PLAYERS_REF = "past-players";

for (let i = 0; i < 10; i++) {

    var pastPlayer = {
        nickName: "Player-" + Math.floor(Math.random() * 1000000),
        category: ["A", "B", "C", "D", "E"][Math.floor(Math.random() * 4)],
        highestScore: Math.floor(Math.random() * 100)
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


// Getting the list or past players from the firebase

var pastPlayers = [];

database.ref(PAST_PLAYERS_REF).orderByChild('highestScore').limitToLast(10).on('value', function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
        pastPlayers.push(childSnapshot.val());
    })

    console.log(pastPlayers);

}, function (error) {
    if (error) {
        console.log(`The read failed: ${CURRENT_PLAYER_REF}, error code: ${error.code}`);
    } else {
        console.log(`The read successful: ${CURRENT_PLAYER_REF}`);
    }
});

// ====================================================