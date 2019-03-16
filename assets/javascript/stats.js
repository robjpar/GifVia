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
const QUESTION_REF = "questions";

var pastPlayers = [];
var questions = [];
var categoryHistogram = {};
var questionHistogram = {};
var question = {};

//function references Firebase to store player data

database.ref(PAST_PLAYERS_REF).on('value', function (snapshot) {
    if (snapshot.val()) {
        pastPlayers = [];

        snapshot.forEach(function (childSnapshot) {
            pastPlayers.push(childSnapshot.val());
        });

        // console.log("past players:");
        // console.log(pastPlayers);

        makeCategoryHistogram();

        plotChart1();

    } else {
        console.log(`There is no data: ${PAST_PLAYERS_REF}`);
    }
});

//this function references database to store category response data
database.ref(QUESTION_REF).on('value', function (snapshot) {
    if (snapshot.val()) {
        questions = [];

        snapshot.forEach(function (childSnapshot) {
            questions.push(childSnapshot.val());
        });

        // console.log("questions: ");
        console.log(questions);
    } else {
        console.log(`There is no data for ${QUESTION_REF}`);
    };

    makeQuestionsHistogram();
    plotChart2();
})

//function compiles information regarding how many times a certain category has been played
function makeCategoryHistogram() {

    pastPlayers.forEach(function (player) {
        if (player.category in categoryHistogram) {
            categoryHistogram[player.category] += 1;
        } else {
            categoryHistogram[player.category] = 1;
        }
    });

}

//function makes a dataset that compiles how many "winning" answers have accumulated based on category type
function makeQuestionsHistogram() {

    questions.forEach(function (question) {
        if (question.category in questionHistogram) {
            if (question.outcome === "winner") {
                questionHistogram[question.category] += 1;
            }
        } else {
            if (question.outcome === "winner") {
                questionHistogram[question.category] = 1;
            }
        }
    });

    console.log(questionHistogram);
};

//sets chart default size
Chart.defaults.global.defaultFontSize = 18;

//plots first chart looking at categories selected most often -- sets a display limit of 6
function plotChart1() {

    var histogramList = [];
    for (var category in categoryHistogram) {
        histogramList.push([category, categoryHistogram[category]]);
    }
    histogramList.sort(function (a, b) {
        return b[1] - a[1];
    });

    var labels = [];
    var data = [];
    for (let i = 0; i < histogramList.length; i++) {
        labels.push(histogramList[i][0]);
        data.push(histogramList[i][1]);
    }

    // console.log(labels);
    // console.log(data);

    var totalCountGames = pastPlayers.length;

    // console.log(totalCountGames);

    var ctx = document.getElementById("chart-1").getContext('2d');

    var myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels.slice(0, 6), // labels
            datasets: [{
                data: data.slice(0, 6), // data
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            title: {
                display: true,
                text: 'Most Often Chosen Quiz Topics, Games Played: ' + totalCountGames,
            },
            responsive: true,
            maintainAspectRatio: true,
        }
    });
}

//function displays second chart that looks at how many "winning" answers have been compiled per category (display limit 6)
function plotChart2() {

    var sortableTwo = [];
    for (var category in questionHistogram) {
        sortableTwo.push([category, questionHistogram[category]]);
    }
    sortableTwo.sort(function (a, b) {
        return b[1] - a[1];
    });

    console.log(sortableTwo);

    var questionLabels = [];
    var dataChartTwo = [];
    for (let i = 0; i < sortableTwo.length; i++) {
        questionLabels.push(sortableTwo[i][0]);
        dataChartTwo.push(sortableTwo[i][1]);
    };

    console.log(questionLabels);
    console.log(dataChartTwo);


    var ctx = document.getElementById("chart-2").getContext('2d');

    var barChartData = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: questionLabels.slice(0, 6), // categories, x-axis
            datasets: [{
                data: dataChartTwo.slice(0, 6),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            title: {
                display: true,
                text: "Number of Correct Answers Guessed per Topic",
            },
            legend: {
                display: false
            },
            responsive: true,
            maintainAspectRatio: true,
        }
    })
};

$(document).ready( function(){
    var winWidth = $( window ).width();

    if(winWidth<992){ //992 is where text and other things get wonky
        Chart.defaults.global.defaultFontSize = 6;
        $('.canvasCont').attr('style','height: 40vh; margin-bottom: 20px;');
    }
    else{
        Chart.defaults.global.defaultFontSize = 18;
        $('.canvasCont').attr('style','');
    }

    $( window ).resize(function() {
        winWidth = $( window ).width();

        if(winWidth<992){ //992 is where text and other things get wonky
            Chart.defaults.global.defaultFontSize = 6;
            $('.canvasCont').attr('style','height: 40vh; margin-bottom: 20px;');
        }
        else{
            Chart.defaults.global.defaultFontSize = 18;
            $('.canvasCont').attr('style','');
        }
    });
});
