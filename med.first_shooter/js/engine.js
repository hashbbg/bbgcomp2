var Game = function() { 
    this.FPS = 200;
    this.deltaFrame;
    this.currentFPS = 0; 
    this.x = 0;
    this.y = 0; 
    this.timer = null;
    this.canvas = null;
    this.context = null;
    this.backBuffer;
    this.backBufferContext = null;
    this.showFPS = false;
    this.lastEvtX;
    this.lastEvtY; 
    this.evtDownX;
    this.evtDownY; 
 
    this.paused = false;
    this.pauseTime = 0;
    
    var g = this;
    window.onblur = function() {
        g.paused = true;
        g.pauseTime = (new Date()).getTime();
    }
    
    window.onfocus = function() {
        g.paused = false;
    }
 
    window.requestAnimFrame = (function(){
        return   window.requestAnimationFrame       || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame    || 
        window.oRequestAnimationFrame      || 
        window.msRequestAnimationFrame     || 
        function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / g.FPS);
        };
    })();                
    
    /*
  * main loop
  */  
    Game.prototype.GameLoop = function() {
        if(!this.paused) {
            // calc current frame per second
            var thisFrameT = new Date().getTime();
            var delta = thisFrameT - this.lastFrameT; 
            if(this.pauseTime > 0) {
                delta = this.pauseTime - this.lastFrameT;
                this.pauseTime = 0;
            }
            this.currentFPS = parseInt(1000/delta);
            this.lastFrameT = thisFrameT;
     
            this.currentState.update(delta);
            this.currentState.draw(this.backBufferContext, this.canvas.width, this.canvas.height, delta);
  
  
            if(this.showFPS) {   
                this.backBufferContext.font = "18px sans-serif bold";
                this.backBufferContext.textAlign = "right";
                this.backBufferContext.textBaseline = "top";
                this.backBufferContext.fillStyle= "#ff0000";
                this.backBufferContext.fillText(this.currentFPS, this.canvas.width-5, 5);
            }
  
            // copy the backbuffer on the screen
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.context.drawImage(this.backBuffer, 0, 0);   
        }
        // check if a state change has been requested
        this.stateChange();
    }
   
    this.currentState = null; 
 
    /*
  * Setup the game and start the main loop
  *  params:
  *   canvasElement: DOM canvas element used to render the game
  *   initialState: a GameState object       
  */  
    Game.prototype.startGame = function(canvasElement, initialState, initialStateParams) {
        this.checkForTouch();  
   
        if(typeof canvasElement == "string")
            this.canvas = document.getElementById(canvasElement);
        else 
            this.canvas = canvasElement;   
        this.context = this.canvas.getContext('2d');
  
        // create the backbuffer
        this.backBuffer = document.createElement('canvas');
        this.backBuffer.width = this.canvas.width;
        this.backBuffer.height = this.canvas.height;
        this.backBufferContext = this.backBuffer.getContext('2d'); 
  
        this.getpos(this.canvas);
                  
        this.currentState = initialState;
        if(this.currentState == null)
            this.currentState = new GameState(); // set a default state
   
        // start initial state
        this.registerEventHandlers();
  
        this.currentState.setGame(this);
        this.currentState.init(initialStateParams);
        this.currentState.initialized = true;
        var g = this;
        this.deltaFrame = 1000/this.FPS;
        this.lastFrameT = new Date().getTime();
        
        requestAnimFrame(function() {
            g.GameLoop();
        } );         
    } 
 
 
    /* Don't like this very much :P To be refactored! */
    Game.prototype.stateChange = function() {   
        if(this.currentState.goToState != null)
        {
            var toGo = this.currentState.goToState;
            this.currentState.goToState = null;
   
            // get a screen of the current state
            //var screen = this.currentState.screenshot();
   
            // stop game loop to change state
            this.currentState.close();
            this.currentState.releaseGame();
            this.currentState = toGo.state;            
                                           
            //this.currentState.oldStateScreen = screen;                                           
            this.currentState.setGame(this);
            this.currentState.init(toGo.params);  
            this.currentState.initialized = true; 
   
            // restart game loop
            this.lastFrameT = new Date().getTime();          
        }
        var g = this;
        requestAnimFrame(function() {
            g.GameLoop();
        } );
    }
 
 
 
    /*********************************************
  *              EVENT HANDLERS               *  
  *********************************************/
  
    /* mouse events
  * mouse events are captured by the engine which calculates the event coordinates
  * relative to the canvas, so the GameState event handlers can directly read
  * event.X and event.Y variables to know the coords in "canvas space"     
  */
    Game.prototype.mouseClick = function(evt) {    
        evt.X = evt.clientX - this.x;
        evt.Y = evt.clientY - this.y;
        if(this.currentState.mouseClick) this.currentState.mouseClick(evt); 
    }
 
    this._isMouseDown = false;
    Game.prototype.mouseDown = function(evt) {  
        if(this._isMouseDown) return;
        this._isMouseDown = true;
        evt.X = evt.clientX - this.x;
        evt.Y = evt.clientY - this.y;
        if(this.currentState.mouseDown) this.currentState.mouseDown(evt); 
        evt.preventDefault();
    }
 
    Game.prototype.mouseUp = function(evt) {
        this._isMouseDown = false;
        evt.X = evt.clientX - this.x;
        evt.Y = evt.clientY - this.y;
        if(this.currentState.mouseUp) this.currentState.mouseUp(evt);
        evt.preventDefault();
    } 
  
    Game.prototype.mouseMove = function(evt) {
        evt.X = evt.clientX - this.x;
        evt.Y = evt.clientY - this.y;
        if(this.currentState.mouseMove) this.currentState.mouseMove(evt);  
        evt.preventDefault();
    }
  
    Game.prototype.touchDown = function(evt) {  
        if(this._isMouseDown) {
            this._isMouseDown = false;  // if double touch do the same as touchend (handle only one touch)
        
            evt.X = this.lastEvtX;
            evt.Y = this.lastEvtY;    
            if(this.currentState.mouseClick ) 
                this.currentState.mouseClick(evt);
            if(this.currentState.mouseUp) 
                this.currentState.mouseUp(evt); 
            this.evtDownX = -10000;
            this.evtDownY = -10000;
            evt.preventDefault();
            return;
        }
        this._isMouseDown = true;
        evt.X = evt.touches[0].clientX - this.x;
        evt.Y = evt.touches[0].clientY - this.y;
        this.lastEvtX = this.evtDownX = evt.X;
        this.lastEvtY = this.evtDownY = evt.Y;  
        if(this.currentState.mouseDown) this.currentState.mouseDown(evt); 
        evt.preventDefault();
    }
 
    Game.prototype.touchMove = function(evt) { 
        evt.X = evt.touches[0].clientX - this.x;
        evt.Y = evt.touches[0].clientY - this.y;
        this.lastEvtX = evt.X;
        this.lastEvtY = evt.Y;
        if(this.currentState.mouseMove) this.currentState.mouseMove(evt); 
        evt.preventDefault();
    }
 
    Game.prototype.touchUp = function(evt) {  
        /*  if(!this._isMouseDown) {
            e.preventDefault();
            return;
        }*/
        this._isMouseDown = false;
        
        evt.X = this.lastEvtX;
        evt.Y = this.lastEvtY;    
        if(this.currentState.mouseClick ) 
            this.currentState.mouseClick(evt);
        if(this.currentState.mouseUp) 
            this.currentState.mouseUp(evt); 
        this.evtDownX = -10000;
        this.evtDownY = -10000;
        evt.preventDefault();
    }
 
    Game.prototype.keyDown = function(evt) {
        if(this.currentState.keyDown)
            this.currentState.keyDown(evt);        
    }
    
    Game.prototype.keyUp = function(evt) {
        if(this.currentState.keyUp)
            this.currentState.keyUp(evt);        
    }
 
    /*
  * register event handlers      
  */
    Game.prototype.registerEventHandlers = function() {
        var g = this;         
  
        if(this.isTouch) {
            g.mdEvt = function(e) {
                g.touchDown(e);
            };
            g.muEvt = function(e) {
                g.touchUp(e);
            };
            g.mmEvt = function(e) {
                g.touchMove(e);
            };
            /*document.body.addEventListener('touchstart', g.mdEvt, false);
            document.body.addEventListener('touchend', g.muEvt, false);
            document.body.addEventListener('touchmove', g.mmEvt, false); */
            g.canvas.addEventListener('touchstart', g.mdEvt, false);
            g.canvas.addEventListener('touchend', g.muEvt, false);
            g.canvas.addEventListener('touchmove', g.mmEvt, false);
        }
        else
        {
            g.mcEvt = function(e) {
                g.mouseClick(e);
            };
            g.mdEvt = function(e) {
                g.mouseDown(e);
            };
            g.muEvt = function(e) {
                g.mouseUp(e);
            };
            g.mmEvt = function(e) {
                g.mouseMove(e);
            };
            /*document.body.addEventListener('click', g.mcEvt, false);
            document.body.addEventListener('mousedown', g.mdEvt, false);
            document.body.addEventListener('mouseup', g.muEvt, false);
            document.body.addEventListener('mousemove', g.mmEvt, false);  */
            g.canvas.addEventListener('click', g.mcEvt, false);
            g.canvas.addEventListener('mousedown', g.mdEvt, false);
            g.canvas.addEventListener('mouseup', g.muEvt, false);
            g.canvas.addEventListener('mousemove', g.mmEvt, false);
        }
        
        g.kdEvt = function(e) {
            g.keyDown(e);
        }
        
        g.kuEvt = function(e) {
            g.keyUp(e);
        }
        
        window.addEventListener('keydown', g.kdEvt, false);
        window.addEventListener('keyup', g.kuEvt, false);
    }   
 
 
    /*********************************************
  *             UTILITY FUNCTIONS             *
  *********************************************/
  
    Game.prototype.getpos = function(o) {
        //gets position of object o
        var bo, b;
        this.x = this.y = 0;
        if(document.getBoxObjectFor) {	//moz
            bo = document.getBoxObjectFor(o);
            this.x = bo.x;
            this.y = bo.y;
        } else if (o.getBoundingClientRect) { //ie (??)
            bo = o.getBoundingClientRect();
            this.x = bo.left;
            this.y = bo.top;
        } else { //opera, safari etc
            while(o && o.nodeName != 'BODY') {
                this.x += o.offsetLeft;
                this.y += o.offsetTop;
                b = parseInt(document.defaultView.getComputedStyle(o,null).getPropertyValue('border-width'));
                if(b > 0) {
                    this.x += b;
                    this.y +=b;
                }
                o = o.offsetParent;
            }
        }
    }


    Game.prototype.checkForTouch = function () {		
        var d = document.createElement("div");
        d.setAttribute("ontouchmove", "return;");	
        return typeof d.ontouchmove == "function" ? true : false;
    };
    Game.prototype.isTouch = this.checkForTouch();
}


/*
 * class GameState
 * base class for every game state 
 */ 
var GameState = function() {
    this.game = null;
    this.goToState = null;
    this.oldStateScreen = null;
    this.gameLayers = Array(); 
  
    /* DO NOT OVERRIDE
  * pass a Game reference to the current GameState
  */   
    GameState.prototype.setGame = function(g) {  
        this.game = g;
    };
 
    // DO NOT OVERRIDE
    GameState.prototype.getGame = function() {
        return this.game;
    };
             
    // DO NOT OVERRIDE
    GameState.prototype.screenshot = function() {
        var bg = document.createElement('canvas');  
        bg.width = this.game.canvas.width;
        bg.height = this.game.canvas.height;
        var bgCtx = bg.getContext('2d');    
        bgCtx.drawImage(this.game.canvas,0,0);
        return bg;
    };
 
    // DO NOT OVERRIDE
    /* call this method to change state
  */
    GameState.prototype.toState = function(newstate, params) {  
        this.goToState = {
            state: newstate, 
            params: params
        };  
    };
 
    // DO NOT OVERRIDE
    GameState.prototype.addLayer = function(layer) {  
        this.gameLayers.push(layer);
        this.gameLayers.sort(function(a,b) {
            return a.zIndex - b.zIndex
        });  
    };
  
    /* 
  * initialize gamestate
  * called when the game enter this state
  *  params:
  *   params: struct filled with parameters passed from previous state    
  */  
    GameState.prototype.init = function(params) {};
    /* 
  * update gamestate
  * called once per frame. update logic, physics...  
  */  
    GameState.prototype.update = function(delta) {
        if(this.gameLayers.length > 0) 
        {    
            for(var i=0; i<this.gameLayers.length;i++)          
                this.gameLayers[i].update(delta);     
        }
    };
    /* 
  * paint on the canvas
  * called once per frame  
  */  
    GameState.prototype.draw = function(ctx, width, height, delta) {    // default draw method           
        ctx.clearRect(0,0,width, height);   
        if(this.gameLayers.length > 0) 
        {    
            for(var i=0; i<this.gameLayers.length;i++)          
                this.gameLayers[i].draw(ctx, width, height, delta);     
        }
        else
        { 
    
            ctx.fillStyle = "#000000";
            ctx.font = "22px sans-serif bold";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
 
            ctx.fillText("Engine Default View", width/2, height/2-20);
        }
    };
    /*
  * called when exiting from this state
  */  
    GameState.prototype.close = function() {    };
 
    // DO NOT OVERRIDE
    GameState.prototype.releaseGame = function() {
        this.game = null;
    };
}

var GameLayer = function(z, isVisible, x, y, width, height, autoredraw) {
    /*this.layerCanvas = document.createElement('canvas');
    this.layerCanvas.width = width;
    this.layerCanvas.height = height;
    this.context = this.layerCanvas.getContext('2d');          */
    
    this.visible = true;
    if(isVisible != undefined)
        this.visible = isVisible;
        
    /*this.autoredraw = true;
    if(autoredraw != undefined)
      this.autoredraw = autoredraw;   */
  
    this.zIndex = 1;
    if(z)
        this.zIndex = z; 
  
    this.gameObjects = Array();
    
    GameLayer.prototype.sortObjects = function() {        
        this.gameObjects.sort( function(a, b) {
            return a.z - b.z
        } );
    }
 
    GameLayer.prototype.addGameObject = function(gameObj) {
        this.gameObjects.push(gameObj);
    }
    
    GameLayer.prototype.popGameObject = function() {
        return this.gameObjects.pop();
    }
 
    GameLayer.prototype.topGameObject = function() {
        return this.gameObjects[this.gameObjects.length-1];
    }
 
    GameLayer.prototype.removeGameObject = function(gameObj) {
        var i;
        for(i=0; i<this.gameObjects.length; i++)
            if(this.gameObjects[i] == gameObj)
                break;
  
        if(i<this.gameObjects.length)
            this.gameObjects.splice(i,1);
    }
 
    GameLayer.prototype.empty = function() {
        this.gameObjects = new Array();
    }

    GameLayer.prototype.size = function() {
        return this.gameObjects.length;
    }

    GameLayer.prototype.update = function(delta) {  
        for(var i=0; i< this.gameObjects.length; i++) {   
            this.gameObjects[i].update(delta);
        }      
    }
 
    GameLayer.prototype.draw = function(ctx, width, height, delta) { 
        if(!this.visible) return;         
        
        for(var i=0; i< this.gameObjects.length; i++) {   
            this.gameObjects[i].draw(ctx, width, height, delta);
        }
      
    //ctx.drawImage(this.layerCanvas,0,0);
    }
    
/*GameLayer.prototype.redraw = function(delta) { 
      this.context.clearRect(0, 0 , this.layerCanvas.width, this.layerCanvas.height);     
      for(var i=0; i< this.gameObjects.length; i++) {   
        this.gameObjects[i].draw(this.context, this.layerCanvas.width, this.layerCanvas.height, delta);
      }
    }
    
    GameLayer.prototype.invalidate = function() {       
      this.redraw(0); 
    } */
}

var GameObject = function() { 
    GameObject.prototype.draw = function(ctx, width, height, delta) {}
    GameObject.prototype.update = function(delta) {}
}

var TilingImage = function(img, width, height, speedx, speedy) {
    this.x = 0;
    this.y = 0;
    this.speedx = speedx;
    this.speedy = speedy;
    this.offX = 0;
    this.offY = 0;
  
    this.canv = document.createElement('canvas');
    var TIctx = this.canv.getContext('2d');
   
    this.offX = 0;
    this.offY = 0;
    this.imgW = img.width;
    this.imgH = img.height;
 
    this.w = width+img.width;
    this.h = height+img.height;
    this.canv.width = this.w;
    this.canv.height = this.h;
        
    for(var j=0; j < this.h; j += this.imgH)
        for(var i = 0; i < this.w; i += this.imgW)
            TIctx.drawImage(img, i, j);
    
     
    TilingImage.prototype.setOffset = function(offX, offY) {
        this.offX = (offX > this.imgW ? offX-this.imgW : offX);
        this.offY = (offY > this.imgH ? offY-this.imgH : offY);     
    } 
   
    TilingImage.prototype.update = function(delta) {
        this.setOffset(this.offX+delta*this.speedx, this.offY+delta*this.speedy);
    }
  
    TilingImage.prototype.draw = function(ctx, width, height) {          
        //ctx.beginPath();
        //ctx.fillStyle = pattern;
        //ctx.fillRect(0,this.offY,width, height+this.offY);
        ctx.drawImage(this.canv, -this.imgW + this.offX, -this.imgH + this.offY);  
    }  
}
TilingImage.prototype = new GameObject();

var TextObject = function(x, y, halign, valign, fontface, color) {
    this.x = 0;
    this.y = 0;
    this.halign = halign;
    this.valign = valign;
    this.fontface = fontface; 
    this.color = color;
    this.text = "";
 
    TextObject.prototype.draw = function(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
  
        ctx.fillStyle = this.color;
        ctx.font = this.fontface;
        ctx.textAlign = this.halign;
        ctx.textBaseline = this.valign;       
        ctx.fillText(this.text, x, y);
  
        ctx.restore();
    }
}
TextObject.prototype = new GameObject();

var MediaTracker = function() {
    this.media = Array();
    this.total = 0;
    this.loaded = 0;
    this.tim = null;
 
    MediaTracker.prototype.addMedia = function(name, object) {  
        var item = [object, false];
        var mt = this;
        this.total++;
        this.media[name] = item;
        object.onload = function() {
            item[1] = true;
            mt.loaded++;
        };
  
    /*if(this.tim == null) 
            this.tim = setInterval(function() {
                mt.check();
            }, 100);*/
    }
 
    MediaTracker.prototype.load = function() {
        var mt = this;
        if(this.tim == null) 
            this.tim = setInterval(function() {
                mt.check();
            }, 100);
    }
 
    MediaTracker.prototype.isReady = function(name) {
        if(name) return (this.media[name][1]?this.media[name][1]:false);
        else return (this.loaded >= this.total);
    }
 
    MediaTracker.prototype.getMedia = function(name) {
        return (this.media[name][0]?this.media[name][0]:null);
    }
 
    MediaTracker.prototype.check = function() {  
        if(this.loaded == this.total) {
            clearTimeout(this.tim);
            this.tim = null;
   
            if(this.onload) this.onload();
        } 
    } 
}                 