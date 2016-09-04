var http = require('http');
var Trivia = require('./../objects/trivia.js');

function toId(text) {
    if (text && text.id) {
        text = text.id;
    } else if (text && text.userid) {
        text = text.userid;
    }
    if (typeof text !== 'string' && typeof text !== 'number') return '';
    return ('' + text).toLowerCase().replace(/[^a-z0-9]+/g, '');
};

exports.commands = {
    official: function(arg, by, room) 
    {
        if (room.charAt(0) === ',' || by.trim().toLowerCase() == "mirf") {
            var text_base = '';
        } else {
            return; // Don't send to people that use this in chat
        }
        if (!Trivia.Trivia.is_occurring) // || room != "trivia")
        {
            var message = "There isn't official trivia game is going on right now.";
            Bot.say(by, room, text_base + message);
            return;
        }
        var params = arg.split(" ");
        if (params.length == 1 && params[0].trim() == "")
        {
            var message = "A trivia game is going on right now [Gamemode: " + Trivia.Trivia.type + "]";
            Bot.say(by, room, text_base + message);
            return;
        }
        if (params[0] === "leader")
        {
            var num_leaders = 1;
            var message = "";
            if (params.length == 2 && !isNaN(params[1]))
            {
                num_leaders = parseFloat(params[1].trim());
                if (num_leaders > 3)
                {
                    message = "Please limit the leaderboard to the top 3.";
                    Bot.say(by, room, text_base + message);
                    return;
                }
                
            }
            if (Trivia.Trivia.members.length == 0)
            {
                message = "Nobody's scored anything yet!";
                Bot.say(by, room, text_base + message);
                return;
            }
            // Since we really want to keep it mostly sorted, this is good.
            Trivia.Trivia.members.sort(function(a, b) { return a.score < b.score; });
            if (num_leaders == 1)
            {
                message = Trivia.Trivia.members[0]["name"] + " is leading with a score of " + Trivia.Trivia.members[0]["score"] + ".";
                Bot.say(by, room, text_base + message);
                return;
            }
            memberList = Trivia.Trivia.members.slice(0, num_leaders);
            for (var i=0; i<memberList.length; i++)
            {
                var cardinal;
                if (i==0) cardinal = "1st";
                if (i==1) cardinal = "2nd";
                if (i==2) cardinal = "3rd";
                message += cardinal + ": " + memberList[i].name + " ("+memberList[i].score+"); ";
            }
            Bot.say(by, room, text_base + message);
            return;
        }
        if (params[0] === "score")
        {
            var user = by;
            if (params.length == 2)
            {
                user = toId(params[1]);
            }
            var lookup = {};
            for (var i = 0, len = Trivia.Trivia.members.length; i < len; i++) {
                lookup[Trivia.Trivia.members[i].name] = Trivia.Trivia.members[i];
            }
            if (lookup[user] == undefined)
            {
                if (toId(user) == toId(by)) 
                { message = "You have "; }
                else
                { message = user + " has "; }
                message += "a score of 0 in the current game.";
            }
            else
            {
                if (toId(user) == toId(by)) 
                { message = "You have "; }
                else
                { message = user + " has a score of "; }
                message += "a score of " + lookup[user].score + " in the current game.";
            }
            Bot.say(by, room, text_base + message);
            return;
        }
        /*
        Command
        @official - returns if there is an official going on
        @official leader <n> - returns top n users (default 1)
        @official score <user> - returns score of user (default by)
        */
    }
}