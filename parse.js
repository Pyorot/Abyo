if (process.env.LOCATE == 'true') {var locate = require('./locate.js')}

var pokedex = require('./data/pokemon/pokedex.json')
var pokefam = require('./data/pokemon/pokefam.json')
var moves = require('./data/pokemon/moves.json')
var stats = require('./data/pokemon/stats.json')
var cpms = require('./data/pokemon/cpms.json')
var genders = {"-1":"", "1":"M", "2":"F", "3":"N"}

module.exports = Pokemon

function findLevel(id, cp, attack, defence, stamina) {
    if (cp < 0) {return -1}
    let stat = stats[pokedex[id]];
    if (!stat) {return -1}
    function getCp(level) {
        let cpm = cpms[level]
        return Math.max(10, Math.floor(0.1
            * (stat.Attack + attack)
            * Math.sqrt(stat.Defense + defence)
            * Math.sqrt(stat.Stamina + stamina)
            * cpm
            * cpm
        ));
    }
    for (level=1; level<=40; level++) {
        if (getCp(level) == cp) {return level}
    }
    return -1
}

function Pokemon(rawPokemon) {                          // the Pokemon class returned by this module
    this.id = parseInt(rawPokemon.pokemon_id)
    this.name = pokedex[this.id]                        // text (always known)
    this.fam = pokefam[this.id]                         // text (always known)
    this.point = [parseFloat(rawPokemon.lat), parseFloat(rawPokemon.lng)]
    this.despawn = parseInt(rawPokemon.despawn)
    this.sig = rawPokemon.despawn + '/' + rawPokemon.lat + '/' + rawPokemon.lng         // unique spacetime ID

    this.cp = parseInt(rawPokemon.cp)                   // original (-1 if unknown)
    this.attack = parseInt(rawPokemon.attack)           // original (-1 if unknown)
    this.defence = parseInt(rawPokemon.defence)         // original (-1 if unknown)
    this.stamina = parseInt(rawPokemon.stamina)         // original (-1 if unknown)
    this.levelAlt = parseInt(rawPokemon.level)          // original (-1 if unknown) – buggy
    this.level = findLevel(this.id, this.cp, this.attack, this.defence, this.stamina)   // number (-1 if unknown)
    this.iv = this.attack + this.defence + this.stamina // number (-3 if unknown)
    this.ivPercent = Math.round((this.iv/45)*100)       // number (-7 if unknown)
    this.move1 = moves[rawPokemon.move1]                // text ("" if unknown)
    this.move2 = moves[rawPokemon.move2]                // text ("" if unknown)
    this.gender = genders[rawPokemon.gender]            // text ("" if unknown)

    this.weather = parseInt(rawPokemon.weather)

    this.form = parseInt(rawPokemon.form)               // original (0 if none, -1 if unknown)
    this.letter = (this.id == 201 && this.form >= 1 && this.form <= 26)? String.fromCharCode(this.form + 64) : "" // text ("" if none/unknown)

    this.location = {}
    if (process.env.LOCATE == 'true') {
        this.location.postcode = locate.gP(this.point)
    }
    this.annotated = false                              // every Pokemon is parsed; those that will be sent out are annotated
}