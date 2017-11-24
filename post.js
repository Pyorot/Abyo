const request = require('superagent')

module.exports.tellHead = tellHead
module.exports.tellBody = tellBody
module.exports.post = post
module.exports.discord = discord

function tellHead(pokemon) {            // provides notification title (except time remaining)
    let letterText = pokemon.letter? ' ' + pokemon.letter  : ''
    let ivText = (pokemon.iv >= 0)? ' ' + pokemon.ivPercent + '%' : ''
    let levelText = (pokemon.level >= 0)? ' L' + pokemon.level : ''
    let locationText = pokemon.location? pokemon.location : '???'
    return pokemon.name
         + letterText
         + ivText
         + levelText
         + '\n'
         + locationText
         + '\n(until '
         + new Date(pokemon.despawn *1000).toTimeString().slice(0,8)
         + ')'
    }

function tellBody(pokemon) {            // provides notification body
    let cpText = (pokemon.cp >= 0)? pokemon.cp + 'CP | ' : ''
    let adsText = (pokemon.iv >= 0)? pokemon.attack + '/' + pokemon.defence + '/' + pokemon.stamina + ' | ' : ''
    let movesText = (pokemon.move1 && pokemon.move2)? pokemon.move1 + '/' + pokemon.move2 + ' | ' : ''
    let genderText = pokemon.gender? pokemon.gender + ' | ' : ''
    return cpText
         + adsText
         + movesText
         + genderText
}

function post(channel, pokemon) {       // constructs full notification, then sends message
    let url = 'http://www.google.com/maps/place/'
            + pokemon.center.lat
            + ','
            + pokemon.center.lng
    let embed = {}
    let content = tellHead(pokemon)
                + '\n'
                + tellBody(pokemon)
                + '\n'
                + url
    embed.image = {}
    embed.image.url = 'https://maps.googleapis.com/maps/api/staticmap?markers='
                    + pokemon.center.lat
                    + ','
                    + pokemon.center.lng
                    + '&zoom=15&size=400x400&sensor=false&key='
                    + process.env.KEY_GOOGLE
    embed.footer = {}

    let now = Date.now()/1000                                           // calculate time remaining just before sending
    if (pokemon.despawn - now <= 2*60) {return Promise.reject('expired')}      // throw expired Pokemon exception
    let slicePoint = content.indexOf('(until')
    content = content.slice(0,slicePoint)
            + new Date((pokemon.despawn - now) *1000).toTimeString().slice(3,8)
            + ' '
            + content.slice(slicePoint)
    embed.footer.text = 'sent at ' + new Date(now *1000).toTimeString().slice(0,8)

    return discord(channel, {content: content, embed: embed})
}

function discord(channel, message) {    // Discord send-message wrapper
    let url = 'https://discordapp.com/api/channels/'+channel+'/messages'
    let logTitle = message.content? message.content : message.embed.title
        let newlineIndex = logTitle.indexOf("\n")
        if (newlineIndex != -1) {logTitle = logTitle.slice(0,newlineIndex)}
    return new Promise((resolve,reject) => {
        request
            .post(url)
            .set('Authorization', 'Bot ' + process.env.KEY_BOT)
            .set('User-Agent', 'Abyo')
            .type('application/json')
            .send(JSON.stringify(message))
            .then(() => {
                console.log('Sent', channel, logTitle)
                resolve()
            })
            .catch(error => {
                console.error('ERROR Discord:', 'Failed to send:', channel, logTitle)
                console.error('    > status:', error.response.status)
                console.error('    > discord code:', JSON.parse(error.response.text).code)
                console.error('    > discord message:', JSON.parse(error.response.text).message)
                reject(error)
            })
    })
}