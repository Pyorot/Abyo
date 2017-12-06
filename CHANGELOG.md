## Changelog

### 1.1 (6/12)
- **locate.js now uses pre-computed bounding boxes to avoid testing point-in-polygon in most cases**; postcode and borough search are now over 10 times faster. Polygon data now contains bounding boxes at `Feature.properties.bbox`.
- **new file geo.js abstracts out the underlying geographical functions**, away from the London data routines. It is importable into each Agent, meaning Agents can now filter by user-defined polygon.
- **all geographical endpoints use a standard format for points**, `point = [lat,lng]`, which is also now used for Pokemon coordinates, at `Pokemon.point`.
- **Agent filters can now return arrays of channel identifiers**, so one Agent can send the same Pokemon to multiple channels (previously, this required multiple Agents). This means redundant filtering by polygon for different channels of the same Discord server can be avoided, but Agents do (for now) only have one send queue handling all channels, so there will be a slight delay between sends.
- **new agent.js `annotate` function, to capture all post-processing of Pokemon**; pre-processing is handled by parse.js, and exposes properties that can be filtered by; post-processed properties cannot be filtered by, but are only computed for Pokemon that are sent (at the first send), so can be more computation-heavy; note that both pre- and post-processing are still blocking of the main `go()` loop, whereas each send operation is concurrent. Notification construction is now post-processed, except for *time remaining*, which is computed just-in-time for sending.
- **Postcodes are now pre-processed**, so filterable.
- **All geographical data is now standard (containerised) GeoJSON.**

### 1.0 (24/11)
*Initial release*.