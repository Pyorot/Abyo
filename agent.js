if (process.env.LOCATE == 'true') {const locate = require('./locate.js')}
const post = require('./post.js')

class Agent {
    constructor(filetitle) {
        let input = require('./agents/'+filetitle+'.js')
        this.channels = input.channels
        this.filter = input.filter
        this.name = filetitle
        this.sendQueue = []
        this.sending = false
    }
}
Agent.prototype.test = function(pokemon) {
    let destination = this.filter(pokemon)
    if (destination) {
        // compute Pokemon location with locate.js if not previously computed for different destination
        if (process.env.LOCATE == 'true' && !pokemon.location) {pokemon.location = locate.g(pokemon.center.lat, pokemon.center.lng)}
        // add [channel, pokemon] to send queue for selected channel
        let channel = this.channels[destination]
        if (channel) {
            this.sendQueue.push([channel, pokemon])
        } else {
            console.error('ERROR agent', this.name, ': no channel registered as:', destination)
        }
        // signal that sending should be happening
        if (!this.sending) {this.send()}
    }
}
Agent.prototype.send = async function() {
    this.sending = Boolean(this.sendQueue.length)   // signify sending iff queue is non-empty
    if (this.sending) {
        let item = this.sendQueue.pop()
        item.push(0)                                // item = [channel, pokemon, failed_attempts]
        let timeout = 1.2
        try {
            if (process.env.POST == 'true') {
                await post.post(...item)                            // real posting mode
            } else {
                console.log('TEST agent:', item[0], item[1].sig)    // test posting mode
            }
        } catch (err) {
            if (err == 'expired') {                 // exception: expired Pokemon
                console.log('ERROR agent', this.name, ': tried to send expired', item[0], item[1].sig)
            } else {                                // exception: Discord POST request failed
                item[2]++
                if (item[2] < 3) {                  // retry send
                    console.log('ERROR agent', this.name, ': failed to send, attempt', item[2])
                    timeout = 5
                    this.sendQueue.push(item)
                } else {                            // abort send
                    console.log('ERROR agent', this.name, ': failed to deliver', item[0], item[1].sig)
                }
            }
        }
        setTimeout(()=>{this.send.call(this)}, timeout*1000)
    }
}

module.exports = Agent