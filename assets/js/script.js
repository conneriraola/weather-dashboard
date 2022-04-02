$(document).ready(function () {

    var indexLastClick = 0;
    var cities = [];
    var searchBtnEl = $("#searchBtn");
    var citiesBtnEl = $("#citiesBtn");
    var sortedArray = [];
    var citiesObjects = new Object;
    var isCityRemoved = "";
    var countRemovingCities = 0;
    var checkNum = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

    if (localStorage.length > 0) {
        var localStorageArray = new Array();
        for (let i = 0; i < localStorage.length; i++) {
            localStorageArray[i] = localStorage.key(i) + localStorage.getItem(localStorage.key(i));
        }
        sortedArray = localStorageArray.sort();

        for (let i = 0; i < sortedArray.length; i++) {
            if (sortedArray[i].slice(0, 9) === "lastClick") {
                citiesObjects["lastClick"] = sortedArray[i].slice(9, sortedArray[i].length);
            } else if (sortedArray[i].slice(0, 13) === "isCityRemoved") {
                citiesObjects["isCityRemoved"] = sortedArray[i].slice(12, sortedArray[i].length);
            } else if (sortedArray[i].slice(0, 19) === "countRemovingCities") {
                citiesObjects["countRemovingCities"] = sortedArray[i].slice(19, sortedArray[i].length);
            }
            else {
                if (checkNum.indexOf(sortedArray[i][1]) > -1) {
                    citiesObjects[sortedArray[i].slice(0, 2)] = sortedArray[i].slice(2, sortedArray[i].length);
                } else {
                    citiesObjects[sortedArray[i][0]] = sortedArray[i].slice(1, sortedArray[i].length);
                }
            }
        }
       
    }

    for (keys in citiesObjects) {
        let value = citiesObjects[keys];
        if (keys === "lastClick") {
            indexLastClick = value;
        } else if (keys === "isCityRemoved") {
            isCityRemoved = value;
        } else if (keys === "countRemovingCities") {
            countRemovingCities = value;
        } else {
            cities.push(value);
        }
    }

    if (cities.length === 0) {
    } else {
        displayWeather(cities[indexLastClick]);
        createButton(cities);
    }

    searchBtnEl.on("click", function () {
        var cityName = $("#searchInput").val().trim();
        var cityNameReset = "";
        for (let i = 0; i < cityName.length; i++) {
            if (i === 0) {
                cityNameReset += cityName[i].toUpperCase();
            } else {
                cityNameReset += cityName[i].toLowerCase();
            }
        }

        if (cities.indexOf(cityNameReset) > -1) {
            console.log("Repeated City!!")
            alert("You alread have " + cityNameReset + " button");
            return;
        }

        indexLastClick = cities.length;

        if (localStorage.length === 0) {
            localStorage.setItem("lastClick", indexLastClick);
            localStorage.setItem("isCityRemoved", "false");
            localStorage.setItem((parseInt(localStorage.length)), cityNameReset);
            localStorage.setItem("countRemovingCities", 0);
        } else {
            localStorage.setItem("lastClick", indexLastClick);
            localStorage.setItem("isCityRemoved", "false");
            localStorage.setItem((parseInt(localStorage.length) + parseInt(countRemovingCities)), cityNameReset);
        }

        cities.push(cityNameReset);

        createButton(cities);

        displayWeather(cities[cities.length - 1]);
    });

    function createButton(arrCities) {
        citiesBtnEl.empty();

        arrCities.forEach(function (data) {
            var buttonEl = $("<button>");
            var spanEl = $("<span>");

            spanEl.addClass("close");
            buttonEl.addClass("btn cities");
            buttonEl.attr("city-name", data);

            spanEl.text("x");
            buttonEl.text(data);

            buttonEl.append(spanEl);
            citiesBtnEl.prepend(buttonEl);
        });
    }

    function displayWeather(cityName) {
        var apiKey = "55b9b01153577ab02bdcfe93626df0e5";
        var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + apiKey;
        var cityEl = $("#cityName");
        var currentTimeEl = $("#currentTime");
        var weatherIconEl = $("#weatherIcon");
        var temperatureEl = $("#temperature");
        var humidityEl = $("#humidity");
        var windspeedEl = $("#windspeed");

        cityEl.css({ "font-size": "30px", "color": "black", "margin": "3px 5px 5px 5px", "padding-top": "10px" });
        currentTimeEl.css({ "font-size": "27px", "color": "black", "margin": "0 5px 5px 5px", "padding-top": "10px" });

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {

            var iconNum = response.weather[0].icon;
            var iconURL = "http://openweathermap.org/img/w/" + iconNum + ".png";

            var degreeF = (response.main.temp - 273.15) * 9 / 5 + 32;
            var windSpeedMPH = response.wind.speed * 2.237;
            var currentDate = new Date(response.dt * 1000);
            var currentDateFormat = currentDate.toLocaleString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });

            cityEl.text(cityName);
            currentTimeEl.text("(" + currentDateFormat + ")");
            weatherIconEl.attr("src", iconURL);
            temperatureEl.text(degreeF.toFixed(1) + " \xBAF");
            humidityEl.text(response.main.humidity + " %");
            windspeedEl.text(windSpeedMPH.toFixed(1) + " MPH");

            function displayUV() {
                var apiKey = "55b9b01153577ab02bdcfe93626df0e5";
                var lat = response.coord.lat;
                var lon = response.coord.lon;
                var uvURL = "https://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon + "&appid=" + apiKey;
                var uvEl = $("#uv");
                uvEl.css({ "color": "white", "padding": "5px", "border-radius": "3px" });

                $.ajax({
                    url: uvURL,
                    method: "GET"
                }).then(function (response) {
                    if (response.value > 10) {
                        uvEl.css({ "background": "rgb(190,0,190)" });
                    } else if (response.value >= 8) {
                        uvEl.css({ "background": "red" });
                    } else if (response.value >= 6) {
                        uvEl.css({ "background": "rgb(255,143,0)" });
                    } else if (response.value >= 3) {
                        uvEl.css({ "background": "rgb(255,213,0)" });
                    } else {
                        uvEl.css({ "background": "green" });
                    }
                    uvEl.text(response.value);
                });
            }

            function displayFivedays() {
                var apiKey = "55b9b01153577ab02bdcfe93626df0e5";
                var lat = response.coord.lat;
                var lon = response.coord.lon;
                var FiveDaysURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=hourly,minutely&units=imperial&appid=" + apiKey;
                var fiveDayForecastEl = $("#forecast");
                fiveDayForecastEl.empty();
                $.ajax({
                    url: FiveDaysURL,
                    method: "GET"
                }).then(function (response) {
                    var dateFiveDays;
                    var iconIdFiveDays;
                    var iconFiveDaysURL;

                    for (let i = 1; i < 6; i++) {
                        var divEl = $("<div>");
                        var h5El = $("<h5>");
                        var imgEl = $("<img>");

                        divEl.attr("class", "card bg-primary");

                        dateFiveDays = new Date(response.daily[i].dt * 1000);
                        iconIdFiveDays = response.daily[i].weather[0].icon;
                        iconFiveDaysURL = "http://openweathermap.org/img/w/" + iconIdFiveDays + ".png";

                        h5El.text(dateFiveDays.toLocaleString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }));
                        divEl.append(h5El);

                        imgEl.attr("src", iconFiveDaysURL);
                        imgEl.attr("class", "weatherIconClass");
                        divEl.append(imgEl);

                        var pTempEl = $("<p>");
                        pTempEl.text("Temp: " + response.daily[i].temp.day + " \xBAF");
                        divEl.append(pTempEl);

                        var pHumidityEl = $("<p>");
                        pHumidityEl.attr('class', "mb-0");
                        pHumidityEl.text("Humidity: " + response.daily[i].humidity + "%");
                        divEl.append(pHumidityEl);

                        fiveDayForecastEl.append(divEl);
                    }
                });
            }
            displayUV();
            displayFivedays();
        });
    }

    $("#citiesBtn").on("click", "button", function (e) {
        e.preventDefault();

        var CityName = $(this).attr("city-name");
        for (let i = 0; i < cities.length; i++) {
            if (cities[i] === CityName) {
                localStorage.setItem("lastClick", i);
            }
        }
        indexLastClick = localStorage.getItem("lastClick");

        displayWeather(CityName);
    });

    $("#citiesBtn").on("click", "button .close", function (e) {
        e.preventDefault();

        console.log($(this).parent().attr("city-name"));
        console.log(cities);

        var removeCityName = $(this).parent().attr("city-name");
        for (let i = 0; i < localStorage.length; i++) {
            let keyName = localStorage.key(i);
            if (removeCityName === localStorage.getItem(keyName)) {
                localStorage.removeItem(keyName);

                let index = cities.indexOf(removeCityName);
                cities.splice(index, 1);
                removeCityName = "";

                countRemovingCities = parseInt(countRemovingCities) + 1;
                
                localStorage.setItem("lastClick", 0);
                localStorage.setItem("isCityRemoved", "true");
                localStorage.setItem("countRemovingCities", countRemovingCities);
            }
        }
        $(this).parent().css("display", "none");
    })

    $(".resetBtn").on("click", function (e) {
        e.preventDefault();
        localStorage.clear();
        cities = [];
        console.log("cities" + cities);
        $("#citiesBtn").text("");
    })
});