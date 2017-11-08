# Abyo/locate.js
This module contains scripts that reverse-geocode locations in London (within M25) using Turf.js with the data stored in ./data/.

## Functions
 - **g(lat, lng)** – An endpoint: returns `[postal district] [3-letter borough code] [name]`, where `[name]` is `@ [nearest station]` if a station is detected within 500m, else `~ [nearest suburb]`.
 - **gB(lat, lng)** – Finds exact borough (exact at boundaries).
 - **gP(lat, lng)** – Finds exact postal district (approximate at boundaries).
 - **gSt(lat, lng)** – Finds nearest station marker (within 500m; TFL Tube Map (except Trams) and National Rail).
 - **gSu(lat, lng)** – Finds nearest suburb marker (unbounded).

## Data
Data comes from these sources. I made up the borough codes myself.
- **Postal Districts** – https://www.doogal.co.uk/PostcodeDistricts.php
- **Boroughs** – https://data.gov.uk/dataset/local-authority-districts-december-2016-full-extent-boundaries-in-great-britain2
- **Stations** – OpenStreetMap (modified)
- **Suburbs** – OpenStreetMap (modified)

## Dependencies
- **turf-inside** – Turf.js library to solve point-in-polygon via ray-casting.
- **turf-distance** – Turf.js library to find spherical distance between two points via Haversine formula.