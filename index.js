require('dotenv').config();

const { readInput, inquirerMenu, pause, listPlaces } = require('./helpers/inquirer');
const SearchEngine = require('./models/SearchEngine');

async function main() {
    const searchEngine = new SearchEngine();
    let option;

    do {
        option = await inquirerMenu();
        
        switch(option) {
            case 1:
                //Show message
                const placeToSearch = await readInput('Ciudad: ');
                
                //Search places
                const places = await searchEngine.findPlaces(placeToSearch);
                
                //Select place
                const idSelected = await listPlaces(places);
                if (idSelected === '0') continue;
                const placeSelected = places.find(p => p.id === idSelected);
                
                //Save
                searchEngine.addToHistory(placeSelected.name);

                //Climate
                const weather = await searchEngine.getClimate(placeSelected.lat, placeSelected.lng);

                //Show results
                console.log('\nInformacion de la ciudad\n'.green);
                console.log('Ciudad:', placeSelected.name.green);
                console.log('Lat:', placeSelected.lat);
                console.log('Lng:', placeSelected.lng);
                console.log('Temperatura:', weather.temp);
                console.log('Minima:', weather.tempMin);
                console.log('Maxima:', weather.tempMax);
                console.log('Clima actual:', weather.desc.green);
                break;
            
            case 2:
                searchEngine.historyLabels.forEach((place, i) => {
                    const idx = `${i + 1}.`.green;
                    console.log(`${idx} ${place}`);
                });
                break;
        }

        if(option !== 0) await pause();
    } while(option !== 0)
}

main();