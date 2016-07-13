//global.Tools
var sys = require('sys');
var https = require('https');
var http = require('http');
var url = require('url');
//global.Tools
exports.Tools = {
    getTimeAgo: function(time) {
        time = ~~((Date.now() - time) / 1000);

        var seconds = time % 60;
        var times = [];
        if (seconds) times.push(seconds + (seconds === 1 ? ' second' : ' seconds'));
        if (time >= 60) {
            time = ~~((time - seconds) / 60);
            var minutes = time % 60;
            if (minutes) times.unshift(minutes + (minutes === 1 ? ' minute' : ' minutes'));
            if (time >= 60) {
                time = ~~((time - minutes) / 60);
                var hours = time % 24;
                if (hours) times.unshift(hours + (hours === 1 ? ' hour' : ' hours'));
                if (time >= 24) {
                    time = ~~((time - hours) / 24);
                    var days = time % 365;
                    if (days) times.unshift(days + (days === 1 ? ' day' : ' days'));
                    if (time >= 365) {
                        var years = ~~((time - days) / 365);
                        if (days) times.unshift(years + (years === 1 ? ' year' : ' years'));
                    }
                }
            }
        }
        if (!times.length) return '0 seconds';
        return times.join(', ');
    },
    syncSettings: function() {
        //keep data across several bots
        try {
            var mySettings = Parse.settings[config.serverid][toId(config.nick)];
        }
        catch (e) {}
        try {
            Parse.settings = JSON.parse(fs.readFileSync('settings.json'));
        }
        catch (e) {
            return false;
        } // file doesn't exist [yet]
        if (!Parse.settings[config.serverid]) {
            Parse.settings[config.serverid] = {};
        }
        if (!Parse.settings[config.serverid][toId(config.nick)]) {
            Parse.settings[config.serverid][toId(config.nick)] = {};
        }
        Parse.settings[config.serverid][toId(config.nick)] = mySettings;
        //end
        return true;
    },
    writeSettings: function() {
        var overWriteCatch = this.syncSettings();
        if (!overWriteCatch) {
            error('writeSettings: failed')
            return;
        }
        var data = JSON.stringify(Parse.settings);
        fs.writeFileSync('settings.json', data);
    },
    uncacheTree: function(root) {
        var uncache = [require.resolve(root)];
        do {
            var newuncache = [];
            for (var i = 0; i < uncache.length; ++i) {
                if (require.cache[uncache[i]]) {
                    newuncache.push.apply(newuncache,
                        require.cache[uncache[i]].children.map(function(module) {
                            return module.filename;
                        })
                    );
                    delete require.cache[uncache[i]];
                }
            }
            uncache = newuncache;
        } while (uncache.length > 0);
    },
    generateString: function() {
        var letters = 'qwertyuiopasdfghjklzxcvbnm1234567890';
        var length = ~~(Math.random() * 12) + 8;
        var text = ''
        for (var i = 0; i < length; i++) {
            var rand = ~~(letters.length * Math.random())
            text += letters[rand];
        }
        return text;
    },
};
