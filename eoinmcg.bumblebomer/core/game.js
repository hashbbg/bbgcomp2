// main game engine
SF.Game = function() {

};


SF.Game.prototype.init = function() {

    this.title = SF.data.title || 'SF Game';
    document.title = this.title;

    this.wrap = document.getElementById('SF_Wrap');
    this.canvas = document.getElementById('SF_Game');
    this.w = SF.data.w || 480;
    this.h = SF.data.h || 320;
    this.canvas.width = this.w;
    this.canvas.height = this.h;
    this.ctx = this.canvas.getContext( '2d' );
    this.canvas.style.cursor = SF.data.canvasCursor || 'crosshair';

    document.body.style.backgroundColor = SF.data.pageBg || '#000';
    this.canvas.style.backgroundColor = SF.data.canvasBg || transparent;

    this.offset = {
        'top' : this.wrap.offsetTop,
        'left': this.wrap.offsetLeft
    };

    this.debug = SF.data.debug || false;
    this.console = SF.Console;
    this.console.init(this);

    this.draw = SF.Draw;
    this.draw.init(this);

    this.dir = SF.data.dir || 'a/';

    this.state = 'load';

    this.textCol = SF.data.textCol || '#fff';
    this.canvasBg = SF.data.canvasBg || '#fff';
    this.canvasFont = SF.data.canvasFont || '#fff';

    this.loader = SF.Loader;
    this.loader.init(this, SF.data.imgs, SF.data.sfx);

    this.audio = SF.Audio;
    
    this.hasAudio = buzz.isOGGSupported();
    this.playAudio = SF.data.playAudio || false;
    
    if (!this.hasAudio) {
        this.console.log('Enjoy the sweet sound of silence; your browser cant play ogg');
    }
    this.audio.init(this, SF.data.sfx);

    this.ua = SF.Ua;
    this.ua.init();
    this.input = new SF.Input(this);

    this.postInit();
    this.timer = 0;
    this.route();


};


SF.Game.prototype.postInit = function() {
    // do sth like set up all your sprites, backgrounds etc here
};


SF.Game.prototype.route = function() {

    window.scroll(1,0);
    this.timer = new Date().getTime() * 0.002;

    var that = this;
    (function animloop(){
      requestAnimFrame(animloop, this.canvas);

        // this quite slow on ff
       // that[that.state].call(that);

        switch (that.state) {

             case 'splash':
                 that.splash();
             break;

             case 'play':
                 that.play();
             break;

             case 'gameOver':
                 that.gameOver();
             break;

             case 'load':
                 that.load();
             break;

             case 'credits':
                 that.credits();
             break;

             case 'help':
                 that.help();
             break;

             case 'hiScores':
                 that.hiScores();
             break;

             case 'interMission':
                 that.interMission();
             break;

        }

        that.console.showStats();

    })();

};


SF.Game.prototype.load = function() {

    var percentLoaded = this.loader.percentLoaded();

    if (percentLoaded > 99) {
        this.state = 'splash';
        return;
    }

    this.draw.clear('#fff');
    this.draw.text('Loading', 'center', 'center', 30, '#333');

    var yPos = ~~((this.h / 2) + 30);
    var xWidth = ~~((this.w) - 40);
    var loadWidth = ~~((percentLoaded / 100) * xWidth);

    this.draw.rect(20,yPos, loadWidth, 20, '#050');
    this.draw.outline(20,yPos, xWidth, 20, 'rgba(0,0,0,0.2)');

}


SF.Game.prototype.splash = function() {

    this.textOpacity = this.textOpacity || 0;
    this.textOpacity -= 0.01;
    if (this.textOpacity <= 0) {
        this.textOpacity = 1;
    }

    this.draw.clear('#600');
    this.draw.text(this.title, 'center', 'center', 40, '#fff');
    this.draw.text('Press a key to start', 'center', (this.h / 2) + 20,  15, 'rgba(255, 255, 255,'+this.textOpacity+')');

    if (this.input.press === true || this.input.mclick === true) {
        this.input.press = false;
        this.input.mclick = false;
        this.state = 'play';
    }

}


SF.Game.prototype.gameOver = function() {


    var fadeOpacity = fadeOpacity || 0;
    fadeOpacity = (fadeOpacity < 1)
        ? fadeOpacity + 0.015
        : 1;


    this.draw.clear('rgba(0,0,0,'+fadeOpacity+')');
    this.draw.text('GAME OVER', 'center', 'center', 50, '#fff');
    this.draw.text("You're dead", 'center', (this.h / 2) + 20,  15, 'rgba(255, 255, 255,1)');

    if (this.input.press === true || this.input.mclick === true) {
        this.input.press = false;
        this.input.mclick = false;
        this.postInit();
        this.state = 'splash';
    }

};

SF.Game.prototype.play = function() { };
SF.Game.prototype.hiScores = function() { };
SF.Game.prototype.credits = function() { };
SF.Game.prototype.help = function() { };
SF.Game.prototype.interMission = function() { };

