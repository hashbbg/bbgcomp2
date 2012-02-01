// base sprite class
SF.Sprite = function (game, config) {

	this.game = game;

	config = config || {};

	this.x = config.x || 0;
	this.y = config.y || 0;
	this.w = config.w || 0;
	this.h = config.h || 0;
    this.sprite = null;

	this.xDir = config.xDir || 0;
	this.yDir = config.yDir || 0;

	this.tick = 0;

	this.speed = config.speed || 1;
	this.opacity = config.opacity || 1;

	this.xOff = config.xOff || 0;
	this.yOff = config.yOff || 0;
	this.zoom = config.zoom || 1;
	this.zoomSpeed = config.zoomSpeed || 0;
	this.zw = this.w * this.zoom;
	this.zh = this.h * this.zoom;

	this.src = config.src || null;

	if (config.src) {
		this.image = new Image();
		this.image.src = config.src;
		this.image.width = this.w;
		this.image.height = this.h;
		this.zw = this.image.width * this.zoom;
		this.zh = this.image.width * this.zoom;
	}
	else {
		this.image = false;
	}

	// for collision detection
	this.left = this.x;
	this.right = this.x + this.w;
	this.top =  this.y;
	this.bottom = this.y + this.h;


	this.col = config.col || '#f0f';

	this.anims = config.anims || [];
	this.anim = config.anim || '';

};

SF.Sprite.prototype.init = function() {
};



SF.Sprite.prototype.move = function() {

	this.x += (this.xDir * this.speed);
	this.y += (this.yDir * this.speed);

};

SF.Sprite.prototype.draw = function() {

	this.animate();


	if (this.src) {

		try {


			this.game.ctx.drawImage(
				this.image,
				this.xOff,this.yOff,
				this.image.width,this.image.height,
				~~this.x,~~this.y,(this.image.width * this.zoom),(this.image.height * this.zoom));
   

		} catch(e) {
			this.console.log(e);
		}

	}
	else {
		this.game.rect(this.x, this.y, this.w, this.h, this.col);
	}
};


SF.Sprite.prototype.animate = function() {

	if (this.image === false || !this.anim) {
		return;
	}

	if (this.tick < this.anims[this.anim].frameSpeed) {
		this.tick++;
	}
	else {
		this.tick = 0;
		if (this.zoom <= this.maxZoom) {
			this.zoom = this.zoom + this.zoomSpeed;
		}

		if (this.anims[this.anim].currentFrame >= this.anims[this.anim].frames && this.anims[this.anim].nextAnim) {
				this.anim = this.anims[this.anim].nextAnim;

		}
		else if(this.anims[this.anim].currentFrame >= this.anims[this.anim].frames) {
			this.anims[this.anim].currentFrame = 0;
		}
		else {
			this.anims[this.anim].currentFrame++;
		}

	}

	this.xOff = this.anims[this.anim].xOff + (this.anims[this.anim].currentFrame * this.image.width);
	this.yOff = this.anims[this.anim].yOff;


};


SF.Sprite.prototype.changeAnim = function(anim) {

	this.tick = 0;
	this.anim = anim;
    console.log(this.anim);
	this.anims[this.anim].currentFrame = 0;

};


SF.Sprite.prototype.collide = function(o) {


	// this sprite's rectangle
	this.left = this.x;
	this.right = this.x + this.w;
	this.top = this.y;
	this.bottom = this.y + this.h;

	// o sprite's rectangle
	o.left = o.x;
	o.right = o.x + o.w;
	o.top = o.y;
	o.bottom = o.y + o.h;

	// determine if not intersecting
    if (this.bottom < o.top) {
        return false; 
    }
    if (this.top > o.bottom) {
        return false; 
    } 

    if (this.right < o.left) {
        return false; 
    }
    if (this.left > o.right) {
        return false; 
    }

	// otherwise, it's a hit
	return true;

};

