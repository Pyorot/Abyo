# Abyo
Work-in-progress notification bot (LondonPogoMap to public Discord channels) with abstract filters.

## App files
- **index.js** – Contains functions to load Agents and run the process once (TODO: process loop).
- **fetch.js** – Wraps LondonPogoMap HTTP endpoint and error-handling.
- **parse.js** – Provides Pokemon class, which parses a raw Pokemon (from the fetched data) into a workable object.
- **agent.js** – Provides Agent class (see below), representing an abstract filter, responsible for filtering and sending.
- **locate.js** – Module that converts co-ordinates into accurate location data using local data and algorithms.
- **post.js** – Wraps Discord HTTP endpoint and error-handling and converts Pokemon into presentable notification.

## Improvements over previous versions of Pyobot
* Location data computed locally from accurate, processed data rather than via HTTP from inaccurate, unprocessed third-party endpoint.
* Abstract filters over concrete JSON filter parameters.
* Logic to figure out when is soonest to poll for data, fetching each datum exactly once (TODO).

## Agent?
The idea is that each Agent object is instantiated from a script file, which provides a dictionary of channels that the Agent should send to (identifier: DiscordChannelID) and a filter function with argument Pokemon that returns a channel identifier from the dictionary for an accepted Pokemon and undefined for a rejected Pokemon. Each Agent posts each Pokemon to at most one channel, so should represent a natural filtering demand, like
- picking a channel for each Unown letter;
- picking a channel for each rare Dex entry;
- posting to a single curated channel;
- posting to a single channel for 100% IV.