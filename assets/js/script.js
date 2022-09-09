var apiKey = "9b35244b1b7b8578e6c231fd7654c186";
var searchHistoryList = [];

// function for current condition
function currentWeather(city) {
  var queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;

  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (cityWeatherValue) {
    console.log(cityWeatherValue);

    $("#weatherContent").css("display", "block");
    $("#cityDetail").empty();

    var iconCode = cityWeatherValue.weather[0].icon;
    var iconURL = `https://openweathermap.org/img/w/${iconCode}.png`;

    // displays temp, humidity, and wind speed
    var today = moment().format("L");
    var currentCity = $(`
            <h4 id="currentCity">
                ${cityWeatherValue.name} ${today} <img src="${iconURL}" alt="${cityWeatherValue.weather[0].description}" />
            </h4>
            <p>Temperature: ${cityWeatherValue.main.temp} °F</p>
            <p>Humidity: ${cityWeatherValue.main.humidity}\%</p>
            <p>Wind Speed: ${cityWeatherValue.wind.speed} MPH</p>
        `);

    $("#cityDetail").append(currentCity);

    // UVI API
    var lat = cityWeatherValue.coord.lat;
    var lon = cityWeatherValue.coord.lon;
    var uviURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    $.ajax({
      url: uviURL,
      method: "GET",
    }).then(function (uviResponse) {
      console.log(uviResponse);

      var uvIndex = uviResponse.value;
      var uvIndexP = $(`
                <p>UV Index: 
                    <span id="uvIndexColor" class="px-2 py-2 rounded">${uvIndex}</span>
                </p>
            `);

      $("#cityDetail").append(uvIndexP);

      forecast(lat, lon);

      //  Changes UV colors based off of UV index severity
      if (uvIndex >= 0 && uvIndex <= 2) {
        $("#uvIndexColor")
          .css("background-color", "#3EA72D")
          .css("color", "white");
      } else if (uvIndex >= 3 && uvIndex <= 5) {
        $("#uvIndexColor").css("background-color", "#FFF300");
      } else if (uvIndex >= 6 && uvIndex <= 7) {
        $("#uvIndexColor").css("background-color", "#F18B00");
      } else if (uvIndex >= 8 && uvIndex <= 10) {
        $("#uvIndexColor")
          .css("background-color", "#E53210")
          .css("color", "white");
      } else {
        $("#uvIndexColor")
          .css("background-color", "#B567A4")
          .css("color", "white");
      }
    });
  });
}

// Search button that retrieves search history and enters city of choice
$("#searchBtn").on("click", function (event) {
  event.preventDefault();

  var city = $("#enterCity").val().trim();
  currentWeather(city);
  if (!searchHistoryList.includes(city)) {
    searchHistoryList.push(city);
    var searchedCity = $(`
              <li class="list-group-item">${city}</li>
              `);
    $("#searchHistory").append(searchedCity);
  }

  localStorage.setItem("city", JSON.stringify(searchHistoryList));
  console.log(searchHistoryList);
});

// function for 5 day forecast
function forecast(lat, lon) {
  var forecastURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=current,minutely,hourly,alerts&appid=${apiKey}`;

  $.ajax({
    url: forecastURL,
    method: "GET",
  }).then(function (forecastInfo) {
    console.log(forecastInfo);
    $("#forecast").empty();

    for (let i = 1; i < 6; i++) {
      var cityInfo = {
        date: forecastInfo.daily[i].dt,
        icon: forecastInfo.daily[i].weather[0].icon,
        temp: forecastInfo.daily[i].temp.day,
        humidity: forecastInfo.daily[i].humidity,
      };

      var currDate = moment.unix(cityInfo.date).format("MM/DD/YYYY");
      var iconURL = `<img src="https://openweathermap.org/img/w/${cityInfo.icon}.png" alt="${forecastInfo.daily[i].weather[0].main}" />`;

      //   shows current date, icon, temperature, and humidity
      var forecastDisplay = $(`
                <div class="pl-3">
                    <div class="card pl-3 pt-3 mb-3 bg-primary text-light" style="width: 12rem;>
                        <div class="card-body">
                            <h5>${currDate}</h5>
                            <p>${iconURL}</p>
                            <p>Temp: ${cityInfo.temp} °F</p>
                            <p>Humidity: ${cityInfo.humidity}\%</p>
                        </div>
                    </div>
                <div>
            `);

      $("#forecast").append(forecastDisplay);
    }
  });
}

// Click function to display the current and future weather in selected city
$(document).on("click", ".list-group-item", function () {
  var displayCity = $(this).text();
  currentWeather(displayCity);
});

// Grabs previously searched city from local storage of page load
$(document).ready(function () {
  var searchHistoryArr = JSON.parse(localStorage.getItem("city"));

  if (searchHistoryArr !== null) {
    var lastSearchedIndex = searchHistoryArr.length - 1;
    var lastSearchedCity = searchHistoryArr[lastSearchedIndex];
    currentWeather(lastSearchedCity);
    console.log(`Last searched city: ${lastSearchedCity}`);
  }
});
