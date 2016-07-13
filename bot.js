//resource Monitor settings:
const MONITOR = {
    USER: 12,
    TOTAL: 90,
    COMMAX: 8,
    PREVENTION: 6,
    WARNING: {
        1: 7,
        2: 30,
        3: 90,
        4: 360,
        5: 1440
    }
}

//global.Bot 
exports.Bot = {
    ranks: {},
    monitor: {
        usage: 0,
        user: {},
        repeat: {},
        pattern: [],
        warnings: {}
    },
    repeatON: {},
    repeatText: {},
    mutes: {},
    initMonitor: function() {
        //reset ResourceMonitor
        setInterval(function() {
            var warnings = this.monitor.warnings;
            var repeat = this.monitor.repeat;
            var pattern = this.monitor.pattern;
            this.monitor = {
                usage: 0,
                user: {},
                pattern: pattern,
                repeat: repeat,
                warnings: warnings
            };
        }.bind(this), 1 * 60 * 1000);
    },
    mute: function(user, duration, by) {
        if (!by) {
            by === '~ResourceMonitor';
        }
        if (!duration) {
            duration = 7;
        }
        duration = duration * 1;
        if (isNaN(duration)) {
            duration = 7;
        }
        user = toId(user);
        this.botlog('global', toId(user) + ' was muted from using the bot for ' + duration + ' minutes by' + by);
        if (this.isBanned(user)) return false;
        var d = new Date();
        var date = d.valueOf();
        this.mutes[user] = date + duration * 1000 * 60;
        return true;
    },
    isDev: function(by) {
        if (!by) return false;
        var isDev = (devList.indexOf(toId(by)) !== -1);
        return isDev;
    },
    
    talk: function(room, message) {
        this.say(config.nick, room, message, true);
    },
    say: function(user, room, text, bypass) {
        user = toId(user);
        if (!Parse.settings[config.serverid][toId(config.nick)].translation) {
            Parse.settings[config.serverid][toId(config.nick)].translation = {}
        }

        if (!bypass && Parse.settings[config.serverid][toId(config.nick)].translation[room] !== 'en' && Parse.settings[config.serverid][toId(config.nick)].translation[room] && room.charAt(0) !== ',' && text.indexOf('/me') !== 0) {
            var parts = ''
            if (text.charAt(0) === '/' && text.charAt(1) !== '/' && text.indexOf('/me') !== 0) {
                parts = text.split(',')[0];
                text = text.split(',').slice(1).join(',')
            }
            Tools.translate(room, parts, text, 'en', Parse.settings[config.serverid][toId(config.nick)].translation[room]);
            return;
        }
        if (!text) return;
        //
        if (room.charAt(0) !== ',') {
            var str = (room !== 'lobby' ? room : '') + '|' + text;
        }
        else {
            room = room.substr(1);
            var str = '|/pm ' + room + ', ' + text;
        }
        send(str, user);
    },
    canUse: function(cmd, room, user) {
        var canUse = false;
        var ranks = ' +★$%@&#~';
        if (!Parse.settings[config.serverid][toId(config.nick)][cmd] || !Parse.settings[config.serverid][toId(config.nick)][cmd][room]) {
            canUse = this.hasRank(user, ranks.substr(ranks.indexOf((cmd === 'autoban' || cmd === 'banword') ? '#' : config.defaultrank)));
        }
        else if (Parse.settings[config.serverid][toId(config.nick)][cmd][room] === true) {
            canUse = true;
        }
        else if (ranks.indexOf(Parse.settings[config.serverid][toId(config.nick)][cmd][room]) > -1) {
            canUse = this.hasRank(user, ranks.substr(ranks.indexOf(Parse.settings[config.serverid][toId(config.nick)][cmd][room])));
        }
        return canUse;
    },
    reload: function() {
        Commands = {};
        var commandFiles = fs.readdirSync('./commands/');
        for (var i = 0; i < commandFiles.length; i++) {
            try {
                Tools.uncacheTree('./commands/' + commandFiles[i]);
                Object.merge(Commands, require('./commands/' + commandFiles[i]).commands);
                ok('Reloaded command files: ' + commandFiles[i])
            }
            catch (e) {
                error('Unable to reload command files: ' + commandFiles[i]);
                console.log(e.stack)
            }
        }
    },
    /*
	alts: 'profile',
	profile: function(arg, by, room, cmd) {
		var destination = ',' + by;
		var user = toId(by);
		if (!arg || !Bot.rankFrom(by, '+')) {
			arg = user;
		}
		else {
			arg = toId(arg);
		}
		if (cmd === 'alts') {
			Tools.uploadToHastebin('User: ' + arg + '\nAlts: ' + (this.profiles[arg] ? this.profiles[arg].join(', ') : arg), function(link) {
				Bot.say(by, destination, link);
			}.bind(this))
		}
		else {
			//get all the alts
			var userData = this.profiles[arg] || [arg];
			var data = {};
			//create data object
			for (var i = 0; i < userData.length; i++) {
				data[userData[i]] = {
					blacklist: [],
					rank: Bot.botRank(userData[i])
				};
			}
			//check blacklist records
			for (var user in data) {
				for (var server in this.settings) {
					for (var nick in this.settings[server]) {
						for (var room in this.settings[server][nick].blacklist) {
							if (this.settings[server][nick].blacklist[room][user]) {
								data[user].blacklist.push('[' + server + '] ' + room);
							}
						}
					}
				}
			}
			//create table
			var table = ['User: ' + arg, 'BotRank: ' + Bot.botRank(arg), '', '+--------------------+-------+--------------------------------+--------------+', '|Alt:                |BotRank|Blacklist Records               |BotBan/BotMute|', '+--------------------+-------+--------------------------------+--------------+']; //19 + 7 + 32
			for (var name in data) {
				//determine number of rows
				var rows = data[name].blacklist.length || 1;
				table.push('|' + name + '                    '.slice(name.length) + '|' + Bot.botRank(name) + '      |' + (data[name].blacklist[0] ? data[name].blacklist[0] : '') + (data[name].blacklist[0] ? '                                '.slice(data[name].blacklist[0].length) : '                                ') + '|' + (Bot.isBanned(name) ? '  X           |' : '              |'))
				for (var i = 1; i < rows; i++) {
					table.push('|                    |       |' + (data[name].blacklist[i] ? data[name].blacklist[i] : '') + (data[name].blacklist[i] ? '                                '.slice(data[name].blacklist[i].length) : '                           ') + '|              |')
				}
				table.push('+--------------------+-------+--------------------------------+--------------+');
			}
			Tools.uploadToHastebin(table.join('\n'), function(link) {
				Bot.say(by, destination, link);
			}.bind(this))
		}
	},*/
}