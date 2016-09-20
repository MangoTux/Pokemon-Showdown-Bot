'use strict';

var allEnemies = {
		"Alligator":
		{description:"Or is it a crocodile?",
		 damage:12,
		 gold:0,
		 baseXP:300,
		 defense:2},
		"Bat":
		{description:"Not the baseball kind.",
		 damage:1,
		 gold:0,
		 baseXP:25,
		 defense:1},
		"Basilisk":
		{description:"Don't look at it!",
		 damage:18,
		 gold:0,
		 baseXP:1000,
		 defense:2},
		"Bumblebee":
		{description:"Just a humble bumblebee.",
		 damage:4,
		 gold:0,
		 baseXP:50,
		 defense:2,
		 defense:-4},
		"Camel":
		{description:"Humps Don't Lie",
		 damage:5,
		 gold:0,
		 baseXP:50,
		 defense:0},
		"Chicken":
		{description:"Why *did* it cross the road?",
		 damage:4,
		 gold:0,
		 baseXP:50,
		 defense:0},
		"Cow":
		{description:"Moo.",
		 damage:4,
		 gold:0,
		 baseXP:50,
		 defense:0},
		"Coyote":
		{description:"Looks a little beaten-up and hungry.",
		 damage:7,
		 gold:0,
		 baseXP:100,
		 defense:-1},
		"Crab":
		{description:"I bet it has a firm handshake.",
		 damage:6,
		 gold:0,
		 baseXP:150,
		 defense:6},
		"Crocodile":
		{description:"Or is it an alligator?",
		 damage:12,
		 gold:0,
		 baseXP:300,
		 defense:2},
		"Demon":
		{description:"The often-malevolent beings of lore.",
		 damage:30,
		 gold:100,
		 baseXP:100,
		 defense:-5},
		"Dragon": // Here be dragons.
		{description:"Here be dragons.",
		 damage:75,
		 gold:0,
		 baseXP:10000,
		 defense:50},
		"Duck":
		{description:"Quack quack.",
		 damage:4,
		 gold:0,
		 baseXP:50,
		 defense:0},
		"Electric Eel":
		{description:"Shockingly, these aren't actually eels.",
		 damage:8,
		 gold:0,
		 baseXP:70,
		 defense:0},
		"Frog":
		{description:"Ribbit.",
		 damage:4,
		 gold:0,
		 baseXP:50,
		 defense:1},
		"Goldfish":
		{description:"Shiny!",
		 damage:1,
		 gold:1,
		 baseXP:1,
		 defense:1},
		"Golem":
		{description:"An animated pile o' stuff.",
		 damage:10,
		 gold:0,
		 baseXP:1000,
		 defense:100},
		"Grizzly Bear":
		{description:"Proof that fuzzy =/= friendly. Don't try to hug it.",
		 damage:40,
		 gold:0,
		 baseXP:200,
		 defense:2},
		"Imp":
		{description:"Practical jokers just looking for a friend.",
		 damage:7,
		 gold:5,
		 baseXP:100,
		 defense:-1},
		"Kraken":
		{description:"A gigantic octopus and the bane of sailors.",
		 damage:4,
		 gold:0,
		 baseXP:50,
		 defense:1},
		"Lizard":
		{description:"Mostly harmless, preferring to spend its time basking in the sun",
		 damage:4,
		 gold:0,
		 baseXP:50,
		 defense:1},
		"Mammoth":
		{description:"",
		 damage:4,
		 gold:0,
		 baseXP:50,
		 defense:1},
		"Mermaid":
		{description:"Half human, half fish. Thankfully, the human half is on top.",
		 damage:4,
		 gold:70,
		 baseXP:50,
		 defense:1},
		"Nomad":
		{description:"I wonder where they'll wander next.",
		 damage:4,
		 gold:5,
		 baseXP:50,
		 defense:1},
		"Penguin":
		{description:"Formal, Flightless and Flippered.",
		 damage:4,
		 gold:10,
		 baseXP:50,
		 defense:1},
		"Pig":
		{description:"Oink!",
		 damage:4,
		 gold:0,
		 baseXP:50,
		 defense:1},
		"Pirate":
		{description:"Pegleg, eyepatch, hook and parrot. Not the other kind.",
		 damage:8,
		 gold:120,
		 baseXP:100,
		 defense:-1},
		"Polar Bear":
		{description:"The apex predator of the arctic. Don't try to hug it.",
		 damage:4,
		 gold:0,
		 baseXP:50,
		 defense:1},
		"Roadrunner":
		{description:"Gotta go fast!",
		 damage:4,
		 gold:0,
		 baseXP:50,
		 defense:1},
		"Scorpion":
		{description:"Mother nature's favorite child.",
		 damage:4,
		 gold:0,
		 baseXP:50,
		 defense:1},
		"Seagull":
		{description:"They lived by the bay until people started making fun of them.",
		 damage:4,
		 gold:0,
		 baseXP:50,
		 defense:1},
		"Seal":
		{description:"Mostly cute and cuddly. Don't even think about fighting it.",
		 damage:4,
		 gold:0,
		 baseXP:50,
		 defense:1},
		"Shark":
		{description:"~~~~~^~~~~~",
		 damage:4,
		 gold:0,
		 baseXP:50,
		 defense:1},
		"Sheep":
		{description:"If there were any more, you'd probably be asleep by now.",
		 damage:4,
		 gold:0,
		 baseXP:50,
		 defense:1},
		"Skeleton":
		{description:"How is it moving if it doesn't have muscles?",
		 damage:4,
		 gold:0,
		 baseXP:50,
		 defense:1},
		"Snake":
		{description:"Named after the dot-collection game featured on the original Nokia phones.",
		 damage:4,
		 gold:0,
		 baseXP:50,
		 defense:1},
		"Snowman":
		{description:"Do you want to kill a snowman?",
		 damage:4,
		 gold:0,
		 baseXP:50,
		 defense:1},
		"Spider":
		{description:"Cute widdle friends!",
		 damage:4,
		 gold:0,
		 baseXP:50,
		 defense:1},
		"Squid":
		{description:"Super intelligent and a lot of legs.",
		 damage:4,
		 gold:0,
		 baseXP:50,
		 defense:1},
		"Squirrel":
		{description:"Little rodents that can be big pests.",
		 damage:4,
		 gold:0,
		 baseXP:50,
		 defense:1},
		"Troll":
		{description:"Ugly, dimwitted, and afraid of sunlight. Who let them use the internet?",
		 damage:4,
		 gold:0,
		 baseXP:50,
		 defense:1},
		"Turtle":
		{description:"",
		 damage:4,
		 gold:0,
		 baseXP:50,
		 defense:1},
		"Venus Flytrap":
		{description:"The opposite of vegetarian",
		 damage:4,
		 gold:0,
		 baseXP:50,
		 defense:1},
		"Villager":
		{description:"Just a peaceful citizen",
		 damage:4,
		 gold:0,
		 baseXP:50,
		 defense:1},
		"Whale":
		{description:"Call me Ishamel!",
		 damage:4,
		 gold:0,
		 baseXP:50,
		 defense:12},
		"Witch":
		{description:"Double, double, toil and trouble/Fire burn, and cauldron bubble.",
		 damage:8,
		 gold:60,
		 baseXP:50,
		 defense:1},
		"Wolf":
		{description:"Hey look, a dog! Hi Doggy!",
		 damage:4,
		 gold:0,
		 baseXP:50,
		 defense:1},
		"Wizard":
		{description:"A wise, old man with a penchant for sorcery",
		 damage:8,
		 gold:45,
		 baseXP:50,
		 defense:1},
		"Yeti":
		{description:"I think \"abominable\" is a bit harsh...",
		 damage:4,
		 gold:0,
		 baseXP:50,
		 defense:1},
		"Zombie":
		{description:"If it only had a brain...",
		 damage:4,
		 gold:0,
		 baseXP:50,
		 defense:-2},
	};
//Overlap of enemies is intended.
var enemies =
{
	//For low levels
	easyEnemies:
	[
		"Bat",
		"Bumblebee",
		"Chicken",
		"Cow",
		"Crab",
		"Duck",
		"Frog",
		"Imp",
		"Lizard",
		"Pig",
		"Seagull",
		"Sheep",
		"Spider",
		"Squirrel",
		"Turtle",
		"Villager"
	],
	//For use in shops/town?
	peopleEnemies:
	[
		"Nomad",
		"Pirate",
		"Skeleton",
		"Villager",
		"Witch",
		"Wizard",
		"Zombie"
	],
	//For North/South > 70
	coldEnemies:
	[
		"Mammoth",
		"Penguin",
		"Polar Bear",
		"Seal",
		"Snowman",
		"Wolf",
		"Yeti"
	],
	//For desert/sand locations
	aridEnemies:
	[
		"Camel",
		"Coyote",
		"Crab",
		"Lizard",
		"Nomad",
		"Roadrunner",
		"Scorpion",
		"Seagull",
		"Skeleton",
		"Snake",
		"Spider",
		"Turtle",
		"Venus Flytrap"
	],
	//These enemies only appear in water
	waterEnemies:
	[
		"Electric Eel",
		"Fish",
		"Goldfish",
		"Kraken",
		"Mermaid",
		"Shark",
		"Squid",
		"Whale"
	],
	//For high levels
	hardEnemies:
	[
		"Alligator",
		"Basilisk",
		"Crocodile",
		"Demon",
		"Dragon",
		"Golem",
		"Grizzly Bear",
		"Imp",
		"Pirate",
		"Scorpion",
		"Skeleton",
		"Troll",
		"Witch",
		"Wizard",
		"Zombie"
	],
	//For everything else
	normalEnemies:
	[
		"Bat",
		"Bumblebee",
		"Chicken",
		"Cow",
		"Crab",
		"Crocodile",
		"Duck",
		"Frog",
		"Grizzly Bear",
		"Imp",
		"Lizard",
		"Nomad",
		"Pig",
		"Pirate",
		"Scorpion",
		"Seagull",
		"Sheep",
		"Skeleton",
		"Snake",
		"Spider",
		"Squirrel",
		"Troll",
		"Turtle",
		"Venus Flytrap",
		"Villager",
		"Wolf",
		"Witch",
		"Wizard",
		"Zombie"
	]
};

exports.createEnemy = function(player) 
{
	var name = "";
	var level = 0;
	var maxHP = 0;
	var luck = 0;
	var baseDamage = 0;
	var defense = 0;
	var currentHP = 0;
	var gold = 0;
    
    // Extreme north or south; create arctic enemies
    if (player.position.y > 70 || player.position.y < -70)
    {
        name = randomChoice(enemies.coldEnemies);
    }
    // Center of world, create people
    else if ((player.position.y < 20 && player.position.y > -20) && (player.position.x < 20 && player.position.x > -20))
    {
        name = randomChoice(enemies.peopleEnemies);
    }
    else if (player.level < 25)
    {
        name = randomChoice(enemies.easyEnemies.concat(enemies.normalEnemies));
    }
    else if (player.level > 60)
    {
        name = randomChoice(enemies.hardEnemies.concat(enemies.normalEnemies));
    }
    else
    {
        name = randomChoice(enemies.normalEnemies);
    }
    var distance = Math.abs(player.position.x + player.position.y);
    level = player.level + getRandomInt(0, distance) - getRandomInt(1, Math.floor(Math.sqrt((200-distance)>0?(200-distance):0)));
					
    if (level > 100)
        level = 100;
    if (level < 1)
        level = 1;
					
    var gold = allEnemies[name].gold;
    var experience = Math.floor(allEnemies[name].baseXP*Math.sqrt(level)); // TODO 
    var maxHP = 30 + Math.floor(level*Math.sqrt(level+1)-getRandomInt(0, level+1));
    var currentHP = maxHP;
				
    var luck = getRandomInt(1, level+1);
        
    var baseDamage = Math.floor(allEnemies[name].damage+level*Math.sqrt(getRandomInt(0, level)));
    
    var description = allEnemies[name].description;
					
    var defense = allEnemies[name].defense; // TODO

    return {
        name: name,
        level: level,
        max_hp: maxHP,
        hp: currentHP,
        atk:baseDamage,
        def:defense,
        luck:luck,
        exp:experience,
        gold:gold,
        desc:description,
    }
}