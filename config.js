//place the URL of the showdown server you are aiming to connect to
exports.url = 'sim.smogon.com-80.psim.us';

// The nick and password to log in with
exports.nick = 'Kikanalo'
exports.pass = '########';

// A list of private rooms that the bot will not leak through the seen command
exports.privaterooms = [];

// The character text should start with to be seen as a command.
// Note that using / and ! might be 'dangerous' since these are used in
// Showdown itself.
// Using only alphanumeric characters and spaces is not allowed.
// Add more command characters 
var comChar = exports.commandcharacter = ['@'];

// The default rank is the minimum rank that can use a command in a room when
// no rank is specified in settings.json
exports.defaultrank = '@';

// Whether this file should be watched for changes or not.
// If you change this option, the server has to be restarted in order for it to
// take effect.
exports.watchconfig = false;

// Secondary websocket protocols should be defined here, however, Showdown
// doesn't support that yet, so it's best to leave this empty.
exports.secprotocols = [];

// What should be logged?
// 0 = error, ok, info, debug, recv, send
// 1 = error, ok, info, debug, cmdr, send
// 2 = error, ok, info, debug (recommended for development)
// 3 = error, ok, info (recommended for production)
// 4 = error, ok
// 5 = error
exports.debuglevel = 3;

// Users who can use all commands regardless of their rank. Be very cautious
// with this, especially on servers other than main.
// This, however does NOT give dev permissions which are declared in parser.js
exports.excepts = ["mirf", "Anacrusis"];
exports.rooms = ["techcode", "joim", "trivia"];
exports.muted = [];
// Alt tracking - generally disabled bc it takes up a LOT of memory.
// If you use this, you will need to uncomment out the neccessary parts in the parser.js and commands.js
exports.alts = false;

// Default avatar - Bird Trainer!
exports.avatar = '31';

// When you pm the bot but don't use a command, it replies you this message.
// Example: "Hi, I'm a bot. Use .guide to view a command guide"
exports.message = ["."];
//
exports.commands = ["/join joim", "/avatar zinnia"];
