const fs = require('fs')
const dotenv = require('dotenv'); dotenv.load() // loads env variables from .env into process.env
var fetch = require('./fetch.js')
var Pokemon = require('./parse.js')
var Agent = require('./agent.js')
var post = require('./post.js')
var error = require('./error.js')
require('./date.js')

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
    let startTime = new Date(); let now = startTime.number()
    console.log(now, 'Start.')
    let data
    try {data = await fetch(since,bounds,pokemon)} catch (error) {return}
    console.log(now, 'Fetched.')
    data.pokemons.forEach(rawPokemon => {
        let pokemon = new Pokemon(rawPokemon)
        agents.forEach(agent => {
            try {agent.test(pokemon)} catch (error) {
                error(error)
                error("x ERROR agent", agent.name, ": failed to process", sig)
            }
        })
    })
    console.log(now, 'Resolved.')
}

// Run loop of process
inserted = 0            // a timecode representing when the data was updated
cache = {}              // to deal with same data appearing in two consecutive fetches sometimes
pending = undefined     // represents the pending loop iteration
oldFetches = 0; retryTime = 2
async function go() {
    stop()              // clean exit of previous iteration
    let startTime = new Date(); let now = startTime.number()
    let sendingString = ''
    for (agent of agents) {
        if (agent.sending) {sendingString += agent.name + ', '} else
        if (agent.sendQueue.length != 0) {sendingString += agent.name + '*, '}
    }
    if (!sendingString) {sendingString = '[clear]'}
    console.log('\n# Start |', startTime.hhmmss(),
                '| from', inserted.date().hhmmss(),
                '| agents', agents.length,
                '| sending:', sendingString)

    // fetch data
    let data; let newInserted; let spawns; let length
    try {
        data = await fetch(inserted)
        newInserted = parseInt(data.meta.inserted)
        spawns = data.pokemons
        length = spawns.length
    } catch (error) {
        console.log('x ERROR index: failed to fetch; retrying in 10s.')
        pending = setTimeout(go, 10*1000); return
    }

    // calculate when to continue
    let Case =
        inserted == 0               ? 'first run'
      :(newInserted > inserted      ? 'new data'
      :                               'old data')
    if (newInserted > inserted) {inserted = newInserted}
    let delay = startTime.number() - inserted
    let callAt =
        Case == 'new data'          ? inserted + 30 + Math.max(2.5, delay - 1)
                                    : (delay < 33 ? inserted + 33 : now + retryTime)
    if (Case != 'new data') {
        oldFetches++; if (oldFetches > 30) {retryTime = 30}
    } else {
        oldFetches = 0; retryTime = 2
    }
    console.log('- Fetched |', Case,
                '| to', newInserted.date().hhmmss(),
                '| delay', delay.toFixed(3),
                '| length', length,
                '| next', callAt.date().hhmmssmmm())

    // resolve new data
    if (Case == 'new data') {
        let processStartTime = new Date()
        let newCache = {}; let foundCounter = 0; let cacheCounter = 0
        spawns.forEach(rawPokemon => {
            let sig = rawPokemon.despawn + '/' + rawPokemon.lat + '/' + rawPokemon.lng
            if (!cache[sig]) {
                let pokemon = new Pokemon(rawPokemon)
                agents.forEach(agent => {
                    try {agent.test(pokemon)} catch (error) {
                        error(error)
                        error("x ERROR agent", agent.name, ": failed to process", sig)
                    }
                })
                newCache[sig] = true
                foundCounter++
            } else {
                cacheCounter++
            }
        })
        cache = newCache // replaces global variable "cache"
        let processEndTime = new Date()
        console.log('- Resolved',
                    '| found', foundCounter,
                    '| took', (processEndTime.number() - processStartTime.number()).toFixed(3))
    }

    // continue
    pending = setTimeout(go, (callAt - now)*1000)
}

// Stop process loop
function stop() {clearTimeout(pending)}

// Live usage
// load(); go()