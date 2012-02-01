SF.Explosion = function(game, x, y, r, num, cols) {

    this.game = game;
    this.x = x;
    this.y = y;

    this.finished = false;

    this.num = num || 6;
    this.cols = cols || ['#900'];

    var totalCols = this.cols.length;
    var currCol = 0;

    this.r = ~~(r / num);
    this.r = 2;
    this.particles = [];

    for (i=0; i <= this.num; i++) {
        this.particles.push( new SF.Particle(game, x,y, this.r, this.cols[currCol]) );
        currCol = (currCol <= totalCols) ? currCol += 1 : 0;
    }

};


SF.Explosion.prototype.move = function() {

    var i, 
        len = this.particles.length;
        remove = [];

    if (len <= 0) {
        this.finished = true;
    }

     for (i = len; i--;) {
        this.particles[i].move();

        if (this.particles[i].remove === true) {
            this.particles.splice(i, 1);
        }

    }


};


SF.Particle = function(game,x,y,r, col) {


    this.game = game;

    this.x = x;
    this.y = y;
    this.r = r;

    this.col = col || '#900';
    this.remove = false;

    var dir = ~~(Math.random() * 2);
    dir = (dir) ? 1 : -1;

    this.vx = ~~(Math.random() * 4) * dir;
    this.vy = ~~(Math.random() * 7) * -1;



};


SF.Particle.prototype.move = function() {

    this.x += this.vx;
    this.y += this.vy;

    this.vx *= 0.99;
    this.vy *= 0.99;

    this.vy += 0.25;

    this.game.draw.circle(this.x, this.y, this.r, this.col);
    if (this.y >= this.game.h) {
        this.remove = true;
    }

};

