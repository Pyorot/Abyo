if (process.env.LOCATE == 'true') {var locate = require('./locate.js')}
var post = require('./post.js')
var error = require('./error.js')

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
    let destinations = this.filter(pokemon)     // a string or list of strings or undefined
    if (destinations && destinations.length) {
        if (!pokemon.annotated) {annotate(pokemon)}
        // add [channel, pokemon] to send queue for selected channels
        if (typeof destinations == 'string') {destinations = [destinations]}
        for (destination of destinations) {
            let channel = this.channels[destination]
            if (channel) {
                this.sendQueue.push([pokemon, channel, destination])
            } else {
                error('x ERROR agent', this.name, ': no channel registered as:', destination)
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
        item.push(0)                                // item = [pokemon, channel, destination, failed_attempts]
        let timeout = 1.2
        try {
            if (process.env.POST == 'true') {       // real posting mode
                await post.post(...item)
                console.log('> Sent >', this.name, item[2], '>', item[0].head)
            } else {                                // test posting mode
                console.log('> Test >', this.name, item[1], item[2], '>', item[0].head)
            }
        } catch (err) {                             // err = 'expired', 'timeout', 'http'
            let postInfo = this.name + '>' + item[2] + '>' + item[0].head
            error('x ERROR agent:', err, ':', postInfo)
            if (err != 'expired') {
                item[3]++
                if (item[3] < 3) {                  // retry send
                    error('.       agent: retrying send in 5s, attempt', item[3]+1, ':', postInfo)
                    timeout = 5
                    this.sendQueue.push(item)
                } else {                            // abort send
                    error('x ERROR agent: delivery failed, aborted :', postInfo)
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
    pokemon.head = pokemon.text.slice(0,40).replace(/\n/g," ")
    pokemon.annotated = true
}

function tell(pokemon) {        // notification content
    let letterText = pokemon.letter? ' ' + pokemon.letter  : ''
    let ivText = (pokemon.iv >= 0)? ' ' + pokemon.ivPercent + '%' : ''
    let levelText = (pokemon.level >= 0)? ' L' + pokemon.level : ''
    let weatherText = (!isNaN(pokemon.weather)) ? 
        (pokemon.weather != 0 ? ' +' : ' –')
        : ''

    let despawnText = new Date(pokemon.despawn *1000).toTimeString().slice(0,8)

    let cpText = (pokemon.cp >= 0)? pokemon.cp + 'CP | ' : ''
    let adsText = (pokemon.iv >= 0)? pokemon.attack + '/' + pokemon.defence + '/' + pokemon.stamina + ' | ' : ''
    let movesText = (pokemon.move1 && pokemon.move2)? pokemon.move1 + '/' + pokemon.move2 + ' | ' : ''
    let genderText = pokemon.gender? pokemon.gender : ''

    let url = 'http://www.google.com/maps/place/' + pokemon.point[0] + ',' + pokemon.point[1]
    
    return pokemon.name + letterText + ivText + levelText + weatherText
         + '\n| ' + pokemon.locationText
         + '\n| #TIME (until ' + despawnText + ')'
         + '\n| ' + cpText + adsText + movesText + genderText
         + '\n| ' + url
}

module.exports = Agent