// let OpenLayers = require('ol');

import 'ol/ol.css';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import * as proj from 'ol/proj';
import Tile from 'ol/layer/Tile';
import View from 'ol/View';


const IPINFO_URL = 'https://ipinfo.io/json?token=';
const IPINFO_TOKEN = '09f4aded924de8';

const OPENWEATHERMAP_URL = 'https://api.openweathermap.org/data/2.5/';
const OPENWEATHERMAP_TOKEN = '5324d62b494ffe8e50d87360e5f4e6aa';

const OPENCAGEDATA_URL = 'https://api.opencagedata.com/geocode/v1/json?q=';
const OPENCAGEDATA_TOKEN = '462ceef9bb0d4f66bf5e3e5585384469';


const UNSPLASH_TOKEN = '31cbc1e66d20a95fa11e4f25263a256ccff43f72aa78b5690a1ef466dbd1a191';
const htmlCoordinates = document.getElementById('coordinates');
const htmlLocation = document.getElementById('location');
const htmlTemperature = document.getElementById('temperature');
const htmlWeatherIcon = document.querySelector('#weather_icon img');
const htmlDescription = document.getElementById('description');
const nextDays = document.querySelectorAll('.next_day');
const btnSearchForTown = document.getElementById('btn_search_for_town');
const searchTownField = document.getElementById('search_town_field');
const btnChangeBg = document.getElementById('btn_change_bg');
const btnSwitchUnit = document.getElementById('btn_switch_unit');
const btnVoiceSearch = document.getElementById('btn_voice_search');
const languageSelect = document.getElementById('languageSelect');


const seasonNames = ['winter', 'spring', 'summer', 'autumn'];
const daytimeNames = ['night', 'morning', 'day', 'evening'];

const languagesText = {
  en: {
    dayNames: ['Sunday', 'Monday', 'Tuesday',
      'Wednesday', 'Thursday', 'Friday', 'Saturday',
    ],
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
    temp: 'Temp',
    feelsLike: 'Feels like',
    wind: 'Wind',
    windSpeedUnit: 'm/s',
    humidity: 'Humidity',
    longitude: 'Longitude',
    latitude: 'Latitude',
    btnBackground: 'Background',
    btnVoice: 'Voice',
    btnSearch: 'Search',
    searchTown: 'Search town',
  },
  ru: {
    dayNames: ['Воскресенье', 'Понедельник', 'Вторник',
      'Среда', 'Четверг', 'Пятница', 'Суббота',
    ],
    monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
    ],
    temp: 'Температура',
    feelsLike: 'Ощущение',
    wind: 'Ветер',
    windSpeedUnit: 'м/с',
    humidity: 'Влажность',
    longitude: 'Долгота',
    latitude: 'Широта',
    btnBackground: 'Фон',
    btnVoice: 'Голос',
    btnSearch: 'Поиск',
    searchTown: 'Поиск города',
  },
  be: {
    dayNames: ['Нядзеля', 'Панядзелак', 'Аўторак',
      'Серада', 'Чацвер', 'Пятніца', 'Субота',
    ],
    monthNames: ['Студзень', 'Люты', 'Сакавік', 'Красавік', 'Май', 'Чэрвень',
      'Ліпень', 'Жнівень', 'Верасень', 'Кастрычнік', 'Лістапад', 'Снежань',
    ],
    temp: 'Тэмпература',
    feelsLike: 'Падобна',
    wind: 'Вецер',
    windSpeedUnit: 'м/с',
    humidity: 'Вільготнасць',
    longitude: 'Даўгата',
    latitude: 'Шырата',
    btnBackground: 'Фон',
    btnVoice: 'Голас',
    btnSearch: 'Пошук',
    searchTown: 'Пошук горада',
  },
};


let curLang = 'en';
let usrLocation;
let usrTown;
let curWeather;
let curForecast;
let curTime = new Date();
let townTime = new Date();
let longitude = 0;
let latitude = 0;
let map;
let tempUnit = 'metric';


// обновление даты и времени
function refreshDatetimeText() {
  // внесение даты
  htmlLocation.querySelector('div:last-of-type').innerText = `${
    languagesText[curLang].dayNames[townTime.getDay()]} ${
    townTime.getDate()} ${languagesText[curLang].monthNames[townTime.getMonth()]}, ${
    (`0${townTime.getHours()}`).slice(-2)}:${(`0${townTime.getMinutes()}`).slice(-2)}`;
}


// обновление текстовых данных страницы
async function refreshText() {
  let response;

  // получение текущей погоды
  response = await fetch(`${OPENWEATHERMAP_URL}weather?lat=${latitude}&lon=${
    longitude}&lang=${curLang}&units=${tempUnit}&APPID=${OPENWEATHERMAP_TOKEN}`);
  curWeather = await response.json();

  // обработка текущей погоды
  // console.log(curWeather);
  htmlTemperature.innerText = `${languagesText[curLang].temp}:
    ${Math.round(curWeather.main.temp)} ${tempUnit === 'metric' ? '°С' : '°F'}`;
  htmlWeatherIcon.src = `http://openweathermap.org/img/wn/${curWeather.weather[0].icon}@2x.png`;

  // ${curWeather.weather[0].main}
  htmlDescription.innerText = `${languagesText[curLang].feelsLike}: ${
    Math.round(curWeather.main.feels_like)} ${tempUnit === 'metric' ? '°С' : '°F'}
    ${languagesText[curLang].wind}: ${tempUnit === 'metric' ? Math.round(curWeather.wind.speed)
  : Math.round(curWeather.wind.speed / 2.237)} ${languagesText[curLang].windSpeedUnit} 
    ${languagesText[curLang].humidity}: ${curWeather.main.humidity} %`;

  // обработка локального времени
  const utc = curTime.getTime() + (curTime.getTimezoneOffset() * 60000);
  townTime = new Date(utc + ((3600000 * curWeather.timezone) / 3600));

  // внесение города
  htmlLocation.querySelector('div:first-of-type').innerText = `${Object.prototype.hasOwnProperty
    .call(usrTown.results[0].components, 'city')
    ? usrTown.results[0].components.city : usrTown.results[0].components.state}, ${
    usrTown.results[0].components.country}`;

  // внесение даты
  refreshDatetimeText();

  // получение прогноза на 5 дней
  response = await fetch(`${OPENWEATHERMAP_URL}forecast?lat=${latitude}&lon=${
    longitude}&lang=${curLang}&units=${tempUnit}&APPID=${OPENWEATHERMAP_TOKEN}`);
  curForecast = await response.json();

  // подготовка к обработке прогноза на 5 дней
  // console.log(curForecast.list);
  const tomorrow = new Date(townTime);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  // обработка прогноза на 5 дней
  nextDays.forEach((nextDay) => {
    for (let i = 0; i < curForecast.list.length; i += 1) {
      if (new Date(curForecast.list[i].dt * 1000).toUTCString() === tomorrow.toUTCString()) {
        const nextDay0 = nextDay;
        let averTemp = 0;
        for (let j = i; j - i < 8; j += 1) {
          // console.log(curForecast.list[j].main.temp);
          averTemp += curForecast.list[j].main.temp;
        }
        nextDay0.querySelector('span').innerText = `${languagesText[curLang].dayNames[tomorrow.getDay()]}
          ${Math.round(averTemp / 8)} ${tempUnit === 'metric' ? '°С' : '°F'}`;
        nextDay0.querySelector('img').src = `http://openweathermap.org/img/wn/${
          curForecast.list[i].weather[0].icon}.png`;
        tomorrow.setDate(tomorrow.getDate() + 1);
        break;
      }
    }
  });
}


// обновление страницы для нового города
async function refreshTown(townName, moveMap = true) {
  curLang = document.querySelector('option:checked').value;
  // console.log(curLang);
  btnChangeBg.innerText = languagesText[curLang].btnBackground;
  btnSearchForTown.innerText = languagesText[curLang].btnSearch;
  btnVoiceSearch.innerText = languagesText[curLang].btnVoice;
  searchTownField.placeholder = languagesText[curLang].searchTown;

  // получение города
  const response = await fetch(`${OPENCAGEDATA_URL + townName}&key=${
    OPENCAGEDATA_TOKEN}&pretty=1&no_annotations=1&language=${curLang}`);
  usrTown = await response.json();

  // обработка города
  if (usrTown.results.length !== 0) {
    // console.log(usrTown);
    longitude = usrTown.results[0].geometry.lng;
    latitude = usrTown.results[0].geometry.lat;
    if (moveMap) {
      // смена центра карты
      map.getView().setCenter(proj.transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857'));
      map.getView().setZoom(12);
    }
    htmlCoordinates.innerText = `${languagesText[curLang].longitude}: ${Math.floor(longitude)}° ${
      Math.round((longitude - Math.floor(longitude)) * 100)}' \n ${languagesText[curLang].latitude}: ${
      Math.floor(latitude)}° ${
      Math.round((latitude - Math.floor(latitude)) * 100)}'`;
  } else throw new Error('Specified town do not exist.');

  await refreshText();
}


// смена фона
async function changeBG() {
  const dateTemp = new Date(townTime);

  if (dateTemp.getMonth() === 11) dateTemp.setMonth(-1);

  dateTemp.setMonth(dateTemp.getMonth() + 1);

  const season = Math.floor(dateTemp.getMonth() / 3);

  dateTemp.setHours(dateTemp.getHours() + 3);

  const daytime = Math.floor(dateTemp.getHours() / 6);

  const requestUrl = `${`${'https://api.unsplash.com/photos/random?orientation=landscape'
  + '&query='}${daytimeNames[daytime]}+${seasonNames[season]}`}&client_id=${UNSPLASH_TOKEN}`;

  let responseUrl;

  try {
    const response = await fetch(requestUrl);
    const data = await response.json();
    responseUrl = data.urls.regular;
  } catch (err) {
    responseUrl = 'https://sun9-52.userapi.com/c849124/v849124744/6bc67/WaZokvSNKZ8.jpg';
  }

  const body = document.querySelector('body');
  body.style = `background-image: url("${responseUrl}");`;
}


// вызывается при заходе на страницу
(async function load() {
  // загрузка данных сессии
  curLang = JSON.parse(localStorage.getItem('curLang'));
  tempUnit = JSON.parse(localStorage.getItem('tempUnit'));
  if (curLang === null) curLang = 'en';
  if (tempUnit === null) tempUnit = 'metric';
  document.getElementById('languageSelect').value = curLang;

  // получение данных о текущем местоположении
  const response = await fetch(IPINFO_URL + IPINFO_TOKEN);
  usrLocation = await response.json();
  map = new Map({
    layers: [
      new Tile({
        source: new OSM(),
      }),
    ],
    target: 'map',
    view: new View({
      center: [0, 0],
      zoom: 12,
    }),
  });
  // console.log(usrLocation);

  // загрузка данных для текущего города
  refreshTown(usrLocation.city).catch(() => {
    usrLocation.city = 'Minsk';
    refreshTown(usrLocation.city);
  }).then(() => {
    changeBG();
    // TODO: uncomment the line up
  });
}());


// обработчик кнопки поиска города
btnSearchForTown.addEventListener('click', () => {
  // загрузка данных для выбранного города
  if (searchTownField.value.length > 1) {
    refreshTown(searchTownField.value).catch(() => {
      // console.log('there is no such town');
    }).then(() => {
      // изменение центра карты
      map.getView().setCenter(proj.transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857'));
      map.getView().setZoom(12);
    });
  }
});


// обработчик кнопки смены фона
btnChangeBg.addEventListener('click', () => {
  // смена фона
  changeBG();
});


// обработчик кнопки смены единиц измерения температуры
btnSwitchUnit.addEventListener('click', () => {
  // смена единиц измерения
  if (tempUnit === 'metric') tempUnit = 'imperial';
  else tempUnit = 'metric';
  refreshText(Object.prototype.hasOwnProperty.call(usrTown.results[0].components, 'city')
    ? usrTown.results[0].components.city : usrTown.results[0].components.state);
});


// обработчик кнопки голосового поиска
btnVoiceSearch.addEventListener('click', () => {
  // voice search
  window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;

  const recognition = new window.SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  recognition.start();

  recognition.onresult = (event) => {
    // console.log(recognizedText);
    searchTownField.value = event.results[0][0].transcript;
  };
});


// обработчик кнопки выбора языка
languageSelect.addEventListener('change', () => {
  refreshTown(Object.prototype.hasOwnProperty.call(usrTown.results[0].components, 'city')
    ? usrTown.results[0].components.city : usrTown.results[0].components.state, false);
});


// вызывается перед уходом со страницы
window.onbeforeunload = () => {
  localStorage.setItem('curLang', JSON.stringify(curLang));
  localStorage.setItem('tempUnit', JSON.stringify(tempUnit));
};


// вызывается каждую минуту
setInterval(() => {
  curTime = new Date();
  const utc = curTime.getTime() + (curTime.getTimezoneOffset() * 60000);
  townTime = new Date(utc + ((3600000 * curWeather.timezone) / 3600));

  refreshDatetimeText();
}, 60 * 1000);
