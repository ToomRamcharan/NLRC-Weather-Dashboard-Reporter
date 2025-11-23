const API_KEY = CONFIG.API_KEY;
const BASE_URL = CONFIG.BASE_URL;

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const searchHistoryContainer = document.getElementById('search-history');
const weatherContainer = document.getElementById('weather-container');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const splashScreen = document.getElementById('splash-screen');
const mainContainer = document.getElementById('main-container');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadSearchHistory();

    // Hide splash screen and show main content
    setTimeout(() => {
        splashScreen.style.display = 'none';
        mainContainer.style.display = 'block';
    }, CONFIG.SPLASH_DURATION);
});

// Event Listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeather(city);
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeather(city);
        }
    }
});

locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherByCoords(latitude, longitude);
            },
            (error) => {
                console.error('Geolocation error:', error);
                showError(`Unable to retrieve your location: ${error.message}`);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        showError('Geolocation is not supported by your browser.');
    }
});

// Main Weather Function
async function getWeather(city) {
    showLoading();
    try {
        const weatherData = await fetchWeatherData(city);
        const forecastData = await fetchForecastData(city);
        const airQualityData = await fetchAirQuality(weatherData.coord.lat, weatherData.coord.lon);

        updateCurrentWeather(weatherData);
        updateAdditionalInfo(weatherData);
        updateAirQuality(airQualityData);
        updateForecast(forecastData);
        saveToHistory(weatherData.name);

        // Update 3D animations based on weather
        if (typeof weatherAnimations !== 'undefined') {
            weatherAnimations.updateWeather(weatherData.weather[0].main);
        }

        showWeather();
    } catch (error) {
        console.error('Weather fetch error:', error);
        showError(error.message);
    }
}

async function getWeatherByCoords(lat, lon) {
    try {
        const weatherRes = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${CONFIG.UNITS}&appid=${API_KEY}`);
        if (!weatherRes.ok) throw new Error('Location not found');
        const weatherData = await weatherRes.json();

        const forecastRes = await fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=${CONFIG.UNITS}&appid=${API_KEY}`);
        if (!forecastRes.ok) throw new Error('Forecast not found');
        const forecastData = await forecastRes.json();

        const airQualityData = await fetchAirQuality(lat, lon);

        updateCurrentWeather(weatherData);
        updateAdditionalInfo(weatherData);
        updateAirQuality(airQualityData);
        updateForecast(forecastData);
        saveToHistory(weatherData.name);

        // Update 3D animations
        if (typeof weatherAnimations !== 'undefined') {
            weatherAnimations.updateWeather(weatherData.weather[0].main);
        }

        showWeather();
    } catch (error) {
        console.error('Coords weather fetch error:', error);
        showError(error.message);
    }
}

// API Helpers
async function fetchWeatherData(city) {
    const response = await fetch(`${BASE_URL}/weather?q=${city}&units=${CONFIG.UNITS}&appid=${API_KEY}`);
    if (!response.ok) {
        throw new Error('City not found');
    }
    return await response.json();
}

async function fetchForecastData(city) {
    const response = await fetch(`${BASE_URL}/forecast?q=${city}&units=${CONFIG.UNITS}&appid=${API_KEY}`);
    if (!response.ok) {
        throw new Error('Forecast not found');
    }
    return await response.json();
}

async function fetchAirQuality(lat, lon) {
    try {
        const response = await fetch(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        if (!response.ok) {
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error('Air quality data not available:', error);
        return null;
    }
}

// UI Updaters
function updateCurrentWeather(data) {
    document.getElementById('city-name').textContent = data.name;
    document.getElementById('current-date').textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('feels-like').textContent = `${Math.round(data.main.feels_like)}°C`;
    document.getElementById('weather-desc').textContent = data.weather[0].description;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('wind-speed').textContent = `${data.wind.speed} km/h`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
    document.getElementById('visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    document.getElementById('weather-icon').src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    // Generate weather summary
    generateWeatherSummary(data);
}

function generateWeatherSummary(data) {
    const city = data.name;
    const temp = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const condition = data.weather[0].description;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const tempMin = Math.round(data.main.temp_min);
    const tempMax = Math.round(data.main.temp_max);

    // Determine wind description
    let windDesc = 'calm';
    if (windSpeed > 20) windDesc = 'strong';
    else if (windSpeed > 10) windDesc = 'moderate';
    else if (windSpeed > 5) windDesc = 'light';

    // Determine humidity description
    let humidityDesc = '';
    if (humidity > 80) humidityDesc = 'very high humidity';
    else if (humidity > 60) humidityDesc = 'high humidity';
    else if (humidity > 40) humidityDesc = 'moderate humidity';
    else humidityDesc = 'low humidity';

    // Generate summary text
    const summaryText = `Today in ${city}, expect ${condition} with temperatures around ${temp}°C (feels like ${feelsLike}°C). Winds are ${windDesc} at ${windSpeed} km/h with ${humidityDesc} at ${humidity}%. Temperature will range between ${tempMin}°C and ${tempMax}°C.`;

    document.getElementById('summary-text').textContent = summaryText;
    document.getElementById('summary-temp-range').textContent = `${tempMin}°C - ${tempMax}°C`;
    document.getElementById('summary-condition').textContent = condition.charAt(0).toUpperCase() + condition.slice(1);
    document.getElementById('summary-wind').textContent = `${windSpeed} km/h ${windDesc}`;
}

function updateAdditionalInfo(data) {
    // Temperature details
    document.getElementById('temp-max').textContent = `${Math.round(data.main.temp_max)}°C`;
    document.getElementById('temp-min').textContent = `${Math.round(data.main.temp_min)}°C`;

    // Sunrise and Sunset
    const sunrise = new Date(data.sys.sunrise * 1000);
    const sunset = new Date(data.sys.sunset * 1000);

    document.getElementById('sunrise').textContent = sunrise.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('sunset').textContent = sunset.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function updateAirQuality(data) {
    if (!data || !data.list || data.list.length === 0) {
        document.getElementById('aqi-value').textContent = 'N/A';
        document.getElementById('aqi-label').textContent = 'Data unavailable';
        document.getElementById('pm25').textContent = '--';
        document.getElementById('pm10').textContent = '--';
        return;
    }

    const aqi = data.list[0].main.aqi;
    const components = data.list[0].components;

    const aqiLabels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    const aqiClasses = ['aqi-good', 'aqi-fair', 'aqi-moderate', 'aqi-poor', 'aqi-very-poor'];

    const aqiValueEl = document.getElementById('aqi-value');
    const aqiLabelEl = document.getElementById('aqi-label');

    aqiValueEl.textContent = aqi;
    aqiLabelEl.textContent = aqiLabels[aqi - 1] || 'Unknown';

    // Remove all AQI classes and add the current one
    aqiValueEl.className = 'aqi-value ' + (aqiClasses[aqi - 1] || '');
    aqiLabelEl.className = 'aqi-label ' + (aqiClasses[aqi - 1] || '');

    document.getElementById('pm25').textContent = components.pm2_5.toFixed(1);
    document.getElementById('pm10').textContent = components.pm10.toFixed(1);
}

function updateForecast(data) {
    const forecastGrid = document.getElementById('forecast-grid');
    forecastGrid.innerHTML = '';

    // Filter for one forecast per day (at 12:00 PM)
    const dailyData = data.list.filter(item => item.dt_txt.includes('12:00:00'));

    dailyData.slice(0, 5).forEach(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        const icon = day.weather[0].icon;
        const temp = Math.round(day.main.temp);
        const desc = day.weather[0].main;

        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <p><strong>${date}</strong></p>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}">
            <h4>${temp}°C</h4>
            <p>${desc}</p>
        `;
        forecastGrid.appendChild(card);
    });
}

// Search History
function saveToHistory(city) {
    let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
    if (!history.includes(city)) {
        history.unshift(city);
        if (history.length > CONFIG.MAX_HISTORY) history.pop();
        localStorage.setItem('weatherHistory', JSON.stringify(history));
        loadSearchHistory();
    }
}

function loadSearchHistory() {
    const history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
    searchHistoryContainer.innerHTML = '';
    history.forEach(city => {
        const btn = document.createElement('button');
        btn.className = 'history-btn';
        btn.textContent = city;
        btn.addEventListener('click', () => getWeather(city));
        searchHistoryContainer.appendChild(btn);
    });
}

// UI State Helpers
function showLoading() {
    loadingDiv.style.display = 'block';
    weatherContainer.style.display = 'none';
    errorDiv.style.display = 'none';
}

function showWeather() {
    loadingDiv.style.display = 'none';
    weatherContainer.style.display = 'block';
    errorDiv.style.display = 'none';
}

function showError(message) {
    loadingDiv.style.display = 'none';
    weatherContainer.style.display = 'none';
    errorDiv.style.display = 'block';
    errorText.textContent = message;
}
