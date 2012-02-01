SF.Console = {

    game: null,
    stats: null,
    debug: null,
    console: null,

    init: function(game) {

        this.game = game;

        this.debug = document.createElement('div');
        this.debug.id = 'SF_debugger';
        this.debug.style.position = 'fixed';
        this.debug.style.top = '0';
        this.debug.style.right = '0';
        this.debug.style.width = '100px';
        this.debug.style.height = '200px';
        this.debug.style.background = 'rgba(0,0,0,0.6)';
        this.debug.style.padding = '2px 5px';
        this.debug.style.font = '10px small-caps monospace';
        this.debug.style.color = '#7ff600';
        this.debug.style.overflow = 'hidden';

        this.debug.style.visibility = 'hidden';

        if (this.game.debug) {
            this.stats = new Stats();

            this.stats.domElement.style.position = 'absolute';
            this.stats.domElement.style.left = '0px';
            this.stats.domElement.style.top = '0px';

            document.body.appendChild(this.stats.domElement);
            document.body.appendChild(this.debug);
            this.console = document.getElementById('SF_debugger');
        }

    },


    log: function(str) {

        if (!this.game.debug) {
            return;
        }

        var t = new Date();
        var log_time = t.getHours()+':'+t.getMinutes()+':'+t.getSeconds();

        var output = document.createElement('p');
        output.style.padding = '3px 0';
        output.style.borderBottom = '1px solid rgba(255,255,255,0.2)';
        output.innerHTML = '<strong>$ </strong>'+str;
        this.console.appendChild(output);
        this.console.insertBefore(output,this.console.firstChild);

    },


    showStats: function() {

        if (!this.game.debug) {
            return;
        }

        this.stats.update();

    }

};

