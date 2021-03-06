# Abyo/locate.js
This module contains scripts that reverse-geocode locations in London (within M25) using Turf.js with the data stored in ./data/geo/. The pure geographical operations are located at ./geo.js.

## Functions
*Convention: point = [lat, lng].*
 - **gB(point)** – Finds exact borough (exact at boundaries).
  - **gBD(point)** – The above, represented by 3-letter code.
 - **gP(point)** – Finds exact postal district (approximate at boundaries).
 - **gSt(point)** – Finds nearest station marker (within 500m; TFL Tube Map (except Trams) and National Rail).
 - **gSu(point)** – Finds nearest suburb marker (unbounded).
  - ~~**g(point)**~~ – (*This has been moved to `annotate` in agent.js*.) An endpoint: returns `[postal district] [name], [3-letter borough code]`, where `[name]` is `@ [nearest station]` if a station is detected within 500m, else `~ [nearest suburb]`.

## Data
Data comes from these sources.
- **Postal Districts** – https://www.doogal.co.uk/PostcodeDistricts.php
- **Boroughs** – https://data.gov.uk/dataset/local-authority-districts-december-2016-full-extent-boundaries-in-great-britain2
- **Stations** – OpenStreetMap (modified)
- **Suburbs** – OpenStreetMap (modified)

I processed the data as follows (the format is GeoJSON). I made up the borough codes myself.
- **Postcodes.json** contains polygons all postal districts in the areas [London postal area], WD, HA, EN, IG, RM, DA, BR, CR,SM, KT, TW, UB, modified by me to ensure Thames boundaries are on the Thames.
- **Boroughs.json** contains all local authority districts in the ceremonial counties Greater London, Buckinghamshire, Hertfordshire, Essex, Kent, Surrey, Berkshire.
- **Stations.json** contains all rail stations (except tram) within the M25; some may be missing (let me know).
- **Suburbs.json** contains place=suburb/town nodes from OSM, heavily modified by me to improve usefulness and accuracy.

The polygons in the polygon collections, Postcodes and Boroughs, have all been annotated with bounding boxes, at `Feature.properties.bbox` (computed using turf-bbox).

## Dependencies
- **turf-inside** – Turf.js library to solve point-in-polygon via ray-casting.
- **turf-distance** – Turf.js library to find spherical distance between two points via Haversine formula.