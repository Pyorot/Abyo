var channels = {
    common: "399062014888247307",
    other: "379656103119814656"
}

function filter(pokemon) {
    let now = Date.now()/1000
    if (pokemon.ivPercent >= 96 && pokemon.despawn - now >= 45*60) {
        if (pokemon.name == "Machop" || pokemon.name == "Geodude" || pokemon.name == "Mudkip") {return "common"} else {return "other"}
    }
}

module.exports.channels = channels
module.exports.filter = filter