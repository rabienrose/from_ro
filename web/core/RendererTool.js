import WebGL from '../../src/utils/WebGL.js';
import Events from '../../src/utils/Events.js';

var Renderer = {};

Renderer.canvas;
Renderer.gl     = null;
Renderer.updateId = 0;
Renderer.tick = 0;
Renderer.renderCallbacks = [];
Renderer.init = function init(param)
{
	if (!Renderer.gl) {
		Renderer.canvas = document.createElement('canvas');
		document.body.appendChild(Renderer.canvas);
		Renderer.canvas.style.position = 'absolute';
		Renderer.canvas.style.zIndex = '-1';
		
		Renderer.gl = WebGL.getContext( Renderer.canvas, param );
		window.addEventListener('contextmenu', function(e) {
			e.preventDefault();
			return false;
		});
		var width, height;
		width  = window.innerWidth;
		height = window.innerHeight;
		Renderer.canvas.width         = width;
		Renderer.canvas.height        = height;
		Renderer.canvas.style.width   = width + 'px';
		Renderer.canvas.style.height  = height + 'px';
		Renderer.gl.viewport( 0, 0, width, height );
	}
	var gl = Renderer.gl;
	gl.clearDepth( 1.0 );
	gl.enable( gl.DEPTH_TEST );
	gl.depthFunc( gl.LEQUAL );
	gl.enable( gl.BLEND );
	gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
};

Renderer.remove = function remove(){
	if (Renderer.canvas.parentNode) {
		document.body.removeChild(Renderer.canvas);
	}
};

Renderer.getContext = function getContext()
{
	return Renderer.gl;
};

Renderer.rendering = false;
Renderer._render = function render(timeDelta)
{
	Renderer.gl.clear( Renderer.gl.COLOR_BUFFER_BIT | Renderer.gl.DEPTH_BUFFER_BIT );
	var newTick = Date.now();
	Renderer.updateId = window.requestAnimationFrame( Renderer._render );
	Renderer.tick = newTick;
	Events.process( Renderer.tick );
	if (Renderer.rendering) {
		var i, count;
		for (i = 0, count = Renderer.renderCallbacks.length; i < count; ++i) {
			Renderer.renderCallbacks[i]( Renderer.tick, Renderer.gl );
		}
	}
};

Renderer.render = function renderCallback( fn )
{
	if (fn) {
		Renderer.renderCallbacks.push(fn);
	}
	Renderer._render();
};

Renderer.stop = function stop( fn )
{
	if (!arguments.length) {
		Renderer.renderCallbacks.length = 0;
		return;
	}
	var pos = Renderer.renderCallbacks.indexOf(fn);
	if (pos > -1) {
		Renderer.renderCallbacks.splice( pos, 1 );
	}
};

export default Renderer;