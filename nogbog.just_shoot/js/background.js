var stars = [];
var starSpeed = 20;
function backgroundRun(){
	bgUpdate();
	bgDraw();
}

function starsGenerate(layer, count){
	for (var i=0; i < count; i++){
		var x = Math.floor(Math.random() * (game.width - 0 + 1)) + 0;
		var y = Math.floor(Math.random() * (game.height - 0 + 1)) + 0;
		stars.push( new Stars(x,y,layer) );
	}
}

function bgUpdate(){
	for (var i=0; i < stars.length; i++){
		stars[i].last.x = stars[i].x;
		stars[i].last.y = stars[i].y;
		if ( stars[i].y > game.height ) stars[i].y = 0;
		if ( stars[i].layer == 0 ) stars[i].y += 1 * game.clockTick * starSpeed;
			else if (stars[i].layer == 1) stars[i].y += 1 * game.clockTick * starSpeed * 2;
			else if (stars[i].layer == 2) stars[i].y += 1 * game.clockTick * starSpeed * 3;
	}
}

function bgDraw(){
	for (var i=0; i < stars.length; i++){
		stars[i].draw();
	}
}

function Stars(x,y,layer){
	this.x = x;
	this.y = y;
	this.remove = false;
	this.layer = layer;
	this.last = { x: 0, y: 0 };
	
	if (layer == 0) this.draw = layer0;
		else if (layer == 1) this.draw = layer1;
		else if (layer == 2) this.draw = layer2;
}

function layer0(){
	var x = Math.floor(this.x);
	var y = Math.floor(this.y);
	var lx = Math.floor(this.last.x);
	var ly = Math.floor(this.last.y);
	bgContext.clearRect(lx, ly, 1, 1);
	bgContext.fillStyle = '#FFFFFF';
	bgContext.fillRect(x, y, 1, 1);
}

function layer1(){
	var x = Math.floor(this.x);
	var y = Math.floor(this.y);
	var lx = Math.floor(this.last.x);
	var ly = Math.floor(this.last.y);
	bgContext.clearRect(lx, ly, 2, 2);
	bgContext.fillStyle = '#FFFFFF';
	bgContext.fillRect(x, y, 2, 2);
}

function layer2(){
	var x = Math.floor(this.x);
	var y = Math.floor(this.y);
	var lx = Math.floor(this.last.x);
	var ly = Math.floor(this.last.y);
	bgContext.clearRect(lx, ly, 3, 3);
	bgContext.fillStyle = '#FFFFFF';
	bgContext.fillRect(x, y, 3, 3);
}
