exports.commands = {
	/**
	 * General commands
	 *
	 * Add custom commands here.
	 */
	'8ball': function(arg, by, room) {
		if (room.charAt(0) === ',') {
			var text = '';
		}
		else {
            if (by.trim() != "mirf") return;
			text = '/pm ' + by + ', ';
		}
		by = toId(by);
		if (!arg) return false;

		var alpha = ' abcdefghijklmnopqrstuvwxyz';
		arg = toId(arg).split('');
		var rand = 0;
		for (var i = 0; i < arg.length; i++) {
			rand += alpha.indexOf(arg[i]);
		}
		for (var i = 0; i < by.length; i++) {
			rand += alpha.indexOf(by.charAt(i));
		}


		switch ((rand % 20) + 1) {
			case 1:
				text += "Signs point to yes.";
				break;
			case 2:
				text += "Yes.";
				break;
			case 3:
				text += "Reply hazy, try again.";
				break;
			case 4:
				text += "Without a doubt.";
				break;
			case 5:
				text += "My sources say no.";
				break;
			case 6:
				text += "As I see it, yes.";
				break;
			case 7:
				text += "You may rely on it.";
				break;
			case 8:
				text += "Concentrate and ask again.";
				break;
			case 9:
				text += "Outlook not so good.";
				break;
			case 10:
				text += "It is decidedly so.";
				break;
			case 11:
				text += "Better not tell you now.";
				break;
			case 12:
				text += "Very doubtful.";
				break;
			case 13:
				text += "Yes - definitely.";
				break;
			case 14:
				text += "It is certain.";
				break;
			case 15:
				text += "Cannot predict now.";
				break;
			case 16:
				text += "Most likely.";
				break;
			case 17:
				text += "Ask again later.";
				break;
			case 18:
				text += "My reply is no.";
				break;
			case 19:
				text += "Outlook good.";
				break;
			case 20:
				text += "Don't count on it.";
				break;
		}
		Bot.say(by, room, text);
	},

	/**
	 * Jeopardy commands
	 *
	 * The following commands are used for Jeopardy in the Academics room
	 * on the Smogon server.
	 */
    /*
	randpoke: function(arg, by, room) {
		var ranges = [
			['1', '151'],
			['152', '251'],
			['252', '386'],
			['387', '493'],
			['494', '649'],
			['650', '721']
		];
		var gens = ['gen1', 'gen2', 'gen3', 'gen4', 'gen5', 'gen6'];
		if (gens.indexOf(toId(arg)) === -1 && arg) return false;
		Bot.say(by, room, "!data " + (arg ? ranges[gens.indexOf(toId(arg))][0] * 1 + ~~((ranges[gens.indexOf(toId(arg))][1] - ranges[gens.indexOf(toId(arg))][0]) * Math.random()) + 1 : ~~(Math.random() * 721)));
	},*/
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
/* globals i */
/* globals ascii */
/* globals timer */
