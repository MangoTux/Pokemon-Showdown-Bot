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
/*
var profiles;
try {
	profiles = JSON.parse(fs.readFileSync('profiles.json'));
}
catch (e) {} // file doesn't exist [yet]

if (!Object.isObject(profiles)) profiles = {};
*/


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
        console.log(message); // HTML structure of messages are [class='chat chat-message-<username>'], while trivia announcements are [class='announcement']
		var spl = message.split('|');
		switch (spl[1]) {
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
							error('Connection error 522; trying agian in one minute');
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
				var by = spl[2];
				this.chatMessage(spl.slice(4).join('|'), by, ',' + by);
				break;
		}
	},
	chatMessage: function(message, by, room) {
        if (by.trim() != "PlantBot")
        console.log(by.trim() + " said '" + message + "'");
		var cmdrMessage = '["' + room + '|' + by + '|' + message + '"]';
		message = message.trim();
		// auto accept invitations to rooms
		if (room.charAt(0) === ',' && message.substr(0, 8) === '/invite ' && by.trim() === 'mirf') {
			invite(by, message.substr(8));
			Bot.say('', '/join ' + message.substr(8));
		}

		//check for command char
		var isCommand = 0;
		for (var c = 0; c < config.commandcharacter.length; c++) {
			if (message.indexOf(config.commandcharacter[c]) === 0) {
				isCommand = config.commandcharacter[c].length;
			}
		}

		//if (isCommand === 0 || toId(by) === toId(config.nick)) return;

		message = message.slice(isCommand);
		var index = message.indexOf(' ');
		var arg = '';
		if (index > -1) {
			var cmd = toId(message.substr(0, index));
			arg = message.substr(index + 1).trim();
		}
		else {
			var cmd = toId(message);
		}

		if (Commands[cmd]) {
			var failsafe = 0;
			var leCommand = cmd;
			while (typeof Commands[cmd] !== "function" && failsafe++ < 10) {
				cmd = Commands[cmd];
			}
			if (typeof Commands[cmd] === "function") {
				if (!this.settings[config.serverid][toId(config.nick)].disable) {
					this.settings[config.serverid][toId(config.nick)].disable = {};
				}
				if (this.settings[config.serverid][toId(config.nick)].disable[cmd] && !Bot.isDev(by)) {
					return;
				}
				cmdr(cmdrMessage);
				try {
					Commands[cmd].call(this, arg, by, room, leCommand);
				}
				catch (e) {
					Bot.talk(room, 'The command failed!');
					error(sys.inspect(e).toString().split('\n').join(' '))
					if (config.debuglevel <= 3) {
						console.log(e.stack);
					}
				}
			}
			else {
				error("Invalid command type for " + cmd + ": " + (typeof Commands[cmd]));
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
