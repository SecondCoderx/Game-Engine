var Game = {
	assets: [],
	TOP: 0,
	TOP_LEFT: 1,
	TOP_RIGHT: 2,
	CENTER: 3,
	BOTTOM: 4,
	BOTTOM_LEFT: 5,
	BOTTOM_RIGHT: 6
};

//Event
Game.Event = function(){};
Game.Event.prototype = {
	bind: function(event, callback){
		this._events = this._events || {};
		this._events[event] = this._events[event]	|| [];
		this._events[event].push(callback);
	},
	unbind: function(event, callback){
		this._events = this._events || {};
		if( event in this._events === false )	return;
		this._events[event].splice(this._events[event].indexOf(callback), 1);
	},
	trigger: function(event /* , args... */){
		this._events = this._events || {};
		if( event in this._events === false )	return;
		for(var i = 0; i < this._events[event].length; i++){
			this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1))
		}
	}
};

/*
Engine Parameters
bgColor: hex-color
clearBeforeDraw: boolean
scene: array
sprites: array
debugg: boolean
*/

Game.Engine = function(canvas, opts) {
	var _self = this,
		_canvas = document.getElementById(canvas),
		_ctx = _canvas.getContext('2d'),
		_clock = new Game.Clock(),
		_frames = 0,
		_fpsUpdateInterval = 1000,
		_lastUpdate = new Date();

	this.event = new Game.Event();
	this.bgcolor = '#d0e7f9';
	this.clearBeforeDraw = true;
	this.scene = [];
	this.currentScene = 0;
	this.sprites = [];
	this.debug = false;
	this.width = _canvas.width;
	this.height = _canvas.height;
	
	for(var i in opts) this[i] = opts[i];

	this.event.trigger("onInit");
	
	var _clearCanvas = function() {
		_ctx.clearRect(0, 0, _canvas.width, _canvas.height);
	};
	
	_clock.ontick = function(td) {
		var currentUpdate = new Date(),
			fps = 0;
			
		_frames++;

		if(currentUpdate - _lastUpdate > _fpsUpdateInterval) {
			fps = _frames / (currentUpdate - _lastUpdate);
			fps = ~~((fps * 1000) + 0.5); // Math.round(fps * 1000)
			_lastUpdate = currentUpdate;
			_frames = 0;
			
			if(_self.debug) console.log("FPS: " + fps);
		}
		
		if("undefined" != typeof(_self.scene[_self.currentScene])) { // Draw scenes
			_self.scene[_self.currentScene].draw();
		}
		
		_self.event.trigger("onDraw", _ctx, td);
			
		if(_self.clearBeforeDraw) //Clear before draw
			_clearCanvas();
	}
	
	this.start = function(){
		if(this.debug) console.log("start");
		
		_self.event.trigger("onStart", _ctx);
		_clock.start();
	};
};

//Points
Game.Points = function(x, y) {
	this.x = x;
	this.y = y;
};

//Coordinate
Game.Coordinate = function(x, y, w, h) {
	this.x = x;
	this.y = y;
	this.width = w;
	this.height = h;
};
Game.Coordinate.prototype = new Game.Points();

//Entity
Game.Entity = function() {
	this.event = new Game.Event();
};
Game.Entity.prototype = new Game.Coordinate();

//Drawble
Game.Drawable = function(opts) {
	var _canvas = document.createElement('canvas'),
		_ctx = _canvas.getContext('2d'),
		_self = this,
		_width = 0,
		_height = 0;

	this.updated = false;
	this.childs = [];
	this.parent;
	this.visible = true;
	this.origin = Game.CENTER;
	this.updated = false;
	this.zindex = 0;
	
	for(var i in opts) {
		this[i] = opts[i];
	}
	
	_canvas.width = this.width;
	_canvas.height = this.height;
	
	this.draw = function(ctx) {
		_self.event.trigger("onDraw");
		
		ctx.drawImage(_ctx.canvas);
		
		for(var i in _self.childs) {
			_self.childs[i].draw(_ctx);
		}
	};
	
	this.addChild = function(drawable) {
		drawable.parent = _self;
		childs.push(drawable);
	};
	
	this.__defineSetter__("width", function(val){
		_canvas.width = _width = val;		
	});
	
	this.__defineSetter__("height", function(val){
		_canvas.height = _height = val;
	});
	this.__defineGetter__("width", function(){
		return _width;		
	});
	this.__defineGetter__("height", function(){
		return _height;
	});
};
Game.Drawable.prototype = new Game.Entity();

//Scene
Game.Scene = function(opts) {
	var _self = this,
		_bgImage = new Image;

	_bgImage.onload = function(){
		_self.ready = true;
		_self.event.trigger("Change");
	};
	
	this.setBackground = function(url) {
		Game.assets.push(url);
		_bgImage.src = url;
	};
	
	this.draw = function(ctx) {};
};
Game.Scene.prototype = new Game.Entity();

//Layer
Game.Layer = function(opts) {

};
Game.Layer.prototype = new Game.Entity();

//Sprite
Game.Sprite = function(opts) {

};
Game.Sprite.prototype = new Game.Drawable();

//Clock
Game.Clock = function () {
    this.running = false;
    this.handle = null;
    this.t0 = new Date();
}
Game.Clock.prototype = {
    tick: function () {
        var t1 = new Date(),
            td = (t1-this.t0)/1000;
        this.t0 = t1;
        this.ontick(td);
    },
    start: function (delay) {
        this.running = true;
        var self = this, f;
		this.handle = window.requestAnimFrame(f = function() {
			self.tick();
			if(self.running){
			    window.requestAnimFrame(f, delay);
			}
		});
        this.t0 = new Date();
    },
    stop: function() {
        window.removeAnimFrame(this.handle);
        this.running = false;
    },
    ontick: function() {}
};

window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
    })();

window.removeAnimFrame = function(handle) {
	window.cancelAnimationFrame ? window.cancelAnimationFrame(handle.value) :
	window.webkitCancelRequestAnimationFrame ? window.webkitCancelRequestAnimationFrame(handle.value)   :
	window.mozCancelRequestAnimationFrame ? window.mozCancelRequestAnimationFrame(handle.value) :
	window.oCancelRequestAnimationFrame ? window.oCancelRequestAnimationFrame(handle.value) :
	window.msCancelRequestAnimationFrame ? msCancelRequestAnimationFrame(handle.value) :
	clearTimeout(handle);
};
