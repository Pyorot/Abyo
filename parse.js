const pokedex = require('./data/pokemon/pokedex.json')
const moves = require('./data/pokemon/moves.json')
const stats = require('./data/pokemon/stats.json')
const cpms = require('./data/pokemon/cpms.json')
const genders = {"-1":"", "1":"M", "2":"F", "3":"N"}

module.exports = Pokemon

function findLevel(id, cp, attack, defence, stamina) {
    if (cp < 0) {return -1}
    let stat = stats[pokedex[id]];
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
    for (level=1; level<=30; level++) {
        if (getCp(level) == cp) {return level}
    }
    return -1
}

function Pokemon(rawPokemon) {                          // the Pokemon class returned by this module
    this.id = rawPokemon.pokemon_id
    this.name = pokedex[this.id]                        // text (always known)
    this.center = {lat: parseFloat(rawPokemon.lat), lng: parseFloat(rawPokemon.lng)}
    this.despawn = parseInt(rawPokemon.despawn)
    this.sig = rawPokemon.despawn + '/' + rawPokemon.lat + '/' + rawPokemon.lng         // unique spacetime ID

    this.cp = parseInt(rawPokemon.cp)                   // original (-1 if unknown)
    this.attack = parseInt(rawPokemon.attack)           // original (-1 if unknown)
    this.defence = parseInt(rawPokemon.defence)         // original (-1 if unknown)
    this.stamina = parseInt(rawPokemon.stamina)         // original (-1 if unknown)
    this.levelAlt = parseInt(rawPokemon.level)          // original (-1 if unknown) – buggy
    this.level = findLevel(this.id, this.cp, this.attack, this.defence, this.stamina)   // number (-1 if unknown)
    this.iv = this.attack + this.defence + this.stamina // number (-3 if unknown)
    this.ivPercent = Math.floor((this.iv/45)*100)       // number (-7 if unknown)
    this.move1 = moves[rawPokemon.move1]                // text ("" if unknown)
    this.move2 = moves[rawPokemon.move2]                // text ("" if unknown)
    this.gender = genders[rawPokemon.gender]            // text ("" if unknown)

    this.form = parseInt(rawPokemon.form)               // original (0 if none, -1 if unknown)
    this.letter = (this.id == 201 && this.form >= 1 && this.form <= 26)? String.fromCharCode(this.form + 64) : "" // text ("" if none/unknown)
}

/* TESTS
a = {
    "pokemon_id": "129",
    "lat": "51.42167132",
    "lng": "-0.18233141",
    "despawn": "1510352863",
    "disguise": "0",
    "attack": "14",
    "defence": "9",
    "stamina": "4",
    "move1": "231",
    "move2": "133",
    "costume": "0",
    "gender": "1",
    "shiny": "0",
    "form": "0",
    "cp": "117",
    "level": "22"
}

b = {
    "pokemon_id": "60",
    "lat": "51.48744525",
    "lng": "-0.14950545",
    "despawn": "1510353217",
    "disguise": "0",
    "attack": "-1",
    "defence": "-1",
    "stamina": "-1",
    "move1": "-1",
    "move2": "-1",
    "costume": "0",
    "gender": "2",
    "shiny": "0",
    "form": "0",
    "cp": "-1",
    "level": "-1"
}

A = new Pokemon(a)
B = new Pokemon(b)
*/

 /* M's parsePokemon
 function parsePokemon(pokemon) {
    pokemon.id = parseInt(pokemon.pokemon_id, 10)
    pokemon.despawn = parseInt(pokemon.despawn, 10)
    pokemon.form = parseInt(pokemon.form, 10)
    pokemon.name = dicts.pokeDict[pokemon.pokemon_id].niceName
    pokemon.cp = parseInt(pokemon.cp, 10)
    pokemon.cp = pokemon.cp >= 0 ? pokemon.cp : -1
    pokemon.attack = parseInt(pokemon.attack, 10)
    pokemon.defence = parseInt(pokemon.defence, 10)
    pokemon.stamina = parseInt(pokemon.stamina, 10)
    pokemon.level = getPokemonLevel(pokemon.cp, dicts.pokeDict[pokemon.id].stats, { attack: pokemon.attack, defense: pokemon.defence, stamina: pokemon.stamina })
    pokemon.move1 = parseInt(pokemon.move1, 10)
    pokemon.move1 = pokemon.move1 > 0 ? dicts.movesDict[pokemon.move1] : ''
    pokemon.move2 = parseInt(pokemon.move2, 10)
    pokemon.move2 = pokemon.move2 > 0 ? dicts.movesDict[pokemon.move2] : ''
    pokemon.gender = parseInt(pokemon.gender, 10)
    pokemon.iv = (pokemon.attack + pokemon.defence + pokemon.stamina) >= 0 ? (pokemon.attack + pokemon.defence + pokemon.stamina) : undefined
    pokemon.ivPercent = !isNaN(Math.round(pokemon.iv / 45 * 100)) ? Math.round(pokemon.iv / 45 * 100) + '%' : ''
} */