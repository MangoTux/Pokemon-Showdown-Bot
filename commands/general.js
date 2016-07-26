var http = require('http');
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
            var text_base = '/pm ' + by + ', ';
        }
        help_page = "http://pastebin.com/kgtSFwnW";
        Bot.say(by, room, text_base + help_page);
    },
    credits: function(arg, by, room) {
        if (room.charAt(0) === ',') {
            var text_base = '';
        }
        else {
            var text_base = '/pm ' + by + ', ';
        }
        var text = "I'm currently being developed by mirf. I'm based on Pokémon Showdown Bots by: Quinella, TalkTakesTime, Morfent, and sparkychild";
        Bot.say(by, room, text_base + text);
    },
    about: function(arg, by, room) {
        if (room.charAt(0) === ',') {
            var text_base = '';
        }
        else {
            var text_base = '/pm ' + by + ', ';
        }
        text = 'Hello! Hulloo! What\'s up? What\'s new? I\'m PlantBot: a Pokemon Lookup & ANalytics Tool designed to extend the functionalities of current commands.';
        Bot.say(by, room, text_base + text);
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
        Bot.say(by, room, text);
    },
    boop: function(arg, by, room) {
        if (room.charAt(0) === ',') {
            var text_base = '';
        }
        else {
            var text_base = '/pm ' + by + ', ';
        }
        
        Bot.say(by, room, text_base + "Boop!");
    }
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
