SF.Draw = {

    game: null,

    init: function(game) {
        this.game = game;
    },


    clear: function(col) {

        this.game.ctx.clearRect(0,0,this.game.w, this.game.h);

    },

    rect: function(x, y, w, h, col) {

        try {
            this.game.ctx.fillStyle = col;
            this.game.ctx.fillRect(x,y,w,h);
        } catch(e) {
            this.game.console.log(e);
        }

    },


    outline: function(x,y,w,h,col) {

        try {
            this.game.ctx.strokeStyle = col;
            this.game.ctx.strokeRect(x,y,w,h);
        } catch(e) {
            this.gameconsole.log(e);
        }

    },


    circle: function(x, y, r, col) {

        col = col || '#c20';

        try {
            this.game.ctx.fillStyle = col;
            this.game.ctx.beginPath();
            this.game.ctx.arc(~~x, ~~y, r, 0, Math.PI*2, true);
            this.game.ctx.closePath();
            this.game.ctx.fill();
        } catch(e) {
            this.gameconsole.log(e);
        }

    },


    image: function(src, x, y, w, h, xOff, yOff, zoom) {
    },


    text: function(str, x, y, size, col, font) {

        size = size || 10;
        font = font || this.game.canvasFont;

        x = (x === 'center')
            ? ~~(this.game.w / 2) - ((str.length * size) / 2.75 )
            : x = x;

        y = (y === 'center')
            ? ~~(this.game.h / 2) - ((size) / 2)
            : y = y;

        col = col || this.game.textCol;


        try {
            this.game.ctx.font = 'bold '+size+'px '+font;
            this.game.ctx.fillStyle = col;
            this.game.ctx.fillText(str, x, y);
        } catch(e) {
            console.log(e);
        }

    },


    changeBg: function(num) {

        var col, newBg = 'none';

        switch (num) {
       
            case 0:
                col = '#c4a000';
            break;

            case 1:
                col = '#8bc';
            break;

            default:
                col = '#333';
            break;
        
        }

        this.game.wrap.style.backgroundColor = col;
        this.game.wrap.style.backgroundImage = newBg;

    }

};

