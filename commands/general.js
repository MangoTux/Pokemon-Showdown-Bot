var http = require('http');
var Config = require('./../config.js');
var bot = require('./../bot.js');
var meteo = require('weather-js');
exports.commands = {
    /**
     * Help commands
     *
     * These commands are here to provide information about the bot.
     */
    info: 'help',
    help: function(arg, by, room) {
        if (room.charAt(0) === ',') {
            var text_base = '';
        }
        else {
            return; 
        }
        return text_base + "Pester mirf to get this implemented.";
    },
    credits: function(arg, by, room) {
        if (room.charAt(0) === ',') {
            var text_base = '';
        }
        else {
            return; 
        }
        return text_base + "I'm currently being developed by mirf. I'm based on Pokémon Showdown Bots by: Quinella, TalkTakesTime, Morfent, and sparkychild";
    },
    about: function(arg, by, room) {
        if (room.charAt(0) === ',') {
            var text_base = '';
        }
        else {
            return; 
        }
        text = 'Hello! Hulloo! What\'s up? What\'s new? I\'m PlantBot (AKA Kikanalo): a Pokemon Lookup & ANalytics Tool designed to extend the functionalities of current commands.';
        return text_base + text;
    },
    who: 'whodabest',
    whosthebest: 'whodabest',
    whodabest: function(arg, by, room) {
        if (room.charAt(0) === ',') {
            var text = '';
        }
        else {
            return; // Don't want to annoy others
        }
        if (by.trim() === "mirf" || by.trim() === "MangoTux")
        {
            text += "Kass is the best! <3";
        }
        else if (by.trim() === "Anacrusis")
        {
            text += "You're the best, and I love you <3";
        }
        else
        {
            text += "Anacrusis is the best!";
        }
        console.log(by.trim() + " asked who the best is.");
        return text_base + text;
    },
    Sorry: 'sorry',
    sorry: function(arg, by, room) {
        if (room.charAt(0) === ',' || toId(by) === "mirf")
        {
            var text = '';
        }
        else {
            return;
        }
        if (Config.muted.indexOf(toId(by)) == -1)
        {
            return "What for? We're friends!";
        }
        else
        {
            Config.muted.splice(Config.muted.indexOf(toId(by)), 1);
            return randomChoice(["It's okay c:", "I forgive you.", "Yay! Friends again!", "It's cool! We're friends now c:"]);
        }
    },
    boop: function(arg, by, room) {
        if (room.charAt(0) === ',') {
            var text_base = '';
        }
        else {
            return; 
        }
        return "Boop!";
    },
    rl: function(arg, by, room) {
        if (toId(by) === "mirf")
        {
            Bot.reload();
            Bot.say(by, room, "Reloaded modules");
        }
        else
        {
            Bot.say(by, room, "/pm " + by + ", You don't have the authority to reload modules.");
        }
    },
    weather: function(arg, by, room, hasPipeOut, argIn) {
        if (room.charAt(0) === ',' || by.trim().toLowerCase() == "mirf" || hasPipeOut) {
            var text_base = '';
        } else {
            var text_base = '/pm ' + by + ', ';
        }
        var degreeType = 'F'
        if (argIn || hasPipeOut)
        {
            Bot.say(by, room, text_base + "``weather`` doesn't work in a pipe stream.");
            return -1;
        }
        if (!arg) {
            Bot.say(by, room, text_base + "Usage: @weather [location]");
        }
    
        if (arg.indexOf('-') == 0)
        {
            arg = arg.substr(1);
            switch (arg.charAt(0).toLowerCase())
            {
                case 'c': case 'C': degreeType = 'C'; break;
                case 'f': case 'F': degreeType = 'F'; break;
                default: Bot.say(by, room, text_base + '-' + arg.charAt(0) + " is not a valid unit; Expected (C)elsius or (F)ahrenheit."); return -1;
            }
            arg = arg.substr(1).trim();
        }
        var text;
        console.log(arg);
        meteo.find({search: arg, degreeType: degreeType}, function(err, result) {
            if(err) {
                console.log(err, result);
                Bot.say(by, room, text_base + "An error occurred.");
                return -1;
            }
            text = "Weather for " + result[0].location.name + ": " + result[0].current.temperature + result[0].location.degreetype + "; Feels like " + result[0].current.feelslike + result[0].location.degreetype + "; Wind: " + result[0].current.winddisplay;
            Bot.say(by, room, text_base + text);
            return -1;
        });
    },
};

/****************************
*       For C9 Users        *
*****************************/
// Yes, sadly it can't be done in one huge chunk w/o undoing it / looking ugly :(

/* globals toId */
/* globals Bot */
/* globals config */
/* globals Plugins */
/* globals fs */
/* globals stripCommands */
/* globals Tools */
/* globals Commands */
/* globals pokemonData */
