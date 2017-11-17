# Abyo/locate.js
This module contains scripts that reverse-geocode locations in London (within M25) using Turf.js with the data stored in ./data/.

## Functions
 - **g(lat, lng)** – An endpoint: returns `[postal district] [3-letter borough code] [name]`, where `[name]` is `@ [nearest station]` if a station is detected within 500m, else `~ [nearest suburb]`.
 - **gB(lat, lng)** – Finds exact borough (exact at boundaries).
 - **gP(lat, lng)** – Finds exact postal district (approximate at boundaries).
 - **gSt(lat, lng)** – Finds nearest station marker (within 500m; TFL Tube Map (except Trams) and National Rail).
 - **gSu(lat, lng)** – Finds nearest suburb marker (unbounded).

## Data
Data comes from these sources.
- **Postal Districts** – https://www.doogal.co.uk/PostcodeDistricts.php
- **Boroughs** – https://data.gov.uk/dataset/local-authority-districts-december-2016-full-extent-boundaries-in-great-britain2
- **Stations** – OpenStreetMap (modified)
- **Suburbs** – OpenStreetMap (modified)

I processed the data as follows (the format is GeoJson). I made up the borough codes myself.
- **Postcodes.json** contains polygons all postal districts in the areas [London postal area], WD, HA, EN, IG, RM, DA, BR, CR,SM, KT, TW, UB.
- **Boroughs.json** contains all local authority districts in the ceremonial counties Greater London, Buckinghamshire, Hertfordshire, Essex, Kent, Surrey, Berkshire.
- **Stations.json** contains all rail stations (except tram) within the M25; some may be missing (let me know).
- **Suburbs.json** contains place=suburb/town nodes from OSM, heavily modified by me to improve usefulness and accuracy.

## Dependencies
- **turf-inside** – Turf.js library to solve point-in-polygon via ray-casting.
- **turf-distance** – Turf.js library to find spherical distance between two points via Haversine formula.