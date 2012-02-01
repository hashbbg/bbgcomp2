SF.Snot = function(game, config) {

    SF.Sprite.call(this, game, config);

    this.type = 'snot';

    this.game = game;
    this.x = config.x;
    this.y = config.y;
        
    this.xDir = -1;
    this.yDir = -0.35;
    this.speed = 5;
    this.w = 6;
    this.h = 6;
    this.r = this.w / 2;

    this.remove = false;

};

SF.Snot.prototype = new SF.Sprite();
SF.Snot.constructor = SF.Snot;

SF.Snot.prototype.move = function() {

    this.x = this.x + (this.xDir * this.speed);
    this.y = this.y + (this.yDir * this.speed);


    if (this.x < 0 || this.x > this.game.w) {
        this.remove = true;
    }
    if (this.y < 0 || this.y > this.game.h) {
        this.remove = true;
    }

    this.draw();

};


SF.Snot.prototype.draw = function() {

    SF.Draw.circle(this.x + this.r, this.y + this.r, this.r, '#2f2');

};

