var {inside} = require('../geo.js')

var channels = {
    y: "387678541388709889"
}

function filter(pokemon) {
    if (pokemon.ivPercent >= 90 && inside(pokemon.point, area)) {
        if (pokemon.name == "Magikarp" && pokemon.ivPercent <= 93 && pokemon.attack != 15) {return}
        return "y"
    }
}

const area = {
    "type": "Feature",
    "properties": {
        "name": "area-hammersmith",
        "bbox": [-0.2463340759277344, 51.48114235839245, -0.1979684829711914, 51.5118674573013]
    },
    "geometry": {
        "type": "Polygon",
        "coordinates": [
        [
            [
            -0.2371501922607422,
            51.48223813101211
            ],
            [
            -0.22590637207030584,
            51.48114235839245
            ],
            [
            -0.21320343017577464,
            51.48215795342048
            ],
            [
            -0.20406246185302074,
            51.49180497821286
            ],
            [
            -0.1979684829711914,
            51.49883185798456
            ],
            [
            -0.20333290100096993,
            51.5078877210284
            ],
            [
            -0.2119159698486262,
            51.5118674573013
            ],
            [
            -0.22659301757811837,
            51.509784148786466
            ],
            [
            -0.24401664733886055,
            51.50786101021456
            ],
            [
            -0.2463340759277344,
            51.48827777095631
            ],
            [
            -0.2371501922607422,
            51.48223813101211
            ]
        ]
        ]
    }
}

module.exports.channels = channels
module.exports.filter = filter