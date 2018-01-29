// **Conventions**:
// endpoints: point = [lat,lng]; polygon as per GeoJSON; distance in km
// GeoJSON/Turf.js: point = [lng,lat]; bbox = [minX,minY,maxX,maxY]

var error = require('./error.js')
const turfInside = require("turf-inside")       // Point in polygon
const turfDistance = require("turf-distance")   // Geodesic distance

module.exports.flip = flip
module.exports.distance = distance
module.exports.inside = inside
module.exports.partition = partition
module.exports.closestPoint = closestPoint

// flips co-ordinate convention
function flip(point) {return [point[1], point[0]]}

// wrapper for turf-distance (spherical distance between points)
function distance(point1, point2) {
    return turfDistance(flip(point1), flip(point2), "kilometres")
}

// wrapper for turf-inside (point in polygon algorithm) with bounding box optimisation
function inside(point, polygon) {
    // assert Polygon (rather than GeometryCollection)
    if (polygon.geometry.type != "Polygon") {throw "not polygon"}
    // bounding box test
    let bbox = polygon.properties.bbox
    if (bbox) {
        if ( !(
            bbox[1] <= point[0]
         && point[0] <= bbox[3]
         && bbox[0] <= point[1]
         && point[1] <= bbox[2]
        )) {
            return false
        }
    } else {
        error('x WARNING geo:', polygon.properties.name, 'has no bbox.')
    }
    // point-in-polygon test
    return turfInside(flip(point), polygon)
}

// point location (in polygon partition)
function partition(point, polygonArray) {
    for (let i=0; i<polygonArray.length; i++) {
        let polygon = polygonArray[i]
        if (inside(point, polygon)) {
            return polygon.properties.name
        }
    }
}

// naive closest point
function closestPoint(point, pointArray, distanceCap) {
    let closestDistance = distanceCap ? distanceCap : 10000
    let closestName
    for (let i=0; i<pointArray.length; i++) {
        let testPoint = pointArray[i]
        let testDistance = distance(point, flip(testPoint.geometry.coordinates))
        if (testDistance < closestDistance) {
            closestDistance = testDistance
            closestName = testPoint.properties.name
        }
    }
    return closestName
}