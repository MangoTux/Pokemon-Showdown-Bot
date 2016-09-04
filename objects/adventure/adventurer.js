'use strict';
var Item = require('./items.js');
//Possible races and race stats
var races =
{
	race:   ["human", "elf", "dwarf", "goblin"],
	damage: [5, 4, 4, 5],
	defense:[1, 1, 2, 0],
    luck:   [0, 2, 0, 0],
	health: [50,40,50,35]
	//TODO base damage, increment damage
};
//Possible classes and class stats
var classes =
{
	pclass: ["warrior", "ranger", "mage", "monk"],
	damage: [2, 1, 1, 1],
	defense:[0, 2, 1, 2],
    luck:   [0, 1, 1, 2],
	health: [5, 4, 5, 5]
	//TODO base damage, increment damage
};

exports.Adventurers = [];
    /*
    An element has this structure:
    {
        name: "name"
        race: [dwarf, goblin, troll, elf, human]
        class: [warrior, ranger, mage, monk]
        game_state: [fight, walk]
        hp: [num]
        max_hp: [num]
        atk: [num], corresponds to damage roll
        def: [num], corresponds to roll for damage block
        inventory: [],
        gold: [num]
    }
    */
exports.createCharacter = function(name)
{
    //Name is a given
    //Race is random between them
    //Class is random between them
    //Game state is walk
    //HP is max_hp
    //Atk is function of race/class
    //Def is function of race/class
    //Inventory is one random item
    //Gold is 100
    var name = name;
    var race_index = randomKey(races.race);
    var race = races.race[race_index];
    var pclass_index = randomKey(classes.pclass);
    var pclass = classes.pclass[pclass_index];
    var game_state = "walk";
    var max_hp = races.health[race_index] + classes.health[pclass_index];
    var hp=max_hp;
    var atk=[races.damage[race_index], classes.damage[pclass_index]]; // 2 elements - first is die to roll, second is added based on armor
    var def=[races.defense[race_index], classes.defense[pclass_index]];
    var luck = races.luck[race_index] + classes.luck[pclass_index];// 2 elements, same as above
    var inventory = [new Item.itemGen({class:pclass, level:1})]; // Generate one item based on class
    var equipped = []; // Slots for each type
    var gold = 100;
    return {
        name: name, 
        race: race, 
        class: pclass, 
        game_state: game_state, 
        hp:hp, 
        max_hp:max_hp, 
        atk:atk, 
        def:def, 
        luck:luck, 
        inventory:inventory, 
        equipped:equipped, 
        gold:gold, 
        level:1, 
        exp:0, 
        position: 
        {x: 0, y: 0},
        enemy: {}
    };
}