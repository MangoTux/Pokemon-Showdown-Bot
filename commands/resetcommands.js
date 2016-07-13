var http = require('http');
exports.commands = {
    clearstatus: function(arg, by, room, cmd) {
        if (cmd) return false;
        for (var tarRoom in anagramON) {
            if (anagramON[tarRoom]) {
                clearInterval(anagramON[tarRoom]);
                delete anagramON[tarRoom];
                ok('Reset anagram game in ' + tarRoom);
            }
        }
        for (var tarRoom in gameStatus) {
            if (gameStatus[tarRoom] !== 'off') {
                clearInterval(blackJack[tarRoom]);
                delete gameStatus[tarRoom];
                ok('Reset blackjack game in ' + tarRoom);
            }
        }
        for (var tarRoom in crazyeight.gameStatus) {
            if (crazyeight.gameStatus[tarRoom] !== 'off') {
                clearInterval(crazyeight.interval[tarRoom]);
                delete(crazyeight.gameStatus[tarRoom]);
                ok('Reset crazyeights game in ' + tarRoom);
            }
        }
        for (var tarRoom in kunc.on) {
            delete kunc.on[tarRoom];
            ok('Reset kunc game in ' + tarRoom);
        }
        for (var tarRoom in statspread.on) {
            delete statspread.on[tarRoom];
            ok('Reset StatSpread game in ' + tarRoom);
        }
        for (var tarRoom in Bot.repeatON) {
            if (Bot.repeatON[tarRoom]) {
                clearInterval(Bot.repeatText[tarRoom]);
                delete Bot.repeatON[tarRoom];
                ok('Reset repeat in ' + tarRoom);
            }
        }
        for (var tarRoom in timer.on) {
            clearTimeout(timer.repeat[tarRoom])
            delete timer.on[tarRoom];
            ok('Reset timer in ' + tarRoom)
        }
    },
};