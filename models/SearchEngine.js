const fs = require('fs');
const axios = require('axios').default;

class SearchEngine {

    history = [];
    dbPath = './db/database.json';

    constructor() {
        this.readDB();
    }

    get historyLabels() {
        return this.history.map(nameCity => {
            let words = nameCity.split(' ');
            let capitalize = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
            return capitalize.join(' ');
        });
    }

    get paramsMapbox() {
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        }
    }


    async findPlaces(place) {
        try {
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${place}.json`,
                params: this.paramsMapbox
            });

            const res = await instance.get();
            return res.data.features.map(placeItem => ({
                id: placeItem.id,
                name: placeItem.place_name,
                lng: placeItem.center[0],
                lat: placeItem.center[1]
            }));
        } catch(error) {
            return [];
        }
    }

    async getClimate(lat, lon) {
        try {
            const instance = axios.create({
                baseURL: 'https://api.openweathermap.org/data/2.5/weather',
                params: {
                    'appid': process.env.OPENWEATHER_KEY,
                    'lat': lat,
                    'lon': lon,
                    'units': 'metric',
                    'lang': 'es'
                }
            });
            const { data } = await instance.get();
            
            return {
                'desc': data.weather[0].description,
                'temp': data.main.temp,
                'tempMin': data.main.temp_min,
                'tempMax': data.main.temp_max
            }

        } catch(error) {
            console.log(error);
        }
    }

    addToHistory(place) {
        // prevent duplicate
        if (this.history.includes(place.toLowerCase())) {
            return;
        }
        this.history.unshift(place.toLowerCase());

        // save
        this.saveDB();
    }

    saveDB() {
        const payload = {
            history: this.history
        }
        fs.writeFileSync(this.dbPath, JSON.stringify(payload))
    }

    readDB() {
        if (fs.existsSync(this.dbPath)) {
            const chunkData = fs.readFileSync(this.dbPath, { encoding: 'utf8' });
            const data = JSON.parse(chunkData);

            this.history = data.history;
        }
    }
}

module.exports = SearchEngine;