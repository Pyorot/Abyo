if (process.env.LOCATE == 'true') {var locate = require('./locate.js')}
var post = require('./post.js')

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
    let destinations = this.filter(pokemon)
    if (destinations) {
        if (!pokemon.annotated) {annotate(pokemon)}
        // add [channel, pokemon] to send queue for selected channels
        if (typeof destinations == 'string') {destinations = [destinations]}
        for (destination of destinations) {
            let channel = this.channels[destination]
            if (channel) {
                this.sendQueue.push([channel, pokemon])
            } else {
                console.error('ERROR agent', this.name, ': no channel registered as:', destination)
            }
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

function annotate(pokemon) {        // post-process any Pokemon that will be sent
    if (process.env.LOCATE == 'true') {
        // pokemon.location.postcode is pre-processed
        pokemon.location.borough = locate.gBD(pokemon.point)
        let station = locate.gSt(pokemon.point)
        pokemon.location.name = station ? "@ " + station : "~ " + locate.gSu(pokemon.point)
        pokemon.locationText = pokemon.location.postcode
                             + " "
                             + pokemon.location.name
                             + ", "
                             + pokemon.location.borough
    } else {
        pokemon.locationText = "#LOCATION"
    }
    pokemon.text = tell(pokemon)
    pokemon.annotated = true
}

function tell(pokemon) {        // notification content
    let letterText = pokemon.letter? ' ' + pokemon.letter  : ''
    let ivText = (pokemon.iv >= 0)? ' ' + pokemon.ivPercent + '%' : ''
    let levelText = (pokemon.level >= 0)? ' L' + pokemon.level : ''

    let despawnText = new Date(pokemon.despawn *1000).toTimeString().slice(0,8)

    let cpText = (pokemon.cp >= 0)? pokemon.cp + 'CP | ' : ''
    let adsText = (pokemon.iv >= 0)? pokemon.attack + '/' + pokemon.defence + '/' + pokemon.stamina + ' | ' : ''
    let movesText = (pokemon.move1 && pokemon.move2)? pokemon.move1 + '/' + pokemon.move2 + ' | ' : ''
    let genderText = pokemon.gender? pokemon.gender : ''

    let url = 'http://www.google.com/maps/place/' + pokemon.point[0] + ',' + pokemon.point[1]
    
    return pokemon.name + letterText + ivText + levelText
         + '\n| ' + pokemon.locationText
         + '\n| #TIME (until ' + despawnText + ')'
         + '\n| ' + cpText + adsText + movesText + genderText
         + '\n| ' + url
}

module.exports = Agent