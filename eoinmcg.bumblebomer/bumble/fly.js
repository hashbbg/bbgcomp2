SF.Fly = function(game, config) {

    SF.Sprite.call(this, game, config);

    this.type = 'fly';
    this.src = config.src || null;
    
    this.speed = config.speed || 3;
    this.flap = 0;
    // this.counter = 0;
    this.wave = config.wave || 0;
    this.x = this.game.w + 100 + config.x;
    this.y = config.y;
    this.yDir = config.yDir || 0;
    this.yConstant = this.y;
    this.r = ~~(this.w / 2);
    this.remove = false;

};


SF.Fly.prototype = new SF.Sprite();    
SF.Fly.prototype.constructor = SF.Fly;

SF.Fly.prototype.move = function() {

    this.x = this.x - this.speed;
    this.y = this.y + this.yDir;
    if (this.y < 0 || this.y > this.game.h) {
        this.yDir *= -1;
    }
    // this.y = this.wave * Math.sin(this.counter) + this.yConstant;
    this.flap = (this.flap === 0) ? 4 : 0;


    if (this.x < (0 - this.w)) {
        this.remove = true;
    }

    // this.counter += 0.05;

    this.draw();

};


SF.Fly.prototype.draw = function() {

    SF.Draw.circle(this.x + 16, this.y + this.flap, 4, 'lightblue');
    SF.Draw.circle(this.x + this.r, this.y + this.r, this.r, 'black');
    SF.Draw.circle(this.x + 18, this.y + 2 + this.flap, 4, 'blue');
    SF.Draw.circle(this.x + 4, this.y + 4, 4, 'white');
    SF.Draw.circle(this.x + 4, this.y + 4, 3, 'green');

};
