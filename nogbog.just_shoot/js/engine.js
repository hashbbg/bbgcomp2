////////////////////////////////////////////////////////////////
///////////////////////// Game Engine //////////////////////////
////////////////////////////////////////////////////////////////
function GameEngine(){
	this.context = null;
	this.entities = [];
	this.elapsedTime = 0;
	this.stop = false;
	this.pause = false;
	this.timer = new Timer();
	this.clockTick;
	this.width;
	this.height;
	
	this.update = function(){
		if (!this.pause) this.elapsedTime++;
		var entitiesCount = this.entities.length;
		for (var i=0; i<entitiesCount; i++){ if (!this.entities[i].removeFromWorld) this.entities[i].update(); }
		for (var i=this.entities.length-1; i>=0; --i){
			if (this.entities[i].removeFromWorld){
				if (this.entities[i].clear){ this.entities[i].clear(this.context); }
				// Remove from entities array //
				this.entities.splice(i, 1);
			}
		}
		if (this.background){ game.background(); } // Executes background animation code
	};
	
	this.draw = function(){
		// this.context.clearRect(0,0, this.context.canvas.width, this.context.canvas.height);
		for (var i=0; i<this.entities.length; i++){
			if (this.entities[i].last.x && this.entities[i].last.y && this.entities[i].clear){
				this.entities[i].clear(this.context); // Clear Object
			}
		}
		for (var i=0; i<this.entities.length; i++){
			this.entities[i].draw(this.context);
		}
	};
	
	this.events = function(){
		switch( this.level ){
			case 0: eventLevel0(); break;
			case 1: eventLevel1(); break;
			case 2: eventLevel2(); break;
			case 3: eventLevel3(); break;
			case 4: eventLevel4(); break;
			case 5: eventLevel5(); break;
		}
	};

	this.addEntity = function(entity){
		this.entities.push(entity);
	};
	
	this.loop = function(){
		if (!this.stop){
			this.clockTick = this.timer.tick();
			this.update();
			this.draw();
			this.events();
		}
	};
	
	this.start = function(){
			var that = this;
			(function gameLoop() {
				that.loop();
				requestAnimFrame(gameLoop);
				// requestAnimationFrame(gameLoop);
			})();
	};
}

function Timer(){
	this.gameTime = 0;
	this.maxStep = 0.05;
	this.wallLastTimestamp = 0;
	
	this.tick = function(){
		var wallCurrent = Date.now();
		var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
		this.wallLastTimestamp = wallCurrent;
		
		var gameDelta = Math.min(wallDelta, this.maxStep);
		this.gameTime += gameDelta;
		return gameDelta;
	};
}
