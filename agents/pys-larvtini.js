var channels = {
    "Larvitar": "345497021182115840",
    "Dratini":  "411697059779969034"
}

function filter(pokemon) {
    if (["Larvitar","Dratini"].includes(pokemon.fam)) {
        if (pokemon.ivPercent >= 91 && (pokemon.ivPercent >= 96 || pokemon.attack == 15 || pokemon.level >= 28)) {return pokemon.fam}
        if (["Tyranitar","Dragonite"].includes(pokemon.name) && pokemon.level >= 25 && (pokemon.ivPercent >= 82 || pokemon.attack >= 14)) {return pokemon.fam}
    }
}

module.exports.channels = channels
module.exports.filter = filter