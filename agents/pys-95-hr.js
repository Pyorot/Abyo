var channels = {
    y: "379656103119814656"
}

function filter(pokemon) {
    let now = Date.now()/1000
    if (pokemon.ivPercent >= 96 && pokemon.despawn - now >= 45*60) {return "y"}
}

module.exports.channels = channels
module.exports.filter = filter