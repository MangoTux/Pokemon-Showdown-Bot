/**
 * This is the file where commands get parsed
 *
 * Some parts of this code are taken from the Pokémon Shfowdown server code, so
 * credits also go to Guangcong Luo and other Pokémon Showdown contributors.
 * https://github.com/Zarel/Pokemon-Showdown
 *
 * @license MIT license
 */

var pmUser = [toId(config.nick)];

var emoticonAbuse = {};
var emoteFlooding = {};

var initChallstr = [];
var forceRenamed = false;

var sys = require('sys');
var https = require('https');
var http = require('http');
var url = require('url');
var Bot = require('./bot.js');
var Trivia = require('./objects/trivia.js');
var htmlparser = require("htmlparser2");

if (!fs.existsSync('settings.json')) {
	fs.writeFileSync('settings.json', '{}');
}

var settings;
try {
	settings = JSON.parse(fs.readFileSync('settings.json'));
}
catch (e) {
	error('Unable to load settings file.')
	process.exit(-1);
} // file doesn't exist [yet]

if (!Object.isObject(settings)) settings = {};

function parseRaw(message, room) 
{
    message = message.substring(5);
    parsed = htmlparser.parseDOM(message)[0];
    // On starting the trivia game, get the type of game to determine how to parse
    if (message.indexOf("The trivia game will begin") != -1)
    {
        console.log("Trivia game starting!".magenta);
        send("trivia|/trivia", "mirf");
        Trivia.Trivia.is_occurring = true;
        return;
    }
    if (message.indexOf("won the game with a final score of <") != -1)
    {
        console.log("Trivia game stopped.".red);
        // Clear up remaining data.
        Trivia.Trivia.is_occurring = false;
        Trivia.Trivia.members = [];
        Trivia.Trivia.type = "";
        return;
    }
    if (Trivia.Trivia.type == "Number")
    {
        if (message.indexOf("Nobody gained any points") != -1)
        {
            console.log("No points gained.");
            return;
        }
    }
    else if (Trivia.Trivia.type == "Timer")
    {
        if (parsed.children.length <= 3 || message.indexOf("Nobody gained any points") != -1)
        {
            return;
        }
        var scoreTable = parsed.children[4].children;
        // Dunno what to do from there
        var numChildren = scoreTable.length;
        // Ignoring first element as it is the Points Gained/Correct marker
        //Broken.
        for (var i=1; i<numChildren; i++)
        {
            var element_score = scoreTable[i].children[0]; // td element
            var element_users = scoreTable[i].children[1]; // td element
            var score = parseFloat(element_score.children[0].data);
            var users = element_users.children[0].data.split(",");
            console.log("Score:\n", score);
            console.log("Users:\n", users.join(", "));
            if (isNaN(score))
            {
                continue;
            }
            for (var j=0; j<users.length; j++)
            {
                var correct = users[j];
            
                var index = search(correct, Trivia.Trivia.members);
                if (index == -1)
                {
                    Trivia.Trivia.members.push({name: correct, score: score});
                }
                else
                {
                    Trivia.Trivia.members[index].score += score;
                }
            }
        }
    }
    else if (Trivia.Trivia.type == "First")
    {
        if (message.indexOf("Correct: ") == -1)
            return;
        var correct = toId(parsed.children[2].data.substring(9));
        var score = parsed.children[7].children[0].data;
        var index = search(correct, Trivia.Trivia.members);
        if (index == undefined)
        {
            Trivia.Trivia.members.push({name: correct, score: score});
        }
        else
        {
            Trivia.Trivia.members[index].score += score;
        }
    }
    else if (Trivia.Trivia.type != "")
    {
        // Log different game types, ignore rawdata
        console.log("I don't know the game type " + Trivia.Trivia.type);
        return;
    }
}

exports.parse = {
	actionUrl: url.parse('https://play.pokemonshowdown.com/~~' + config.serverid + '/action.php'),
	room: 'trivia',
	'settings': settings,
	//'profiles': profiles,
	blacklistRegexes: {},
	chatData: {},
	rooms: {},
	data: function(data) {
		if (data.substr(0, 1) === 'a') {
			data = JSON.parse(data.substr(1));
			if (data instanceof Array) {
				for (var i = 0, len = data.length; i < len; i++) {
					this.splitMessage(data[i]);
				}
			}
			else {
				this.splitMessage(data);
			}
		}
	},
	splitMessage: function(message) {
		if (!message) return;
		var changes = false;
		if (!this.settings[config.serverid]) {
			this.settings[config.serverid] = {};
			info('Created subsettings: serverid')
			changes = true;
		}
		if (!this.settings[config.serverid][toId(config.nick)]) {
			this.settings[config.serverid][toId(config.nick)] = {};
			info('Created subsettings: nick');
			changes = true;
		}
		if (changes) {
			Tools.writeSettings();
		}
		var room = 'trivia';
		if (message.indexOf('\n') < 0) return this.message(message, room);

		var spl = message.split('\n|:|')[0].split('\n');
		if (spl[0].charAt(0) === '>') {
			room = spl.shift().substr(1);
		}
		for (var i = 0, len = spl.length; i < len; i++) {
			this.message(spl[i], room);
		}
	},
	message: function(message, room) {
		var spl = message.split('|');
		switch (spl[1]) {
            case 'updateuser':
                console.log(("Updated " + spl[2] + " to avatar " + spl[4]).green);
                if (spl[2].trim().toLowerCase() == "kikanalo")
                {
                    for (var i=0; i<config.commands.length; i++)
                    {
                        send("lobby|" + config.commands[i], "mirf");
                    }
                }
                break;
			case 'init':
				if (!this.rooms[room]) {
					this.rooms[room] = this.rooms[room] || {
						name: null,
						users: {}
					};
				}
				break;
			case 'nametaken':
			case 'challstr':
				if (spl[1] === 'challstr') {
					initChallstr = spl
				}
				else {
					spl = initChallstr;
					forceRenamed = true;
				}

				info('received challstr, logging in...');
				var id = spl[2];
				var str = spl[3];

				var requestOptions = {
					hostname: this.actionUrl.hostname,
					port: this.actionUrl.port,
					path: this.actionUrl.pathname,
					agent: false
				};

				if (!config.pass) {
					requestOptions.method = 'GET';
					requestOptions.path += '?act=getassertion&userid=' + toId(config.nick) + '&challengekeyid=' + id + '&challenge=' + str;
				}
				else {
					requestOptions.method = 'POST';
					var data = 'act=login&name=' + config.nick + '&pass=' + config.pass + '&challengekeyid=' + id + '&challenge=' + str;
					requestOptions.headers = {
						'Content-Type': 'application/x-www-form-urlencoded',
						'Content-Length': data.length
					};
				}

				var req = https.request(requestOptions, function(res) {
					res.setEncoding('utf8');
					var data = '';
					res.on('data', function(chunk) {
						data += chunk;
					});
					res.on('end', function() {
						if (data === ';') {
							error('failed to log in; nick is registered - invalid or no password given');
							process.exit(-1);
						}
						if (data.length < 50) {
							error('failed to log in: ' + data);
							process.exit(-1);
						}

						if (data.indexOf('heavy load') !== -1) {
							error('the login server is under heavy load; trying again in one minute');
							setTimeout(function() {
								this.message(message);
							}.bind(this), 60 * 1000);
							return;
						}

						if (data.substr(0, 16) === '<!DOCTYPE html>') {
							error('Connection error 522; trying again in one minute');
							setTimeout(function() {
								this.message(message);
							}.bind(this), 60 * 1000);
							return;
						}

						try {
							data = JSON.parse(data.substr(1));
							if (data.actionsuccess) {
								data = data.assertion;
							}
							else {
								error('could not log in; action was not successful: ' + JSON.stringify(data));
								process.exit(-1);
							}
						}
						catch (e) {}
						send('|/trn ' + config.nick + ',0,' + data); // /trn does nickname?
					}.bind(this));
				}.bind(this));

				req.on('error', function(err) {
					error('login error: ' + sys.inspect(err));
				});

				if (data) req.write(data);
				req.end();
				break;
			case 'pm':
                if (spl[2].trim().toLowerCase()==="kikanalo") break;
                console.log(("Received pm from" + spl[2] + ": " + spl.slice(4).join('|')).green);
				var by = spl[2];
				this.chatMessage(spl.slice(4).join('|'), by, ',' + by);
				break;
            case 'c:':
                if (spl[3].trim().toLowerCase()==="kikanalo") break;
                var by = spl[3].trim();
                if (by.toLowerCase() == "mirf")
                {
                    this.chatMessage(spl.slice(4).join('|'), by, room);
                }
                else
                    this.chatMessage(spl.slice(4).join('|'), by, ',' + by);
                break;
            case 'formats': break;
            case 'queryresponse': break;
            case 'raw': parseRaw(message, room); break;
            case 'popup': break;
            case 'title': break;
            case 'users': break;
            case 'N': break; // User changed name
            case 'L': break;//console.log(("Goodbye from " + room + "," + spl[2]).magenta); break; // User left
            case 'J': break;//console.log(("Hello from " + room + "," + spl[2]).green); break; // User joined
            case 'updatechallenges': // When a challenge is received, politely decline in favor of pacifism.
                var list = JSON.parse(spl[2]);
                for (var i in list.challengesFrom)
                {
                    send("lobby|/reject " + i, "mirf");
                    console.log("Politely declining a challenge from " + i);
                    send("|/w " + i + ", Thank you, but I am a pacifist.", "mirf");
                }
                break;
            case 'html': 
            if (message.indexOf("There is a trivia game in progress") != -1)
            {
                var mode = spl[2].split("Mode:")[1].trim();
                Trivia.Trivia.type = mode;
            }
            else
                console.log(message); 
                
                break;// HTML is a defacto method of returning data - errors and trivia tables are among them
                break;
            case 'unlink': break; // Wanings 'n stuff
            default: console.log(message);
		}
	},
	chatMessage: function(message, by, room) {
        
        if (config.muted.indexOf(by) != -1 && (message.indexOf("sorry") == -1 || (message.indexOf("sorry") != -1 && message.indexOf("not") != -1)))
        {
            console.log("Ignoring " + by);
            return;
        }
        var messageList = message.split(' | ');
        var messageResult = "";
        for (var i in messageList)
        {
            var cmdrMessage = '["' + room + '|' + by + '|' + messageList[i] + '"]';
            message = messageList[i].trim();
            //check for command char
            var isCommand = 0;
            for (var c = 0; c < config.commandcharacter.length; c++)
            {
                if (message.indexOf(config.commandcharacter[c]) === 0)
                {
                    isCommand = config.commandcharacter[c].length;
                }
            }
            // Ignore people when they're not me and sending messages in public chat that don't start with '@'
            if (message.indexOf("@") !== 0)
            {
                if (toId(by) != "mirf")
                    return;
            }
    
            message = message.slice(isCommand);
        
            var index = message.indexOf(' ');
            var arg = '';
            if (index > -1)
            {
                var cmd = toId(message.substr(0, index));
                arg = message.substr(index + 1).trim();
            }
            else
            {
                var cmd = toId(message);
            }

            if (Commands[cmd]) 
            {
                var failsafe = 0;
                var leCommand = cmd;
                while (typeof Commands[cmd] !== "function" && failsafe++ < 10)
                {
                    cmd = Commands[cmd];
                }
                if (typeof Commands[cmd] === "function")
                {
                    if (!this.settings[config.serverid][toId(config.nick)].disable)
                    {
                        this.settings[config.serverid][toId(config.nick)].disable = {};
                    }
                    if (this.settings[config.serverid][toId(config.nick)].disable[cmd] && !Bot.isDev(by))
                    {
                        return;
                    }
                    cmdr(cmdrMessage);
                    try
                    {
                        var textResult = Commands[cmd].call(this, arg, by, room, (i < messageList.length-1), baseString, leCommand);
                        if (textResult == -1) return;
                        if (i == messageList.length-1)
                        {
                            var sayList = textResult.split("\n");

                            by = toId(by);
                            if (room.charAt(0) !== ',') {
                                var baseString = (room!=='lobby'?room:'') + "|";
                            }
                            else
                            {
                                var baseString = '|/pm ' + room.substr(1) + ', ';
                            }
                            for (var i in sayList)
                            {
                                send(baseString + sayList[i], by);
                            }
                        }
                        else
                        {
                            baseString = textResult;
                        }
                    }
                    catch (e)
                    {
                        console.log(e);
                        console.log('The command failed!');
                        error(sys.inspect(e).toString().split('\n').join(' '))
                        if (config.debuglevel <= 3)
                        {
                            console.log(e.stack);
                        }
                    }
                }
                else
                {
                    error("Invalid command type for " + cmd + ": " + (typeof Commands[cmd]));
                }
            }
        }
	},
	cleanChatData: function() {
		var chatData = this.chatData;
		for (var user in chatData) {
			for (var room in chatData[user]) {
				var roomData = chatData[user][room];
				if (!Object.isObject(roomData)) continue;

				if (!roomData.times || !roomData.times.length) {
					delete chatData[user][room];
					continue;
				}
				var newTimes = [];
				var now = Date.now();
				var times = roomData.times;
				for (var i = 0, len = times.length; i < len; i++) {
					if (now - times[i] < 5 * 1000) newTimes.push(times[i]);
				}
				newTimes.sort(function(a, b) {
					return a - b;
				});
				roomData.times = newTimes;
				if (roomData.points > 0 && roomData.points < 4) roomData.points--;
			}
		}
	},
};
