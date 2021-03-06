'use strict';
var nameList = 
[
	'Amaryll',
	'Ancient', 
	'Arendall', 
	'Arenia', 
	'Asaru', 
	'Aura', //aura aura aura aura aura aura aura
	'Avian',
	'Berenthos', 
	'Bragi', 
	'Brakas', 
	'Chelisern', 
	'Ciel', 
	'Daggard', 
	'Erenthar', 
	'Farzen', 
	'Fiend', 
	'Fyre', 
	'Garoa', 
	'Gary',
	'Ghazeer', 
	'Goelleniar',
	'Halberd',
	'Hemdallr', 
	'Ifris', 
	'Igneous',
	'Iruzia', 
	'Javon', 
	'Javallyne', 
	'Jormust', 
	'Kazahn', 
	'Krennemoor',
	'Lavallyam', 
	'Luminous',
	'Mahuta', 
	'Meadow', 
	'Nallander', 
	'Orian', 
	'Paladin',
	'Petreuve', 
	'Quixor', 
	'Ragnarok',
	'Rallian', 
    'Saradomin',
	'Starchaser', 
	'Tanfanna', 
	'Tempest',
	'Trallos', 
	'Samarik', 
	'Sanctuary',
	'Saria',
	'Solaris',
	'Ugori', 
    'Ulyntos',
    'Valor',
	'Vastorn', 
	'Wind', 
	'Wynd',
	'Wrath', 
	'Xaradyne', 
    'Zamorak',
	'Zerefoss', 
	'Zatall'
];

var Mdict = function()
{
	this.d = [];
	
	this.getItem = function(key) { 
        if (key in this.d) { 
            return this.d[key]; 
        } 
    }
    
	// Adds or appends the given suffix to the prefix in the list
	this.addKey = function(pref, suff) { 
        if (pref in this.d) { 
            try {
                this.d[pref].push(suff); 
            } 
            catch (err) {
                this.d[pref] = [suff];
            }
        } else { 
            this.d[pref] = [suff];
        } 
    }
	
	this.getSuffix = function(prefix) { return randomChoice(this.d[prefix]); }
};

var MName = function()
{
	this.chainLen = 2;
	this.mcd = new Mdict()
	var s;
	for (var p in nameList) 
	{
		s = "  " + nameList[p];
		for (var i = 0; i<nameList[p].length; i++)
			this.mcd.addKey(s.substring(i, i+this.chainLen), s.charAt(i+this.chainLen));
		this.mcd.addKey(s.substring(nameList[p].length, nameList[p].length+this.chainLen), "\n");
	}
	
	this.New = function()
	{
		var prefix = "  ";
		var name = "";
		var suffix = "";
		while (true) {
			suffix = this.mcd.getSuffix(prefix);
			if (suffix == "\n" || name.length > 9)
				break;
			else
			{
				name += suffix;
				prefix = prefix.charAt(1) + suffix;
			}
		}
		return name.charAt(0).toUpperCase() + name.slice(1); // Capitalize name
	}
};

var types = 
{
	//Descriptors
	armor:'Armor',
	weapon:'Weapon',
	both:'Both',
	healing:'Healing',
	//Equip location
	head:'Head',
	hat:'Head',
	neck:'Neck',
	chest:'Chest',
	arms:'Arms',
	legs:'Legs',
	feet:'Feet',
	wield:'Wield',
}
/*Item modifiers*/		  
var modifier = 
{
	'Holy':
	{
		type:types.both,
		multiplier:3//player.playerClass=="monk"?4.5:3
	},
	'Magical':
	{
		type:types.both,
		multiplier:2//player.playerClass=="mage"?2.5:2
	},
	'Golden':
	{
		type:types.both,
		multiplier:3
	}, 
	'Great':
	{
		type:types.both,
		multiplier:4
	}, 
	'Leather':
	{
		type:types.armor,
		multiplier:0.8//player.playerClass=="ranger"?2.5:0.8
	}, 
	'Steel':
	{
		type:types.both,
		multiplier:1.15
	},  
	'Iron':
	{
		type:types.both,
		multiplier:1.1
	}, 
	'Bronze':
	{
		type:types.both,
		multiplier:1.05
	}, 
	'Silk':
	{
		type:types.armor,
		multiplier:0.8//player.playerClass=="mage"?2.5:0.8
	},
	'Flaming':
	{
		type:types.weapon,
		multiplier:2.5
	}, 
	'Fire':
	{
		type:types.weapon,
		multiplier:2
	}, 
	'Freezing':
	{
		type:types.weapon,
		multiplier:2.5
	}, 
	'Ice':
	{
		type:types.weapon,
		multiplier:2
	}, 
	'Stone':
	{
		type:types.weapon,
		multiplier:1.5
	},
	'Dragonscale':
	{
		type:types.armor,
		multiplier:3
	}
};
/*Items that can be used by anyone*/
var allItems = 
{   //TODO make some items apply stat modifiers
	'Bread':
	{
		HP:30
	}, 
	'Potato':
	{
		HP:15
	}, 
	'Cabbage':
	{
		HP:10
	}, 
	'Soup':
	{
		HP:40
	},
	'Healing Potion':
	{
		HP:-1 //If -1, heal to max HP
	}
};
/*All items occupy Head/Neck/Chest/Arms/Legs/(Waist)/Feet/Wield, and person can carry 2 of each*/
var warriorItems = 
{
	'Sword':
	{
		type: types.wield,
		damage:5,
		defense:0,
		luck:0
	}, 
	'Shield':
	{
		type: types.wield,
		damage:1,
		defense:5,
		luck:1
	},
	'Axe':
	{
		type: types.wield,
		damage:7,
		defense:-2,
		luck:0
	},
	'Polearm':
	{
		type: types.wield,
		damage:5,
		defense:-1,
		luck:0
	},
	'Hammer':
	{
		type: types.wield,
		damage:7,
		defense:-2,
		luck:0
	},
	'Cutlass':
	{
		type: types.wield,
		damage:4,
		defense:0,
		luck:0
	},
	'Rapier':
	{
		type: types.wield,
		damage:4,
		defense:0,
		luck:0
	},
	'Scimitar':
	{
		type: types.wield,
		damage:4,
		defense:0,
		luck:0
	},
	'Helm':
	{
		type: types.head,
		damage:0,
		defense:2,
		luck:0
	},
	'Brooch':
	{
		type: types.neck,
		damage:0,
		defense:1,
		luck:3
	},
	'Breastplate':
	{
		type: types.chest,
		damage:0,
		defense:3,
		luck:0
	},
	'Vambraces':
	{
		type: types.arms,
		damage:0,
		defense:1.2,
		luck:0
	},
	'Greaves':
	{
		type: types.legs,
		damage:0,
		defense:1.2,
		luck:0
	},
	'Boots': 
	{
		type: types.feet,
		damage:0,
		defense:1,
		luck:0
	}
};
var rangerItems = 
{
	'Shortbow':
	{
		type: types.wield,
		damage:5,
		defense:0,
		luck:2
	},
	'Longbow':
	{
		type: types.wield,
		damage:4,
		defense:0,
		luck:2
	},
	'Crossbow':
	{
		type: types.wield,
		damage:6,
		defense:-1,
		luck:2
	},
	'Spear':
	{
		type: types.wield,
		damage:5,
		defense:0,
		luck:2
	},
	'Boomerang':
	{
		type: types.wield,
		damage:4,
		defense:-1,
		luck:4
	},
	'Shuriken':
	{
		type: types.wield,
		damage:4,
		defense:-1,
		luck:4
	},
	'Cowl':
	{
		type: types.head,
		damage:0,
		defense:2,
		luck:2
	},
	'Cloak':
	{
		type: types.neck,
		damage:0,
		defense:1.5,
		luck:2
	},
	'Jerkin':
	{
		type: types.chest,
		damage:0,
		defense:2.5,
		luck:2
	},
	'Tunic':
	{
		type: types.chest,
		damage:0,
		defense:2,
		luck:2
	},
	'Vambraces':
	{
		types: types.arms,
		damage:0,
		defense:1.2,
		luck:2
	},
	'Breeches':
	{
		type: types.legs,
		damage:0,
		defense:1.2,
		luck:2
	},
	'Boots':
	{
		type: types.feet,
		damage:0,
		defense:1,
		luck:2
	}
};
var mageItems = 
{
	'Staff':
	{
		type: types.wield,
		damage:5,
		defense:0,
		luck:1
	}, 
	'Wand':
	{
		type: types.wield,
		damage:3,
		defense:0,
		luck:1
	}, 
	'Rod':
	{
		type: types.wield,
		damage:4,
		defense:0,
		luck:2
	}, 
	'Scepter':
	{
		type: types.wield,
		damage:5,
		defense:0,
		luck:1
	},
	'Tome':
	{
		type: types.wield,
		damage:5,
		defense:0,
		luck:3
	}, 
	'Runes':
	{
		type: types.wield,
		damage:4,
		defense:0,
		luck:2
	}, 
	'Wizard Hat':
	{
		type: types.hat,
		damage:0,
		defense:1,
		luck:1
	},
	'Tiara':
	{
		type: types.hat,
		damage:0,
		defense:-3, // Not a good use of a hat, really.
		luck:20 // You're a pretty princess!
	},
	'Eye':
	{
		type: types.neck,
		damage:0,
		defense:-1,
		luck:5
	}, 
	'Amulet':
	{
		type: types.neck,
		damage:0,
		defense:1,
		luck:3
	}, 
	'Wizard Robe':
	{
		type: types.chest,
		damage:0,
		defense:3,
		luck:0
	},
	'Ring':
	{
		type: types.arms,
		damage:0,
		defense:0,
		luck:5
	},
	'Wizard Robe': //Yes, two
	{
		type: types.legs,
		damage:0,
		defense:2,
		luck:0
	},
	'Boots':
	{
		type: types.feet,
		damage:0,
		defense:1,
		luck:0
	}
};
var monkItems = 
{
	'Chakram':
	{
		type: types.wield,
		damage:5,
		defense:0,
		luck:1
	},
	'Claw':
	{
		type: types.wield,
		damage:5,
		defense:0,
		luck:1
	}, 
	'Fist':
	{
		type: types.wield,
		damage:4,
		defense:1,
		luck:0
	},
	'Gloves':
	{
		type: types.wield,
		damage:3,
		defense:1,
		luck:1
	},  
	'Talisman':
	{
		type: types.wield,
		damage:2,
		defense:2,
		luck:3
	}, 
	'Cowl':
	{
		type: types.hat,
		damage:0,
		defense:2,
		luck:1
	},
	'Pendant':
	{
		type: types.neck,
		damage:0,
		defense:0,
		luck:3
	}, 
	'Robe':
	{
		type: types.chest,
		damage:0,
		defense:4,
		luck:1
	},
	'Shroud':
	{
		type: types.chest,
		damage:0,
		defense:3,
		luck:4
	}, 
	'Ring':
	{
		type: types.arms,
		damage:0,
		defense:0,
		luck:3
	}, 
	'Shackle':
	{
		type: types.legs,
		damage:0,
		defense:1,
		luck:2
	},
	'Sandals':
	{
		types: types.feet,
		damage:0,
		defense:0,
		luck:4
	},
	'Boots':
	{
		type: types.feet,
		damage:0,
		defense:1,
		luck:2
	}
};

//Given a list of key/value pairs, returns a random key from list
function randomKey(obj) {
    var ret;
    var c = 0;
    for (var key in obj)
        if (Math.random() < 1/++c)
           ret = key;
    return ret;
}

exports.HealthItem = function()
{
	var type = types.healing;
	var name = randomKey(allItems);
    var HP = allItems[this.name].HP;
	var cost = this.HP*2;
	if (this.cost < 0) this.cost = 400;
    return {type: type, name: name, HP: HP, cost: cost};
}

exports.itemGen = function(player) {
    var isWeapon = (Math.random() > .5);
    var itemModList = [];
    var itemNameList = [];
    var referenceList;
    
    switch (player.class)
    {
        case "warrior": referenceList = warriorItems; break;
        case "ranger": referenceList = rangerItems; break;
        case "mage": referenceList = mageItems; break;
        case "monk": referenceList = monkItems; break;
        default: referenceList = allItems; break;
    }
    
    for (var p in modifier)
    {
        if ((modifier[p].type == types.both) || (isWeapon && modifier[p].type == types.weapon) || (!isWeapon && modifier[p].type == types.armor))
        {
            itemModList.push(p);
        }
    }
    for (var p in referenceList)
    {
        if ((referenceList[p].type == types.wield && isWeapon) || (referenceList[p].type != types.wield && !isWeapon))
        {
            itemNameList.push(p);
        }
    }
    var nameMod = randomChoice(itemModList);
    var itemType = randomChoice(itemNameList);
    var mname = new MName();
	   
    this.name = nameMod + ' ' + itemType + ' of ' + mname.New();
    
    if (referenceList[itemType].damage < 0)
        this.damage = Math.floor(referenceList[itemType].damage*modifier[nameMod].multiplier);
    else
        this.damage = Math.floor(modifier[nameMod].multiplier*Math.sqrt(referenceList[itemType].damage*player.level));
    if (referenceList[itemType].defense < 0)
        this.defense = Math.floor(referenceList[itemType].defense*modifier[nameMod].multiplier);
    else
        this.defense = Math.floor(modifier[nameMod].multiplier*Math.sqrt(referenceList[itemType].defense*player.level));
    if (referenceList[itemType].luck < 0)
        this.luck = Math.floor(referenceList[itemType].luck*modifier[nameMod].multiplier);
    else
        this.luck = Math.floor(modifier[nameMod].multiplier*Math.sqrt(referenceList[itemType].luck*player.level));
    this.type = referenceList[itemType].type;
    this.cost = Math.floor((getRandomInt(30, 200)+this.luck+this.defense+this.damage)*modifier[nameMod].multiplier); 
};