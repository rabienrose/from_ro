import Renderer from '../Renderer.js';
import glMatrix from '../../utils/gl-matrix.js';

var vec4  = glMatrix.vec4;
var _pos  = new Float32Array(4);
var _size = new Float32Array(2);

function Cast()
{
	this.tick       =  0;
	this.delay      =  0;
	this.percent    = -1;
	this.display    = false;
	this.color      = '#00FF00';
	this.onComplete = null;

	this.canvas     = document.createElement('canvas');
	this.ctx        = this.canvas.getContext('2d');
	this.canvas.style.position = 'absolute';
	this.canvas.style.zIndex   = 1;
	this.canvas.width  = 60;
	this.canvas.height = 6;
}

Cast.prototype.set = function Set( delay, color )
{
	// Init cast
	this.display = true;
	this.tick    = Renderer.tick + 0;
	this.delay   = delay;
	this.color   = color || '#00FF00';
};

Cast.prototype.remove = function Remove()
{
	this.percent = -1;
	this.display = false;
	if (this.canvas.parentNode) {
		document.body.removeChild(this.canvas);
	}
};

Cast.prototype.clean = function Clean()
{
	this.remove();
	this.onComplete = null;
	//this.ctx    = null;
	//this.canvas = null;
};

Cast.prototype.update = function Update( perc )
{
	var width = 60, height =  6;
	var ctx   = this.ctx;

	// Border
	ctx.fillStyle = '#10189c';
	ctx.fillRect( 0, 0, width, height ) ;

	// Background
	ctx.fillStyle = '#424242';
	ctx.fillRect( 1, 1, width-2, 4 );

	// Percent
	ctx.fillStyle = this.color;
	ctx.fillRect( 1, 1, Math.round( (width-2) * perc ), 4 );
};

Cast.prototype.render = function Render( matrix )
{
	var canvas  = this.canvas;
	var percent = +( ( Renderer.tick - this.tick ) / this.delay ).toFixed(2);
	var z;

	// Cast complete remove it
	if (percent >= 1.0) {
		this.remove();

		if (this.onComplete) {
			this.onComplete();
			this.onComplete = null;
		}
		return;
	}

	// Update
	if (percent !== this.percent) {
		this.update(percent);
		this.percent = percent;
	}

	// Cast position
	_pos[0] =  0.0;
	_pos[1] =  90 / 35;
	_pos[2] =  0.0;
	_pos[3] =  1.0;

	// Set the viewport
	_size[0] = Renderer.width  / 2;
	_size[1] = Renderer.height / 2;

	// Project point to scene
	vec4.transformMat4( _pos, _pos, matrix );

	// Calculate position
	z = _pos[3] === 0.0 ? 1.0 : ( 1.0 / _pos[3] );
	_pos[0] = _size[0] + Math.round(_size[0] * (_pos[0] * z));
	_pos[1] = _size[1] - Math.round(_size[1] * (_pos[1] * z));

	canvas.style.top  = (_pos[1] | 0) + 'px';
	canvas.style.left = ((_pos[0] - canvas.width/2) | 0) + 'px';

	// Append to body
	if (!canvas.parentNode) {
		document.body.appendChild(canvas);
	}
};

export default function Init()
{
	this.cast = new Cast();
};

