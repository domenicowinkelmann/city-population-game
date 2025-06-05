let cityData = [];

let score = 0;
let highScore = parseInt(localStorage.getItem('highScore')) || 0;
let canGuess = true;

document.addEventListener('DOMContentLoaded', () => {
    const currentScoreEl = document.getElementById('currentScore');
    const highScoreEl = document.getElementById('highScore');

    currentScoreEl.textContent = score;
    highScoreEl.textContent = highScore;

    // Store references globally if needed
    window.currentScoreEl = currentScoreEl;
    window.highScoreEl = highScoreEl;

    console.log("Highscore: ", highScore);

});


async function fetchCityPopulations() {
    try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/population/cities');
        const json = await response.json();

        if (!json.data || !Array.isArray(json.data)) {
            throw new Error('Unexpected API response structure');
        }

        cityData = json.data
            .map(cityEntry => {
                const latest = cityEntry.populationCounts[0];
                return {
                    city: cityEntry.city,
                    country: cityEntry.country,
                    year: parseInt(latest.year),
                    population: parseFloat(latest.value)
                };
            })
            .filter(({ year }) => year > 2010);

        console.log('Filtered city population data:', cityData);

        displayRandomCities();
    } catch (error) {
        console.error('Error fetching city populations:', error);
        document.getElementById('city-list').textContent = 'Failed to load data.';
    }
}

function getTwoRandomCities() {
    if (cityData.length < 2) return [];

    const shuffled = [...cityData].sort(() => 0.5 - Math.random());
    return [shuffled[0], shuffled[1]];
}

function displayRandomCities() {
    const [city1, city2] = getTwoRandomCities();

    if (!city1 || !city2) return;

    document.getElementById('cityName1').textContent = `${city1.city}`;
    document.getElementById('cityName2').textContent = `${city2.city}`;

    document.getElementById('countryName1').textContent = `${city1.country}`;
    document.getElementById('countryName2').textContent = `${city2.country}`;

    // Optionally, hide the population values at first:
    document.getElementById('cityPop1').textContent = '';
    document.getElementById('cityPop2').textContent = '';

    // Store their populations for comparison later
    document.getElementById('cityPop1').dataset.population = Math.round(city1.population);
    document.getElementById('cityPop2').dataset.population = Math.round(city2.population);
}

function guess(selectedCityId) {
    if (!canGuess) return;

    canGuess = false;

    const pop1 = parseFloat(document.getElementById('cityPop1').dataset.population);
    const pop2 = parseFloat(document.getElementById('cityPop2').dataset.population);

    const isCorrect =
        (selectedCityId === 'city1' && pop1 > pop2) ||
        (selectedCityId === 'city2' && pop2 > pop1);

    document.getElementById('cityPop1').textContent = pop1.toLocaleString();
    document.getElementById('cityPop2').textContent = pop2.toLocaleString();

    const feedbackIcon = document.getElementById('vsFeedbackIcon');
    const vsText = document.getElementById('vsIconText');

    vsText.classList.add('hide');
    feedbackIcon.classList.remove('correct', 'wrong', 'show');

    if (isCorrect) {
        feedbackIcon.textContent = 'check';
        feedbackIcon.classList.add('correct', 'show');
        score++;
        if (window.currentScoreEl) window.currentScoreEl.textContent = score;
    } else {
        feedbackIcon.textContent = 'close';
        feedbackIcon.classList.add('wrong', 'show');
        setTimeout(()=>{
            showGameOverPopup();
        }, 1500)
        return;
    }

    setTimeout(() => {
        feedbackIcon.classList.remove('correct', 'wrong', 'show');
        feedbackIcon.textContent = '';
        vsText.classList.remove('hide');
        displayRandomCities();
        canGuess = true;
    }, 3500);
}


function showGameOverPopup() {
    const popup = document.getElementById('gameOverPopup');
    const scoreEl = document.getElementById('finalScore');
    const feedbackIcon = document.getElementById('vsFeedbackIcon');
    const vsText = document.getElementById('vsIconText');


    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
        if (window.highScoreEl) window.highScoreEl.textContent = highScore;
    }

    scoreEl.textContent = score;

    popup.classList.add('show');

    score = 0;

    feedbackIcon.classList.remove('correct', 'wrong', 'show');
    feedbackIcon.textContent = '';
    vsText.classList.remove('hide');
}

function restartGame() {
    if (window.currentScoreEl) window.currentScoreEl.textContent = score;
    const popup = document.getElementById('gameOverPopup');
    popup.classList.remove('show');
    displayRandomCities();
    canGuess = true;
}

fetchCityPopulations();
