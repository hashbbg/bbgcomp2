SF.Bumble = function() {
	SF.Game.call(this);
};

SF.Bumble.prototype = new SF.Game();
SF.Bumble.prototype.constructor = SF.Bumble;

SF.Bumble.prototype.postInit = function() {

    var i;

	this.ground = 120;
	this.score = 0;
	this.hiScore = localStorage.bumble_hiScore || 1000;
	this.level = 1;
	this.explosions = [];
    this.numClouds = 5;
    this.clouds = [];
	this.nextWave = 100;
    this.cannonInterval = 10;
    this.nextBullet = this.cannonInterval;
    this.bullets = [];

    this.textLayer = document.getElementById('textLayer');

	this.textOpacity = 0;

	this.player = new SF.Player(this, SF.data.player);

	this.player.anims.fly = new SF.Animation(SF.data.player_anims.fly);
	this.player.health = 100;

	this.audio.play('ping');
    this.draw.changeBg(0);

    for (i = this.numClouds; i--;) {
        this.clouds.push(new SF.Cloud(this)); 
    }

    this.enemies = [];
    this.enemies.push(new SF.Plant(this, {}));

};


SF.Game.prototype.splash = function() {

	this.textOpacity = (this.textOpacity < 0) ? 1 : this.textOpacity-=0.015;

    this.draw.clear();

    this.draw.text('BUMBLEBOMBER', 'center', 100, 50, '#E8C010', 'Eater');
    this.draw.text('BUMBLEBOMBER', 'center', 95, 50, '#000', 'Eater');

	this.draw.text(this.ua.action + " to start","center", (this.h / 2) + 30, 15, "rgba(255, 255, 255,"+this.textOpacity+")");

	if (this.input.mclick === true) {

		this.input.mclick = false;
		this.count = 0;
		this.draw.changeBg(1);
		this.state = "interMission";

        this.textLayer.style.display = 'none';

	}

};



SF.Bumble.prototype.interMission = function() {

	this.textOpacity = (this.textOpacity < 0) ? 1 : this.textOpacity-=0.015;

    this.count += 1;
	this.draw.clear();
    this.drawBg();
	this.hud();
	this.moveExplosions();
	this.player.move();

	if (this.count < 120) {

		this.draw.text("Get Ready", "center", (this.h/2),20, "rgba(0, 0, 0," + this.textOpacity+")", "Eater");

	}
	else {


		this.count = 0;

		this.state = 'play';

	}

};


SF.Bumble.prototype.play = function() {

	if (this.player.health <= 0) {
        this.explosions.push(new SF.Explosion(this, this.player.x, this.player.y));
		this.state = 'gameOver';
        this.textLayer.style.display = 'block';
		return;
	}


    var i, n, bullets, enemies, explosions, config, remove, random_fire;

    random_fire = (~~(Math.random() * 125) === 50) ? true: false;
    random_fired = false;

    if (this.nextBullet < 0) {
        this.nextBullet = this.cannonInterval;
        this.bullets.push(new SF.Bullet(this, {
            x: this.player.x + this.player.w, y: this.player.y + 20}));
    }

    if (this.nextWave < 0) {
        i = 5;
        config = SF.data.fly;
        config.y = Math.random() * this.w;
        config.xDir = -1;
        config.wave = Math.random() * 50;
        config.speed = ( Math.random() * 4 ) + 3;
        if (config.y < 100) {
            config.yDir = 1;
        } else if (config.y > this.h - 100) {
            config.yDir = -1;
        }
        else {
            config.yDir = 0;
        }
        for (i = 0; i < 5; i += 1) {
            config.x = i * 50;
            this.enemies.push(new SF.Fly(this, config)); 
        }
        this.nextWave = ~~( Math.random() * 100 ) + 50;
    }

    if (this.nextWave % 194 === 0) {
        this.enemies.push(new SF.Plant(this));
    }

	this.draw.clear();
    this.drawBg();
	this.hud();
	this.moveExplosions();
	this.player.move();

    bullets = this.bullets.length;
    enemies = this.enemies.length;
    explosions = this.explosions.length;

    for (i = bullets; i--;) {
        this.bullets[i].move();

        for (n = enemies; n--;) {
            if ( this.enemies[n].type !== 'snot' && this.enemies[n].collide(this.bullets[i]) ) {
                this.enemies[n].remove = true;
                this.bullets[i].remove = true;
                this.score += 10;
                this.explosions.push(new SF.Explosion(this, this.enemies[n].x, this.enemies[n].y));
            }
        }

        if (this.bullets[i].remove) {
            this.bullets.splice(i, 1);
        }
    }

    for (i = enemies; i--;) {
        this.enemies[i].move();

        // randomly fire
        if (random_fire && this.enemies[i].type === 'plant') {
     

            this.enemies.push(new SF.Snot(this, {
                            x: this.enemies[i].x,
                            y: this.enemies[i].y}));

        }

        if (this.enemies[i].collide(this.player)) {
            this.enemies[i].remove = true;
            this.explosions.push(new SF.Explosion(this, this.enemies[i].x, this.enemies[i].y));
            this.player.health -= 20;

        }

        if (this.enemies[i].remove) {
            this.enemies.splice(i, 1);
        }
    }

	for (i = explosions; i--;) {
		if (this.explosions[i].finished) {
			this.explosions.splice(i, 1);
		}
		else {
			this.explosions[i].move();
		}
	}

    //collision detection

    this.nextWave -= 1;
    this.nextBullet -= 1;
	this.input.mclick = false;


};

SF.Bumble.prototype.hud = function() {

	//draw health
	this.draw.rect(10,5, 50, 20, 'rgba(255,255,255,0.2)');
	this.draw.rect(10,5, ((this.player.health / 100) * 50 ), 20, '#c20');
	this.draw.outline(10,5, 50, 20, 'rgba(0,0,0,0.5)');


	// draw score
	this.draw.text('Score: '+this.score, (this.w - 70), 20);
	this.draw.text('Hi: '+this.hiScore, 'center', 20);

};




SF.Bumble.prototype.moveExplosions = function() {

    var i;

	// move explosions
	for (i = 0; i < this.explosions.length; i += 1) {
		if (this.explosions[i].finished) {
			this.explosions.splice(i, 1);
		}
		else {
			this.explosions[i].move();
		}
	}

};


SF.Bumble.prototype.gameOver = function() {

    this.draw.clear();
    this.drawBg();
	this.hud();
	this.moveExplosions();

	this.draw.text("GAME OVER!","center", (this.h/3), 30, "rgba(0, 0, 0,1)", 'Eater');

    if (this.score > this.hiScore) {
        this.draw.text("New HiScore!","center", (this.h/3)+20, 20, "rgba(0, 0, 0,1)", "Eater");
    }



	if (this.input.mclick) {

        if (this.score > this.hiScore) {
            this.hiScore = this.score;
            localStorage.bumble_hiScore = this.hiScore;
        }

		this.reset();

		this.state="splash";
        this.draw.changeBg(0);
		this.input.mclick=false;
	}

};


SF.Bumble.prototype.reset = function() {

	this.score = 0;
	this.level = 1;
	this.explosions = [];
    this.enemies = [];
    this.bullets = [];
	this.nextWave = 100;
	this.currentBg = 0;

	this.player.health = 100;
	this.player.dead = false;
	this.player.x = ~~((this.w / 2) - (this.player.w / 2));
	this.player.changeAnim("fly");



};

SF.Bumble.prototype.drawBg = function() {

    var i, 
        clouds = this.clouds.length;

    this.draw.circle(350, 60, 80, '#fce94f');

    for (i = clouds; i--;) {
        this.clouds[i].move();    
    }
    

};

