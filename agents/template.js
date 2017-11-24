var channels = {
    // identifier: DiscordChannelID
    pys1: "293838131407486980"
}

function filter(pokemon) {
    let now = Date.now()/1000   // represents current time at the time of filtering
    // returns identifier for use in channels
    // can filter based on any properties in Pokemon class (see parse.js)
    // no side-effects pls (do not modify the argument!!!)
    // e.g. to post hour-long dratini to pys1:
    if (pokemon.name == "Dratini" && pokemon.despawn - now >= 45*60) {return "pys1"}
}

module.exports.channels = channels
module.exports.filter = filter