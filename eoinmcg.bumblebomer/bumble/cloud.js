SF.Cloud = function(game, config) {

    this.game = game;
    this.x = -120;
    this.y = 0;
    this.size = null;
    this.halfSize = null;
    this.speed = null;

    this.move = function() {

        if (this.x < -100) {
            this.regenerate();
        }
  
        this.x = this.x + this.speed;

        this.draw();


    };


    this.draw = function() {
   
        this.game.draw.circle(this.x, this.y, this.size, this.col);
        this.game.draw.circle(this.x + this.size, this.y, this.size, this.col);
        this.game.draw.circle(this.x + this.halfSize, this.y - this.halfSize, this.size, this.col);

    };

    this.regenerate = function() {
   
        this.x = ~~( Math.random() * 300 ) + this.game.w;
        // this.x = this.game.w / 2;
        this.y = ~~(Math.random() * this.game.w);
        this.circles = ~~(Math.random() * 2) + 1;
        this.size = ~~(Math.random() * 30) + 10;
        this.halfSize = this.size / 2;
        this.speed = ~~(Math.random() * 20) / -this.size;
        this.col = 'rgba(255,255,255,1)';

    };

};
