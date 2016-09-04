var http = require('http');
var Config = require('./../config.js');
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
        help_page = "http://pastebin.com/kgtSFwnW";
        Bot.say(by, room, text_base + help_page);
    },
    credits: function(arg, by, room) {
        if (room.charAt(0) === ',') {
            var text_base = '';
        }
        else {
            return; 
        }
        var text = "I'm currently being developed by mirf. I'm based on Pokémon Showdown Bots by: Quinella, TalkTakesTime, Morfent, and sparkychild";
        Bot.say(by, room, text_base + text);
    },
    about: function(arg, by, room) {
        if (room.charAt(0) === ',') {
            var text_base = '';
        }
        else {
            return; 
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
    sudo: function(arg, by, room) {
        console.log(arg, by, room);
        if (room.charAt(0) === ',') {
            var text = '';
        }
        else {
            return; // Don't want to annoy others
        }
        if ((by.trim() === "mirf" || by.trim() === "Anacrusis" || by.trim() === "MangoTux") && room.charAt(0) === ',')
        {
            Bot.say(by, room, text + arg);
        }
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
            Bot.say(by, room, "What for? We're friends!");
            return;
        }
        else
        {
            Config.muted.splice(Config.muted.indexOf(toId(by)), 1);
            Bot.say(by, room, randomChoice(["It's okay c:", "I forgive you.", "Yay! Friends again!", "It's cool! We're friends now c:"]));
            return;
        }
    },
    boop: function(arg, by, room) {
        if (room.charAt(0) === ',') {
            var text_base = '';
        }
        else {
            return; 
        }
        Bot.say(by, room, "Boop!");
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
