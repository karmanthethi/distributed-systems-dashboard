const fs = require('fs');
const path = require('path');

const USER_APIS_FILE = path.join(__dirname, 'data/user-apis.json');
const userId = 'user_mkz066qgyfbsg00o8';

const demoApis = [
    {
        name: 'Open-Meteo Weather (NYC)',
        url: 'https://api.open-meteo.com/v1/forecast?latitude=40.71&longitude=-74.01&current_weather=true',
        method: 'GET',
        region: 'EU-West',
        headers: {},
        description: 'Real-time weather data for New York City'
    },
    {
        name: 'CoinGecko Bitcoin Price',
        url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd,eur',
        method: 'GET',
        region: 'US-East',
        headers: {},
        description: 'Live Bitcoin & Ethereum prices in USD/EUR'
    },
    {
        name: 'NASA Astronomy Picture',
        url: 'https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY',
        method: 'GET',
        region: 'US-East',
        headers: {},
        description: 'NASA Astronomy Picture of the Day'
    },
    {
        name: 'USGS Earthquakes (Last Hour)',
        url: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson',
        method: 'GET',
        region: 'US-West',
        headers: {},
        description: 'Real earthquake data from the last hour'
    },
    {
        name: 'SpaceX Latest Launch',
        url: 'https://api.spacexdata.com/v4/launches/latest',
        method: 'GET',
        region: 'US-Central',
        headers: {},
        description: 'Latest SpaceX rocket launch data'
    },
    {
        name: 'Exchange Rates (EUR base)',
        url: 'https://api.frankfurter.app/latest',
        method: 'GET',
        region: 'EU-Central',
        headers: {},
        description: 'Real currency exchange rates'
    },
    {
        name: 'IP Geolocation',
        url: 'https://ipapi.co/json/',
        method: 'GET',
        region: 'US-West',
        headers: {},
        description: 'Your current IP location data'
    },
    {
        name: 'World Population Clock',
        url: 'https://countrymeters.info/en/World',
        method: 'GET',
        region: 'EU-West',
        headers: {},
        description: 'World population statistics'
    },
    {
        name: 'GitHub API Status',
        url: 'https://www.githubstatus.com/api/v2/status.json',
        method: 'GET',
        region: 'US-East',
        headers: {},
        description: 'GitHub service status check'
    },
    {
        name: 'International Space Station',
        url: 'http://api.open-notify.org/iss-now.json',
        method: 'GET',
        region: 'US-Central',
        headers: {},
        description: 'Current ISS location in real-time'
    }
];

const newApis = demoApis.map(api => ({
    id: 'api_' + Math.random().toString(36).substr(2, 9),
    ...api,
    createdAt: new Date().toISOString(),
    isActive: true,
    isDemo: true
}));

const data = {
    userApis: {
        [userId]: newApis
    }
};

fs.writeFileSync(USER_APIS_FILE, JSON.stringify(data, null, 2));
console.log('Reset user APIs for', userId);
