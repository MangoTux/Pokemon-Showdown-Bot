var Pokemon = require('./../objects/pokemon.js').Pokedex;
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
    var atk=pokemon.baseStats.atk;
    var def=pokemon.baseStats.def;
    var spa=pokemon.baseStats.spa;
    var spd=pokemon.baseStats.spd;
    var spe=pokemon.baseStats.spe;
    var bst=0;
    for (stat in pokemon.baseStats) { bst += pokemon.baseStats[stat]; }
    var wgt=pokemon.weightkg;
    var hgt=pokemon.heightm;
    var dex=pokemon.num;
    
    return eval(lhs + comparison + rhs);
}

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
        if (room.charAt(0) === ',') 
            var text_base = ''
        else 
            var text_base = '/pm ' + by + ', ';
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
            var statComparison = stat_list[stat_index+1].toLowerCase();
            if (["bst", "atk", "def", "spa", "spd", "spe", "hp"].indexOf(statComparison) == -1)
            {
                Bot.say(by, room, text_base + "Invalid stat parameter."); return;
            }
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
    
    ds: 'dexsearch',
	dsearch: 'dexsearch',
	dexsearch: function(arg, by, room) {
        if (room.charAt(0) === ',') 
            var text_base = '';
        else 
            var text_base = '/pm ' + by + ', ';
        var text;
        
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
        var andGroups = arg.split(',');
        for (var i = 0; i < andGroups.length; i++) 
        {
            var orGroup = {abilities: {}, tiers: {}, colors: {}, gens: {}, moves: {}, types: {}, resists: {}, categories: {}, eggGroups: {}, stats: {}, minmax: false, skip: false, cat: false};
            var parameters = andGroups[i].split("|");
            if (parameters.length > 3) 
            { Bot.say(by, room, text_base + "No more than 3 alternatives for each parameter may be used."); return; }
            
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
                    orGroup.abilities[targetAbility] = !isNotSearch; continue;
                }

                if (target in allColours) {
                    target = target.charAt(0).toUpperCase() + target.slice(1);
                    orGroup.colors[target] = !isNotSearch;
                    continue;
                }

                if (target in allEggs) {
                    target = target.charAt(0).toUpperCase() + target.slice(1);
                    orGroup.allEggs[target] = !isNotSearch;
                    continue;
                }
        
                if (target === 'recovery') 
                {
                    if (parameters.length > 1) 
                    { 
                        Bot.say(by, room, text_base + "The parameter 'recover' cannot have alternative parameters"); 
                        return; 
                    }
                    var recoveryMoves = [ "recover", "roost", "moonlight", "morningsun", "synthesis", "milkdrink", "slackoff", "softboiled", "wish", "healorder"];
                    for (var k = 0; k < recoveryMoves.length; k++) {
                        if (isNotSearch) {
                            var bufferObj = {moves: {}};
                            bufferObj.moves[recoveryMoves[k]] = false;
                            searches.push(bufferObj);
                        } else {
                            orGroup.moves[recoveryMoves[k]] = true;
                        }
                    }
                    if (isNotSearch) orGroup.skip = true; break;
                }
        
                if (target === 'priority') 
                {
                    if (parameters.length > 1) 
                    { 
                        Bot.say(by, room, text_base + "The parameter 'priority' cannot have alternate parameters"); 
                        return; 
                    }
                    for (var move in Moves) 
                    {
                        var moveData = getMove(move);
                        if (moveData.category === "Status" || moveData.id === "bide") continue;
                        if (moveData.priority > 0) 
                        {
                            if (isNotSearch) 
                            {
                                var bufferObj = {moves: {}};
                                bufferObj.moves[move] = false;
                                searches.push(bufferObj);
                            }
                            else
                            {
                                orGroup.moves[move] = true;
                            }
                        }
                    }
                    if (isNotSearch) orGroup.skip = true;
                    break;
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
                        return;
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
                        return;
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
                        return;
                    }
                    minmax["stat"] = stat;
                    orGroup.minmax = true;
                    continue;
                }
                
                var targetMove = getMove(target);
                if (targetMove.exists) {
                    orGroup.moves[targetMove.id] = !isNotSearch;
                    continue;
                }
                
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
                        return;
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
                        return;
                    }
                }
                
                var inequality = target.search(/>|<|=/);
                if (inequality >= 0)
                {
                    if (isNotSearch)
                    {
                        Bot.say(by, room, text_base + "You cannot use the negation symbol '!' in stat ranges.");
                        return;
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
                        return;
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
                        return;
                    }
                    if (!orGroup.stats[stat]) orGroup.stats[stat] = {};
                    if (orGroup.stats[stat][direction]) return {reply: "Invalid stat range for " + stat + "."};
                    orGroup.stats[stat][direction] = num;
                    continue;
                }
                Bot.say(by, room, text_base + target + " could not be found in any of the search categories.");
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

                if (!learnSetsCompiled) {
                    for (var mon2 in dex) {
                        var template = dex[mon2];
                        if (!template.learnset) template = getTemplate(template.baseSpecies);
                        if (!template.learnset) continue;
                        var fullLearnset = template.learnset;
                        while (template.prevo) {
                            template = getTemplate(template.prevo);
                            for (var move in template.learnset) {
                                if (!fullLearnset[move]) fullLearnset[move] = template.learnset[move];
                            }
                        }
                        dex[mon2].learnset = fullLearnset;
                    }
                    learnSetsCompiled = true;
                }

                for (var move in alts.moves) {
                    var canLearn = dex[mon].learnset[move];
                    if ((canLearn && alts.moves[move]) || (alts.moves[move] === false && !canLearn)) {
                        matched = true;
                        break;
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
        var resultsStr = "";
        
        if (results.length > 1) 
        {
            if (results.length > 25)
            {
                resultsStr = results.length + " results returned. Please narrow your query.";
            }
            else
            {
                results.forEach(function (part, index, arr) { arr[index] = arr[index].name });
                resultsStr = results.join(", ");
            }
        }
        else if (results.length === 1) {
            resultsStr = results[0].name;
        } else {
            resultsStr = "No Pokemon found.";
        }
        // Print message
        Bot.say(by, room, text_base + resultsStr);
	},
    
    calc: 'calculate',
    calculate: function(arg, by, room) {
        if (room.charAt(0) === ',') 
            var text_base = ''
        else 
            var text_base = '/pm ' + by + ', ';
        var text;
        var arg = arg.trim();
        if ((arg.match(/=/g) || []).length != 1)
        {
            Bot.say(by, room, text_base + "Input should contain a left-hand side and a right-hand side");
            return;
        }
        var lhs = arg.substr(0, arg.indexOf("="));
        var rhs = arg.substr(arg.indexOf("=")+1);
        
         var match = [];
        for (var p in Pokemon)
        {
            if (evaluate(lhs, rhs, '==', Pokemon[p]))
                match.push(Pokemon[p]);
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
    }
};