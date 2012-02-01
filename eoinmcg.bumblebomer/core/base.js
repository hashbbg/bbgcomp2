/*!
 * Bejaysus, it's raining
 * W  H  I  S  K  E  Y
 *
 * http://eoinmcg.org/games/whiskey
 *
 * Copyright 2011, Eoin McGrath
 * Licensed under GPL Version 2 license.
 *
 *
 * Date: DATE
 */


// namespace
var SF = {};

// shim layer with setTimeout fallback
requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
          };
})();

// preload imgs and audio
SF.Loader = {

    totalImgs:0,
    totalSfx:0,
    dir:"a/",
    loaded:0,
    ready:false,
    errors:[],
    game:null,
    sfxType: '.ogg',

    init: function(game, imgs, sfx) {

        var i;

        this.game = game;
        this.dir=this.game.dir || this.dir;
        this.imgs = imgs || [];
        this.sfx = sfx || [];

        this.totalImgs = this.imgs.length;
        this.totalSfx = this.sfx.length;

        var soundDiv = document.createElement("div");
        soundDiv.id="soundDiv";
        soundDiv.style.display="none";
        document.body.appendChild(soundDiv);

        this.game.console.log("loading assets from "+this.dir);
        this.game.console.log("total images: "+this.totalImgs);
        this.game.console.log("total sfx: "+this.totalSfx);

        for (i = this.imgs.length; i--;) {
            this.loadImg(this.imgs[i]);
        }

        for (i = this.sfx.length; i--;) {
            this.loadSfx(this.sfx[i]);
        }

    },

    loadImg: function(file) {

        file = this.dir + file;

        var img = new Image();
        var that = this;

        img.src = file;
        img.addEventListener('load', function() {
            that.game.console.log('loaded: '+file);
            that.loaded += 1;
        }, false);
        img.addEventListener('error', function() {
            that.errors.push('error loading: '+file);
        }, false);
    },



    loadSfx: function(file){

        file = this.dir+file+this.sfxType;

        var id = "SF_"+file;
        var sfx = document.createElement("audio");

        sfx.src = file;
        sfx.setAttribute("id",id);

        if (!this.game.hasAudio) {
            this.loaded += 1;
            return;
        }

        sfx.load();
        sfx.autobuffer="true";
        sfx.preload="auto";
        document.body.appendChild(sfx);

        var that = this;

        sfx.addEventListener("canplaythrough",function() {
            that.game.console.log("loaded: "+file);
            that.loaded += 1;
            this.removeEventListener("canplaythrough", arguments.callee, false);
            this.pause();
            this.currentTime = 0.01;
        }, false);

        sfx.addEventListener("error", function() {
            that.game.console.log("error: "+file);
            that.errors.push("error loading: "+file);
            that.loaded += 1;
        },false);

    },

    percentLoaded: function() {
        return ~~( (this.loaded / (this.totalImgs + this.totalSfx)) *100 );
    }

};

