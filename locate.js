const turfInside = require("turf-inside") // Point in polygon
const turfDistance = require("turf-distance") // Geodesic distance
module.exports.g = g // Formatted endpoint
module.exports.gB = gB // Finds exact borough (exact at boundaries)
module.exports.gP = gP // Finds exact postal district (approximate at boundaries)
module.exports.gSt = gSt // Finds nearest station marker (within 500m)
module.exports.gSu = gSu // Finds nearest suburb marker (unbounded)

const postcodes = require('./data/geo/Postcodes.json') // Doogal postcode polygons
const boroughs = require('./data/geo/Boroughs.json') // Data.gov borough polygons
const suburbs = require('./data/geo/Suburbs.json').features // OSM suburb/town nodes (modified)
const stations = require('./data/geo/Stations.json').features // OSM railway station nodes (expanded)
const boroughDict = require('./data/geo/boroughDict.json') // Three-letter codes for boroughs
console.log("Loaded geographical data.") // ~ 13MB

// wrapper for turf-inside (point in polygon algorithm)
function inside(lat, lng, polygon) {
    let point = {"type": "Point", "coordinates": [lng,lat]}
    if (polygon.geometry.type == "Polygon") {
        return turfInside(point, polygon)
    } else if (polygon.geometry.type == "GeometryCollection") {
        // would need to adapt imported module to fix
        return polygon.properties.name + " is not a polygon."
    }
}

// wrapper for turf-distance (spherical distance between points)
function distance(lat1, lng1, lat2, lng2) {
    let point1 = {"type": "Point", "coordinates": [lng1,lat1]}
    let point2 = {"type": "Point", "coordinates": [lng2,lat2]}
    return turfDistance(point1, point2, "kilometres")
}

// finds postcode from co-ords (London + HP)
function gP(lat, lng) {
    for (j=0; j<postcodes.length; j++) {
        let postcode = postcodes[j]
        let test = inside(lat, lng, postcode)
        if (typeof test == 'string') {continue}
        if (test) {
            return postcode.properties.name
        }
    }
    return "(not found)"
}

// finds borough from co-ords (London + HC)
function gB(lat, lng) {
    for (j=0; j<boroughs.length; j++) {
        let borough = boroughs[j]
        let test = inside(lat, lng, borough)
        if (typeof test == 'string') {continue}
        if (test) {
            return borough.properties.lad16nm
        }
    }
    return "(not found)"
}

// finds suburb from co-ords (M25)
function gSu(lat, lng) {
    let closestDistance = 10000 // infinity
    let closestName = ""
    for (j=0; j<suburbs.length; j++) {
        let suburb = suburbs[j]
        let test = distance(lat, lng, suburb.geometry.coordinates[1], suburb.geometry.coordinates[0])
        if (test < closestDistance) {
            closestDistance = test
            closestName = suburb.properties.name
        }
    }
    return closestName
}

// finds station from co-ords (M25)
function gSt(lat, lng) {
    let closestDistance = 0.5 // will only return stations within 0.5km
    let closestName = "(none found)"
    for (j=0; j<stations.length; j++) {
        let station = stations[j]
        let test = distance(lat, lng, station.geometry.coordinates[1], station.geometry.coordinates[0])
        if (test < closestDistance) {
            closestDistance = test
            closestName = station.properties.name
        }
    }
    return closestName
}

// endpoint
function g(lat, lng) {
    let name = gSt(lat, lng)
    if (name == "(none found)") {
        name = "~ " + gSu(lat, lng)
    } else {
        name = "@ " + name
    }
    return gP(lat, lng) + " " + name + ", " + boroughDict[gB(lat, lng)]
}