/* ==========================================
   QUIZ QUESTIONS
========================================== */

const questions = [

    {
        q: "Which language is primarily used to structure the content of a web page?",
        o: ["HTML", "CSS", "SQL", "Python"],
        a: 0
    },

    {
        q: "Which data structure follows the FIFO principle?",
        o: ["Stack", "Queue", "Tree", "Graph"],
        a: 1
    },

    {
        q: "Which SQL command is used to retrieve data from a table?",
        o: ["INSERT", "UPDATE", "SELECT", "DELETE"],
        a: 2
    },

    {
        q: "What does CSS primarily control?",
        o: [
            "Database records",
            "Web page presentation",
            "Server hardware",
            "File compression"
        ],
        a: 1
    },

    {
        q: "Which JavaScript keyword declares a block-scoped variable that can be reassigned?",
        o: [
            "const",
            "let",
            "class",
            "return"
        ],
        a: 1
    },

    {
        q: "Which algorithm is commonly used to find the shortest path in a weighted graph when edge weights are non-negative?",
        o: [
            "Dijkstra's algorithm",
            "Bubble sort",
            "Binary search",
            "DFS"
        ],
        a: 0
    },

    {
        q: "What is the main purpose of Git?",
        o: [
            "Designing logos",
            "Version control",
            "Hosting databases",
            "Compiling Java"
        ],
        a: 1
    },

    {
        q: "Which Python library is widely used for tabular data analysis?",
        o: [
            "Pandas",
            "Flask",
            "Tkinter",
            "Pygame"
        ],
        a: 0
    },

    {
        q: "What does API commonly stand for?",
        o: [
            "Application Programming Interface",
            "Advanced Program Instruction",
            "Automated Page Index",
            "Application Process Input"
        ],
        a: 0
    },

    {
        q: "Which HTTP status code means 'Not Found'?",
        o: [
            "200",
            "301",
            "404",
            "500"
        ],
        a: 2
    }

];


/* ==========================================
   VARIABLES
========================================== */

const QUIZ_TIME = 60;

const SCORE_KEY = "quizWeatherLeaderboard";

let state = {

    name: "",

    index: 0,

    score: 0,

    selected: null,

    timeLeft: QUIZ_TIME,

    timerId: null,

    active: false

};


/* ==========================================
   SHORTCUT
========================================== */

const $ = id => document.getElementById(id);


/* ==========================================
   SECURITY
========================================== */

function escapeHtml(value) {

    return String(value).replace(
        /[&<>"']/g,
        character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]
    );

}


/* ==========================================
   LOCAL STORAGE
========================================== */

function getScores() {

    try {

        return JSON.parse(
            localStorage.getItem(SCORE_KEY) || "[]"
        );

    } catch {

        return [];

    }

}


function saveScores(scores) {

    localStorage.setItem(
        SCORE_KEY,
        JSON.stringify(scores)
    );

}


/* ==========================================
   LEADERBOARD
========================================== */

function renderLeaderboard() {

    const scores = getScores()
        .sort(
            (a, b) =>
                b.score - a.score ||
                b.timestamp - a.timestamp
        )
        .slice(0, 10);


    $("leaderboardBody").innerHTML =
        scores.map(
            (score, index) => `

                <tr>

                    <td class="rank">
                        ${index + 1}
                    </td>

                    <td>
                        ${escapeHtml(score.name)}
                    </td>

                    <td>
                        ${score.score}/10
                    </td>

                    <td>
                        ${score.score * 10}%
                    </td>

                    <td>
                        ${new Date(
                            score.timestamp
                        ).toLocaleDateString()}
                    </td>

                </tr>

            `
        ).join("");


    $("emptyScores").classList.toggle(
        "hidden",
        scores.length > 0
    );

}


/* ==========================================
   TIMER
========================================== */

function updateTimer() {

    const minutes = String(
        Math.floor(state.timeLeft / 60)
    ).padStart(2, "0");


    const seconds = String(
        state.timeLeft % 60
    ).padStart(2, "0");


    $("timer").textContent =
        `${minutes}:${seconds}`;


    $("timer").style.color =
        state.timeLeft <= 10
            ? "var(--bad)"
            : "var(--accent)";

}


function startTimer() {

    clearInterval(state.timerId);


    state.timerId = setInterval(() => {

        if (!state.active) return;


        state.timeLeft--;

        updateTimer();


        if (state.timeLeft <= 0) {

            finishQuiz(true);

        }

    }, 1000);

}


/* ==========================================
   DISPLAY QUESTION
========================================== */

function renderQuestion() {

    const question =
        questions[state.index];


    $("progressText").textContent =
        `Question ${state.index + 1} / ${questions.length}`;


    $("questionNumber").textContent =
        `QUESTION ${String(
            state.index + 1
        ).padStart(2, "0")}`;


    $("questionText").textContent =
        question.q;


    $("progressBar").style.width =
        `${((state.index + 1) / questions.length) * 100}%`;


    $("nextBtn").disabled = true;


    $("nextBtn").textContent =
        state.index === questions.length - 1
            ? "Finish Quiz"
            : "Next Question";


    $("answerMessage").textContent = "";


    $("options").innerHTML =
        question.o.map(
            (option, index) => `

                <button
                    class="option"
                    type="button"
                    data-index="${index}"
                >

                    <span class="letter">
                        ${String.fromCharCode(65 + index)}
                    </span>

                    <span>
                        ${escapeHtml(option)}
                    </span>

                </button>

            `
        ).join("");


    document
        .querySelectorAll(".option")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    selectAnswer(
                        Number(button.dataset.index)
                    );

                }
            );

        });

}


/* ==========================================
   ANSWER
========================================== */

function selectAnswer(index) {

    if (state.selected !== null) return;


    state.selected = index;


    const correct =
        questions[state.index].a;


    document
        .querySelectorAll(".option")
        .forEach((button, i) => {

            button.disabled = true;


            if (i === correct) {

                button.classList.add("correct");

            }


            if (
                i === index &&
                i !== correct
            ) {

                button.classList.add("wrong");

            }

        });


    if (index === correct) {

        state.score++;

        $("answerMessage").textContent =
            "Correct! +1 point";

    } else {

        $("answerMessage").textContent =
            `Not quite. Correct answer: ${
                questions[state.index].o[correct]
            }`;

    }


    $("nextBtn").disabled = false;

}


/* ==========================================
   START QUIZ
========================================== */

function startQuiz() {

    const enteredName =
        $("playerName").value.trim();


    const name =
        enteredName || "Anonymous";


    state = {

        name: name.slice(0, 24),

        index: 0,

        score: 0,

        selected: null,

        timeLeft: QUIZ_TIME,

        timerId: null,

        active: true

    };


    $("quizStart")
        .classList.add("hidden");


    $("quizResult")
        .classList.add("hidden");


    $("quizGame")
        .classList.remove("hidden");


    updateTimer();

    renderQuestion();

    startTimer();


    location.hash = "quiz";

}


/* ==========================================
   NEXT QUESTION
========================================== */

function nextQuestion() {

    if (state.selected === null) return;


    if (
        state.index ===
        questions.length - 1
    ) {

        finishQuiz(false);

    } else {

        state.index++;

        state.selected = null;

        renderQuestion();

    }

}


/* ==========================================
   FINISH QUIZ
========================================== */

function finishQuiz(timedOut) {

    if (!state.active) return;


    state.active = false;


    clearInterval(state.timerId);


    const scores = getScores();


    scores.push({

        name: state.name,

        score: state.score,

        timestamp: Date.now()

    });


    saveScores(scores);


    $("quizGame")
        .classList.add("hidden");


    $("quizResult")
        .classList.remove("hidden");


    $("finalScore").textContent =
        state.score;


    if (timedOut) {

        $("resultTitle").textContent =
            "Time's up!";

    } else if (state.score >= 8) {

        $("resultTitle").textContent =
            "Excellent work!";

    } else if (state.score >= 5) {

        $("resultTitle").textContent =
            "Good effort!";

    } else {

        $("resultTitle").textContent =
            "Keep practicing!";

    }


    $("resultMessage").textContent =
        `${state.name}, you scored ${
            state.score
        } out of ${
            questions.length
        }${timedOut ? " before the timer ended." : "."}`;


    renderLeaderboard();

}


/* ==========================================
   QUIT
========================================== */

function quitQuiz() {

    if (!state.active) return;


    const confirmed =
        confirm(
            "Quit this quiz? Your current attempt will not be saved."
        );


    if (!confirmed) return;


    state.active = false;


    clearInterval(state.timerId);


    $("quizGame")
        .classList.add("hidden");


    $("quizStart")
        .classList.remove("hidden");


    updateTimer();

}


/* ==========================================
   WEATHER CODES
========================================== */

const weatherText = {

    0: ["Clear sky", "☀️"],

    1: ["Mainly clear", "🌤️"],

    2: ["Partly cloudy", "⛅"],

    3: ["Overcast", "☁️"],

    45: ["Fog", "🌫️"],

    48: ["Rime fog", "🌫️"],

    51: ["Light drizzle", "🌦️"],

    53: ["Drizzle", "🌦️"],

    55: ["Heavy drizzle", "🌧️"],

    61: ["Light rain", "🌦️"],

    63: ["Rain", "🌧️"],

    65: ["Heavy rain", "🌧️"],

    71: ["Light snow", "🌨️"],

    73: ["Snow", "❄️"],

    75: ["Heavy snow", "❄️"],

    80: ["Rain showers", "🌦️"],

    81: ["Rain showers", "🌧️"],

    82: ["Heavy showers", "⛈️"],

    95: ["Thunderstorm", "⛈️"],

    96: ["Thunderstorm + hail", "⛈️"],

    99: ["Thunderstorm + hail", "⛈️"]

};


function weatherInfo(code) {

    return (
        weatherText[code] ||
        ["Mixed conditions", "🌡️"]
    );

}


/* ==========================================
   WEATHER API
========================================== */

async function loadWeather(city) {

    const status =
        $("weatherStatus");


    status.textContent =
        `Searching for ${city}...`;


    try {

        /* GET CITY COORDINATES */

        const geoResponse =
            await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
                    city
                )}&count=1&language=en&format=json`
            );


        if (!geoResponse.ok) {

            throw new Error(
                "Location search failed"
            );

        }


        const geo =
            await geoResponse.json();


        if (
            !geo.results ||
            !geo.results.length
        ) {

            throw new Error(
                "City not found"
            );

        }


        const place =
            geo.results[0];


        /* WEATHER REQUEST */

        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?` +
            `latitude=${place.latitude}` +
            `&longitude=${place.longitude}` +
            `&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code` +
            `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
            `&forecast_days=5` +
            `&timezone=auto`;


        const response =
            await fetch(weatherURL);


        if (!response.ok) {

            throw new Error(
                "Weather request failed"
            );

        }


        const data =
            await response.json();


        /* CURRENT WEATHER */

        const [
            description,
            icon
        ] =
            weatherInfo(
                data.current.weather_code
            );


        $("weatherCity").textContent =
            `${place.name}${
                place.country
                    ? ", " + place.country
                    : ""
            }`;


        $("weatherDescription")
            .textContent =
            description;


        $("weatherIcon")
            .textContent =
            icon;


        $("temperature")
            .textContent =
            Math.round(
                data.current.temperature_2m
            );


        $("feelsLike")
            .textContent =
            `${Math.round(
                data.current.apparent_temperature
            )}°C`;


        $("humidity")
            .textContent =
            `${data.current.relative_humidity_2m}%`;


        $("wind")
            .textContent =
            `${Math.round(
                data.current.wind_speed_10m
            )} km/h`;


        /* FORECAST */

        $("forecastList").innerHTML =
            data.daily.time.map(
                (date, index) => {

                    const [
                        forecastDescription,
                        forecastIcon
                    ] =
                        weatherInfo(
                            data.daily
                                .weather_code[index]
                        );


                    const day =
                        index === 0
                            ? "Today"
                            : new Date(
                                `${date}T12:00:00`
                              ).toLocaleDateString(
                                undefined,
                                {
                                    weekday: "short"
                                }
                              );


                    return `

                        <div class="forecast-row">

                            <span class="forecast-day">
                                ${day}
                            </span>

                            <span
                                class="forecast-icon"
                                title="${forecastDescription}"
                            >
                                ${forecastIcon}
                            </span>

                            <span class="forecast-temp">

                                ${Math.round(
                                    data.daily
                                        .temperature_2m_max[index]
                                )}°

                                <small>
                                    /
                                    ${Math.round(
                                        data.daily
                                            .temperature_2m_min[index]
                                    )}°
                                </small>

                            </span>

                        </div>

                    `;

                }
            ).join("");


        status.textContent =
            `Updated for ${place.name}.`;

    } catch (error) {

        status.textContent =
            `Could not load weather: ${
                error.message
            }. Check the city name and internet connection.`;

    }

}


/* ==========================================
   EVENT LISTENERS
========================================== */

$("startBtn")
    .addEventListener(
        "click",
        startQuiz
    );


$("nextBtn")
    .addEventListener(
        "click",
        nextQuestion
    );


$("quitBtn")
    .addEventListener(
        "click",
        quitQuiz
    );


$("restartBtn")
    .addEventListener(
        "click",
        () => {

            $("quizResult")
                .classList.add("hidden");

            $("quizStart")
                .classList.remove("hidden");

            $("playerName").value =
                state.name;

            updateTimer();

        }
    );


$("clearScoresBtn")
    .addEventListener(
        "click",
        () => {

            const confirmed =
                confirm(
                    "Clear all saved leaderboard scores?"
                );


            if (confirmed) {

                localStorage.removeItem(
                    SCORE_KEY
                );

                renderLeaderboard();

            }

        }
    );


/* WEATHER SEARCH */

$("weatherBtn")
    .addEventListener(
        "click",
        () => {

            const city =
                $("cityInput")
                    .value
                    .trim();


            if (city) {

                loadWeather(city);

            }

        }
    );


$("cityInput")
    .addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                $("weatherBtn").click();

            }

        }
    );


/* ==========================================
   DARK MODE
========================================== */

$("themeBtn")
    .addEventListener(
        "click",
        () => {

            const dark =
                document.documentElement
                    .dataset.theme === "dark";


            document.documentElement
                .dataset.theme =
                dark ? "" : "dark";


            $("themeBtn").textContent =
                dark ? "☾" : "☀";


            localStorage.setItem(
                "quizTheme",
                dark ? "light" : "dark"
            );

        }
    );


/* ==========================================
   LOAD SAVED THEME
========================================== */

const savedTheme =
    localStorage.getItem(
        "quizTheme"
    );


if (savedTheme === "dark") {

    document.documentElement
        .dataset.theme = "dark";

    $("themeBtn").textContent = "☀";

}


/* ==========================================
   INITIALIZE
========================================== */

renderLeaderboard();

loadWeather("Bhopal");