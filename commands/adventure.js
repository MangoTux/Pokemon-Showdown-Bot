var Adv = require('./../objects/adventure/adventurer.js');
var Item = require('./../objects/adventure/items.js');
var Enemy = require('./../objects/adventure/enemy.js');
var Config = require('./../config.js');
exports.commands = {
    start: function(arg, by, room) {
        if (room.charAt(0) === ',' || toId(by) === "mirf")
        {
            var text = '';
        }
        else {
            var text = '/pm ' + by + ", ";
        }
        if (arg.trim().toLowerCase() === "adventure" || arg.trim().toLowerCase() === "quest")
        {
            var index = search(by, Adv.Adventurers);
            // If user is not in adventurer list
            if (index == -1)
            {
                //Create a new character!
                var char = Adv.createCharacter(by);
                Adv.Adventurers.push(char);
                var message = "Hello " + char.name + ", the " + char.race + " " + char.class + ".";
                Bot.say(by, room, text + message);
            }
            else
            {
                Bot.say(by, room, text + "You're already in an adventure!");
            }
        }
    },
    
    stats: function(arg, by, room) {
        if (room.charAt(0) === ',' || toId(by) === "mirf")
        {
            var text = '';
        }
        else {
            var text = '/pm ' + by + ", ";
        }
        var index = search(by, Adv.Adventurers);
        // If user is not in adventurer list
        if (index == -1)
        {
            return;
        }
        var char = Adv.Adventurers[index];
        var msg = "**" + char.name.trim() + ", the level " + char.level + " " + char.race + " " + char.class + "**; Damage: d" + char.atk[0] + "+" + char.atk[1] + "; Defense: d" + char.def[0] + "+" + char.def[1] + "; HP: " + char.hp + "/" + char.max_hp + "; Gold: " + char.gold; 
        Bot.say(by, room, text + msg);
    },
    
    inv: 'inventory',
    inventory: function(arg, by, room) {
        if (room.charAt(0) === ',' || toId(by) === "mirf")
        {
            var text = '';
        }
        else {
            var text = '/pm ' + by + ", ";
        }
        var index = search(by, Adv.Adventurers);
        // If user is not in adventurer list
        if (index == -1) return;
        var msg = "";
        if (arg.trim().length == 0)
        {
            arg = 0;
            var inv_length = Adv.Adventurers[index].inventory.length;
            for (var i=5*arg; i<inv_length && i<5*(arg+1); i++)
            {
                msg += Adv.Adventurers[index].inventory[i].name;
            }
            Bot.say(by, room, text + msg);
            return;
        }
        else if (!isNaN(arg.trim()) && parseFloat(arg.trim()) > 0)
        {
            arg = parseFloat(arg.trim())-1;
            console.log("Viewing page " + arg);
            var inv_length = Adv.Adventurers[index].inventory.length;
            for (var i=5*arg; i<inv_length && i<5*(arg+1); i++)
            {
                msg += Adv.Adventurers[index].inventory[i].name;
            }
            Bot.say(by, room, text + msg);
            return;
        }
        else
        {
            console.log(arg); // For testing
        }
        // inventory -> list items if less than 5
        // inventory [n] -> list items 5*n through 5*n+4
        // inventory inspect [item] -> show info on certain item
        console.log("TODO");
    },
    
    equip: function(arg, by, room) {
        // equip -> No items error, one item equip
        // equip [item] -> move item to player's equipped region
        console.log("TODO");
    },
    
    fight: function(arg, by, room) {
        if (room.charAt(0) === ',' || toId(by) === "mirf")
        {
            var text = '';
        }
        else {
            var text = '/pm ' + by + ", ";
        }
        //TODO
        var index = search(by, Adv.Adventurers);
        // If user is not in adventurer list
        if (index == -1) return;
        if (Adv.Adventurers[index].game_state == "fight" && Adv.Adventurers[index].enemy != {})
        {
            var enemy = Adv.Adventurers[index].enemy;
            Bot.say(by, room, text + "I'm kinda phoning it in right now. You won or something.");
            Adv.Adventurers[index].exp += enemy.exp;
            Adv.Adventurers[index].gold += enemy.gold;
            Adv.Adventurers[index].enemy = {};
            Adv.Adventurers[index].game_state = "walk";
            Bot.say(by, room, text + "You gained: " + enemy.gold + " gold and " + enemy.exp + " experience.");
            return;
        }
        else
        {
            Bot.say(by, room, text + "Fight what? There's nothing here.");
        }
    },
    
    inspect: function(arg, by, room) {
        if (room.charAt(0) === ',' || toId(by) === "mirf")
        {
            var text = '';
        }
        else {
            var text = '/pm ' + by + ", ";
        }
        var index = search(by, Adv.Adventurers);
        // If user is not in adventurer list
        if (index == -1) return;
        var char = Adv.Adventurers[index];
        var msg = "";
        if (char.game_state != "fight") { Bot.say(by, room, text + "There's nothing here to inspect!"); return; }
        var enemy = Adv.Adventurers[index].enemy;
        msg += "**" + enemy.name + "** (Level " + enemy.level + ") __" + enemy.desc + "__";
        Bot.say(by, room, text + msg);
    },
    
    run: function(arg, by, room) {
        if (room.charAt(0) === ',' || toId(by) === "mirf")
        {
            var text = '';
        }
        else {
            var text = '/pm ' + by + ", ";
        }
        var index = search(by, Adv.Adventurers);
        // If user is not in adventurer list
        if (index == -1) return;
        var char = Adv.Adventurers[index];
        if (Adv.Adventurers[index].game_state == "fight")
        {
            Adv.Adventurers[index].game_state = "walk";
            var enemy = Adv.Adventurers[index].enemy;
            Adv.Adventurers[index].enemy = {};
            Bot.say(by, room, text + randomChoice(["You ran from the " + enemy.name + ". Coward.", "You valiantly flee from the " + enemy.name + ", tail betwixt your legs.", "The " + enemy.name + " is probably making fun of you to their friends by now.", "You barely escape before the " + enemy.name + " could hurt you.", "Ooh, smart move. You run from the " + enemy.name + ".", "History will remember of the time that " + by + " almost fought the " + enemy.name + "."]));
            return;
        }
        else if (Adv.Adventurers[index].game_state == "walk")
        {
            // TODO parse
        }
        return;
    },
    
    map: function(arg, by, room) {
        if (room.charAt(0) === ',' || toId(by) === "mirf")
        {
            var text = '';
        }
        else {
            var text = '/pm ' + by + ", ";
        }
        var index = search(by, Adv.Adventurers);
        // If user is not in adventurer list
        if (index == -1) return;
        var char = Adv.Adventurers[index];
        var x = char.position.x;
        var y = char.position.y;
        var msg = "Current Position: ";
        if (y >= 0) 
            msg += y + "N, ";
        else
            msg += -1*y + "S, ";
        if (x >= 0)
            msg += x + "E";
        else
            msg += -1*x + "W";
        Bot.say(by, room, text + msg);
    },
    
    leave: 'quit',
    quit: function(arg, by, room) {
        if (room.charAt(0) === ',' || toId(by) === "mirf")
        {
            var text = '';
        }
        else {
            var text = '/pm ' + by + ", ";
        }
        if (arg.trim().toLowerCase() === "adventure" || arg.trim().toLowerCase() === "quest")
        {
            var index = search(by, Adv.Adventurers);
            // If user is not in adventurer list
            if (index != -1)
            {
                //Create a new character!
                var char = Adv.Adventurers[index];
                Adv.Adventurers.splice(index, 1);
                var message = "Goodbye, " + char.name + "!";
                Bot.say(by, room, text + message);
                return;
            }
        } 
    },
    
    Go: 'go',
    go: function(arg, by, room) {
        if (room.charAt(0) === ',' || toId(by) === "mirf")
        {
            var text = '';
        }
        else {
            var text = '/pm ' + by + ", ";
        }
        if (arg.trim().toLowerCase() === "away" || arg.trim().toLowerCase().indexOf("to hell") != -1) 
        {
            Bot.say(by, room, "Okay :c");
            Config.muted.push(by);
            return;
        }
        // After the 'go away' possibility, start parsing everything as adventuring
        var index = search(by, Adv.Adventurers);
        if (index == -1)
        {
            return;
        }
        var char = Adv.Adventurers[index];
        if (char.game_state == "walk")
        {
            if (arg.trim().toLowerCase() === "north")
            {
                Adv.Adventurers[index].position.y++;
                Bot.say(by, room, "You head north.");
            }
            else if (arg.trim().toLowerCase() === "south")
            {
                Adv.Adventurers[index].position.y--;
                Bot.say(by, room, "You head south.");
            }
            else if (arg.trim().toLowerCase() === "east")
            {
                Adv.Adventurers[index].position.x++;
                Bot.say(by, room, "You head east.");
            }
            else if (arg.trim().toLowerCase() === "west")
            {
                Adv.Adventurers[index].position.x--;
                Bot.say(by, room, "You head west.");
            }
            else if (arg.trim().toLowerCase() === "up")
            {
                Bot.say(by, room, text + "What are you doing? You're not a bird. You can't go up.");
                return;
            }
            else if (arg.trim().toLowerCase() === "down")
            {
                Bot.say(by, room, text + "You start digging. It's dark down here.");
                Adv.Adventurers[index].game_state = "down";
                return;
            }
            if (Math.random() < .2)
            {
                Adv.Adventurers[index].game_state = "fight";
                
                var msg = randomChoice(["Oh No!", "Oh geez.", "Ah!", "Ahh!", "", "Look out!", "Jeepers!"]);
                
                var enemy = Enemy.createEnemy(char)
                Adv.Adventurers[index].enemy = enemy;
                
                msg += " You ran into a level " + enemy.level + " " + enemy.name + randomChoice([".", "!"]) + " What will you do? [fight|inspect|run]";
                Bot.say(by, room, text + msg)
            }
        }
        else if (char.game_state == "down")
        {
            if (arg.trim().toLowerCase() === "down")
            {
                var msg = randomChoice(["Watch out for balrogs...", "Don't disturb the molepeople!", "Sorry, it's all up from here.", "Going down is what got you stuck here."]);
                Bot.say(by, room, text + msg);
            }
            else if (arg.trim().toLowerCase() === "up")
            {
                var msg = "You're back on solid ground!";
                Adv.Adventurers[index].game_state = "walk";
                Bot.say(by, room, text + msg);
            }
            else
            {
                Bot.say(by, room, text + "You're in a hole. You can't go anywhere.");
            }
        }
        else if (char.game_state == "fight")
        {
            Bot.say(by, room, text + "You can't back down from a challenge unless you run!");
            return;
        }
        // Random chance to encounter enemies, set game state
        return;
    },
    
    guide: function(arg, by, room) {
        if (room.charAt(0) === ',' || toId(by) === "mirf")
        {
            var text = '';
        }
        else {
            var text = '/pm ' + by + ", ";
        }
        console.log(arg, by, room);
        if (room == "trivia") return;
        var msg = "Welcome to a text-based RPG!";
        Bot.say(by, room, text + msg);
        msg = "Commands: @go [north|south|east|west], @inventory, @stats, @map, @start quest, @leave quest, @equip [item]";
        Bot.say(by, room, text + msg);
    }
}