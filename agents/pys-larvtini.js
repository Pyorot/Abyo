var channels = {
    y: "345497021182115840"
}

function filter(pokemon) {
    switch (pokemon.name) {
        case "Dratini":
        case "Dragonair":
        case "Larvitar":
        case "Pupitar":
            if (pokemon.ivPercent >= 93) {return "y"}
            break
        case "Dragonite":
        case "Tyranitar":
            if (pokemon.ivPercent >= 87) {return "y"}
    }
}

module.exports.channels = channels
module.exports.filter = filter