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

inserted = 0                    // a timecode representing when the data was updated
cache = {}                      // to deal with same data appearing in two consecutive fetches sometimes
pending = undefined             // represents the pending loop iteration
oldFetches = 0; retryTime = 1.8 // how many times in a row old data was fetched and when to try again for new data

// Run one instance of process = fetch > parse > filter + send.
// Returns timeout in seconds for next intended call of self.
async function run() {
    let startTime = new Date(); let now = startTime.number()
    let sendingStatus = agents.map(agent => agent.sending ? agent.name : '').filter(x => x).join(', ')
    console.log('\n# Start |', startTime.hhmmss(),
                '| from', inserted.date().hhmmss(),
                '| agents', agents.length,
                '| sending:', sendingStatus ? sendingStatus : '[clear]')

    // fetch data
    let data; let newInserted; let spawns; let length
    try {
        data = await fetch(inserted)
        newInserted = parseInt(data.meta.inserted)
        spawns = data.pokemons
        length = spawns.length
    } catch (err) {
        console.log('x ERROR index: failed to fetch; retrying in 10s.')
        return 10
    }

    // calculate when to continue
    let Case =
        inserted == 0               ? 'first run'
      :(newInserted > inserted      ? 'new data'
      :                               'old data')
    if (newInserted > inserted) {inserted = newInserted}
    let delay = now - inserted
    let callAt =
        Case == 'new data'          ? inserted + 30 + Math.max(2, delay - 1.2)
                                    : (delay < 33 ? inserted + 33 : now + retryTime)
    if (Case != 'new data') {
        oldFetches++;   if (oldFetches > 30) {retryTime = 30}
    } else {
        oldFetches = 0; retryTime = 1.8
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
                    try {agent.test(pokemon)} catch (err) {
                        error(JSON.stringify(err, null, 4))
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
    return callAt - now
}

// Process loop
async function go() {stop(); pending = setTimeout(go, await run()*1000)}
function stop() {clearTimeout(pending)}
if (process.env.AUTORUN == 'true') {load(); go()}