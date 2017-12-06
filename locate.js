const geo = require('./geo.js')

var postcodes = require('./data/geo/Postcodes.json').features    // Doogal postcode polygons
var boroughs = require('./data/geo/Boroughs.json').features      // Data.gov borough polygons
var suburbs = require('./data/geo/Suburbs.json').features        // OSM suburb/town nodes (modified)
var stations = require('./data/geo/Stations.json').features      // OSM railway station nodes (expanded)
var boroughDict = require('./data/geo/boroughDict.json')         // Three-letter codes for boroughs
console.log("Loaded geographical data.") // ~ 13MB

module.exports = {gB: gB, gBD: gBD, gP: gP, gSt: gSt, gSu: gSu}

function gP(point) {return geo.partition(point, postcodes)}
function gB(point) {return geo.partition(point, boroughs)}
function gBD(point) {return boroughDict[gB(point)]}
function gSu(point) {return geo.closestPoint(point, suburbs)}
function gSt(point) {return geo.closestPoint(point, stations, 0.5)}