import glMatrix from '../utils/gl-matrix.js';
import WebGL from '../utils/WebGL.js';
import Session from '../utils/SessionStorage.js';
import Camera from './Camera.js';
import Events from '../utils/Events.js';
import Mouse from '../control/MouseEventHandler.js';
var mat4          = glMatrix.mat4;

var Renderer = {};

Renderer.canvas;
Renderer.gl     = null;
Renderer.width = 0;
Renderer.height = 0;
Renderer.updateId = 0;
Renderer.tick = 0;
Renderer.vFov = 15.0;
Renderer.renderCallbacks = [];
Renderer.frameLimit = 10;
Renderer.init = function init(param)
{
	if (!Renderer.gl) {
		Renderer.canvas = document.createElement('canvas');
		document.body.appendChild(Renderer.canvas);
		Renderer.canvas.style.position = 'absolute';
		Renderer.canvas.style.zIndex = '-1';
		Renderer.canvas.style.width = '100%';
		Renderer.canvas.style.height = '100%';
		
		Renderer.gl = WebGL.getContext( Renderer.canvas, param );
		// window.addEventListener('resize', this.onResize.bind(this));
		window.addEventListener('contextmenu', function(e) {
			e.preventDefault();
			return false;
		});
		Renderer.resize();
	}
	var gl = Renderer.gl;
	gl.clearDepth( 1.0 );
	gl.enable( gl.DEPTH_TEST );
	gl.depthFunc( gl.LEQUAL );
	gl.enable( gl.BLEND );
	gl.blendFunc( gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA );
};

Renderer.show = function show(){
	if (!Renderer.canvas.parentNode) {
		
	}
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

Renderer.onResize = function onResize()
{
	// Renderer.resizeTimeOut = setTimeout(Renderer.resize, 500);
};

Renderer.resize = function resize()
{
	var width, height, quality;
	width  = window.innerWidth;
	height = window.innerHeight;

	Mouse.screen.width  = Renderer.width  = width;
	Mouse.screen.height = Renderer.height = height;

	quality = 1;
	width  *= quality;
	height *= quality;
	
	Renderer.canvas.width         = width;
	Renderer.canvas.height        = height;
	Renderer.canvas.style.width   = Renderer.width + 'px';
	Renderer.canvas.style.height  = Renderer.height + 'px';
	

	Renderer.gl.viewport( 0, 0, width, height );

	mat4.perspective_custom( Renderer.vFov, width/height, 1, 3000, Camera.projection );
};

Renderer.rendering = false;
Renderer._render = function render(timeDelta)
{
	var newTick = Date.now();
	// if( Renderer.frameLimit > 0 ) {
	// 	window.cancelAnimationFrame( Renderer.updateId );
	// 	if( ( 100 / ( newTick - Renderer.tick ) ) > ( 1000 / Renderer.frameLimit ) ) return;
	// }else {
	Renderer.updateId = window.requestAnimationFrame( Renderer._render );
	// }
	Session.serverTick += (newTick - Renderer.tick);
	Renderer.tick = newTick;
	Events.process( Renderer.tick );
	var i, count;
	for (i = 0, count = Renderer.renderCallbacks.length; i < count; ++i) {
		Renderer.renderCallbacks[i]( Renderer.tick, Renderer.gl );
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