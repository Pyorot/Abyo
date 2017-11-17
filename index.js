const fetch = require('./fetch.js')
const Pokemon = require('./parse.js')
const Agent = require('./agent.js')
const post = require('./post.js')
const fs = require('fs')

// Load (build an agent for each script in ./agents/)
agents = []; agentsDict = {}
function load() {
    delete agents; delete agentsDict
    agents = []; agentsDict = {}
    fs.readdirSync('./agents/').forEach((filename) => {
        filetitle = filename.slice(0,-3)
        let agent = new Agent(filetitle)
        agents.push(agent); agentsDict[filetitle] = agent
        console.log('Loaded agent:', agent.name)
    })
}

// Run one chain of fetch > parse > filter + send
// TODO #1: logic for fetching loop, to get data asap after each update on the source.
async function run(since, bounds, pokemon) {
    let now = String(Date.now())
    console.log(now, 'Start.')
    let data
    try {data = await fetch(since,bounds,pokemon)} catch (error) {return}
    console.log(now, 'Fetched.', 'Length='+data.pokemons.length, 'Since='+data.meta.inserted, 'Time='+data.meta.time)
    let pokemons = data.pokemons.map(rawPokemon => {return new Pokemon(rawPokemon)})
    console.log(now, 'Parsed.', 'Pokemon='+pokemons.length, 'Agents='+agents.length)
    pokemons.forEach(pokemon => {
        agents.forEach(agent => {
            agent.test(pokemon)
        })
    })
    // TODO #2: ensure that each agent.test is synchronous (but agent.send is async).
    // If true, we can tail-recurse with delay determined by fetching loop logic,
    // without risking a cascade of blocking operations and hence uncontrollable delays.
    console.log(now, 'Filters launched.')
}

// Other TODOs:
// #3: some sort of REPL-esque interface for monitoring and controlling.
// #4: make it possible to reload individual agents; ensure that reloading doesn't kill send queue.
// #5: introduce permanent testing infrastructure.

/* TESTS
// fetch and save raw to ./result.json
async function fetcher(since,bounds,pokemon) {
    let response
    try {
        response = await fetch(since,bounds,pokemon)
        pokemons = response.pokemons
        console.log('Fetched '+pokemons.length+' Pokemon.')
        fs.writeFileSync('./result.json',JSON.stringify(response,null,4))
        console.log('Written.')
    } catch (err) {
        console.error(err)
    }
}

a = {
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

b = new Pokemon(a)
*/