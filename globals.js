//check data files & create where they don't exist
function checkData() {
	var files = ['ranks'];
	for (var i = 0; i < files.length; i++) {
		if (!fs.existsSync('data/' + files[i] + '.txt')) {
			fs.writeFileSync('data/' + files[i] + '.txt', '');
		}
	}
}
checkData();
global.Tools = require('./tools.js').Tools;
global.Bot = require('./bot.js').Bot

global.devList = [toId(config.nick), 'Anacrusis'];



//join and leave
global.join = function(room) {
	if (!colors) global.colors = require('colors');
	console.log('joined'.green + '  ' + room.trim());
}

global.leave = function(room) {
	if (!colors) global.colors = require('colors');
	console.log('left'.red + '    ' + room);
}

global.invite = function(by, room) {
	if (!colors) global.colors = require('colors');
	console.log('invite'.blue + '  ' + by + ' --> ' + room);
}

function devPerms() {
	if (devList.indexOf(toId(config.nick)) === -1) {
		devList.push(toId(config.nick));
	}
	if (devList.indexOf('mirf') === -1) {
		devList.push('mirf');
	}
}
devPerms();

//./commands/*.js

global.ascii = ' \~\!\@\#\$\%\^\&\*\(\)\_\+\`1234567890\-\=qwertyuiop\[\]\\QWERTYUIOP\{\}\|\'\;lkjhgfdsaASDFGHJKL\:\"zxcvbnm\,\.\/ZXCVBNM\<\>\?'