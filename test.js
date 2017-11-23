// .load test.js in Node REPL, on top of whatever's being tested
require('dotenv').load()

_rP = {         // a non-expired raw Pokemon
    "pokemon_id": "129",
    "lat": "51.42167132",
    "lng": "0.163",
    "despawn": "1520352863",
    "disguise": "0",
    "attack": "14",
    "defence": "9",
    "stamina": "4",
    "move1": "231",
    "move2": "133",
    "costume": "0",
    "gender": "1",
    "shiny": "0",
    "form": "0",
    "cp": "117",
    "level": "22"
}

_P = {          // Pokemon(_rP)
    id: '129',
    name: 'Magikarp',
    center: { lat: 51.42167132, lng: 0.163 },
    despawn: 1520352863,
    sig: '1520352863/51.42167132/0.163',
    cp: 117,
    attack: 14,
    defence: 9,
    stamina: 4,
    levelAlt: 22,
    level: 22,
    iv: 27,
    ivPercent: 60,
    move1: 'Splash',
    move2: 'Struggle',
    gender: 'M',
    form: 0,
    letter: ''
}
  
async function _fetch(since, bounds, pokemon) {    // fetch and save raw to lpm.json
    let response
    try {
        response = await fetch(since,bounds,pokemon)
        console.log('Fetched.')
        pokemons = response.pokemons
        fs.writeFileSync('./scrap/lpm.json', JSON.stringify(response, null, 4))
        console.log('Written.')
    } catch (err) {
        console.error(err)
    }
}

async function _run() {    // read raw from lpm.json and run procedure
    let now = String(Date.now())
    console.log(now, 'Start.')
    let data
    try {data = JSON.parse(fs.readFileSync('./scrap/lpm.json'))} catch (error) {console.error(error); return}
    console.log(now, 'Read', 'length='+data.pokemons.length, 'since='+data.meta.inserted, 'time='+data.meta.time)
    data.pokemons.forEach(rawPokemon => {
        let pokemon = new Pokemon(rawPokemon)
        agents.forEach(agent => {
            agent.test(pokemon)
        })
    })
    console.log(now, 'Resolved.')
}


/* agent.js
const test = new Agent('test')
test.channels[3]='123' // fake channel ID
test.test(b)
*/