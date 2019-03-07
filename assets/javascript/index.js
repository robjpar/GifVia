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

var currentPlayer = {
    nickName: "Player1",
    category: "Art"
}

const CURRENT_PLAYER_REF = "current-player";

database.ref(CURRENT_PLAYER_REF).set(currentPlayer, function (error) {
    if (error) {
        console.log(`The write failed: ${CURRENT_PLAYER_REF}, error code: ` + error.code);
    } else {
        console.log(`The write successful: ${CURRENT_PLAYER_REF}`);
    }
});

database.ref(CURRENT_PLAYER_REF).once('value', function (snapshot) {
    console.log(snapshot.val().nickName);
    console.log(snapshot.val().category);

}, function (error) {
    if (error) {
        console.log(`The read failed: ${CURRENT_PLAYER_REF}, error code: ` + error.code);
    } else {
        console.log(`The read successful: ${CURRENT_PLAYER_REF}`);
    }
});

var pastPlayers = [{
        nickName: "Player2",
        category: "A",
        highestScore: "1"
    },
    {
        nickName: "Player3",
        category: "B",
        highestScore: "1"
    },
    {
        nickName: "Player4",
        category: "B",
        highestScore: "2"
    },
    {
        nickName: "Player5",
        category: "A",
        highestScore: "2"
    }
]

const PAST_PLAYERS_REF = "past-players";

pastPlayers.forEach(function (player) {

    database.ref(PAST_PLAYERS_REF).push(player, function (error) {
        if (error) {
            console.log(`The write failed: ${PAST_PLAYERS_REF}, error code: ` + error.code);
        } else {
            console.log(`The write successful: ${PAST_PLAYERS_REF}`);
        }
    })

});

var pastPlayers = [];

database.ref(PAST_PLAYERS_REF).orderByChild('highestScore').limitToLast(10).on('value', function (snapshot) {
    snapshot.forEach(function (childSnapshot) {
        pastPlayers.push({
            nickName: childSnapshot.val().nickName,
            category: childSnapshot.val().category,
            highestScore: childSnapshot.val().highestScore
        });
    })

    console.log(pastPlayers);

}, function (error) {
    if (error) {
        console.log(`The read failed: ${CURRENT_PLAYER_REF}, error code: ` + error.code);
    } else {
        console.log(`The read successful: ${CURRENT_PLAYER_REF}`);
    }
});