/**
 * SpiritBeacon
 * 
 * @author Jiří "NoxArt" Petruželka | @NoxArt
 */

(function(window, $, undefined){
	
	var math = Math;
	var originalRound = math.round;
	math.round = function(value, precision) {
		var mul = Math.pow(10, precision || 1);
		return originalRound(value * mul) / mul;
	};
	
	var basePath = "/";
	var imagePath = basePath + "assets/images/";
	var audioPath = basePath + "assets/audio/";
	
	var baseRefreshRate = math.floor(1000 / 60);
	var key = {
		backspace: 8,
		tab: 9,
		enter: 13,
		shift: 16,
		ctrl: 17,
		alt: 18,
		escape: 27,
		left: 37,
		space: 32,
		up: 38,
		right: 39,
		down: 40,
		m: 77,
		p: 80,
		r: 82,
		x: 88,
		zero: 48,
		f5: 116
	};
	
	var effects = {
		shake: function(jQueryAble, multiplier) {
			multiplier = multiplier || 1;
			var object = $(jQueryAble);
			
			object.css({
				position: "relative",
				left: 0,
				top: 0
			});
			
			var strength = 35 + math.random() * 30 * multiplier;
			var dimnish = 1.35 + math.random() * 0.65 / multiplier;
			var speed = 18 + math.random() * 10;
			var direction = -1;
			
			var action = function(){
				object.animate({
					left: (strength * direction) + "px",
					top: (strength * direction) + "px"
				}, speed, function(){
					object.animate({
						left: 0,
						top: 0
					}, speed);
				});
				
				direction *= -1;
				strength /= dimnish;
				
				if( strength > 5 )
					setTimeout(action, speed * 2.1);
			};
			
			action();
		}
	};
	
	// requestAnimationFrame for syncing the animations with browsers
	// updates for smoother animating
	/// @link http://paulirish.com/2011/requestanimationframe-for-smart-animating/
	var requestAnimFrame = (function(){
		return  window.requestAnimationFrame       || 
				window.webkitRequestAnimationFrame || 
				window.mozRequestAnimationFrame    || 
				window.oRequestAnimationFrame      || 
				window.msRequestAnimationFrame     || 
				function( callback ){
					window.setTimeout(callback, baseRefreshRate);
				};
	})();

	/// @link https://gist.github.com/992342
	var desaturate = function (context) {
		var imgData = context.ctx.getImageData(0, 0, context.width, context.height);
		var i, y, x;
		var tempY;

		for (y = 0; y < context.height; y++) {
			tempY = y * context.width;
			for (x = 0; x < context.width; x++) {
				i = (tempY + x) * 4;

				// Apply Monochrome level across all channels:
				imgData.data[i] = imgData.data[i + 1] = imgData.data[i + 2] = RGBtoGRAYSCALE(imgData.data[i], imgData.data[i + 1], imgData.data[i + 2]);
			}
		}

		return imgData;
	};

	var RGBtoGRAYSCALE = function (r, g, b) {
		// Returns single monochrome figure:
		return window.parseInt((0.2125 * r) + (0.7154 * g) + (0.0721 * b), 10);
	};
	
	/**
	 * Intializations
	 */
	var difficulty = {
		level: 1,
		value: 0.3
	};
	var isFinished = false;
	var isPaused = false;
	var config = {
		noScale: true,
		originalWidth: 550,
		originalHeight: 750,
		documentMargin: 20,
		canvasMargin: 20,
		bodyPadding: 40,
		
		platingPower: 20,
		speed: 1.5,
		shieldShocked: 2000,
		difficultyIncreaseInterval: 120000,
		difficultyIncrease: 0.2,
		
		audio: {
			enabled: false,
			/// @link http://music.incompetech.com/royaltyfree2/Mechanolith.mp3
			track: 'Mechanolith',
			/// @link http://music.incompetech.com/royaltyfree2/Private%20Reflection.mp3
			spiritTrack: 'PrivateReflection',
			formats: ['mp3', 'ogg']
		}
	};
	var playAudio = false;
	var audio = null;
	var spiritAudio = null;
	var content = $("section");
	var canvas = $("section canvas");
	var renderContext = {
		ctx: canvas[0].getContext('2d'),
		scale: 1,
		width: config.originalWidth,
		height: config.originalHeight,
		
		fix: function(val) {
			//return val / this.scale
			return val;
		}
	};
	
	var timePauseCompensation = 0;
	var timeSpiritCompensation = 0;
	var previousTime = 0;
	var spiritWorld = null;
	
	// Rescale canvas
	var rescaleCanvas = function() {
		var scale;
		
		if( config.noScale )
			scale = 1;
		else
		{
			var availWidth = $(document).innerWidth();
			var availHeight =  $(document).innerHeight()
									- $("header").outerHeight(true)
									- $("footer").outerHeight(true)
									- config.canvasMargin * 2
									- config.documentMargin * 2;

			var width = math.min(availWidth, config.originalWidth);
			var height = math.min(availHeight, config.originalHeight);

			var scaleX = width / config.originalWidth;
			var scaleY = height / config.originalHeight;

			scale = math.min(scaleX, scaleY);
		}
		
		width = config.originalWidth * scale;
		height = config.originalHeight * scale;
		
		canvas.css({
			width: width + "px",
			height: height + "px",
			marginTop: config.canvasMargin,
			marginBottom: config.canvasMargin
		}).prop("width", width).prop("height", height);
		
		renderContext.ctx = canvas[0].getContext('2d');
		renderContext.scale = scale;
		renderContext.width = width;
		renderContext.height = height;
		
		$("body").css("width", width + config.bodyPadding * 2 );
		$("html").css({
			marginTop: config.documentMargin + "px",
			marginBottom: config.documentMargin + "px"
		});
	};

	
	/**
	 * Entities
	 */
	var player = null;
	
	var entities = [];
	
	// --- Controls ------------------------------------------------------------
	var controls = Object.extended({
		left: "left",
		up: "up",
		right: "right",
		down: "down",
		space: "fire",
		zero: "fire"
	});
	
	var immediateControls = Object.extended({
		m: "mute",
		p: "pause",
		r: "restart",
		f5: "restart",
		shift: "switchWeapons",
		x: "spiritWorld"
	});
	
	var action = {
		keysPressed: Object.extended({}),
		scheduledActions: [],
		
		reset: function() {
			this.scheduledActions = [];
		}
	};
	
	var levelCheckpoints = [
		4000,
		8000,
		20000
	];
	
	// --- Ship ----------------------------------------------------------------	
	var gameObjectId = 0;
	var GameObject = function() {
		
		// movement
		this.x = 0;
		this.y = 0;
		this.width = 50;
		this.height = 50;
		this.speed = 6;
		this.speedVertical = 2;
		
		this.direction = 1;
		
		// state
		this.state = 'normal';
		
				
		this.setVisualType = function(type) {
			this.visual = new Image();
			this.visual.src = imagePath + this.sprite + "-" + type + ".png";
		};
		
		this.render = function(context) {
			context.ctx.drawImage(this.visual, context.fix(this.x), context.fix(this.y), this.width, this.height);
		};
		
		this.left = function(screen) {
			this.x = math.floor(math.max(this.x - this.speed * config.speed, 0));
		};
		
		this.right = function(screen) {
			this.x = math.floor(math.min(this.x + this.speed * config.speed, screen.width - this.width ));
		};
		
		this.up = function(screen) {
			this.y = math.round(math.max(this.y - this.speedVertical * config.speed, 0));
		};
		
		this.down = function(screen) {
			this.y = math.round(math.min(this.y + this.speedVertical * config.speed, screen.height - this.height ));
		};
		
		this.destroy = function() {
			delete entities[ this.id ];
			delete this;
		};
		
		this.collidesWith = function(gameObject) {
			if( ! this.x || ! this.y )
				return false;
						
			return ((
						(this.x <= gameObject.x + gameObject.width && this.x >= gameObject.x)
							||
						(this.x + this.width >= gameObject.x && this.x + this.width <= gameObject.x + gameObject.width )
					)
				&&
					(
						(this.y <= gameObject.y + gameObject.height && this.y >= gameObject.y)
							||
						(this.y + this.height >= gameObject.y && this.y + this.height <= gameObject.y + gameObject.height )
					));
		};
	};

	var Ship = function() {		
		this.shields = 0;
		this.shieldsMax = 50;
		this.plating = 0;
		this.hp = 600;
		this.hpMax = 700;
		this.bounceShield = 0;
		
		if( ! this.shieldImage )
		{
			this.shieldImage = new Image();
			this.shieldImage.src = imagePath + "shield.png";
		}
		this.platingImage = new Image();
		this.platingImage.src = imagePath + "plating.png";
		
		this.weapon = Laser;
		this.weaponLastShot = 0;
		this.weaponBurst = 0;
		this.reloading = false;
		
		this.collisionDamage = 8;
		
		this.render = function(context) {
			Ship.prototype.render.apply(this, [context]);
			
			// shield
			if( this.shieldsMax > 0 )
			{
				var alpha = math.min(this.shields / this.shieldsMax, this.shieldsMax / 100);
				if( alpha > 0 ) alpha += 0.2;
				
				if( this.bounceShield > 0 )
					alpha = 1;
				
				context.ctx.globalAlpha = alpha;
				context.ctx.drawImage(
					this.shieldImage,
					this.x - math.abs(this.width - this.shieldImage.width) / 2,
					this.y - math.abs(this.height - this.shieldImage.height) / 2,
					this.shieldImage.width,
					this.shieldImage.height
				);
				context.ctx.globalAlpha = 1;
			}
			
			// platings
			if( this.plating > 0 )
			{
				var centerX = math.floor(this.x + this.width / 2);
				var centerY = math.floor(this.y + this.height / 2  );
				
				for(var i=0; i < this.plating; i++)
					context.ctx.drawImage(
						this.platingImage,
						centerX + (i - math.floor(this.plating / 2)) * 8 ,
						centerY - this.height / 1.2 * this.direction + 2 * math.pow(math.abs(i - this.plating / 2),1.25) * this.direction,
						4,
						6
					);
			}
		};
		
		this.update = function(now) {
			
			if( this.bounceShield < now )
			{
				this.shieldImage.src = imagePath + "shield.png";
				this.bounceShield = 0;
			}
			
			if( this.weaponLastShot !== 0 && (now - this.weaponLastShot) >= this.weapon.cooldown && this.reloading === true )
			{
				this.reloading = false;
				this.weaponBurst = 0;
			}
			
		};
		
		this.setShieldBounce = function(lasts, now) {
			this.shieldImage = new Image();
			this.shieldImage.src = imagePath + "bounce-shields.png";
			this.bounceShield = now + lasts;
		};
		
		this.hpRegeneration = {
			value: 5,
			speed: 1000,
			lastUpdate: 0,
			isScheduled: function(now) {
				return this.lastUpdate === 0 || (now - this.lastUpdate) >= this.speed;
			}
		};
		this.shieldsRegeneration = {
			value: 0.1,
			speed: 100,
			lastUpdate: 0,
			isScheduled: function(now) {
				return this.lastUpdate === 0 || (now - this.lastUpdate) >= this.speed;
			}
		};
		
		this.damage = function(value, shot) {
			if( this.bounceShield > 0 )
			{
				if( shot && shot.damagesBounce )
					this.bounceShield -= shot.damageValue * 20;
				
				var bounce = math.random();
				
				if( bounce > 0.65 )
					return 1;
				if( bounce > 0.25)
					return -1;
				else
					return 0;
			}
			else if( this.shields > 0 )
			{
				this.shields = math.round(math.max(this.shields - value, 0), 2);
				
				this.shieldsRegeneration.lastUpdate += config.shieldShocked;
			}
			else if( this.plating > 0 )
			{
				this.plating -= (this === player ? (math.random() > 0.4 ? 0 : 1) : 1);
				this.hp = math.round(this.hp - value / config.platingPower, 2);
			}
			else
				this.hp = math.round(this.hp - value, 2);
			
			return null;
		};
		
		this.regenerate = function(now) {
			if( this.reloading && ! this.isInSpiritWorld )
				return;
			
			if( this.hpRegeneration.isScheduled(now) )
			{
				var value = this.hpRegeneration.value;				
				this.hp = math.round(math.min(this.hp + value, this.hpMax), 2);
				this.hpRegeneration.lastUpdate = now;
			}
			if( this.shieldsRegeneration.isScheduled(now) )
			{
				this.shields = math.round(math.min(this.shields + this.shieldsRegeneration.value, this.shieldsMax), 2);
				this.shieldsRegeneration.lastUpdate = now;
			}
		};
		
		this.fire = function(context, now, shiftHeight) {			
			if( this.weaponLastShot === 0 || (now - this.weaponLastShot) >= this.weapon.cooldown )
			{
				if( this.reloading === true )
				{
					this.reloading = false;
					this.weaponBurst = 0;
				}
				var count = 1;
				
				if( weaponConstructors[ this.weapon.desc ] )
					count = weaponConstructors[ this.weapon.desc ][
						math.min(this.weapons[ this.weaponSelected ].level, weaponConstructors[ this.weapon.desc ].length - 1)
					].bind(this)();
				else
				{
					var shot = new this.weapon();
					entities[ shot.id ] = shot;
					shot.direction = this.direction;
					shot.shotBy = this;
					shot.x = this.x + this.width / 2 - shot.width / 2;
					shot.y = this.y + (this.direction === -1 ? this.height + 10 : -10 );
					
					if( shiftHeight )
						shot.y += shiftHeight;
				}
				
				this.weaponBurst += count;				
				this.weaponLastShot = now;
				
				if( this.weaponBurst >= this.weapon.burst )
				{
					this.reloading = true;
					this.weaponLastShot += this.weapon.reload;
				}
			}
		};
	};
	
	Ship.prototype = new GameObject();
	Ship.prototype.constructor = GameObject;
	
	// --- Weapons --------------------------------------------------------------
	var Weapon = function() {
		this.damageValue = 0;
		this.angle = 0;
		this.shotBy = null;
		this.bounces = false;
		this.destroyOnImpact = true;
		this.diesOnBounce = false;
		this.damagesBounce = false;
		
		this.up = function(screen) {
			if( this.angle == 0 )
				Weapon.prototype.up.apply(this, [screen]);
			else
			{
				var mul = math.sqrt(2);
				
				this.x = math.min(math.max(this.x + this.speedVertical * config.speed * mul * this.angle, 0), screen.width - this.width);
				this.y = math.max(this.y - this.speedVertical * config.speed * mul, 0);
			}
		};
		
		this.down = function(screen) {
			if( this.angle == 0 )
				Weapon.prototype.down.apply(this, [screen]);
			else
			{
				var mul = math.sqrt(2);
				
				this.x = math.min(math.max(this.x - this.speedVertical * config.speed * mul * this.angle, 0), screen.width - this.width);
				this.y = math.min(math.max(this.y - this.speedVertical * this.direction * config.speed * mul, 0), screen.height - this.height);
			}
		};
		
		this.move = function(screen) {
			this.direction === 1 ?	this.up(screen) : this.down(screen);
			
			if( (this.x === 0 || this.x + this.width === screen.width) && this.bounces )
				this.angle *= -1;
			
			if( this.y <= 0 || this.y + this.height >= screen.height )
				this.destroy();
			
			var self = this;
			var cancelled = false;
			var bounced = false;
			entities.each(function(entity){				
				if( cancelled == false && "damage" in entity && self.collidesWith(entity) && (!self.shotBy || self.shotBy !== entity) )
				{
					if( self.direction === 1 || entity === player )
					{
						var damage = self.damageValue;
						
						if( entity === player )
							damage *= difficulty.value;
						
						var bounce = entity.damage(damage, self);
						
						if( bounce !== null && self.diesOnBounce === false )
						{	
							self.angle = bounce;
							self.direction *= -1;
							self.bounces = true;
						}
						else
							cancelled = self.destroyOnImpact;
						
						if( bounce !== null && self.diesOnBounce )
							bounced = true;
					}
				}
			});
			
			if( bounced || (cancelled && self.destroyOnImpact) )
				this.destroy();
		};
	};
	
	Weapon.prototype = new GameObject();
	Weapon.prototype.constructor = GameObject;
	
	
	var weaponConstructors = {
		"Laser cannon": [
			function() {
				var shot = new this.weapon();
				entities[ shot.id ] = shot;
				shot.direction = this.direction;
				shot.x = this.x + this.width / 2 - shot.width / 2;
				shot.y = this.y + (this.direction === -1 ? this.height + shot.height : -shot.height );
				shot.shotBy = this;
				
				return 1;
			},
			
			function() {
				var shot = new this.weapon();
				entities[ shot.id ] = shot;
				shot.direction = this.direction;
				shot.damageValue *= 0.6;
				shot.x = this.x + this.width / 2 - shot.width / 2 - shot.width;
				shot.y = this.y + (this.direction === -1 ? this.height + shot.height : -shot.height );
				shot.shotBy = this;
				
				var shot2 = new this.weapon();
				entities[ shot2.id ] = shot2;
				shot2.direction = this.direction;
				shot2.damageValue *= 0.6;
				shot2.x = this.x + this.width / 2 + shot.width / 2;
				shot2.y = this.y + (this.direction === -1 ? this.height + shot2.height : -shot2.height );
				shot2.shotBy = this;
				
				return 1.2;
			},
			
			function() {
				var shot = new this.weapon();
				entities[ shot.id ] = shot;
				shot.height *= 2;
				shot.direction = this.direction;
				shot.damageValue *= 0.8;
				shot.x = this.x + this.width / 2 - shot.width / 2 - shot.width;
				shot.y = this.y + (this.direction === -1 ? this.height + shot.height : -shot.height );
				shot.shotBy = this;
				
				var shot2 = new this.weapon();
				entities[ shot2.id ] = shot2;
				shot2.height *= 2;
				shot2.direction = this.direction;
				shot2.damageValue *= 0.8;
				shot2.x = this.x + this.width / 2 + shot.width / 2;
				shot2.y = this.y + (this.direction === -1 ? this.height + shot2.height : -shot2.height );
				shot2.shotBy = this;
				
				return 1.6;
			},
			
			function() {
				var shot = new this.weapon();
				entities[ shot.id ] = shot;
				shot.direction = this.direction;
				shot.x = this.x + this.width / 2 - shot.width / 2;
				shot.y = this.y + (this.direction === -1 ? this.height + shot.height : -shot.height );
				shot.shotBy = this;
				
				var shot2 = new this.weapon();
				entities[ shot2.id ] = shot2;
				shot2.direction = this.direction;
				shot2.damageValue *= 0.4;
				shot2.x = this.x + this.width / 2  - shot2.width / 2 - shot2.width * 2;
				shot2.y = this.y + (this.direction === -1 ? this.height + shot2.height : -shot2.height );
				shot2.shotBy = this;
				
				var shot3 = new this.weapon();
				entities[ shot3.id ] = shot3;
				shot3.direction = this.direction;
				shot3.damageValue *= 0.4;
				shot3.x = this.x + this.width / 2  - shot3.width / 2 + shot3.width * 2;
				shot3.y = this.y + (this.direction === -1 ? this.height + shot3.height : -shot3.height );
				shot3.shotBy = this;
				
				return 1.8;
			},
			
			function() {
				var shot = new this.weapon();
				entities[ shot.id ] = shot;
				shot.direction = this.direction;
				shot.height *= 2;
				shot.x = this.x + this.width / 2 - shot.width / 2;
				shot.y = this.y + (this.direction === -1 ? this.height + shot.height : -shot.height );
				shot.shotBy = this;
				
				var shot2 = new this.weapon();
				entities[ shot2.id ] = shot2;
				shot2.direction = this.direction;
				shot2.damageValue *= 0.65;
				shot2.height *= 2;
				shot2.x = this.x + this.width / 2  - shot2.width / 2 - shot2.width * 2;
				shot2.y = this.y + (this.direction === -1 ? this.height + shot2.height : -shot2.height );
				shot2.shotBy = this;
				
				var shot3 = new this.weapon();
				entities[ shot3.id ] = shot3;
				shot3.direction = this.direction;
				shot3.damageValue *= 0.65;
				shot3.height *= 2;
				shot3.x = this.x + this.width / 2  - shot3.width / 2 + shot3.width * 2;
				shot3.y = this.y + (this.direction === -1 ? this.height + shot3.height : -shot3.height );
				shot3.shotBy = this;
				
				return 2.3;
			},
			
			function() {
				var shot = new this.weapon();
				entities[ shot.id ] = shot;
				shot.direction = this.direction;
				shot.damageValue *= 1.6;
				shot.height *= 2.2;
				shot.x = this.x + this.width / 2 - shot.width / 2;
				shot.y = this.y + (this.direction === -1 ? this.height + shot.height : -shot.height );
				shot.shotBy = this;
				
				var shot2 = new this.weapon();
				entities[ shot2.id ] = shot2;
				shot2.direction = this.direction;
				shot2.damageValue *= 0.5;
				shot2.x = this.x + this.width / 2  - shot2.width / 2 - shot2.width * 2;
				shot2.y = this.y + (this.direction === -1 ? this.height + shot2.height : -shot2.height );
				shot2.shotBy = this;
				
				var shot3 = new this.weapon();
				entities[ shot3.id ] = shot3;
				shot3.direction = this.direction;
				shot3.damageValue *= 0.5;
				shot3.x = this.x + this.width / 2  - shot3.width / 2 + shot3.width * 2;
				shot3.y = this.y + (this.direction === -1 ? this.height + shot3.height : -shot3.height );
				shot3.shotBy = this;
				
				var shot4 = new this.weapon();
				entities[ shot4.id ] = shot4;
				shot4.direction = this.direction;
				shot4.damageValue *= 0.3;
				shot4.width *= 0.6;
				shot4.height *= 0.6;
				shot4.x = this.x + this.width / 2  - shot4.width / 2 - shot4.width * 20;
				shot4.y = this.y + (this.direction === -1 ? this.height + shot4.height : -shot4.height );
				shot4.shotBy = this;
				
				var shot5 = new this.weapon();
				entities[ shot5.id ] = shot5;
				shot5.direction = this.direction;
				shot5.damageValue *= 0.3;
				shot5.width *= 0.6;
				shot5.height *= 0.6;
				shot5.x = this.x + this.width / 2  - shot5.width / 2 + shot5.width * 20;
				shot5.y = this.y + (this.direction === -1 ? this.height + shot5.height : -shot5.height );
				shot4.shotBy = this;
				
				return 2.8;
			},
			
			function() {
				var shot = new this.weapon();
				entities[ shot.id ] = shot;
				shot.direction = this.direction;
				shot.damageValue *= 1.4;
				shot.height *= 2;
				shot.x = this.x + this.width / 2 - shot.width / 2;
				shot.y = this.y + (this.direction === -1 ? this.height + shot.height : -shot.height );
				shot.shotBy = this;
				
				var shot2 = new this.weapon();
				entities[ shot2.id ] = shot2;
				shot2.direction = this.direction;
				shot2.damageValue *= 0.6;
				shot2.height *= 2;
				shot2.x = this.x + this.width / 2  - shot2.width / 2 - shot2.width * 4;
				shot2.y = this.y + (this.direction === -1 ? this.height + shot2.height : -shot2.height );
				shot2.shotBy = this;
				
				var shot3 = new this.weapon();
				entities[ shot3.id ] = shot3;
				shot3.direction = this.direction;
				shot3.damageValue *= 0.6;
				shot3.height *= 2;
				shot3.x = this.x + this.width / 2  - shot3.width / 2 + shot3.width * 4;
				shot3.y = this.y + (this.direction === -1 ? this.height + shot3.height : -shot3.height );
				shot3.shotBy = this;
				
				var shot4 = new this.weapon();
				entities[ shot4.id ] = shot4;
				shot4.direction = this.direction;
				shot4.damageValue *= 0.4;
				shot4.width *= 0.6;
				shot4.height *= 0.6;
				shot4.x = this.x + this.width / 2  - shot4.width / 2 - shot4.width * 24;
				shot4.y = this.y + (this.direction === -1 ? this.height + shot4.height : -shot4.height );
				shot4.shotBy = this;
				
				var shot5 = new this.weapon();
				entities[ shot5.id ] = shot5;
				shot5.direction = this.direction;
				shot5.damageValue *= 0.4;
				shot5.width *= 0.6;
				shot5.height *= 0.6;
				shot5.x = this.x + this.width / 2  - shot5.width / 2 + shot5.width * 24;
				shot5.y = this.y + (this.direction === -1 ? this.height + shot5.height : -shot5.height );
				shot5.shotBy = this;
				
				return 4;
			},
		
			function() {
				var shot = new this.weapon();
				entities[ shot.id ] = shot;
				shot.direction = this.direction;
				shot.damageValue *= 1.7;
				shot.height *= 2.25;
				shot.x = this.x + this.width / 2 - shot.width / 2;
				shot.y = this.y + (this.direction === -1 ? this.height + shot.height : -shot.height );
				shot.shotBy = this;
				
				var shot2 = new this.weapon();
				entities[ shot2.id ] = shot2;
				shot2.direction = this.direction;
				shot2.damageValue *= 0.6;
				shot2.height *= 2;
				shot2.x = this.x + this.width / 2  - shot2.width / 2 - shot2.width * 4;
				shot2.y = this.y + (this.direction === -1 ? this.height + shot2.height : -shot2.height );
				shot2.shotBy = this;
				
				var shot3 = new this.weapon();
				entities[ shot3.id ] = shot3;
				shot3.direction = this.direction;
				shot3.damageValue *= 0.6;
				shot3.height *= 2;
				shot3.x = this.x + this.width / 2  - shot3.width / 2 + shot3.width * 4;
				shot3.y = this.y + (this.direction === -1 ? this.height + shot3.height : -shot3.height );
				shot3.shotBy = this;
				
				var shot4 = new this.weapon();
				entities[ shot4.id ] = shot4;
				shot4.direction = this.direction;
				shot4.damageValue *= 0.65;
				shot4.width *= 0.7;
				shot4.height *= 0.9;
				shot4.x = this.x + this.width / 2  - shot4.width / 2 - shot4.width * 24;
				shot4.y = this.y + (this.direction === -1 ? this.height + shot4.height : -shot4.height );
				shot4.shotBy = this;
				
				var shot5 = new this.weapon();
				entities[ shot5.id ] = shot5;
				shot5.direction = this.direction;
				shot5.damageValue *= 0.65;
				shot5.width *= 0.7;
				shot5.height *= 0.9;
				shot5.x = this.x + this.width / 2  - shot5.width / 2 + shot5.width * 24;
				shot5.y = this.y + (this.direction === -1 ? this.height + shot5.height : -shot5.height );
				shot5.shotBy = this;
				
				return 4;
			}
		],
		"Plasma cannon": [
			function() {
				var shot = new this.weapon();
				entities[ shot.id ] = shot;
				shot.direction = this.direction;
				shot.x = this.x + this.width / 2 - shot.width / 2;
				shot.y = this.y + (this.direction === -1 ? this.height + shot.height : -shot.height );
				shot.shotBy = this;
				
				return 1;
			},
			
			function() {
				var shot = new this.weapon();
				entities[ shot.id ] = shot;
				shot.width *= 1.25;
				shot.height *= 1.25;
				shot.damageValue *= 1.4;
				shot.direction = this.direction;
				shot.shotBy = this;
				shot.x = this.x + this.width / 2 - shot.width / 2;
				shot.y = this.y + (this.direction === -1 ? this.height + shot.height : -shot.height );
				
				return 1.25;
			},
			
			function() {
				var shot = new this.weapon();
				entities[ shot.id ] = shot;
				shot.width *= 1.4;
				shot.height *= 1.4;
				shot.damageValue *= 2;
				shot.direction = this.direction;
				shot.shotBy = this;
				shot.x = this.x + this.width / 2 - shot.width / 2;
				shot.y = this.y + (this.direction === -1 ? this.height + shot.height : -shot.height );
				
				return 1.5;
			},
			
			function() {
				var shot = new this.weapon();
				entities[ shot.id ] = shot;
				shot.width *= 1.6;
				shot.height *= 1.6;
				shot.damageValue *= 3.5;
				shot.direction = this.direction;
				shot.shotBy = this;
				shot.x = this.x + this.width / 2 - shot.width / 2;
				shot.y = this.y + (this.direction === -1 ? this.height + shot.height : -shot.height );
				
				return 2;
			},
			
			function() {
				var shot = new this.weapon();
				entities[ shot.id ] = shot;
				shot.width *= 2;
				shot.height *= 2;
				shot.damageValue *= 7;
				shot.direction = this.direction;
				shot.shotBy = this;
				shot.x = this.x + this.width / 2 - shot.width / 2;
				shot.y = this.y + (this.direction === -1 ? this.height + shot.height : -shot.height );
				
				return 3;
			},
			
			function() {
				var shot = new this.weapon();
				entities[ shot.id ] = shot;
				shot.visual.width *= 1.5;
				shot.visual.height *= 1.5;
				shot.damageValue *= 5;
				shot.direction = this.direction;
				shot.shotBy = this;
				shot.x = this.x + this.width / 2 - shot.width / 2 - shot.width;
				shot.y = this.y + (this.direction === -1 ? this.height + shot.height : -shot.height );
				
				var shot2 = new this.weapon();
				entities[ shot2.id ] = shot2;
				shot2.visual.width *= 1.5;
				shot2.visual.height *= 1.5;
				shot2.damageValue *= 5;
				shot2.direction = this.direction;
				shot2.shotBy = this;
				shot2.x = this.x + this.width / 2 + shot2.width / 2;
				shot2.y = this.y + (this.direction === -1 ? this.height + shot2.height : -shot2.height );
				
				return 4;
			},
			
			function() {
				var shot = new this.weapon();
				entities[ shot.id ] = shot;
				shot.visual.width *= 1.85;
				shot.visual.height *= 1.85;
				shot.damageValue *= 6;
				shot.direction = this.direction;
				shot.shotBy = this;
				shot.x = this.x + this.width / 2 - shot.width / 2 - shot.width;
				shot.y = this.y + (this.direction === -1 ? this.height + shot.height : -shot.height );
				
				var shot2 = new this.weapon();
				entities[ shot2.id ] = shot2;
				shot2.visual.width *= 1.85;
				shot2.visual.height *= 1.85;
				shot2.damageValue *= 6;
				shot2.direction = this.direction;
				shot2.shotBy = this;
				shot2.x = this.x + this.width / 2 + shot2.width / 2;
				shot2.y = this.y + (this.direction === -1 ? this.height + shot2.height : -shot2.height );
				
				return 6;
			}
		]
	};
	
	
	
	var Laser = function() {
		this.id = ++gameObjectId;
		this.damageValue = 110;
		this.speedVertical = 15;
		this.width = 7;
		this.height = 18;
		this.sprite = "laser";
		this.setVisualType("normal");
		this.bounces = true;
	};
	
	Laser.desc = "Laser cannon";
	Laser.cooldown = 90;
	Laser.reload = 1400;
	Laser.burst = 200;
	Laser.prototype = new Weapon();
	Laser.prototype.constructor = Weapon;
	
	var Plasma = function() {
		this.id = ++gameObjectId;
		this.damageValue = 450;
		this.speedVertical = 9;
		this.width = 7;
		this.height = 18;
		this.sprite = "plasma";
		this.setVisualType("normal");
		this.damagesBounce = true;
	};
	
	Plasma.desc = "Plasma cannon";
	Plasma.cooldown = 300;
	Plasma.reload = 1400;
	Plasma.burst = 70;
	Plasma.prototype = new Weapon();
	Plasma.prototype.constructor = Weapon;
	
	var HellTwin = function() {
		this.id = ++gameObjectId;
		this.damageValue = 20;
		this.speedVertical = 8;
		this.width = 20;
		this.height = 30;
		this.sprite = "helltwin";
		this.setVisualType("normal");
	};
	
	HellTwin.desc = "HellTwin striker";
	HellTwin.cooldown = 300;
	HellTwin.reload = 4000;
	HellTwin.burst = 10;
	HellTwin.prototype = new Weapon();
	HellTwin.prototype.constructor = Weapon;
	
	var StarCannon = function() {
		this.id = ++gameObjectId;
		this.damageValue = 7;
		this.speedVertical = 8;
		this.width = 7;
		this.height = 18;
		this.sprite = "starcannon";
		this.setVisualType("normal");
	};
	
	StarCannon.desc = "Star cannon";
	StarCannon.cooldown = 320;
	StarCannon.reload = 2500;
	StarCannon.burst = 7;
	StarCannon.prototype = new Weapon();
	StarCannon.prototype.constructor = Weapon;
	
	var Annihilator = function() {
		this.id = ++gameObjectId;
		this.damageValue = 5;
		this.speedVertical = 9;
		this.width = 25;
		this.height = 45;
		this.sprite = "annihilator";
		this.setVisualType("normal");
		this.diesOnBounce = true;
		this.damagesBounce = true;
	};
	
	Annihilator.desc = "Annihilator";
	Annihilator.cooldown = 60;
	Annihilator.reload = 5000;
	Annihilator.burst = 100;
	Annihilator.prototype = new Weapon();
	Annihilator.prototype.constructor = Weapon;
	
	var SunScorch = function() {
		this.id = ++gameObjectId;
		this.damageValue = 1200;
		this.speedVertical = 9;
		this.width = 75;
		this.height = 11;
		this.sprite = "sunscorch";
		this.setVisualType("normal");
		this.destroyOnImpact = false;
	};
	
	SunScorch.desc = "Sun-scorcher";
	SunScorch.cooldown = 700;
	SunScorch.reload = 2000;
	SunScorch.burst = 20;
	SunScorch.prototype = new Weapon();
	SunScorch.prototype.constructor = Weapon;
	
	var PlateWall = function() {
		this.id = ++gameObjectId;
		this.damageValue = 0;
		this.collisionDamage = 30;
		this.speedVertical = 0.05;
		this.width = 75;
		this.height = 8;
		this.sprite = "platewall";
		this.setVisualType("normal");
		
		this.hp = 800;
		this.hpMax = 800;
		this.plating = 6;
		this.shields = this.shieldsMax = 0;
		
		this.damage = function(value) {
			PlateWall.prototype.damage.apply(this, [value]);
			
			if( this.hp / this.hpMax < 0.4 )
				this.setVisualType("dying");
			else if( this.hp / this.hpMax < 0.75 )
				this.setVisualType("damaged");
			
			if( this.hp <= 0 )
				this.destroy();
		};
		
		this.move = function(screen) {
			this.down(screen);
			
			if( this.y + this.height >= screen.height )
				this.destroy();
			
			if( this.collidesWith(player) )
			{
				if( player.bounceShield > 0 )
					player.bounceShiled -= 1000;
				
				player.damage(this.collisionDamage);
				
				if( player.bounceShield > 0 )
					this.destroy();
				else
					player.down(screen);
			}
		};
	};
	
	PlateWall.desc = "PlateWall";
	PlateWall.cooldown = 2000;
	PlateWall.reload = 8000;
	PlateWall.burst = 2;
	PlateWall.prototype = new Ship();
	PlateWall.prototype.constructor = Ship;
	
	// --- Player --------------------------------------------------------------
	var Player = function() {
		this.id = ++gameObjectId;
		this.stats = {
			kills: 0,
			score: 0,
			killed: Object.extended({})
		};
		this.hp = 130;
		this.hpMax = 200;
		this.shieldsMax = 110;
		this.plating = 10;
		this.sprite = "player";
		this.speedVertical = 2.5;
		
		this.saved = false;		
		this.isInSpiritWorld = false;
		this.setVisualType("normal");
		
		this.weaponSelected = 0;
		this.weapons = [
			{
				blueprint: Laser,
				level: 0
			},
			{
				blueprint: Plasma,
				level: 0
			},
			{
				blueprint: SunScorch,
				level: 0
			}
		];
		
		this.hpRegeneration = {
			value: 5,
			speed: 1000,
			lastUpdate: 0,
			isScheduled: function(now) {
				return this.lastUpdate === 0 || (now - this.lastUpdate) >= this.speed;
			}
		};
		
		this.hpRegenerationSpirit = {
			value: -1,
			speed: 110,
			lastUpdate: 0,
			isScheduled: function(now) {
				return this.lastUpdate === 0 || (now - this.lastUpdate) >= this.speed;
			}
		};
		this.shieldsRegenerationSpirit = {
			value: 3,
			speed: 65,
			lastUpdate: 0,
			isScheduled: function(now) {
				return this.lastUpdate === 0 || (now - this.lastUpdate) >= this.speed;
			}
		};
		
		this.renderStats = function(context) {
			var x = 20;
			var y = context.height - 50;
			
			var status = "";
			if( isPaused )
				status = "[PAUSED]";
			if( this.isInSpiritWorld )
				status = "[IN SPIRIT WORLD]";
			
			
			context.ctx.textAlign = "left";
			context.ctx.font = "bold 12px Tahoma";
			
			context.ctx.fillStyle = this.isInSpiritWorld ? "rgb(165,10,0)" : "rgba(255,230,160,0.7)";
			context.ctx.fillText(status, x, y);
			
			var first = "Shields: " + this.shields + " / " + this.shieldsMax + " ";
			first    += "  :  Plating: " + this.plating + "  :  HP " + this.hp + " / " + this.hpMax;
			first += "   |   Difficulty: " + difficulty.level;
			
			context.ctx.fillStyle = this.isInSpiritWorld ? "rgb(165,10,0)" : "rgba(100,230,60,0.7)";
			context.ctx.fillText(first, x, y + context.fix(20));
			
			var second  = "Score: " + this.stats.score + " (kills: " + this.stats.kills + ")"
			
			context.ctx.fillText(second, x, y + 40 );
			
			context.ctx.textAlign = "right";
			second = "Weapon: " + this.weapon.desc;
			second += " (level " + (this.weapons[ this.weaponSelected ].level+1) + ")";
			second += "  burst ["
			
			var depleted = math.min(math.floor( this.weaponBurst / this.weapon.burst * 20), 20);
			
			for(var i=0; i < (20 - depleted); i++)
				second += ":";
			for(var j=0; j < depleted; j++)
				second += " ";
			
			second += "]";
				
			context.ctx.fillText(second, context.width - 20, y + 40 );
		};
		
		this.damage = function(value, by) {
			var hp = this.hp;
			var bounce = Player.prototype.damage.apply(this, [value, by]);
			
			if( this.shields === 0 && this.plating === 0 && this.hp < hp )
			{
				var multiplier = 1;
				
				if( by && by.diesOnBounce === false )
					multiplier = 0.5;
				
				effects.shake(content, multiplier);
				
				if( by && by.destroyOnImpact === false )
				{
					this.down(renderContext);
				}
				else
				{
					if( math.random() > 0.5 )
					{
						this.left(renderContext);
						this.left(renderContext);
					}
					else
					{
						this.right(renderContext);
						this.right(renderContext);
					}
				}
			}
						
			if( playAudio )
			{
				audio.volume = math.min(0.5 + math.max(1 - this.hp / this.hpMax, 0) / 2, 1);
				spiritAudio.volume = math.min(0.5 + math.max(1 - this.hp / this.hpMax, 0) / 2, 1);
			}
			
			if( this.hp < 0 )
			{
				if( this.saved === false )
				{
					this.saved = true;
					
					this.hp = 1;
					this.shields = 500;
				}
				else
				{
					var self = this;
					$(document).unbind();
					$("#gameover").show().find(".score").text( this.stats.score );
					var killlist = "";

					player.stats.killed.each(function(enemy, count){
						killlist += "<li>"+enemy+" "+count+"x</li>";
					});

					$("#gameover ul").html(killlist);
					
					$("#gameover form").submit(function(){
						var nick = $("input[name=nick]").val();
						var score = self.stats.score;
						
						$.post('/scoreboard.php', {
							nick: nick,
							score: score
						}, function(){
							window.location.href = "/scoreboard.php";
						});
						
						return false;
					});

					isFinished = true;
					this.destroy();
					this.pause();

					$(document).scrollTop(0);

					setTimeout(function(){
						content.clearQueue();
						content.animate({
							left: 0,
							top: 0
						}, 2000);
					}, 2000);
				}
			}
			
			return bounce;
		};
		
		this.switchWeapons = function() {
			this.weaponSelected = (this.weaponSelected + 1) % this.weapons.length;
			
			this.weapon = this.weapons[ this.weaponSelected ].blueprint;
			
			this.weaponLastShot = 0;
			this.weaponBurst = 0;
			
			return false;
		};
		
		this.pause = function() {
			isPaused = !isPaused;
			action.keysPressed = Object.extended({});
			
			if( playAudio )
			{
				if( isPaused )
				{
					this.isInSpiritWorld ? spiritAudio.pause() : audio.pause();
				}
				else
				{
					this.isInSpiritWorld ? spiritAudio.play() : audio.play();
				}
			}
		};
		
		this.mute = function() {
			playAudio = !playAudio;
			
			if( playAudio )
				this.isInSpiritWorld ? spiritAudio.play() : audio.play();
			else
				this.isInSpiritWorld ? spiritAudio.pause() : audio.pause();
		};
		
		this.restart = function() {
			window.location.reload(true);
		};
		
		this.spiritWorld = function() {
			if( this.isInSpiritWorld === false )
			{
				spiritWorld = null;
				this.isInSpiritWorld = true;
				
				if( playAudio )
				{
					audio.pause();
					spiritAudio.play();
				}
				
				content.clearQueue();
				content.animate({
					left: 0,
					top: 0
				}, 200);
				
				this._hpRegeneration = this.hpRegeneration;
				this._shieldsRegeneration = this.shieldsRegeneration;
				
				this.hpRegeneration = this.hpRegenerationSpirit;
				this.shieldsRegeneration = this.shieldsRegenerationSpirit;
			}
			else
				this.exitSpiritWorld();
		};
	
		this.update = function(now) {
			if( this.isInSpiritWorld && this.hp < 25 )
				this.exitSpiritWorld();
			
			Player.prototype.update.apply(this, [now]);
		};
		
		this.exitSpiritWorld = function() {
			if( playAudio )
			{
				audio.play();
				spiritAudio.pause();
			}
			
			if( this._hpRegeneration && this._shieldsRegeneration )
			{
				this.hpRegeneration = this._hpRegeneration;
				this.shieldsRegeneration = this._shieldsRegeneration;
			}
			
			this.isInSpiritWorld = false;
			spiritWorld = null;
		};
	};
	
	Player.prototype = new Ship();
	Player.prototype.constructor = Ship;
	
	
	// --- Enemy ---------------------------------------------------------------
	var Enemy = function() {
		this.id = ++gameObjectId;
		this.sprite = "enemy";
		this.weapon = StarCannon;
		
		this.desc = "Enemy fighter";
		
		// movement
		this.speed = 1;
		this.speedVertical = 1;
		this.direction = -1;
		this.chargeup = 200 + math.random() * 200;
		this.tendency = 50 + math.random() * 110;
		var dir = 1;
		this.shoots = true;
		this.strafes = true;
		this.staticShooting = false;
		
		// score
		this.score = 85;
		
		if( math.random() > 0.5 )
			dir = -1;
		
		
		this.setVisualType("normal");
		
		this.move = function(screen, now) {
			var fired = false;
			
			if( this.shoots === false || this.y < this.getDistanceClose(screen) )
				this.down(screen);
			else if( this.y > this.getDistanceClose(screen) && this.canReturnBack  )
				this.up(screen);
			else
			{
				this.fire(screen, now);
				fired = true;
			}
			
			if( (this.shoots === true || this.strafes === true) && (fired === false || this.staticShooting === false) )
			{
				if( this.escapes > 0 && (this.hp / this.hpMax) <  this.escapes && math.abs(this.x - player.x) < screen.width * (1 - this.escapes) )
				{
					if( this.x > player.x )
						this.right(screen);
					else
						this.left(screen);
					
					this.escapes -= 0.005;
				}
				else if( this.chargeup < 0 )
				{
					if( this.x > player.x && (this.x - player.x > this.width / 2) )
						this.left(screen);
					else if( (player.x - this.x > this.width / 2) )
						this.right(screen);
				}
				else if( this.chargeup > 0 || this.chargeup === null )
				{
					if( this.tendency * dir > 0 )
						this.left(screen);
					else
						this.right(screen);
					this.tendency--;

					if( this.tendency <  -50 - math.random() * 110)
						this.tendency = 50 + math.random() * 110;
				}
				
				if( this.chargeup >= 0 )
					this.chargeup--;
			}
			
			if( this.collidesWith(player) )
			{
				player.damage(this.collisionDamage);
				this.destroy();
			}
			
			if( this.y + this.height >= screen.height )
				this.destroy();
		};
		
		this.getDistanceClose = function(screen) {
			return screen.height * (0.1 + math.random() * 0.4);
		};
		
		this.damage = function(value, shot) {			
			var bounce = Enemy.prototype.damage.apply(this, [value, shot]);
			
			if( this.hp < 0 )
			{
				player.stats.score += this.score;
				player.stats.kills++;
				if( ! player.stats.killed[ this.desc ] )
					player.stats.killed[ this.desc ] = 1;
				else
					player.stats.killed[ this.desc ]++;
				this.destroy();
			}
			
			return bounce;
		};
	};
	
	Enemy.prototype = new Ship();
	Enemy.prototype.constructor = Ship;
	
	var FastEnemy = function() {
		this.id = ++gameObjectId;
		this.sprite = "fast";
		this.setVisualType("normal");
		
		this.speedVertical = 3;
		this.speed = 3;
		this.hp = 600;
		this.shields = this.shieldsMax = 800;
		this.chargeup = math.random() * 200;
		
		this.score = 90;
		this.desc = "Speedy fighter";
	};
	
	FastEnemy.prototype = new Enemy();
	FastEnemy.prototype.constructor = Enemy;
	
	var Elites = function() {
		this.id = ++gameObjectId;
		this.sprite = "elites";
		this.setVisualType("normal");
		this.desc = "Elites";
		
		this.speedVertical = 2.4;
		this.speed = 1.25;
		this.canReturnBack = true;
		this.hp = 1200;
		this.hpMax = 1300;
		this.plating = 10;
		
		this.score = 425;
		
		this.chargeup = math.random() * 50;
		this.weapon = HellTwin;
	};
	
	Elites.prototype = new Enemy();
	Elites.prototype.constructor = Enemy;
	
	var Terminator = function() {
		this.id = ++gameObjectId;
		this.sprite = "terminator";
		this.setVisualType("normal");
		this.desc = "Terminator";
		
		this.speedVertical = 2.6;
		this.speed = 1.7;
		this.canReturnBack = true;
		this.staticShooting = true;
		this.hp = this.hpMax = 9000;
		this.plating = 4;
		this.shields = this.shieldsMax = 18000;		
		this.setShieldBounce(14000, (new Date).getTime());
		
		this.score = 7000;
		
		this.chargeup = 150;
		this.weapon = Annihilator;
		
		this.fire = function(context, now, shiftHeight) {
			Terminator.prototype.fire.apply(this, [context, now, -35]);
		};
	
		this.getDistanceClose = function(screen) {
			return screen.height * (0.075 + math.random() * 0.125);
		};
	};
	
	Terminator.prototype = new Enemy();
	Terminator.prototype.constructor = Enemy;
	
	var Torpedo = function() {
		this.id = ++gameObjectId;
		this.desc = "Torpedo";
		
		this.speedVertical = 7.5;
		this.speed = 0.5;
		this.hp = 5;
		this.shields = 0;
		this.shieldsMax = 0;
		this.collisionDamage = 25;
		this.shoots = false;
		this.score = 300;
		this.sprite = "torpedo";
		this.setVisualType("normal");
	};
	
	Torpedo.prototype = new Enemy();
	Torpedo.prototype.constructor = Enemy;
	
	var Mine = function() {
		this.id = ++gameObjectId;
		this.desc = "Mine";
		
		this.speedVertical = 5;
		this.speed = 1.75;
		this.hp = 5;
		this.shields = 0;
		this.shieldsMax = 0;
		this.collisionDamage = 30;
		this.shoots = false;
		this.strafes = false;
		this.score = 350;
		this.sprite = "mine";
		this.setVisualType("normal");
		
		this.width = 27;
		this.height = 25;
	};
	
	Mine.prototype = new Enemy();
	Mine.prototype.constructor = Enemy;
	
	var Guardian = function() {
		this.id = ++gameObjectId;
		this.desc = "Guardian";
		
		this.speedVertical = 0.4;
		this.speed = 1;
		this.hp = this.hpMax = 3800;
		this.shields = 6500;
		this.shieldsMax = 6500;
		this.plating = 28;
		this.collisionDamage = 100;
		this.score = 3000;
		this.chargeup = 700;
		this.width = 120;
		this.height = 70;
		this.sprite = "guardian";
		this.setVisualType("normal");
		this.canReturnBack = true;
		
		this.weapon = PlateWall;
		
		this.getDistanceClose = function(screen) {
			return screen.height * (0.1 + math.random() * 0.15);
		};
	};
	
	Guardian.prototype = new Enemy();
	Guardian.prototype.constructor = Enemy;
	
	// --- Bonuses -------------------------------------------------------------
	var Bonus = function() {
		this.speedVertical = 2;
		this.direction = -1;
		this.width = this.height = 30;
		this.effect = null;
		this.setEffect = function(effect) {
			this.effect = effect;
		};
		
		this.move = function(screen, now) {
			this.down(screen);
			
			if( this.collidesWith(player) )
			{
				this.effect(player, now);
				this.destroy();
			}
			
			if( this.y + this.height >= screen.height )
				this.destroy();
		};
		
		this.damage = function(value) {
			this.destroy();
		};
	};
	
	Bonus.prototype = new GameObject();
	Bonus.prototype.constructor = GameObject;
	
	
	var Plating = function() {
		this.id = ++gameObjectId;
		this.sprite = "plating";
		
		this.setVisualType("normal");
		this.setEffect(function(player){
			player.plating++;
			player.hp += 5;
		});	
	};
	
	Plating.prototype = new Bonus();
	Plating.prototype.constructor = Bonus;
	
	
	var Battery = function() {
		this.id = ++gameObjectId;
		this.sprite = "battery";
		
		this.setVisualType("normal");
		this.setEffect(function(player){
			player.shields = player.shieldsMax * 2;
			player.shieldsMax = math.max(player.shieldsMax - 5, 5);
		});	
	};
	
	Battery.prototype = new Bonus();
	Battery.prototype.constructor = Bonus;
	
	var Exoskelet = function() {
		this.id = ++gameObjectId;
		this.sprite = "exoskelet";
		
		this.setVisualType("normal");
		this.setEffect(function(player){
			player.hp = math.max(player.hp - 30, 5);
			player.hpMax += 10;
		});	
	};
	
	Exoskelet.prototype = new Bonus();
	Exoskelet.prototype.constructor = Bonus;
	
	var Firepower = function() {
		this.id = ++gameObjectId;
		this.sprite = "firepower";
		
		this.setVisualType("normal");
		this.setEffect(function(player){
			player.weapons[ player.weaponSelected ].level++;
			player.weaponBurst = 1000000;
		});	
	};
	
	Firepower.prototype = new Bonus();
	Firepower.prototype.constructor = Bonus;
	
	var Bouncer = function() {
		this.id = ++gameObjectId;
		this.sprite = "bouncer";
		
		this.setVisualType("normal");
		this.setEffect(function(player, now){
			player.shields = 0;
			player.setShieldBounce(7000, now);
		});
	};
	
	Bouncer.prototype = new Bonus();
	Bouncer.prototype.constructor = Bonus;
	
	
	
	// --- Generators ----------------------------------------------------------
	var enemyGenerator = null;
	var specialsGenerator = null;
	
	var Generator = function(waves) {
		this.spacing = 15;
		this.waves = waves;
		this.wave = {
			index: 0,
			subindex: 0,
			speed: 500,
			completed: this.waves[0],
			lastUpdate: 0,
			isScheduled: function(now, speed) {
				return this.lastUpdate === 0 || (now - this.lastUpdate) >= (speed || this.speed);
			}
		};
		this.lastPosition = 20;
		
		this.createWave = function(screen, now) {
			if( this.wave.isScheduled(now, this.wave.completed[this.wave.subindex].speed) )
			{
				var enemy = this.createEnemy(
					screen,
					this.wave.completed[this.wave.subindex].name,
					this.wave.completed[this.wave.subindex].random
				);
				
				entities[ enemy.id ] = enemy;
				this.wave.completed[this.wave.subindex].count--;
				
				this.wave.lastUpdate = now;
				
				if( this.wave.completed[this.wave.subindex].count <= 0 )
				{
					this.wave.completed[this.wave.subindex].count = this.wave.completed[this.wave.subindex].fullCount;
					this.wave.lastUpdate += this.wave.completed[this.wave.subindex].waitAfter / config.speed;
					// next subwave
					this.wave.subindex++;
				
					if( this.wave.subindex >= this.wave.completed.length )
					{
						// next wave
						this.lastPosition = 20;
						this.wave.subindex = 0;
						this.wave.index = (this.wave.index + 1) % this.waves.length;
						this.wave.completed = this.waves[ this.wave.index ];
						
						for(var i=0; i<this.wave.completed.length; i++ )
							if( this.wave.completed[i].fullCount > 1 )
								this.wave.completed[i].fullCount = this.wave.completed[i].count = this.wave.completed[i].fullCount + difficulty.level;
					}
				}
			}
		};
		
		this.createEnemy = function(screen, blueprint, isRandom) {
			var enemy = new blueprint;
			
			enemy.x = isRandom ? math.floor(math.random() * (screen.width - (enemy.width + 20) * 2)) + 20 + enemy.width :
								this.lastPosition;
			
			this.lastPosition += enemy.width + this.spacing;
			
			if( this.lastPosition + enemy.width > screen.width )
				this.lastPosition = 20;
			
			return enemy;
		}		
	};
	
	var generators = [
		{
			enemy: [
				[{name: Enemy, fullCount: 5, count: 5, waitAfter: 3000, speed: 500}, {name: FastEnemy, fullCount: 2, count: 2, waitAfter: 1000, speed: 10}],
				[{name: FastEnemy, fullCount: 4, count: 4, waitAfter: 1000, speed: 1200}],
				[{name: Guardian, fullCount: 1, count: 1, waitAfter: 38000}],
				[{name: Enemy, fullCount: 6, count: 6, waitAfter: 500, speed: 1600}],
				[{name: Elites, fullCount: 3, count: 3, waitAfter: 1200, speed: 700}],
				[{name: Mine, fullCount: 10, count: 10, waitAfter: 1500, speed: 65, random: true}],
				[{name: Torpedo, fullCount: 8, count: 8, waitAfter: 100, speed: 65}],
				[{name: Torpedo, fullCount: 8, count: 8, waitAfter: 100, speed: 65, random: true}],
				[{name: Enemy, fullCount: 6, count: 6, waitAfter: 3000}],
				[{name: Torpedo, fullCount: 8, count: 8, waitAfter: 200}],
				[{name: Torpedo, fullCount: 25, count: 25, waitAfter: 100, random: true}],
				[{name: Torpedo, fullCount: 8, count: 8, waitAfter: 1500, speed: 65}],
				[{name: Elites, fullCount: 4, count: 4, waitAfter: 6000}],
				[{name: Mine, fullCount: 10, count: 10, waitAfter: 1500, speed: 65, random: true}],
				[{name: Torpedo, fullCount: 8, count: 8, waitAfter: 100}],
				[{name: Elites, fullCount: 6, count: 6, waitAfter: 6000, random: true}],
				[{name: Torpedo, fullCount: 8, count: 8, waitAfter: 100, speed: 65}],
				[{name: Torpedo, fullCount: 8, count: 8, waitAfter: 1000, speed: 65, random: true}],
				[{name: Mine, fullCount: 10, count: 10, waitAfter: 1500, speed: 65, random: true}],
				[{name: Enemy, fullCount: 3, count: 3, waitAfter: 5000, speed: 1600, random: true}],
				[{name: Guardian, fullCount: 1, count: 1, waitAfter: 5000}],
				[{name: FastEnemy, fullCount: 8, count: 8, waitAfter: 5000, speed: 65}],
				[{name: FastEnemy, fullCount: 6, count: 6, waitAfter: 10000, speed: 120}],
				[{name: FastEnemy, fullCount: 8, count: 8, waitAfter: 20000, speed: 180}],
				[{name: Torpedo, fullCount: 25, count: 25, waitAfter: 100, random: true}],
				[{name: Elites, fullCount: 5, count: 5, waitAfter: 8000, random: true}],
				[{name: Elites, fullCount: 8, count: 8, waitAfter: 6000, random: true}],
				[{name: Enemy, fullCount: 6, count: 6, waitAfter: 1000}],
				[{name: Enemy, fullCount: 6, count: 6, waitAfter: 3000}],
				[{name: Mine, fullCount: 20, count: 20, waitAfter: 100, speed: 100, random: true}],
				[{name: Elites, fullCount: 4, count: 4, waitAfter: 6000, random: true}],
				[{name: Mine, fullCount: 20, count: 20, waitAfter: 100, speed: 100, random: true}],
				[{name: Enemy, fullCount: 6, count: 6, waitAfter: 2000}],
				[{name: FastEnemy, fullCount: 8, count: 8, speed: 65, waitAfter: 500}],
				[{name: FastEnemy, fullCount: 8, count: 8, speed: 65, waitAfter: 2000}],
				[{name: Terminator, fullCount: 1, count: 1, waitAfter: 2000, random: true}],
				[{name: Mine, fullCount: 10, count: 10, waitAfter: 17000, speed: 65, random: true}]
			],
			specials: [
				[{name: Plating, fullCount: 1, count: 1, waitAfter: 5000, random: true}],
				[{name: Battery, fullCount: 1, count: 1, waitAfter: 4000, random: true}],
				[{name: Bouncer, fullCount: 1, count: 1, waitAfter: 4000, random: true}],
				[{name: Plating, fullCount: 1, count: 1, waitAfter: 5000, random: true}],
				[{name: Battery, fullCount: 1, count: 1, waitAfter: 1000, random: true},
				 {name: Plating, fullCount: 1, count: 1, waitAfter: 4000, random: true}],
				[
					{name: Exoskelet, fullCount: 1, count: 1, waitAfter: 10, random: true},
					{name: Firepower, fullCount: 1, count: 1, waitAfter: 4000, random: true}
				]
			]
		}
	];
	
	
	/**
	 * Basics
	 */
	var speedUp = 1000;
	var gameLoop = function() {
		
		// Time
		var realTime = (new Date).getTime();
		var now;
		
		if( isPaused )
			timePauseCompensation += math.abs( realTime - previousTime );
		if( player.isInSpiritWorld )
			timeSpiritCompensation += math.abs( realTime - previousTime );
	
		now  = (new Date).getTime() - timeSpiritCompensation;
		previousTime = realTime;		
		
		// Stopped
		if( isPaused || isFinished )
		{
			action.reset();
			
			if( ! isFinished && action.keysPressed[ "key" + key.p ] )
				player.pause();
			
			if( ! isFinished )
				requestAnimFrame(gameLoop);
			
			return;
		}
		
		// clear canvas
		renderContext.ctx.clearRect(0,0,renderContext.fix(renderContext.width),renderContext.fix(renderContext.height));
		
		// background
		renderContext.ctx.fillStyle = player.isInSpiritWorld === false ? "black" : "rgb(150,150,150)";
		renderContext.ctx.fillRect(0,0,renderContext.fix(renderContext.width),renderContext.fix(renderContext.height));
		
		// actions
		if( player.isInSpiritWorld === false )
		{
			enemyGenerator.createWave(renderContext, now);
			specialsGenerator.createWave(renderContext, now);
		}
		
		player.regenerate(realTime - timePauseCompensation);
		
		var cancelActions = false;
		
		action.keysPressed.each(function(pressed, is){
			if( cancelActions )
				return;
			
			pressed = parseInt(pressed.replace(/[^\d]/g, ''));
			
			controls.each(function(control, action){
				if( cancelActions )
					return;
				
				if( is && key[control] && pressed == key[control] && player[action] )
					cancelActions = !player[action](renderContext, now);

			});
			
		});
		
		action.scheduledActions.each(function(callback){			
			player[callback](renderContext, now);
		});
		
		// contents
		if( player === undefined )
			return;
		
		entities.each(function(entity){
			
			if( ! entity )
				return;
			
			if( "move" in entity && player.isInSpiritWorld === false )
				entity.move(renderContext, now);
			
			if( "update" in entity && (player.isInSpiritWorld === false || entity === player) )
				entity.update(now);
						
			entity.render(renderContext);
		});
		
		if( player.isInSpiritWorld )
		{
			if( spiritWorld === null )
				spiritWorld = desaturate(renderContext);
			
			renderContext.ctx.putImageData(spiritWorld,0,0);
			player.render(renderContext);
		}
		
		// stats
		player.renderStats(renderContext);
				
		// clear requests
		action.reset();
		
		if( player !== undefined )
			requestAnimFrame(gameLoop);
	};
	
	var init = function(conf) {
		config = $.extend(config, conf);
		
		// canvas size
		if( config.noScale === false )
			$(window).resize(rescaleCanvas);
		
		rescaleCanvas();
		
		// attach controls
		$(document).keydown(function(event){
			immediateControls.each(function(pressed, control){				
				if( key[ pressed ] && key[ pressed ] == event.keyCode )
					action.scheduledActions.push( control );
			});
			
			action.keysPressed[ "key" + event.keyCode ] = true;
			
			return isFinished;
		});
		$(document).keyup(function(event){
			action.keysPressed[ "key" + event.keyCode ] = false;
			
			return isFinished;
		});
		
		// basic objects
		player = new Player;
		player.x = config.originalWidth / 2 - player.width / 2;
		player.y = config.originalHeight - player.height - 20;
		
		entities[player.id] = player;
		
		enemyGenerator = new Generator(generators[0].enemy);
		specialsGenerator = new Generator(generators[0].specials);
		
		// audio
		playAudio = config.audio.enabled;
		audio = $("<audio autoplay preload loop />");
		spiritAudio = $("<audio preload loop />");

		config.audio.formats.each(function(format){
			$("<source src='"+(audioPath + config.audio.track + "." + format) + "'>").appendTo(audio);
		});

		config.audio.formats.each(function(format){
			$("<source src='"+(audioPath + config.audio.spiritTrack + "." + format) + "'>").appendTo(spiritAudio);
		});

		audio.appendTo(content);
		audio = audio[0];

		spiritAudio.appendTo(content);
		spiritAudio = spiritAudio[0];
	
		if( playAudio === false )
			audio.pause();
	
		// run loop
		requestAnimFrame(gameLoop);
		
		setInterval(function(){
			difficulty.level++;
			difficulty.value += config.difficultyIncrease;
		}, config.difficultyIncreaseInterval)
	};
	

	
	/**
	 * Run
	 */
	$(document).ready(function(){
		
		// init
		window.start = init;
		
		$("body").css("width", "500px");
		canvas.hide();
		$("#gameover").hide();
		
		$("a.start").click(function(){
			$(".menu").hide();
			canvas.show();
			init(config);
			
			return false;
		});
		
		$("a.music").click(function(){
			
			config.audio.enabled = !config.audio.enabled;
			
			$(this).text( "Music is " + (config.audio.enabled ? "ON" : "OFF") );
			
			return false;
		});
		
		$("a.restart").click(function(){
			window.location.reload(true);
			
			return false;
		});
		
	});
	
})(window, window.jQuery);
