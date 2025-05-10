import glMatrix from '../utils/gl-matrix.js';
import jQuery from '../utils/jQuery.js';
import WebGL from '../utils/WebGL.js';
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

Renderer.init = function init( canvas, param)
{
	Renderer.canvas = canvas;
	if (!Renderer.gl) {
		Renderer.gl = WebGL.getContext( Renderer.canvas, param );
		jQuery(window)
			.on('resize', Renderer.onResize)
			.on('contextmenu',function(){
				return false;
			});
		Renderer.onResize();
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
		document.body.appendChild(Renderer.canvas);
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
	var width, height;
	width  = window.innerWidth  || document.body.offsetWidth;
	height = window.innerHeight || document.body.offsetHeight;
	Renderer.width  = width;
	Renderer.height = height;
	Renderer.gl.viewport( 0, 0, width, height );
	// mat4.perspective( Renderer.vFov, width/height, 1, 1000, Camera.projection );
	// Background.resize( Renderer.width, Renderer.height );
	// getModule('UI/UIManager').fixResizeOverflow( Renderer.width, Renderer.height );
};

Renderer.rendering = false;
Renderer._render = function render()
{
	Renderer.updateId = window.requestAnimationFrame( Renderer._render);
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