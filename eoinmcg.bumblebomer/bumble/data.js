SF.data = {

	title: 'BumbleBomber',
	debug: false,
	pageBg: '#000',
	canvasBg: 'transparent',
	canvasFont: 'Monaco, monospace',
	canvasCursor: 'none',
	textCol: '#000',
    hasAudio: false,
    playAudio: true,

	w: 480,
	h: 320,
	resize: false,

	imgs: [
		'sprites.png'
	],

	sfx: [
		'ping'
	],

	player: {
		'w': 48,
		'h': 40,
		'col': '#2c0',
		'src': 'a/sprites.png',
		'anim': 'fly'
	},

	player_anims: {
		'fly': {
			xOff: 0,
			yOff: 0,
			frames: 1,
			currentFrame: 0,
			frameSpeed: 0
		}

	},


    fly: {
        w: 22,
        h: 20,
        src: 'a/sprites.png',
        yOff: 40
        // 'anim': 'buzz'
    },


	fly_anims: {
		'buzz': {
			xOff: 0,
			yOff: 0,
			frames: 1,
			currentFrame: 0,
			frameSpeed: 0
		}

	},

	explosionCols:["#ce5c00","#f57900","#a40000"],
	playerCols:["#920","#c20","#600"]

};

