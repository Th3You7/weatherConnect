// Initialize
window.addEventListener("DOMContentLoaded", () => {
  const timeElement = document.getElementById("current_time");
  const locationElement = document.getElementById("current_location");
  const hmdty = document.getElementById("humidity");
  const wind = document.getElementById("wind");
  const press = document.getElementById("pressure");
  const desc = document.getElementById("desc");
  const fl = document.querySelector("#feels_like");
  const current_temp = document.getElementById("curren_temp");
  const visib = document.getElementById("visibility");
  //const search = document.getElementById("search");
  const search = document.querySelector("input");

  const API_KEY = "947bd228ea27b2adbc4c114d49c71039";
  const CITY_KEY = "dfsW0xUYVKmmyY6Jv3L90A==hwN5XzX4xnuiEvSl";

  const weatherApi = (lat, lon) =>
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

  const locationApi = (name) => `https://www.api-ninjas.com/api/${name}`;

  const geolocationApi = (latitude, longitude) =>
    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

  const searchCityApi = (name) =>
    `https://api.api-ninjas.com/v1/city?${name}=San Francisco`;

  const loginApi = `https://login.meteomatics.com/api/v1/token`;

  // const username = "enaa_boy_free";
  // const password = "4VYs1nOb91";
  // const headers = new Headers();
  // headers.set("Authorization", "Basic " + btoa(username + ":" + password));

  // Function to format time with leading zeros
  function formatTime(number) {
    return number.toString().padStart(2, "0");
  }

  // Update clock function
  function updateClock() {
    const now = new Date();
    const hours = formatTime(now.getHours());
    const minutes = formatTime(now.getMinutes());

    timeElement.textContent = `${hours}:${minutes}`;
  }

  // Get location function
  function getLocation() {
    if (!navigator.geolocation) {
      locationElement.textContent =
        "Geolocation is not supported by your browser";
      return;
    }

    // Get current position
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    });
  }

  // handle geolocation success or search
  function handleSuccess(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const url = geolocationApi(latitude, longitude);
    // Optional: Fetch city name using reverse geocoding
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const {
          address: { region, country },
        } = data;
        locationElement.textContent = `${country}, ${region}`;
        getWeather(latitude, longitude);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // handle geolocation error
  function handleError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        locationElement.textContent = "Location access denied by user";
        break;
      case error.POSITION_UNAVAILABLE:
        locationElement.textContent = "Location information unavailable";
        break;
      case error.TIMEOUT:
        locationElement.textContent = "Location request timed out";
        break;
      default:
        locationElement.textContent = "An unknown error occurred";
    }
  }

  //handle login
  function login() {
    fetch("https://login.meteomatics.com/api/v1/token", {
      method: "GET",
      headers: headers,
    })
      .then(function (resp) {
        const res = resp.json();
        const token = res.access_token;

        localStorage.setItem("token", token);
      })
      .catch(function (err) {
        console.log("something went wrong", err);
      });
  }

  //get weather and update elements
  async function getWeather(lat, long) {
    const url = weatherApi(lat, long);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Weather data fetch failed");
      }

      const data = await response.json();
      const current = data.current;
      console.log(data);
      const {
        wind: { speed },
        sys: { sunrise, sunset },
        visibility,
        weather,
        main: { temp, pressure, sea_level, feels_like, humidity },
      } = data;
      wind.textContent = speed;
      //pressure.textContent = pressure;
      fl.textContent = `Feels like ${feels_like}`;
      hmdty.textContent = humidity;
      desc.textContent = weather[0].description;
      visib.textContent = visibility;
      current_temp.textContent = temp;
      press.textContent = pressure;
    } catch (error) {}
  }

  // handle Search
  async function handleSearch(e) {
    console.log("clicked");
    if (e.key === "Enter") {
      const searchValue = e.target.value;
      const url = searchCityApi(searchValue);
      try {
        const res = await fetch(url, { headers: { "X-Api-Key": CITY_KEY } });
        const { langtitude, latitude } = res;
        handleSuccess({ coords: { langtitude, langtitude } });
      } catch (error) {}
    }
  }

  // Start clock updates
  updateClock(); // Initial call
  setInterval(updateClock, 1000); // Update every second

  //login
  //   login();

  // Get location
  getLocation();

  // Search
  search.addEventListener("keydown", handleSearch);
});
