var Pokemon = require('./../objects/pokemon.js').Pokedex;
var PokemonMega = require('./../objects/pokemonmega.js').Pokedex;
var Moves = require('./../objects/moves.js').BattleMovedex;
var Types = require('./../objects/types.js').BattleTypeChart;
var Abilities = require('./../objects/abilities.js').BattleAbilities;
var Learnsets = require('./../objects/learnsets.js').BattleLearnsets;
var Aliases = require('./../objects/aliases.js').BattleAliases;

function BST(obj) {
    var sum = 0;
    for (var el in obj) {
        if (obj.hasOwnProperty(el)) {
            sum += parseFloat(obj[el]);
        }
    }
    return sum;
}

function toId(text) {
    if (text && text.id) {
        text = text.id;
    } else if (text && text.userid) {
        text = text.userid;
    }
    if (typeof text !== 'string' && typeof text !== 'number') return '';
    return ('' + text).toLowerCase().replace(/[^a-z0-9]+/g, '');
};

function getAbility(ability) {
    if (!ability || typeof ability === 'string') {
        var name = (ability || '').trim();
        var id = toId(name);
        ability = {};
        if (id && Abilities[id]) {
            ability = Abilities[id];
            if (ability.cached) return ability;
            ability.cached = true;
            ability.exists = true;
        }
        if (!ability.id) ability.id = id;
        if (!ability.name) ability.name = name;
        if (!ability.fullname) ability.fullname = 'ability: ' + ability.name;
        ability.toString = this.effectToString;
        if (!ability.category) ability.category = 'Effect';
        if (!ability.effectType) ability.effectType = 'Ability';
    }
    return ability;
};

function getMove(move) {
    if (!move || typeof move === 'string') {
        var name = (move).trim();
        var id = toId(name);
        move = {};
        if (id.substr(0, 11) === 'hiddenpower') {
            var matches = /([a-z]*)([0-9]*)/.exec(id);
            id = matches[1];
        }
        if (id && Moves[id]) {
            move = Moves[id];
            if (move.cached) return move;
            move.cached = true;
            move.exists = true;
        }
        if (!move.id) move.id = id;
        if (!move.name) move.name = name;
        if (!move.fullname) move.fullname = 'move: ' + move.name;
        move.toString = this.effectToString;
        if (!move.critRatio) move.critRatio = 1;
        if (!move.baseType) move.baseType = move.type;
        if (!move.effectType) move.effectType = 'Move';
        if (!move.secondaries && move.secondary)    move.secondaries = [move.secondary];
        if (!move.priority) move.priority = 0;
        if (move.ignoreImmunity === undefined) move.ignoreImmunity = (move.category === 'Status');
        if (!move.flags) move.flags = {};
    }
    return move;
};

function getTemplate(template) 
{
    if (!template || typeof template === 'string') {
        var name = (template || '').trim();
        var id = toId(name);
        if (Aliases[id]) {
            name = Aliases[id];
            id = toId(name);
        }
        template = {};
        if (id && Pokemon[id]) {
            template = Pokemon[id];
            if (template.cached) return template;
            template.cached = true;
            template.exists = true;
        }
        name = template.species || template.name || name;
        if (Learnsets[id]) {
            Object.assign(template, Learnsets[id]);
        }
        if (!template.id) template.id = id;
        if (!template.name) template.name = name;
        if (!template.speciesid) template.speciesid = id;
        if (!template.baseSpecies) template.baseSpecies = name;
        if (!template.prevo) template.prevo = '';
        if (!template.evos) template.evos = [];
    }
    return template;
};

function getEffectiveness(source, target) {
    var sourceType = source.type || source;
    var totalTypeMod = 0;
	var targetTyping = target.getTypes && target.getTypes() || target.types || target;
    if (Array.isArray(targetTyping)) {
        for (var i = 0; i < targetTyping.length; i++) {
            totalTypeMod += getEffectiveness(sourceType, targetTyping[i]);
        }
        return totalTypeMod;
    }
    var typeData = Types[targetTyping];
    if (!typeData) return 0;
    switch (typeData.damageTaken[sourceType]) {
        case 1: return 1; // super-effective
		case 2: return -1; // resist
		// in case of weird situations like Gravity, immunity is
		// handled elsewhere
		default: return 0;
    }
};

function getImmunity(source, target) 
{
    // returns false if the target is immune; true otherwise
    // also checks immunity to some statuses
    var sourceType = source.type || source;
    var targetTyping = target.getTypes && target.getTypes() || target.types || target;
    if (Array.isArray(targetTyping)) {
        for (var i = 0; i < targetTyping.length; i++) {
            if (!getImmunity(sourceType, targetTyping[i])) return false;
        }
        return true;
    }
    var typeData = Types[targetTyping];
    if (typeData && typeData.damageTaken[sourceType] === 3) return false;
    return true;
};

/*
@param lhs The left-hand side of the evaluation to parse 
@param rhs The right-hand side of the evaluation to parse
@param pokemon The pokemon object where data will be filled in
*/
function evaluate(lhs, rhs, comparison, pokemon)
{
    // Fill in parameters
    var hp =pokemon.baseStats.hp;
    var health=hp;
    var atk=pokemon.baseStats.atk;
    var attack=atk;
    var def=pokemon.baseStats.def;
    var defense=def;
    var spa=pokemon.baseStats.spa;
    var specialattack=spa;
    var spd=pokemon.baseStats.spd;
    var specialdefense = spd;
    var spe=pokemon.baseStats.spe;
    var speed = spe;
    var bst=0;
    for (stat in pokemon.baseStats) { bst += pokemon.baseStats[stat]; }
    var wgt=pokemon.weightkg;
    var weight = wgt;
    var hgt=pokemon.heightm;
    var height = hgt;
    var dex=pokemon.num;
    
    try {
        return eval(lhs + comparison + rhs);
    }  catch (e) {
        return false;
    }
}

exports.commands = {
    /**
     * Analytical commands
     *
     * These commands are here to provide extended support for /ds, /dt, and /ms
     */
    head: function(arg, by, room, hasPipeOut, argIn) {
        if (room.charAt(0) === ',' || by.trim().toLowerCase() == "mirf" || hasPipeOut) {
            var text_base = '';
        }    
        else {
            var text_base = '/pm ' + by + ', ';
        }
        if (argIn == "")
        {
            Bot.say(by, room, text_base + "``head`` requires input.");
            return -1;
        }
        var numLines = 10;
        if (arg.indexOf('-n') == 0)
        {
            arg = arg.substr(2).trim();
            numLines = parseFloat(arg) || 10;
        }
        argIn =  argIn.split("\n").splice(0, numLines).join(hasPipeOut?"\n":", ");
        if (argIn.length < 200 || hasPipeOut)
            return text_base + argIn;
        Bot.say(by, room, text_base + "Maximum length exceeded. Please narrow results and try again.");
        return -1;
    },
    
    tail: function(arg, by, room, hasPipeOut, argIn) {
        if (room.charAt(0) === ',' || by.trim().toLowerCase() == "mirf" || hasPipeOut) {
            var text_base = '';
        }    
        else {
            var text_base = '/pm ' + by + ', ';
        }
        if (argIn == "")
        {
            Bot.say(by, room, text_base + "``tail`` requires input.");
            return -1;
        }
        var numLines = 10;
        if (arg.indexOf('-n') == 0)
        {
            arg = arg.substr(2).trim();
            numLines = parseFloat(arg) || 10;
        }
        argIn =  argIn.split("\n").splice(-1*numLines).join(hasPipeOut?"\n":", ");
        if (argIn.length < 200 || hasPipeOut)
            return text_base + argIn;
        Bot.say(by, room, text_base + "Maximum length exceeded. Please narrow results and try again.");
        return -1;
    },
    
    ls: function(arg, by, room, hasPipeOut, argIn) {
        if (room.charAt(0) === ',' || by.trim().toLowerCase() == "mirf") {
            var text_base = '';
        }
        else {
            var text_base = '/pm ' + by + ', ';
        }
        
        var text = "Pokemon | Moves | Types | Abilities";
        return text_base + text;
    },
    grep: function(arg, by, room, hasPipeOut, argIn) {
        if (room.charAt(0) === ',' || by.trim().toLowerCase() == "mirf" || hasPipeOut) {
            var text_base = '';
        }
        else {
            var text_base = '/pm ' + by + ", ";
        }
        if (argIn=="")
        {
            Bot.say(by, room, text_base + "``grep`` is used to filter an input list. Please provide an input file using ``cat``.");
            return -1;
        }
        var ignoreCase = false;
        var inverse = false;
        if (arg.indexOf('-') == 0)
        {
            arg = arg.substr(1);
            while (arg.length > 0 && arg.charAt(0) != ' ')
            {
                switch (arg.charAt(0))
                {
                    case 'i':
                    case 'I': ignoreCase = true; break;
                    case 'v':
                    case 'V': inverse = true; break;
                    default: Bot.say(by, room, text_base + '-' + arg.charAt(0) + " is not a valid flag."); return -1;
                }
                arg = arg.substr(1);
            }
            arg = arg.trim();
        }
        try {
             reg = new RegExp(arg);
        } catch (err) {
            Bot.say(by, room, text_base + arg + " did not contain a valid regular expression.");
            return -1;
        }
        var text = [];
        var argList = argIn.split("\n");
        for (var i in argList)
        {
            if (reg.test(ignoreCase?toId(argList[i]):argList[i]) == !inverse)
            {
                text.push(argList[i]);
            }
        }
        if (text.length == 0)
        {
            Bot.say(by, room, text_base + "No results returned.");
            return -1;
        }
        if (hasPipeOut)
        {
            return text_base + text.join("\n");
        }
        else
        {
            text = text.join(", ");
            if (text.length < 120)
            {
                return text_base + text;
            }
            else
                return text_base + "Size limit exceeded. Please narrow your search term.";
        }
        return text_base + text;
    },
    cat: function(arg, by, room, hasPipeOut, argIn) {
        if (room.charAt(0) === ',' || by.trim().toLowerCase() == "mirf" || hasPipeOut) {
            var text_base = '';
        }
        else {
            var text_base = '/pm ' + by + ', ';
        }
        if (!hasPipeOut) {
            var text = "``cat`` sends too much output. Please use ``grep`` to process data.";
            Bot.say(by, room, text_base + text);
            return -1;
        }
        var text = ""; // Pipe out will split 
        switch (toId(arg))
        {
            case "pokemon": 
                for (var p in Pokemon)
                {
                    text += Pokemon[p].name + "\n";
                }
                return text.replace(/\n$/, "");
                break;
            case "moves": 
                for (var p in Moves)
                {
                    text += Moves[p].name + "\n";
                }
                return text.replace(/\n$/, "");
                break;
            case "types": 
                for (var p in Types)
                {
                    text += p + "\n";
                }
                return text.replace(/\n$/, "");
                break;
            case "abilities": 
                for (var p in Abilities)
                {
                    text += Abilities[p].name + "\n";
                }
                return text.replace(/\n$/, "");
                break;
            default:
                Bot.say(by, room, arg + ": Not found.");
                return -1;
        }
    },
    re: 'regex',
    regex: function(arg, by, room, hasPipeOut, argIn) {
        if (room.charAt(0) === ',' || by.trim().toLowerCase() == "mirf") {
            var text_base = '';
        }
        else {
            var text_base = '/pm ' + by + ', ';
        }
        if (hasPipeOut) {
            Bot.say(by, room, text_base + "regex does not support the use of piping.");
            return -1;
        }
        var text;
        var reg;
        
        try {
             reg = new RegExp(arg);
        } catch (err) {
            Bot.say(by, room, text_base + arg + " did not contain a valid regular expression.");
            return -1;
        }
        var dex = [];
        for (var pokemon in Pokemon)
        {
            if (reg.test(Pokemon[pokemon].name.toLowerCase()))
            {
                dex.push(Pokemon[pokemon].name);
            }
        }
        if (dex.length == 0)
        {
            text = "No pokemon matched the expression.";
        }
        else if (dex.length == 1)
        {
            text = dex[0];
        }
        else if (dex.length > 15 && room.charAt(0) != ",")
        {
            text = dex.length + " results. Please narrow your search.";
        }
        else
        {
            text = dex.splice(0, dex.length-1).join(", ") + ", and " + dex[dex.length-1];
        }
        return text_base + text;
    },
    
    weak: 'weakness',
    weakness: function(arg, by, room, hasPipeOut, argIn) {
        if (room.charAt(0) === ',' || by.trim().toLowerCase() == "mirf") {
            var text_base = '';
        }    
        else {
            var text_base = '/pm ' + by + ', ';
        }
        if (hasPipeOut) {
            Bot.say(by, room, text_base + "weakness does not support the use of piping.");
            return -1;
        }
        // In the future, allow options for abilities to add immunities/weaknesses
        
        var allTypes = ["Bug", "Dark", "Dragon", "Electric", "Fairy", "Fighting", "Fire", "Flying", "Ghost", "Grass", "Ground", "Ice", "Normal", "Poison", "Psychic", "Rock", "Steel", "Water"];
        var tempList = arg.split('/');
        // The final type list is here
        var typeList = [];
        
        var hasAll = -1;
        for (var i in tempList)
        {
            if (toId(tempList[i]) == "all")
            {
                var hasAll = tempList.indexOf(tempList[i]);
                break;
            }
        }
        
        if (hasAll != -1)
        {
            typeList = allTypes;
            for (var i in tempList)
            {
                var element = toId(tempList[i]);
                if (element == "" || element == "all")
                {
                    continue;
                }
                if (PokemonMega[element] != undefined)
                {
                    for (var j in PokemonMega[element].types)
                    {
                        if (typeList.indexOf(PokemonMega[element].types[j]) != -1)
                            typeList.splice(typeList.indexOf(PokemonMega[element].types[j]), 1);
                    }
                }
                else if (typeList.indexOf("Grass") != -1 && (element == "forestcurse" || element == "forestscurse"))
                {
                    typeList.splice(typeList.indexOf("Grass"), 1);
                }
                else if (typeList.indexOf("Ghost") != -1 && (element == "tricktreat" || element == "trickortreat"))
                {
                    typeList.splice(typeList.indexOf("Ghost"), 1);
                }
                // Check for types now
                var typeIndex = typeList.indexOf(element[0].toUpperCase() + element.substr(1));
                if (typeIndex > -1)
                {
                    typeList.splice(typeIndex, 1);
                }
            }   
        }
        else
        {
            for (var i in tempList)
            {
                var element = toId(tempList[i]);
                if (element == "")
                {
                    continue;
                }
                if (PokemonMega[element] != undefined)
                {
                    for (var j in PokemonMega[element].types)
                    {
                        typeList.push(PokemonMega[element].types[j]);
                    }
                }
                else if (element == "forestcurse" || element == "forestscurse")
                {
                    typeList.push("Grass");
                }
                else if (element == "trickortreat" || element == "tricktreat")
                {
                    typeList.push("Ghost");
                }
                // Check for types now
                var typeIndex = allTypes.indexOf(element[0].toUpperCase() + element.substr(1));
                if (typeIndex > -1)
                {
                    typeList.push(allTypes[typeIndex]);
                }
            }
        }
        
        //TODO remove duplicates
        for (var i in typeList)
        {
            if (typeList.indexOf(typeList[i]) != i)
                typeList.splice(i, 1);
        }
        // In the future, all with any other parameter starts all, and then removes other elements
        
        var total_weakness = {
			"Bug": 0,
			"Dark": 0,
			"Dragon": 0,
			"Electric": 0,
			"Fairy": 0,
			"Fighting": 0,
			"Fire": 0,
			"Flying": 0,
			"Ghost": 0,
			"Grass": 0,
			"Ground": 0,
			"Ice": 0,
			"Normal": 0,
			"Poison": 0,
			"Psychic": 0,
			"Rock": 0,
			"Steel": 0,
			"Water": 0,
        }
        
        // Build the type matchup, summing for each element
        for (var type in typeList)
        {
            if (allTypes.indexOf(typeList[type]) == -1)
            {
                return text_base + "'" + typeList[type] + "' is not a recognized type.";
            } 
            for (var type2 in allTypes) 
            {
                switch (Types[typeList[type]].damageTaken[allTypes[type2]])
                {
                    case 0: break;
                    case 1:
                        if (total_weakness[allTypes[type2]] != -20) {
                            total_weakness[allTypes[type2]]++;
                        }  
                        break;
                    case 2:
                        if (total_weakness[allTypes[type2]] != -20) {
                            total_weakness[allTypes[type2]]--;
                        } 
                        break;
                    case 3:
                        total_weakness[allTypes[type2]] = -20; 
                        break;
                }
            }
        }
        
        var results_sorted = [];
        for(var a in total_weakness)
        {
            if (total_weakness[a] != 0) 
                results_sorted.push([a,total_weakness[a]])
        }
        
        results_sorted.sort(function(a,b){return a[1] - b[1]});
        results_sorted.reverse();
        var weakness = [];
        var text = typeList.join("/") + ":";
        
        text += "\n" + text_base + "**Weaknesses:** ";
        var i=0; 
        while (i < results_sorted.length && results_sorted[i][1] > 0)
        {
            weakness.push(results_sorted[i][0] + " (x" + Math.pow(2, results_sorted[i][1]) + ")");
            i++;
        }
        if (weakness.length == 0)
            text += "__None__";
        else
            text += weakness.join(", ");

        var resist = [];
        text += "\n" + text_base + "**Resistances:** ";
        while (i < results_sorted.length && results_sorted[i][1] != -20)
        {
            resist.push(results_sorted[i][0] + " (x1/" + Math.pow(2, (-1*results_sorted[i][1])) + ")");
            i++
        }
        if (resist.length == 0)
            text += "__None__";
        else
            text += resist.join(", ");
        
        var immune = [];
        text += "\n" + text_base + "**Immunities:** ";
        while (i < results_sorted.length)
        {
            immune.push(results_sorted[i][0]);
            i++;
        }
        if (immune.length == 0)
            text += "__None__";
        else
            text += immune.join(", ");
        return text_base + text;
    },
    
    sp: 'species',
    species: function(arg, by, room, hasPipeOut, argIn) {
        if (room.charAt(0) === ',' || by.trim().toLowerCase() == "mirf") {
            var text_base = '';
        }
        else {
            var text_base = '/pm ' + by + ', ';
        }
        if (hasPipeOut) {
            Bot.say(by, room, text_base + "species does not support the use of piping.");
            return -1;
        }
        var pokemon = toId(arg.replace(/\s/g, "").toLowerCase());
        if (pokemon == "")
        {
            text = "Usage: .species [pokemon]";
            return text_base + text;
        }
        var result = Pokemon[pokemon];
        if (result == undefined) 
        {
            text = pokemon + " does not match any Pokemon in the database.";
            return text_base + text;
        }
        text = "The " + result.species + " Pokemon"; // Testing
        return text_base + text;
    },
        
    ca: 'speciesreverseadvanced',
    categoryadvanced: 'speciesreverseadvanced',
    speciesreverseadvanced: function(arg, by, room, hasPipeOut, argIn) {
        if (room.charAt(0) === ',' || by.trim().toLowerCase() == "mirf" || hasPipeOut) 
            var text_base = '';
        else 
            var text_base = '/pm ' + by + ', ';
        var text;
        if (arg == "") 
        {
            text = "Usage: .speciesreverseadvanced [contains] [searchterm], [max/min] [stat]"; 
            Bot.say(by, room, text_base + text);
            return -1;
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
                return -1;
            }
            var category = contain_list.slice(contain_index+1).join(' ').toLowerCase().replace('pokemon').replace(/\s/g, "");
            strict = false;
        }
        else
        {
            var category = arg_list[0].toLowerCase().replace('pokemon', '').replace(/\s/g, "");
        }
        
        // Min/Max stat values
        var statSearch = false;
        if (arg_list.length > 1 && arg_list[1].indexOf("min") != -1 && arg_list[1].indexOf("max") != -1) 
        {
            Bot.say(by, room, text_base + "Can't minmax search");
            return -1;
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
                Bot.say(by, room, text_base + "Invalid search order.");
                return -1;
            }
            var statComparison = stat_list[stat_index+1].toLowerCase();
            if (["bst", "atk", "def", "spa", "spd", "spe", "hp"].indexOf(statComparison) == -1)
            {
                Bot.say(by, room, text_base + "Invalid stat parameter");
                return -1;
            }
        }
        
        if (category == "")
        {
            text = "Usage: .speciesreverse [category]";
            return text_base + text;
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
        for (var i=0; i<match.length; i++)
        {
            match[i] = match[i].name;
        }
        if (match.length == 0)
        {
            Bot.say(by, room, text_base + "No results found.");
            return -1;
        }
        else if (match.length > 25 && !hasPipeOut)
        {
            Bot.say(by, room, text_base + match.length + " results returned. Please narrow your search and try again.");
            return -1;
        }
        else
        {
            text = match.join(hasPipeOut?"\n":", ");
        }
        return text_base + text;
    },
   
    mixandmega: 'mnm',
    mnm: function(arg, by, room, hasPipeOut, argIn) {
        if (room.charAt(0) === ',' || by.trim().toLowerCase() == "mirf")
            var text_base = '';
        else
            var text_base = '/pm ' + by + ', ';
        if (hasPipeOut) {
            Bot.say(by, room, text_base + "mnm does not support the use of piping.");
            return -1;
        }
        var text;
        var pokemon_list = arg.split(' ');
        
        var stats = {hp:0, atk:0, def:0, spa:0, spd:0, spe:0};
        if (pokemon_list.length <= 1)
        {
            text = "Usage: .mnm [pokemon] [pokemon] <[pokemon]...>";
            return text_base + text;
        }
        
        if (pokemon_list.length >= 2)
        {
            var meganame = pokemon_list[0].replace(/\s/g, "").toLowerCase();
            var form = "";
            if (meganame.indexOf("charizard") > -1 || meganame.indexOf("mewtwo") > -1 && (meganame.charAt(meganame.length-1) == 'x' || meganame.charAt(meganame.length-1) == 'y'))
            {
                //Charizard and mewtwo both have x and y forms
                form = "mega" + meganame.charAt(meganame.length-1);
                meganame = meganame.substring(0, meganame.length - 1);
            }
            else if (meganame.indexOf("kyogre") > -1 || meganame.indexOf("groudon") > -1)
            {
                form = "primal";
            }
            else
            {
                form = "mega";
            }
            var premega = PokemonMega[meganame];   
            if (premega == undefined)
            {
                return text_base + premega + " is not a recognized Pokemon.";
            }
            var meganame = meganame + form;
            var postmega = PokemonMega[meganame];
            if (postmega == undefined)
            {
                return text_base + premega.species + " does not have a mega form.";
            }
            for (var i = 1; i < pokemon_list.length; i++)
            {
                var compare = PokemonMega[pokemon_list[i]];
                if (compare == undefined)
                {
                    text += "\n" + text_base + pokemon_list[i] + " is not a recognized Pokemon.";
                    continue;
                }
                stats.hp = compare.baseStats.hp + postmega.baseStats.hp - premega.baseStats.hp;
                stats.atk = compare.baseStats.atk + postmega.baseStats.atk - premega.baseStats.atk;
                stats.def = compare.baseStats.def + postmega.baseStats.def - premega.baseStats.def;
                stats.spa = compare.baseStats.spa + postmega.baseStats.spa - premega.baseStats.spa;
                stats.spd = compare.baseStats.spd + postmega.baseStats.spd - premega.baseStats.spd;
                stats.spe = compare.baseStats.spe + postmega.baseStats.spe - premega.baseStats.spe;
                var formModifier = "";
                if (form == "primal")
                    formModifier = "-Primal";
                else
                    formModifier = "-Mega" + (form!="mega"?"-"+form.toUpperCase():"");
                text += "\n" + text_base + "Results for " + compare.species + " being boosted by " + premega.species + formModifier + " stats:";
                text += "\n" + text_base + "[" + stats.hp + "|" + stats.atk + "|" + stats.def + "|" + stats.spa + "|" + stats.spd + "|" + stats.spe + "]";
                text += " [" + postmega.abilities[0] + "]";
                if (JSON.stringify(premega.types) != JSON.stringify(postmega.types))
                {
                    var secondType = "|" + postmega.types[postmega.types.length-1];
                    var type = compare.types[0] + secondType;
                }
                else
                {
                    var type = compare.types.join("|");
                }
                text += " ["+type+"]";
                return text_base + text;
            }
            return;
        }
    },
    
    mega: function(arg, by, room, hasPipeOut, argIn) {
        if (room.charAt(0) === ',' || by.trim().toLowerCase() == "mirf")
            var text_base = '';
        else
            var text_base = '/pm ' + by + ', ';
        if (hasPipeOut) {
            Bot.say(by, room, text_base + "mega does not support the use of piping.");
            return -1;
        }
        var text;
        var pokemon_list = arg.split(' ');
        
        var stats = {hp:0, atk:0, def:0, spa:0, spd:0, spe:0};
        if (pokemon_list.length == 0)
        {
            text = "Usage: .mega [pokemon] <[pokemon] ...>";
            return text_base + text;
        }
        
        if (pokemon_list.length == 1)
        {
            var meganame = pokemon_list[0].replace(/\s/g, "").toLowerCase();
            var form = "";
            if (meganame.indexOf("charizard") > -1 || meganame.indexOf("mewtwo") > -1 && (meganame.charAt(meganame.length-1) == 'x' || meganame.charAt(meganame.length-1) == 'y'))
            {
                //Charizard and mewtwo both have x and y forms
                form = "mega" + meganame.charAt(meganame.length-1);
                meganame = meganame.substring(0, meganame.length - 1);
            }
            else if (meganame.indexOf("kyogre") > -1 || meganame.indexOf("groudon") > -1)
            {
                form = "primal";
            }
            else
            {
                form = "mega";
            }
            var premega = PokemonMega[meganame];  
            if (premega == undefined)
            {
                return text_base + meganame + " is not a recognized Pokemon.";
            }
            meganame = meganame + form;
            var postmega = PokemonMega[meganame];
            if (postmega == undefined)
            {
                return text_base + premega.species + " does not have a mega form.";
            }
                                       
            stats.hp     = postmega.baseStats.hp - premega.baseStats.hp;
            stats.atk = postmega.baseStats.atk - premega.baseStats.atk;
            stats.def = postmega.baseStats.def - premega.baseStats.def;
            stats.spa = postmega.baseStats.spa - premega.baseStats.spa;
            stats.spd = postmega.baseStats.spd - premega.baseStats.spd;
            stats.spe = postmega.baseStats.spe - premega.baseStats.spe;
                                       
            for (var key in stats){
                stats[key] = (stats[key]>=0?"+"+stats[key]:stats[key]);
            }
            text = "[" + stats.hp + "|" + stats.atk + "|" + stats.def + "|" + stats.spa + "|" + stats.spd + "|" + stats.spe + "]";
            var formModifier = "";
            if (form == "primal")
                formModifier = "-Primal";
            else
                formModifier = "-Mega" + (form!="mega"?"-"+form.toUpperCase():"");
            text = text_base + "Stat changes between " + premega.species + " and " + premega.species + formModifier + ":\n" + text_base + text;
            return text;
        }
        else if (pokemon_list.length >= 2)
        {
            var meganame = pokemon_list[0].replace(/\s/g, "").toLowerCase();
            var form = "";
            if (meganame.indexOf("charizard") > -1 || meganame.indexOf("mewtwo") > -1 && (meganame.charAt(meganame.length-1) == 'x' || meganame.charAt(meganame.length-1) == 'y'))
            {
                //Charizard and mewtwo both have x and y forms
                form = "mega" + meganame.charAt(meganame.length-1);
                meganame = meganame.substring(0, meganame.length - 1);
            }
            else if (meganame.indexOf("kyogre") > -1 || meganame.indexOf("groudon") > -1)
            {
                form = "primal";
            }
            else
            {
                form = "mega";
            }
            var premega = PokemonMega[meganame];   
            if (premega == undefined)
            {
                return text_base + premega + " is not a recognized Pokemon.";
            }
            var meganame = meganame + form;
            var postmega = PokemonMega[meganame];
            if (postmega == undefined)
            {
                return text_base + premega.species + " does not have a mega form.";
            }
            for (var i = 1; i < pokemon_list.length; i++)
            {
                var compare = PokemonMega[pokemon_list[i]];
                if (compare == undefined)
                {
                    return text_base + pokemon_list[i] + " is not a recognized Pokemon.";
                }
                stats.hp = compare.baseStats.hp + postmega.baseStats.hp - premega.baseStats.hp;
                stats.atk = compare.baseStats.atk + postmega.baseStats.atk - premega.baseStats.atk;
                stats.def = compare.baseStats.def + postmega.baseStats.def - premega.baseStats.def;
                stats.spa = compare.baseStats.spa + postmega.baseStats.spa - premega.baseStats.spa;
                stats.spd = compare.baseStats.spd + postmega.baseStats.spd - premega.baseStats.spd;
                stats.spe = compare.baseStats.spe + postmega.baseStats.spe - premega.baseStats.spe;
                text = "[" + stats.hp + "|" + stats.atk + "|" + stats.def + "|" + stats.spa + "|" + stats.spd + "|" + stats.spe + "]";
               
                var formModifier = "";
                if (form == "primal")
                    formModifier = "-Primal";
                else
                    formModifier = "-Mega" + (form!="mega"?"-"+form.toUpperCase():"");
                return text_base + "Results for " + compare.species + " being boosted by " + premega.species + formModifier + " stats:\n" + text_base + text;
            }
            return;
        }
    },
    
    ds: 'dexsearch',
	dsearch: 'dexsearch',
	dexsearch: function(arg, by, room, hasPipeOut, argIn) {
        if (room.charAt(0) === ',' || by.trim().toLowerCase() == "mirf" || hasPipeOut) 
            var text_base = '';
        else 
            var text_base = '/pm ' + by + ', ';
        var text = [];
        
        var searches = [];
        // All colors of pokemon
        var allColours = {'green':1, 'red':1, 'blue':1, 'white':1, 'brown':1, 'yellow':1, 'purple':1, 'pink':1, 'gray':1, 'black':1};
        // Searchable stats
        var allStats = {'hp':1, 'atk':1, 'def':1, 'spa':1, 'spd':1, 'spe':1, 'bst':1, 'wgt':1, 'hgt':1};
        // All egg group categories
        var allEggs = {'monster':'Monster', 'grass':'Grass', 'dragon':'Dragon', 'water1':'Water 1', 'bug':'Bug', 'flying':'Flying', 'field':'Field','fairy':'Fairy','undiscovered':'Undiscovered','humanlike':'Human-Like','water3':'Water 3','mineral':'Mineral','amorphous':'Amorphous','water2':'Water 2','ditto':'Ditto'};
        var strict = true;
        var minmax = {'isMinMax':false, 'type':'none', 'stat':'none'};
        var category = {'isCat':false, 'isStrict':true, 'cat':0};
        var evos = 0;
        var prevo = 0;
        var andGroups = arg.split(',');
        for (var i = 0; i < andGroups.length; i++) 
        {
            var orGroup = {abilities: {}, tiers: {}, colors: {}, gens: {}, types: {}, resists: {}, categories: {}, eggGroups: {}, stats: {}, evoSearch: false, prevoSearch: false, minmax: false, skip: false, cat: false};
            var parameters = andGroups[i].split("|");
            if (parameters.length > 3) 
            {
                Bot.say(by, room, text_base + "No more than 3 alternatives for each parameter may be used.");
                return -1;
            }
            
            for (var j = 0; j < parameters.length; j++) 
            {
                var isNotSearch = false;
                target = parameters[j].trim().toLowerCase();
                if (target.charAt(0) === '!') {
                    isNotSearch = true;
                    target = target.substr(1);
                }
            
                var targetAbility = getAbility(target);
                if (targetAbility.exists) {
                    console.log(targetAbility);
                    orGroup.abilities[targetAbility.name] = !isNotSearch; continue;
                }

                if (target in allColours) {
                    target = target.charAt(0).toUpperCase() + target.slice(1);
                    orGroup.colors[target] = !isNotSearch;
                    continue;
                }
                if (target.substr(0, 3) === 'evo')
                {
                    orGroup.evoSearch = true;
                    if (isNotSearch)
                        evos = -1;
                    else
                        evos = 1;
                    continue;
                }
                
                if (target.substr(0, 5) === 'prevo')
                {
                    orGroup.prevoSearch = true;
                    if (isNotSearch)
                        prevo = -1;
                    else
                        prevo = 1;
                    continue;
                }
                
                if (target.substr(0, 8) === 'resists ') 
                {
                    var targetResist = target.substr(8, 1).toUpperCase() + target.substr(9);
                    if (targetResist in Types)
                    {
                        orGroup.resists[targetResist] = !isNotSearch;
                        continue;
                    } 
                    else 
                    {
                        Bot.say(by, room, text_base + targetResist + " is not a recognized type.");
                        return -1;
                    }
                }
                if (target.substr(0, 3) === "ca ")
                {
                    category.isCat = true;
                    target = target.substr(3);
                    if (target.substr(0, 9) === "contains ")
                    {
                        target = target.substr(9);
                        category.isStrict = false;
                    }
                    category.cat = target.toLowerCase().replace('pokemon', '').replace(/\s/g, "");
                    orGroup.cat = true;
                    continue;
                }
                
                if (target.substr(0, 4) === "min " || target.substr(0, 4) === "max ")
                {
                    if (orGroup.minmax)
                    {
                        Bot.say(by, room, text_base + " You cannot use multiple min/max terms in the same query.");
                        return -1;
                    }
                    minmax["isMinMax"] = true;
                    minmax["type"] = target.substr(0, 4).trim();
                    stat = target.substr(4).trim();
                    switch (toId(stat))
                    {
                        case 'attack': stat = 'atk'; break;
                        case 'defense': stat = 'def'; break;
                        case 'specialattack': stat = 'spa'; break;
                        case 'spatk': stat = 'spa'; break;
                        case 'specialdefense': stat = 'spd'; break;
                        case 'spdef': stat = 'spd'; break;
				        case 'speed': stat = 'spe'; break;
                        case 'weight': stat = 'wgt'; break;
                        case 'height': stat = 'hgt'; break;
                    }
                    if (!(stat in allStats))
                    {
                        Bot.say(by, room, text_base + target + " did not contain a valid stat.");
                        return -1;
                    }
                    minmax["stat"] = stat;
                    orGroup.minmax = true;
                    continue;
                }
                
                // Ability check
                // TODO
                
                var typeIndex = target.indexOf(' type');
                if (typeIndex >= 0)
                {
                    target = target.charAt(0).toUpperCase() + target.substring(1, typeIndex);
                    if (target in Types)
                    {
                        orGroup.types[target] = !isNotSearch;
                        continue;
                    }
                    else
                    {
                        Bot.say(by, room, text_base + target + " is not a recognized type.");
                        return -1;
                    }
                }
                
                if (target.substr(-4) === ' egg')
                {
                    target = toId(target.substr(0, target.length-4));
                    if (target in allEggs)
                    {
                        orGroup.eggGroups[target] = !isNotSearch;
                        continue;
                    }
                    else
                    {
                        Bot.say(by, room, text_base + target + " is not a recognized egg group.");
                        return -1;
                    }
                }
                
                var inequality = target.search(/>|<|=/);
                if (inequality >= 0)
                {
                    if (isNotSearch)
                    {
                        Bot.say(by, room, text_base + "You cannot use the negation symbol '!' in stat ranges.");
                        return -1;
                    }
                    if (target.charAt(inequality + 1) === '=')
                    {
                        inequality = target.substr(inequality, 2);
                    }
                    else
                    {
                        inequality = target.charAt(inequality);
                    }
                    
				    var inequalityOffset = (inequality.charAt(1) === '=' ? 0 : -1);
                    var targetParts = target.replace(/\s/g, '').split(inequality);

                    var num, stat, direction;
                    if (!isNaN(targetParts[0])) 
                    {
                        // e.g. 100 < spe
                        num = parseFloat(targetParts[0]);
                        stat = targetParts[1];
                        switch (inequality.charAt(0)) 
                        {
                            case '>': direction = 'less'; num += inequalityOffset; break;
                            case '<': direction = 'greater'; num -= inequalityOffset; break;
                            case '=': direction = 'equal'; break;
                        }
                    } 
                    else if (!isNaN(targetParts[1])) 
                    {
                        // e.g. spe > 100
                        num = parseFloat(targetParts[1]);
                        stat = targetParts[0];
                        switch (inequality.charAt(0)) 
                        {
                           case '<': direction = 'less'; num += inequalityOffset; break;
                            case '>': direction = 'greater'; num -= inequalityOffset; break;
                            case '=': direction = 'equal'; break;
                        }
                    }
                    else
                    {
                        Bot.say(by, room, text_base + "No value given to compare with '" + target + "'.");
                        return -1;
                    }
                    switch (toId(stat))
                    {
                        case 'attack': stat = 'atk'; break;
                        case 'defense': stat = 'def'; break;
                        case 'specialattack': stat = 'spa'; break;
                        case 'spatk': stat = 'spa'; break;
                        case 'specialdefense': stat = 'spd'; break;
                        case 'spdef': stat = 'spd'; break;
				        case 'speed': stat = 'spe'; break;
                        case 'weight': stat = 'wgt'; break;
                        case 'height': stat = 'hgt'; break;
                    }
                    if (!(stat in allStats))
                    {
                        Bot.say(by, room, text_base + target + " did not contain a valid stat.");
                        return -1;
                    }
                    if (!orGroup.stats[stat])
                        orGroup.stats[stat] = {};
                    if (orGroup.stats[stat][direction])
                    {
                        Bot.say(by, room, text_base + "Invalid stat range for " + stat + ".");
                        return -1;
                    }
                    orGroup.stats[stat][direction] = num;
                    continue;
                }
                Bot.say(by, room, text_base + target + " could not be found in any of the search categories.");
                return -1;
            }
            searches.push(orGroup);
        }
        
        var dex = {};
        for (var pokemon in Pokemon)
        {
            dex[pokemon] = getTemplate(pokemon);
        }
        dex = JSON.parse(JSON.stringify(dex)); // Don't modify the original template (when compiling learnsets)
        
        var learnSetsCompiled = false;

        // Prioritize searches with the least alternatives.
        var accumulateKeyCount = (count, searchData) => count + (typeof searchData === 'object' ? Object.keys(searchData).length : 0);
        searches.sort((a, b) => Object.values(a).reduce(accumulateKeyCount, 0) - Object.values(b).reduce(accumulateKeyCount, 0));
        
        for (var group = 0; group < searches.length; group++) 
        {
            var alts = searches[group];
            
            if (alts.skip) continue;
            if (alts.minmax) continue;
            
            for (var mon in dex) 
            {
                var matched = false;
                if (alts.cat)
                {
                    var toMatch = dex[mon].species.toLowerCase().replace('pokemon', '').replace(/\s/g, "");
                    if ((!category.isStrict && (toMatch.indexOf(category.cat) > -1)) || (category.isStrict && (toMatch === category.cat))) {
                        matched = true;
                        continue;
                    }
                }
                
                if (alts.colors && Object.keys(alts.colors).length) {
                    if (alts.colors[dex[mon].color]) continue;
                    if ((Object.values(alts.colors).indexOf(false) > -1) && alts.colors[dex[mon].color] !== false) continue;
                }
                
                if (alts.evoSearch)
                {
                    if ((evos == 1 && dex[mon].evos != undefined && dex[mon].evos.length != 0) || (evos == -1 && (dex[mon].evos == undefined || dex[mon].evos.length == 0))) {
                        matched = true;
                        continue;
                    } 
                }
                
                if (alts.prevoSearch)
                {
                    if ((prevo == 1 && dex[mon].prevo.length !=  0) || (evos == -1 && (dex[mon].prevo.length == 0))) {
                        matched = true;
                        continue;
                    } 
                }
                
                for (var egg in alts.eggGroups) {                    
                    if ((dex[mon].eggGroups.indexOf(egg) > -1) === alts.eggGroups[egg]) {
                        matched = true;
                        break;
                    }
                }
                if (matched) continue;
                
                for (var type in alts.types) {
                    if ((dex[mon].types.indexOf(type) > -1) === alts.types[type]) {
                        matched = true;
                        break;
                    }
                }
                if (matched) continue;

                for (var type in alts.resists) {
                    var effectiveness = 0;
                    var notImmune = getImmunity(type, dex[mon]);
                    if (notImmune) effectiveness = getEffectiveness(type, dex[mon]);
                    if (!alts.resists[type]) {
                        if (notImmune && effectiveness >= 0) matched = true;
                    } else {
                        if (!notImmune || effectiveness < 0) matched = true;
                    }
                }
                if (matched) continue;

                for (var ability in alts.abilities) {
                    if ((Object.values(dex[mon].abilities).indexOf(ability) > -1) === alts.abilities[ability]) {
                        matched = true;
                        break;
                    }
                }
                if (matched) continue;
                
                for (var stat in alts.stats) 
                {
                    var monStat = 0;
                    if (stat === 'bst') {
                        for (var monStats in dex[mon].baseStats) {
                            monStat += dex[mon].baseStats[monStats];
                        }
                    } else if (stat === 'wgt') {
                        monStat = dex[mon].weightkg;
                    } else if (stat === 'hgt') {
                        monStat = dex[mon].heightm;
                    } else {
                        monStat = dex[mon].baseStats[stat];
                    }
                    if (typeof alts.stats[stat].less === 'number') {
                        if (monStat <= alts.stats[stat].less) {
                            matched = true;
                            break;
                        }
                    }
                    if (typeof alts.stats[stat].greater === 'number') {
                        if (monStat >= alts.stats[stat].greater) {
                            matched = true;
                            break;
                        }
                    }
                    if (typeof alts.stats[stat].equal === 'number') {
                        if (monStat === alts.stats[stat].equal) {
                            matched = true;
                            break;
                        }
                    }
                }
                if (matched) continue;
                delete dex[mon];
            }
        }

        // Sort for the minimum values only
        var results = [];
        for (var mon in dex) 
        {
            if (dex[mon].baseSpecies && (results.indexOf(dex[mon].baseSpecies) > -1)) continue;
            else
            {
                if (minmax["isMinMax"])
                {
                    if (results.length === 0)
                    {
                        results.push(dex[mon]);
                    }
                    else
                    {
                        switch (minmax["stat"])
                        {
                            case 'hp': // All in basestats
                            case 'atk': // All in basestats
                            case 'def': // All in basestats
                            case 'spa': // All in basestats
                            case 'spd': // All in basestats
                            case 'spe': 
                                if ((minmax["type"] == 'max' && dex[mon].baseStats[minmax["stat"]] > results[0].baseStats[minmax["stat"]]) || (minmax["type"] == 'min' && dex[mon].baseStats[minmax["stat"]] < results[0].baseStats[minmax["stat"]]))
                                    results = [dex[mon]];
                                else if (dex[mon].baseStats[minmax["stat"]] == results[0].baseStats[minmax["stat"]])
                                    results.push(dex[mon]);
                                break;
                            case 'wgt': 
                                if ((minmax["type"] == 'max' && dex[mon].weightkg > results[0].weightkg) || (minmax["type"] == 'min' && dex[mon].weightkg < results[0].weightkg)) {
                                    results = [dex[mon]];
                                }
                                else if (dex[mon].weightkg == results[0].weightkg)
                                    results.push(dex[mon]);
                                break;
                            case 'hgt': 
                                if ((minmax["type"] == 'max' && dex[mon].heightm > results[0].heightm) || (minmax["type"] == 'min' && dex[mon].heightm < results[0].heightm)) {
                                    results = [dex[mon]];
                                }
                                else if (dex[mon].heightm == results[0].heightm)
                                    results.push(dex[mon]);
                                break;
                            case 'bst':
                                if ((minmax["type"] == 'max' && BST(dex[mon].baseStats) > BST(results[0].baseStats)) || (minmax["type"] == 'min' && BST(dex[mon].baseStats) < BST(results[0].baseStats)))
                                    results = [dex[mon]];
                                else if (BST(dex[mon]) == BST(results[0]))
                                    results.push(dex[mon]);
                                break;
                        }
                    }
                }
                else
                {
                    results.push(dex[mon]);
                }
            }
        }
        for (var i=0; i<dex.length; i++)
        {
            dex[i] = dex[i].name;
        }
        var resultsStr = "";
        
        if (results.length > 1) 
        {
            if (results.length > 25 && !hasPipeOut)
            {
                Bot.say(by, room, text_base + results.length + " results returned. Please narrow your query.");
                return -1;
            }
            else
            {
                results.forEach(function (part, index, arr) { arr[index] = arr[index].name });
                if (hasPipeOut)
                {
                    resultsStr = results.join("\n");
                }
                else
                {
                    resultsStr = results.join(", ");
                }
            }
        }
        else if (results.length === 1) {
            resultsStr = results[0].name;
        } else {
            Bot.say(by, room, text_base + "No Pokemon found.");
            return -1;
        }
        // Print message
        return text_base + resultsStr;
	},
    
    calc: 'calculate',
    calculate: function(arg, by, room, hasPipeOut, argIn) {
        if (room.charAt(0) === ',' || by.trim().toLowerCase() == "mirf" || hasPipeOut) 
            var text_base = '';
        else 
            var text_base = '/pm ' + by + ', ';
        var text;
        var arg = arg.trim();
        if ((arg.match(/=/g) || []).length != 1)
        {
            Bot.say(by, room, text_base + "Input should contain a left-hand side and a right-hand side");
            return -1;
        }
        var lhs = arg.substr(0, arg.indexOf("="));
        var rhs = arg.substr(arg.indexOf("=")+1);
        
        var match = [];
        for (var p in Pokemon)
        {
            if (evaluate(lhs, rhs, '==', Pokemon[p]))
                match.push(Pokemon[p].name);
        }
        if (match.length == 0)
        {
            Bot.say(by, room, text_base + "No results found.");
            return -1;
        }
        else if (!hasPipeOut && match.length > 25 && room.charAt(0) != ",")
        {
            Bot.say(by, room, text_base + match.length + " results returned. Please narrow your search and try again.");
            return -1;
        }
        else
        {
            if (hasPipeOut)
            {
                return text_base + match.join("\n");
            }
            else
            {
                return text_base + match.join(", ");
            }
        }
    }
};