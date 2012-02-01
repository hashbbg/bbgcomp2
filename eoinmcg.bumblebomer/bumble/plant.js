SF.Plant = function(game, config) {

    SF.Sprite.call(this, game, config);

    this.type = 'plant';

    this.game = game;
    this.height = 0;
    this.maxHeight = this.game.h / 2;
    this.w = 20;
    this.r = this.w / 2;
    this.speed = ( Math.random() * 3 ) + 1;

    this.x = this.game.w;
    this.y = this.game.h;
    this.yDir = -1;
    this.xOff = this.x - this.r;
    this.col = 'green';
    this.remove = false;


};


SF.Plant.prototype = new SF.Sprite();
SF.Plant.constructor = SF.Plant;

SF.Plant.prototype.move = function() {

    this.x = this.x - 1;
    if (this.y < this.maxHeight || this.y > this.game.h) {
        this.yDir = this.yDir * -1;
    }

    if (this.x < 0) {
        this.x = 500;
    }

    this.y = this.y + (this.yDir * this.speed);
    this.draw();

};

SF.Plant.prototype.draw = function() {

    this.game.draw.rect(this.x, this.y, 2, this.game.h - this.y, '#030');
    this.game.draw.circle(this.x, this.y, this.r, this.col);
    this.game.draw.circle(this.x - 3, this.y - 2, this.r / 2, '#010');

};
