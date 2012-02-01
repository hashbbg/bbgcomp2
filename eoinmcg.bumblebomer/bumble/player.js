// player class
SF.Player = function(game, config) {

	SF.Sprite.call(this, game, config);

    this.x = (this.game.w / 2) - (this.w / 2);
	this.y = this.game.h  - (this.h + this.game.ground);
	this.health = 100;

    this.xAdjust = (this.game.ua.hasTouch) ? this.w - 80 : this.w;
    this.yAdjust = (this.game.ua.hasTouch) ? this.h : this.h;

};

SF.Player.prototype = new SF.Sprite();
SF.Player.prototype.constructor = SF.Player;

SF.Player.prototype.move = function() {


	this.last_x = this.x;
	this.last_y = this.y;
	this.x = this.game.input.mx - this.xAdjust;
	this.y = this.game.input.my - this.yAdjust;



	if (this.x <= 0 ) {
		this.x = 0;
	}
	else if (this.x >= this.game.w - this.w) {

		this.x = this.game.w - this.w;
	}

    if (this.y <= 0) {
        this.y = 0;
    }
    else if (this.y >= this.game.h - this.h) {
        this.y = this.game.h - this.h;
    }


	this.draw();

};

// SF.Player.prototype.draw = function() {
// 
//     this.game.draw.rect(this.x, this.y, this.w, this.h, 'blue');
// 
// }
