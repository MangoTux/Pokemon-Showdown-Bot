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
    }
}