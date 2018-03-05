var channels = {
    common: "399062014888247307",
    other:  "379656103119814656"
}

function filter(pokemon) {
    let now = Date.now()/1000
    if (pokemon.ivPercent >= 96 && pokemon.despawn - now >= 45*60) {
        if (common.includes(pokemon.name)) {return "common"} else {return "other"}
    }
}

const common = ["Machop", "Geodude", "Abra", "Mudkip", "Aron"]

module.exports.channels = channels
module.exports.filter = filter