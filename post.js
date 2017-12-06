const request = require('superagent')

module.exports.post = post
module.exports.discord = discord

function post(channel, pokemon) {       // constructs full notification, then sends message
    let embed = {
        image: {
            url: 'https://maps.googleapis.com/maps/api/staticmap?markers='
               + pokemon.point[0]
               + ','
               + pokemon.point[1]
               + '&zoom=15&size=400x400&sensor=false&key='
               + process.env.KEY_GOOGLE
        },
        footer: {}
    }

    let now = Date.now()/1000                                                   // calculate time remaining just before sending
    if (pokemon.despawn - now <= 2*60) {return Promise.reject('expired')}       // throw expired Pokemon exception
    let timeRemaining = new Date((pokemon.despawn - now) *1000).toTimeString().slice(3,8)
    embed.footer.text = 'sent at ' + new Date(now *1000).toTimeString().slice(0,8)

    return discord(channel, {content: pokemon.text.replace("#TIME", timeRemaining), embed: embed})
}

function discord(channel, message) {    // Discord send-message wrapper
    return new Promise((resolve,reject) => {
        request
            .post('https://discordapp.com/api/channels/'+channel+'/messages')
            .set('Authorization', 'Bot ' + process.env.KEY_BOT)
            .set('User-Agent', 'Abyo')
            .type('application/json')
            .send(JSON.stringify(message))
            .then(() => {
                console.log('Sent', channel, message.content.slice(0,30).replace(/\n/g," "))
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