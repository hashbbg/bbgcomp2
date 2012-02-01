// input class
SF.Input = function(game) {

	this.game = game;

	this.up = false;
	this.down = false;
	this.left = false;
	this.right = false;
	this.press = false;
	this.mdown = false;
	this.mclick = false;

    this.target = (document.body.addEventListener)
        ? document.body
        : window;
    
	var that = this;

    if (this.game.ua.hasTouch) {

        var target = (document.body.addEventListener)
            ? document.body
            : window;

            target.addEventListener('touchstart', function(e) {
                e.preventDefault(); 
                that.mclick = true;
                that.mousePos(e.touches[0]); 
                // return false;
            }, false);
            target.addEventListener('touchmove', function(e) {
                e.preventDefault(); 
                that.mousePos(e.touches[0]); 
                return false;
            }, false);
            target.addEventListener('touchend', function(e) {
                e.preventDefault(); 
                that.mousePos(e.touches[0]); 
                return false;
            }, false);
    }
    else {
        window.addEventListener('click', function(e) {
            that.mousePos(e);
            that.mclick = true;
        }, false);

        window.addEventListener('mousedown', function(e) {
            that.mdown = true;
        }, false);

        window.addEventListener('mousedup', function(e) {
            that.mdown = false;
        }, false);

        window.addEventListener("mousemove", function(e) {
                that.mousePos(e);
        }, false);
    }


    this.mousePos = function(e) {
        that.mx = (e.pageX - that.game.offset.left);
        that.my = (e.pageY - that.game.offset.top);
    };


	window.addEventListener('keydown', function(e) {

		that.press = true;
		switch(e.keyCode) {

			case 38:
				that.up = true;
			break;

			case 40:
				that.down = true;
			break;

			case 37:
				that.left = true;
			break;

			case 39:
				that.right = true;
			break;

		}

	}, false);


	window.addEventListener('keyup', function(e) {

		that.press = false;

		switch(e.keyCode) {

			case 38:
				that.up = false;
			break;

			case 40:
				that.down = false;
			break;

			case 37:
				that.left = false;
			break;

			case 39:
				that.right = false;
			break;

		}

	}, false);

};

