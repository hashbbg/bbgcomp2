SF.Bullet = function(game, config) {

    this.game = game;
    this.x = config.x;
    this.y = config.y;
    this.w = config.w || 10;
    this.h = this.w;
    this.r = ~~(this.w / 2);
    this.speed = config.speed || 5;
    this.xdir = config.xdir || 1;
    this.ydir = config.ydir || 0;
    this.col = config.col || '#c20';
    this.remove = false;

    this.move = function() {
   
        this.x = this.x + (this.xdir * this.speed);
        this.y = this.y + (this.ydir * this.speed);
        
        this.draw();

        if (this.x > this.game.w + this.r) {
            this.remove = true;
        }

    };

    this.draw = function() {
   
       this.game.draw.circle(this.x, this.y, this.r, this.col); 

    };

};
