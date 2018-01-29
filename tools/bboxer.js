// Tool to label polygons with their bounding boxes
// Syntax: node bboxer [area-file] [area-name]

fs = require('fs')
bbox = require('turf-bbox') // external dependency

filename = process.argv[2] ? process.argv[2] : "area.geojson"
nametag = process.argv[3]

try {input = JSON.parse(fs.readFileSync(filename))} catch (err) {console.error("Input file not found."); return}
if (nametag) {input.properties.name = nametag}
input.properties.bbox = bbox(input)

fs.writeFileSync(filename, JSON.stringify(input))
console.log('Bboxed', filename, nametag ? 'and labelled '+nametag : '')