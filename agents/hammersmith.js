var {inside} = require('../geo.js')

var channels = {
    y: "387678541388709889"
}

function filter(pokemon) {
    if (pokemon.ivPercent >= 90 && inside(pokemon.point, area)) {return "y"}
}

area = {
    "type": "Feature",
    "properties": {},
    "geometry": {
      "type": "Polygon",
      "coordinates": [
        [
          [
            -0.22573471069335935,
            51.4810621788744
          ],
          [
            -0.21303176879882815,
            51.48207777568792
          ],
          [
            -0.2048778533935547,
            51.49009485119805
          ],
          [
            -0.2050495147705078,
            51.4964540617562
          ],
          [
            -0.2117443084716797,
            51.51178733181241
          ],
          [
            -0.22642135620117188,
            51.50970401963339
          ],
          [
            -0.24384498596191406,
            51.50778087767913
          ],
          [
            -0.25071144104003906,
            51.482345034248304
          ],
          [
            -0.22573471069335935,
            51.4810621788744
          ]
        ]
      ]
    }
  }

module.exports.channels = channels
module.exports.filter = filter