// .load test.js in Node REPL, on top of whatever's being tested
require('dotenv').load()
require('./date.js')

_rP = {         // a non-expired raw Pokemon
    "pokemon_id": "193",
    "lat": "51.64146084",
    "lng": "-0.28978798",
    "despawn": "1512513386",
    "disguise": "0",
    "attack": "-1",
    "defence": "-1",
    "stamina": "-1",
    "move1": "-1",
    "move2": "-1",
    "costume": "0",
    "gender": "2",
    "shiny": "0",
    "form": "0",
    "cp": "-1",
    "level": "-1"
}

_P = {          // Pokemon(_rP)
    id: '149',
    name: 'Dragonite',
    point: [ 51.475071, -0.279798 ],
    despawn: 1512513386,
    sig: '1512513386/51.64146084/-0.28978798',
    cp: -1,
    attack: -1,
    defence: -1,
    stamina: -1,
    levelAlt: -1,
    level: -1,
    iv: -3,
    ivPercent: 93,
    move1: '',
    move2: '',
    gender: 'F',
    form: 0,
    letter: '',
    annotated: false,
    location: {postcode: "W10"}
}

_PLong = {          // Pokemon with longest possible info
    id: '129',
    name: 'Charmander',
    center: { lat: 51.42167132, lng: 0.16345678 },
    despawn: 1520352863,
    sig: '1520352863/51.42167132/0.16345678',
    cp: 3000,
    attack: 10,
    defence: 10,
    stamina: 10,
    levelAlt: 30,
    level: 30,
    iv: 27,
    ivPercent: 120,
    move1: 'Zen Headbutt',
    move2: 'Dragon Pulse',
    gender: 'M',
    form: 0,
    letter: '',
    location: 'SW00 ~ SomeLongishPlaceName, YYY'
}

var pys = {
    "1": "293838131407486980",
    "2": "296066428694429697",
    "3": "296965358533869568",
    "4": "296986176567640064"
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

function _run() {    // read raw from lpm.json and run procedure
    let now = String(new Date.number())
    console.log(now, 'Start.')
    let data
    try {data = JSON.parse(fs.readFileSync('./scrap/lpm.json'))} catch (err) {console.error(err); return}
    console.log(now, 'Read', 'length='+data.pokemons.length, 'since='+data.meta.inserted, 'time='+data.meta.time)
    data.pokemons.forEach(rawPokemon => {
        let pokemon = new Pokemon(rawPokemon)
        agents.forEach(agent => {
            agent.test(pokemon)
        })
    })
    console.log(now, 'Resolved.')
}