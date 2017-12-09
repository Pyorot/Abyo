const fs = require('fs')
const dotenv = require('dotenv'); dotenv.load() // loads env variables from .env into process.env
var fetch = require('./fetch.js')
var Pokemon = require('./parse.js')
var Agent = require('./agent.js')
var post = require('./post.js')

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

// Run one instance of process = fetch > parse > filter + send
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

// Run loop of process
inserted = 2000000000   // a timecode representing when the data was updated
cache = {}              // to deal with same data appearing in two consecutive fetches sometimes
pending = undefined     // represents the pending loop iteration
async function go() {
    stop()              // clean exit of previous iteration
    let now = Date.now()/1000; let nowString = String(Math.floor(now))
    console.log(nowString, 'Start.')

    // fetch data
    let data
    try {
        data = await fetch(inserted)
    } catch (error) {
        console.log(nowString, 'Failed to fetch; retrying in 10s...')
        pending = setTimeout(go, 10*1000); return
    }

    // calculate when to continue
    let newInserted = parseInt(data.meta.inserted)
    let Case =
        newInserted > inserted      ? 'new data'
      :(newInserted === inserted    ? 'old data'
      :                               'first run')
    inserted = newInserted
    let delay = now - inserted
    let callAt =
        Case == 'new data'          ? inserted + 30 + Math.max(3, delay - 1)
      :                               (delay < 33? inserted + 33 : now + 2)
    console.log(nowString, 'Fetched |', Case, '| delay='+String(delay.toFixed(2)), '| next='+String(callAt.toFixed(2)))

    // resolve new data
    if (Case == 'new data') {
        let newCache = {}
        console.log(nowString, 'Resolving new data...')
        let foundCounter = 0; let cacheCounter = 0
        data.pokemons.forEach(rawPokemon => {
            let sig = rawPokemon.despawn + '/' + rawPokemon.lat + '/' + rawPokemon.lng
            if (!cache[sig]) {
                let pokemon = new Pokemon(rawPokemon)
                agents.forEach(agent => {
                    agent.test(pokemon)
                })
                newCache[sig] = true
                foundCounter++
            } else {
                cacheCounter++
            }
        })
        console.log(nowString, 'Resolved;', "found="+String(foundCounter), "; cached="+String(cacheCounter))
        cache = newCache // replaces global variable "cache"
    }

    // continue
    pending = setTimeout(go, (callAt - now)*1000)
}

// Stop process loop
function stop() {clearTimeout(pending)}