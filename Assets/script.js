
var nameOfLocationEl = $(".locationName");
var searchHistoryEl = $(".storedHistory");
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0');
var yyyy = today.getFullYear();
var today = mm + '/' + dd + '/' + yyyy;
var currentDateEl = $(".currentDate");

var searchBtn = $(".searchBtn");
var searchInput = $(".searchInput");
searchBtn.on("click", function(e) {
    e.preventDefault();
    if (searchInput.val() === "") {
        alert("You must enter a location!");
        return;
    }
    console.log("successful search")
    weatherSearch(searchInput.val());
});

$(document).on("click", ".historyEntry", function() {
    console.log("stored history")
    var thisElement = $(this);
    weatherSearch(thisElement.text());
})

if (JSON.parse(localStorage.getItem("searchHistory")) === null) {
    console.log("Unable to Locate your Request")
}else{
    console.log("loading");
    renderSearchHistory();
}


function renderSearchHistory(locationName) {
    searchHistoryEl.empty();
    var searchHistoryArr = JSON.parse(localStorage.getItem("searchHistory"));
    for (var i = 0; i < searchHistoryArr.length; i++) {
        var loggedData = $("<li>").attr("class", "historyEntry");
        loggedData.text(searchHistoryArr[i]);
        searchHistoryEl.prepend(loggedData);
    }
}

var apiKey = "7e19f82278f9f51f7a7d15c164352f7f";
function renderWeatherData(locationName, cityTemp, cityHumidity, cityWindSpeed, cityWeatherIcon, uvVal) {
    nameOfLocationEl.text(locationName)
    temperatureEl.text(`Temperature: ${cityTemp} °F`);
    humidityEl.text(`Humidity: ${cityHumidity}%`);
    windSpeedEl.text(`Wind Speed: ${cityWindSpeed} MPH`);
    uvIndexEl.text(`UV Index: ${uvVal}`);
    weatherIconEl.attr("src", cityWeatherIcon);
}

var temperatureEl = $(".temperature");
var humidityEl = $(".humidity");
var windSpeedEl = $(".windSpeed");
var uvIndexEl = $(".uvIndex");
var cardRow= $(".card-row");

function weatherSearch(nameOfCity) {
    var queryUrl = `https://api.openweathermap.org/data/2.5/weather?q=${nameOfCity}&APPID=${apiKey}&units=imperial`;
    $.ajax({
        url: queryUrl,
        method: "GET"
    })
    .then(function(weatherData) {
        var cityObj = {
            locationName: weatherData.name,
            cityTemp: weatherData.main.temp,
            cityHumidity: weatherData.main.humidity,
            cityWindSpeed: weatherData.wind.speed,
            cityUVIndex: weatherData.coord,
            cityWeatherIconName: weatherData.weather[0].icon
        }
    var queryUrl = `https://api.openweathermap.org/data/2.5/uvi?lat=${cityObj.cityUVIndex.lat}&lon=${cityObj.cityUVIndex.lon}&APPID=${apiKey}&units=imperial`
    $.ajax({
        url: queryUrl,
        method: 'GET'
    })
    .then(function(uvData) {
        if (JSON.parse(localStorage.getItem("searchHistory")) == null) {
            var searchHistoryArr = [];
            // Keeps user from adding the same city to the searchHistory array list more than once
            if (searchHistoryArr.indexOf(cityObj.locationName) === -1) {
                searchHistoryArr.push(cityObj.locationName);
                // store our array of searches and save 
                localStorage.setItem("searchHistory", JSON.stringify(searchHistoryArr));
                var renderedWeatherIcon = `https:///openweathermap.org/img/w/${cityObj.cityWeatherIconName}.png`;
                renderWeatherData(cityObj.locationName, cityObj.cityTemp, cityObj.cityHumidity, cityObj.cityWindSpeed, renderedWeatherIcon, uvData.value);
                renderSearchHistory(cityObj.locationName);
            }else{
                var renderedWeatherIcon = `https:///openweathermap.org/img/w/${cityObj.cityWeatherIconName}.png`;
                renderWeatherData(cityObj.locationName, cityObj.cityTemp, cityObj.cityHumidity, cityObj.cityWindSpeed, renderedWeatherIcon, uvData.value);
            }
        }else{
            var searchHistoryArr = JSON.parse(localStorage.getItem("searchHistory"));
            if (searchHistoryArr.indexOf(cityObj.locationName) === -1) {
                searchHistoryArr.push(cityObj.locationName);
                localStorage.setItem("searchHistory", JSON.stringify(searchHistoryArr));
                var renderedWeatherIcon = `https:///openweathermap.org/img/w/${cityObj.cityWeatherIconName}.png`;
                renderWeatherData(cityObj.locationName, cityObj.cityTemp, cityObj.cityHumidity, cityObj.cityWindSpeed, renderedWeatherIcon, uvData.value);
                renderSearchHistory(cityObj.locationName);
            }else{
                var renderedWeatherIcon = `https:///openweathermap.org/img/w/${cityObj.cityWeatherIconName}.png`;
                renderWeatherData(cityObj.locationName, cityObj.cityTemp, cityObj.cityHumidity, cityObj.cityWindSpeed, renderedWeatherIcon, uvData.value);
            }
        }
    })
        
    });
    getFiveDayForecast();

    function getFiveDayForecast() {
        cardRow.empty();
        var queryUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${nameOfCity}&APPID=${apiKey}&units=imperial`;
        $.ajax({
            url: queryUrl,
            method: "GET"
        })
        .then(function(fiveDayReponse) {
            for (var i = 0; i != fiveDayReponse.list.length; i+=8 ) {
                var cityObj = {
                    date: fiveDayReponse.list[i].dt_txt,
                    icon: fiveDayReponse.list[i].weather[0].icon,
                    temp: fiveDayReponse.list[i].main.temp,
                    humidity: fiveDayReponse.list[i].main.humidity
                }
                var dateStr = cityObj.date;
                var trimmedDate = dateStr.substring(0, 10); 
                var weatherIco = `https:///openweathermap.org/img/w/${cityObj.icon}.png`;
                createForecastCard(trimmedDate, weatherIco, cityObj.temp, cityObj.humidity);
            }
        })
    }   
}
var weatherIconEl = $(".weatherIcon");

function createForecastCard(date, icon, temp, humidity) {

    // HTML elements we will create to later
    var fiveDaysCardEl = $("<div>").attr("class", "five-day-card");
    var dateCard = $("<h3>").attr("class", "card-text");
    var cardIcon = $("<img>").attr("class", "weatherIcon");
    var cardTemperature = $("<p>").attr("class", "card-text");
    var cardHumidity = $("<p>").attr("class", "card-text");

    cardRow.append(fiveDaysCardEl);
    dateCard.text(date);
    cardIcon.attr("src", icon);
    cardTemperature.text(`Temp: ${temp} °F`);
    cardHumidity.text(`Humidity: ${humidity}%`);
    fiveDaysCardEl.append(dateCard, cardIcon, cardTemperature, cardHumidity);
}

function activatePlacesSearch() {
    let options = {
        types: ['(regions)']
    };
    let input = document.getElementById('search-term');
    let autocomplete = new google.maps.places.Autocomplete(input, options);
}

