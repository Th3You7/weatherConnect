const timeElement = document.getElementById("current_time");
const locationElement = document.getElementById("current_location");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const pressure = document.getElementById("pressure");
const desc = document.getElementById("desc");
const feels_like = document.getElementById("feels_like");
const current_temp = document.getElementById("current_temp");
const visibility = document.getElementById("visibility");

const API_KEY = "947bd228ea27b2adbc4c114d49c71039";

const weatherApi = (lat, lon) =>
  `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

const locationApi = (name) => `https://www.api-ninjas.com/api/${name}`;
const geolocationApi = (latitude, longitude) =>
  `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
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

  // Get current position
  navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  });
}

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
    console.log(speed, feels_like);
    wind.textContent = speed;
    //pressure.textContent = pressure;
    feels_like.innerHTML = `Feels like noo ${feels_like}`;
    humidity.textContent = humidity;
    desc.textContent = `${weather[0].description}`;
    current_temp.textContent = temp;
  } catch (error) {}
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // Start clock updates
  updateClock(); // Initial call
  setInterval(updateClock, 1000); // Update every second

  //login
  //   login();

  // Get location
  getLocation();
});
