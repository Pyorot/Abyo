# Abyo
Notification bot (LondonPogoMap to public Discord channels) with abstract filters.

## App files
- **index.js** – Contains functions to load Agents and run the process loop.
- **fetch.js** – Wraps LondonPogoMap HTTP endpoint and error-handling.
- **parse.js** – Provides Pokemon class, which parses a raw Pokemon (from the fetched data) into a workable object.
- **agent.js** – Provides Agent class (see below), representing an abstract filter, responsible for filtering, as well as annotating and sending.
- **locate.js** – Module that converts co-ordinates into accurate location data using local data and geo.js.
- **geo.js** – Module that provides geographical algorithms, namely distance, point-in-polygon (with bounding-box optimisation), point location in polygon partition, and closest point.
- **post.js** – Wraps Discord HTTP endpoint and error-handling, and sends messages with up-to-date time information.

## Improvements over previous versions of public Pyobot
* Location data computed locally from accurate, processed data rather than via HTTP from inaccurate, unprocessed third-party endpoint – faster, more scalable and gives better info.
* Abstract filters over concrete JSON filter parameters – much more flexibility to configure notification channels (e.g. as of v1.1: can filter location by polygon).
* Logic to try to poll for data as soon as it's available (continually adjusting its timing) rather than in fixed intervals – noticeably faster.
* Redesigned notification format: takes advantage of line breaks on iOS while giving detailed yet clearly delimited single-line alerts on Android.

## Agents and abstract filters?
The idea is that each Agent object is instantiated from a script file, which provides a dictionary of channels that the Agent should send to (with format `{identifier: DiscordChannelID}`) and a filter function with argument Pokemon that returns a channel identifier from the dictionary (or array of them) for an accepted Pokemon and `undefined` (or `[]`) for a rejected Pokemon. Each Agent represents a natural filtering demand, like (see examples in ./agents/):
- picking a channel for each Unown letter, and reposting 100% IV to a special channel;
- picking a channel for each rare Dex entry;
- posting to a single curated channel;
- posting to various channels for a single local area.

## To set up
- [authenticate your IP address with the Discord gateway](https://pastebin.com/NRh6Lb90).
- Create a .env file, containing configuration variables that are loaded when the app is started:
    - `KEY_BOT` is the Discord bot token;
    - `KEY_GOOGLE` is the Google Static Maps API key;
    - `LOCATE = true`/`false` is a toggle for whether to load/use locate.js;
    - `POST = true`/`false` toggles real/test posting mode (Discord/console rsp.).
- Place in ./agents/ a `.js` file for every agent (template.js is ignored).

## To run (REPL mode)
- open command line in the program directory and run Node.js REPL via the command `node` (no arguments).
- run `.load index.js` to load program.
- `load()` (re)loads the Agents. If an Agent is sending when reloaded, it will continue to exist until it finishes.
- `go()` starts the process loop (if started, it will continue the loop immediately).
- `stop()` stops the process loop.
- **Testing**: `.load` can be used to test each code file individually and `.load test.js` imports test data).

## To run (non-REPL mode)
*Use if problems in REPL mode with command line falling asleep or such.*
- append `load(); go()` to index.js.
- open command line in the program directory and run `node .`.

## Tada!
<img src="https://cdn.discordapp.com/attachments/293838131407486980/385244167627866112/image.png" width="468"/>

## Acknowledgements
With thanks to [moriakaice](https://github.com/moriakaice/) from the  [PokémonGoLondon Discord](https://discord.gg/en6ea96) for implementing the original Node.js version of the notification bot ("Pyobot"), from which I learned some code techniques and tools, and got inspiration for improvements, and to the Discord community for providing ongoing feedback.
    – Pyorot