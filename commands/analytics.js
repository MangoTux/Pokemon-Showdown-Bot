var Pokemon = require('./pokemon.js').Pokedex;
exports.commands = {
    /**
     * Analytical commands
     *
     * These commands are here to provide extended support for /ds, /dt, and /ms
     */
    sp: 'species',
    species: function(arg, by, room) {
        if (room.charAt(0) === ',') {
            var text_base = '';
        }
        else {
            var text_base = '/pm ' + by + ', ';
        }
        var pokemon = arg.replace(/\s/g, "").toLowerCase();
        if (pokemon == "")
        {
            text = "Usage: .species [pokemon]";
            Bot.say(by, room, text_base + text);
        }
        var result = Pokemon[pokemon];
        if (result == undefined) 
        {
            text = pokemon + " does not match any Pokemon in the database.";
            Bot.say(by, room, text_base + text);
            return;
        }
        text = "The " + result.species + " Pokemon"; // Testing
        Bot.say(by, room, text_base + text);
    },
    
    rsp: 'speciesreverse',
    spr: 'speciesreverse',
    c: 'speciesreverse',
    speciesreverse: function(arg, by, room) {
        if (room.charAt(0) === ',') 
            var text_base = ''
        else 
            var text_base = '/pm ' + by + ', ';
        var text;
        if (arg == "") 
        {
            text = "Usage: .speciesreverse [category]"; Bot.say(by, room, text_base + text); 
            return; 
        }
        
        var category = arg.toLowerCase().replace('pokemon', '').replace(/\s/g, "");
        if (category == "")
        {
            text = "Usage: .speciesreverse [category]"; Bot.say(by, room, text_base + text); return;
        }
        // Passes test, start searching now
        var match = [];
        for (var p in Pokemon)
        {
            if (Pokemon[p].formeLetter != undefined && Pokemon[p].num != 720) continue;
            
            if (Pokemon[p].species.toLowerCase().replace(/\s/g, "") == category)
            {
                match.push(Pokemon[p]);
            }
        }
        if (match.length == 0)
        {
            text = "No results found.";
        }
        else if (match.length > 25)
        {
            text = match.length + " results returned. Please narrow your search and try again.";        
        }
        else
        {
            text = match[0].name;
            for (var i=1; i<match.length; i++) {
                text += ", " + match[i].name;
            }
        }
        Bot.say(by, room, text_base + text);
    },
        
    ca: 'speciesreverseadvanced',
    categoryadvanced: 'speciesreverseadvanced',
    speciesreverseadvanced: function(arg, by, room) {
        console.log("CA command used.");
        if (room.charAt(0) === ',') 
            var text_base = ''
        else 
            var text_base = '/pm ' + by + ', ';
        console.log("Initial arguments: " + arg);
        var text;
        if (arg == "") 
        {
            text = "Usage: .speciesreverseadvanced [contains] [searchterm], [max/min] [stat]"; Bot.say(by, room, text_base + text); 
            return; 
        }
        arg_list = arg.split(',');
        var strict = true;
        var index = arg_list[0].indexOf("contains");
        if (index !== -1)
        {
            var contain_list = arg_list[index].split(' ');
            var contain_index = contain_list.indexOf("contains");
            if (contain_index == contain_list.length-1)
            {
                // Invalid range
                Bot.say(by, room, text_base + "Invalid search term.");
                return;
            }
            var category = contain_list.slice(contain_index+1).join(' ').toLowerCase().replace('pokemon').replace(/\s/g, "");
            strict = false;
        }
        else
        {
            var category = arg_list[0].toLowerCase().replace('pokemon', '').replace(/\s/g, "");
        }
        console.log("Category: " + category);
        
        // Min/Max stat values
        var statSearch = false;
        if (arg_list.length > 1 && arg_list[1].indexOf("min") != -1 && arg_list[1].indexOf("max") != -1) 
        {
            Bot.say(by, room, text_base + "Can't minmax search.");
            return;
        }
        else if (arg_list.length > 1 && arg_list[1].indexOf("min") > -1)
        {
            index = arg_list[1].indexOf("min");
            statSearch = true;
            var maxSearch = false;
        }
        else if (arg_list.length > 1 && arg_list[1].indexOf("max") > -1)
        {
            index = arg_list[1].indexOf("max");
            statSearch = true;
            var maxSearch = true;
        }
        if (statSearch)
        {
            var stat_list = arg_list[index].trim().split(' ');
            var stat_index = stat_list.indexOf(maxSearch?"max":"min");
            if (stat_index == stat_list.length-1)
            {
                Bot.say(by, room, text_base + "Invalid search order."); return;
            }
            console.log(stat_list); var statComparison = stat_list[stat_index+1].toLowerCase();
            if (["bst", "atk", "def", "spa", "spd", "spe", "hp"].indexOf(statComparison) == -1)
            {
                Bot.say(by, room, text_base + "Invalid stat parameter."); return;
            }
            console.log("Stats: " + (maxSearch?"Max ":"Min ") + statComparison);
        }
        
        if (category == "")
        {
            text = "Usage: .speciesreverse [category]"; Bot.say(by, room, text_base + text); return;
        }
        // Passes test, start searching now
        var match = [];
        for (var p in Pokemon)
        {
            if (Pokemon[p].formeLetter != undefined && Pokemon[p].num != 720) continue;
            
            if ((strict && Pokemon[p].species.toLowerCase().replace(/\s/g, "") == category) || (!strict && Pokemon[p].species.toLowerCase().replace(/\s/g, "").indexOf(category) !== -1))
            {
                if (match.length > 0 && statSearch)
                {
                    if (statComparison == "bst")
                    {
                        var compareBST = 0;
                        var currentBST = 0;
                        for (var stat in Pokemon[p].baseStats)
                        {
                            currentBST += Pokemon[p].baseStats[stat];
                        }
                        for (var stat in match[0].baseStats)
                        {
                            compareBST += match[0].baseStats[stat];
                        }
                        if ((maxSearch && compareBST < currentBST) || (!maxSearch && compareBST > currentBST))
                            match = [Pokemon[p]];
                        else if (currentBST == compareBST)
                            match.push(Pokemon[p]);
                    }
                    else
                    {
                        if ((maxSearch && Pokemon[p].baseStats[statComparison] > match[0].baseStats[statComparison]) || (!maxSearch && Pokemon[p].baseStats[statComparison] < match[0].baseStats[statComparison]))
                        {
                            match = [Pokemon[p]];
                        }
                        else if (Pokemon[p].baseStats[statComparison] == match[0].baseStats[statComparison])
                            match.push(Pokemon[p]);
                    }
                }
                else
                {
                    match.push(Pokemon[p]);
                }
            }
        }
        if (match.length == 0)
        {
            text = "No results found.";
        }
        else if (match.length > 25)
        {
            text = match.length + " results returned. Please narrow your search and try again.";        
        }
        else
        {
            text = match[0].name;
            for (var i=1; i<match.length; i++) {
                text += ", " + match[i].name;
            }
        }
        Bot.say(by, room, text_base + text);
    },
};