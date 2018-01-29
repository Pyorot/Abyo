const request = require('superagent')
const error = require('./error.js')

module.exports.post = post
module.exports.discord = discord

function post(pokemon, channel) {       // constructs full notification, then sends message
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
            .timeout({
                response: 5*1000,       // to start receiving
                deadline: 10*1000,      // to finish receiving
            })
            .set('Authorization', 'Bot ' + process.env.KEY_BOT)
            .set('User-Agent', 'Abyo')
            .type('application/json')
            .send(JSON.stringify(message))
            .then(resolve)
            .catch(error => {
                if (error.response) {   // for HTTP errors (rather than manual rejections)
                    let logTitle = message.content.slice(0,30).replace(/\n/g," ")
                    error('x ERROR Discord:', '(http) failed to post:', channel, logTitle,
                                '\n      - status:', error.response.status,
                                '\n      - discord code:', JSON.parse(error.response.text).code,
                                '\n      - discord message:', JSON.parse(error.response.text).message)
                }
                reject('http')
            })
        setTimeout(() => reject('timeout'), 10*1000)    // manual rejection after 10s (to prevent hanging awaiting reply)
    })
}