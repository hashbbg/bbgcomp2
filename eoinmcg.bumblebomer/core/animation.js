SF.Animation = function(options) {

    options = options || {};

    this.xOff = (options.xOff) || 0;
    this.yOff = (options.yOff) || 0;
    this.frames = (options.frames) || 0;
    this.currentFrame = (options.current) || 0;
    this.nextAnim = (options.nextAnim) || false;
    this.frameSpeed = (options.frameSpeed) || 3;


};

