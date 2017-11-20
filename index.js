const fs = require('fs')
const dotenv = require('dotenv'); dotenv.load() // loads env variables from .env into process.env
const fetch = require('./fetch.js')
const Pokemon = require('./parse.js')
const Agent = require('./agent.js')
const post = require('./post.js')

// Load (build an agent for each script in ./agents/)
agents = []; agentsDict = {}
function load() {
    delete agents; delete agentsDict
    agents = []; agentsDict = {}
    fs.readdirSync('./agents/').forEach((filename) => {
        filetitle = filename.slice(0,-3)
        if (filetitle == 'template') {return}
        let agent = new Agent(filetitle)
        agents.push(agent); agentsDict[filetitle] = agent
        console.log('Loaded agent:', agent.name)
    })
}

// Run one chain of fetch > parse > filter + send
async function run(since, bounds, pokemon) {
    let now = String(Math.floor(Date.now()/1000))
    console.log(now, 'Start.')
    let data
    try {data = await fetch(since,bounds,pokemon)} catch (error) {return}
    console.log(now, 'Fetched.')
    data.pokemons.forEach(rawPokemon => {
        let pokemon = new Pokemon(rawPokemon)
        agents.forEach(agent => {
            agent.test(pokemon)
        })
    })
    console.log(now, 'Resolved.')
}

// UNDER CONSTRUCTION: logic for fetching loop, to get data asap after each update on the source.
var inserted = 0
var cache = {}      // to deal with same data appearing in two consecutive fetches sometimes
async function go() {
    let now = String(Math.floor(Date.now()/1000))
    console.log(now, 'Start.')
    let data
    let timeout
    try {
        data = await fetch(inserted)
    } catch (error) {
        console.log(now, 'Failed fetch; retrying in 10s...')
        timeout = 10
    }
    if (data.meta.inserted > inserted) {
        console.log(now, 'New data; resolving...')
        data.pokemons.forEach(rawPokemon => {
            let pokemon = new Pokemon(rawPokemon)
            agents.forEach(agent => {
                agent.test(pokemon)
            })
        })
        console.log(now, 'Resolved.')
        timeout = (inserted + 3) - (Date.now()/1000)
    } else {
        console.log(now, 'Old data; retrying in 2s...')
        timeout = 2
    }
    inserted = data.meta.inserted
    setTimeout(go, timeout)     // cannot stop this from REPL; use generator instead?
}

// Other TODOs:
// #3: some sort of REPL-esque interface for monitoring and controlling.