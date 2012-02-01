////////////////////////////////////////////////////////////////
/////////////////////// Keyboard Input /////////////////////////
////////////////////////////////////////////////////////////////
var KEYMAP = {
	// Arrow Keys
	up: 38,	down: 40,	left: 37,	right: 39,
	// WASD
	w: 87, a: 65, s: 83, d: 68,
	// SPACE
	space: 32,
	// Number Keys
	num1: 49,
	num2: 50,
	num3: 51,
	num4: 52,
	num5: 53,
	num6: 54,
	num7: 55,
	num8: 56,
	num9: 57,
	num0: 48,
	minus: 189,
	plus: 187,
	checkKeys: function(keyCode){
		var k;
		switch(keyCode){
			case KEYMAP.up: k = 'up'; break;
			case KEYMAP.down: k = 'down'; break;
			case KEYMAP.left: k = 'left'; break;
			case KEYMAP.right: k = 'right'; break;
			case KEYMAP.space: k = 'space'; break;
			case KEYMAP.w: k = 'w'; break;
			case KEYMAP.a: k = 'a'; break;
			case KEYMAP.s: k = 's'; break;
			case KEYMAP.d: k = 'd'; break;
		}
		return k;
	}
};

function keyListener(){
	window.onkeydown = keyPressed;
	window.onkeyup = keyReleased;
}

var keysDown = []; // Tracks keys

function keyPressed(e){
		e.preventDefault(); // This disables key default behaviour, like scrolling
	var k = KEYMAP.checkKeys(e.keyCode); // This event is for keys held down
	if (k){ keysDown[k] = true; }
	
	// TESTING PURPOSES ONLY
	testKeypress(e);
}
function keyReleased(e){
	//console.log( 'Key: ' + e.keyCode );
	var k = KEYMAP.checkKeys(e.keyCode);
	if (k){ delete keysDown[k]; }
}

function isKeyDown(k){
	return keysDown[k];
}

function testKeypress(e){
	// This doesn't work
	switch(e.keyCode){
		case KEYMAP.num1: shoot({ x: 300, y: 150 }, null, 'fanRight'); break;
		case KEYMAP.num2: shoot({ x: 300, y: 150 }, null, 'fanLeft'); break;
		case KEYMAP.num3: shoot({ x: 300, y: 150 }, null, 'fanDown'); break;
		case KEYMAP.num4: shoot({ x: 300, y: 150 }, null, 'triple'); break;
		case KEYMAP.num5: shoot({ x: 300, y: 150 }, null, 'down'); break;
		case KEYMAP.num6: shoot({ x: 300, y: 150 }, null, 'left'); break;
		case KEYMAP.num7: shoot({ x: 300, y: 150 }, null, 'right'); break;
		case KEYMAP.num8: shoot({ x: 300, y: 150 }, null, 'loop'); break;
		case KEYMAP.num9: shoot({ x: 300, y: 150 }, null, 'gravity'); break;
		case KEYMAP.num0: shoot({ x: 300, y: 150 }, game.entities[0], 'atPlayer'); break;
		case KEYMAP.plus:
			console.log('plus');
			if (game.entities[0].weaponLevel < 3) game.entities[0].weaponLevel++;
			shoot({ x: 300, y: 150 }, game.entities[0], 'normal');
			break;
		case KEYMAP.minus:
			console.log('minus');
			if (game.entities[0].weaponLevel > 1) game.entities[0].weaponLevel--;
			shoot({ x: 300, y: 150 }, game.entities[0], 'normal');
			break;
	}
	// game.addEntity( new Enemy(200, 0, 150, null, 'MoveDownUp') );
	// game.addEntity( new Enemy(200, 0, 200, null, 'MoveDown') );
	// game.addEntity( new Enemy(320, 0, 100, null, 'MoveWave') );
	// game.addEntity( new Enemy(512, 0, 50, null, 'MoveWaveLarge') );
	// game.addEntity( new Enemy(100, 1, 200, null, 'MoveSquareWave') );
	// game.addEntity( new Enemy(100, 1, 200, 11.25*2, 'MoveAngle') );
}