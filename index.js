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
            try {agent.test(pokemon)} catch (error) {
                console.error(error)
                console.error("ERROR agent", agent.name, ": failed to process", sig)
            }
        })
    })
    console.log(now, 'Resolved.')
}

// Run loop of process
inserted = 0            // a timecode representing when the data was updated
cache = {}              // to deal with same data appearing in two consecutive fetches sometimes
pending = undefined     // represents the pending loop iteration
retryTime = 2
oldFetches = 0
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
        inserted == 0               ? 'first run'
      :(newInserted > inserted      ? 'new data'
      :                               'old data')
    if (newInserted > inserted) {inserted = newInserted}
    let delay = now - inserted
    let callAt =
        Case == 'new data'          ? inserted + 30 + Math.max(2.5, delay - 1)
                                    : (delay < 33 ? inserted + 33 : now + retryTime)
    if (Case != 'new data') {
        oldFetches++
        if (oldFetches > 30) {
            retryTime = 30
        }
    } else {
        retryTime = 2
        oldFetches = 0
    }
    console.log(nowString, 'Fetched |', Case, '| delay='+String(delay.toFixed(2)), '| next='+String(callAt.toFixed(2)))

    // resolve new data
    if (Case == 'new data') {
        let newCache = {}
        console.log(nowString, 'Resolving new data...', 'agents='+String(agents.length))
        let foundCounter = 0; let cacheCounter = 0
        data.pokemons.forEach(rawPokemon => {
            let sig = rawPokemon.despawn + '/' + rawPokemon.lat + '/' + rawPokemon.lng
            if (!cache[sig]) {
                let pokemon = new Pokemon(rawPokemon)
                agents.forEach(agent => {
                    try {agent.test(pokemon)} catch (error) {
                        console.error(error)
                        console.error("ERROR agent", agent.name, ": failed to process", sig)
                    }
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