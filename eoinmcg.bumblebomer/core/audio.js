SF.Audio = {

    game: null,
    sounds: [],

    init: function(game, sfx) {

        var i;
        this.game = game;

        if (this.game.playAudio === false) {
            return;
        }

        for (i = 0; i < sfx.length; i++) {
            this.sounds[sfx[i]] = new buzz.sound('a/' + sfx[i] + '.ogg');
        }

    },


    play: function (sfx) {

        if (this.game.playAudio === false) {
            return;
        }


        if (this.game.hasAudio === false) {
            return;
        }

        this.sounds[sfx].play();


    }

};

