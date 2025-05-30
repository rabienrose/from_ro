import * as glMatrix from 'gl-matrix';
import Renderer from '../Renderer.js';
import DB from '../../configs/DBManager.js';

var vec4  = glMatrix.vec4;
var _pos  = new Float32Array(4);
var _size = new Float32Array(2);

function Life()
{
	this.hp      = -1;
	this.sp      = -1;
	this.ap      = -1;
	this.hp_max  = -1;
	this.sp_max  = -1;
	this.ap_max  = -1;
	this.display = false;
	this.canvas  = document.createElement('canvas');
	this.ctx     = this.canvas.getContext('2d');
	this.canvas.style.position = 'absolute';
	this.canvas.style.zIndex   = 1;
	this.entity  = null;
	this.hunger  = -1;
	this.hunger_max  = -1;
}

Life.prototype.remove = function remove()
{
	this.display = false;
	if (this.canvas.parentNode) {
		document.body.removeChild(this.canvas);
	}
};

Life.prototype.clean = function clean()
{
	this.remove();
};

Life.prototype.update = function update()
{
	var width  = 60, height =  5;
	var Entity = this.entity.constructor;

	// Don't display it, if negatives values.
	if (this.hp < 0 || this.hp_max < 0) {
		this.remove();
		return;
	}

	// Init variables
	this.display = true;
	var ctx      = this.ctx;
	var hp_per   = this.hp / this.hp_max;
	var sp       = this.sp > -1 && this.sp_max > -1;
	var sp_per   = this.sp / this.sp_max;
	var ap       = this.ap > -1 && this.ap_max > -1;
	var ap_per   = this.ap / this.ap_max;

	var hunger       = this.hunger > -1 && this.hunger_max > -1;
	var hunger_per   = this.hunger / this.hunger_max;

	if (sp) {
		height += 4;
	}

	if (hunger) {
		height += 4;
	}

	// Draw life
	ctx.canvas.width  = width;
	ctx.canvas.height = height;

	// border
	ctx.fillStyle = '#10189c';
	ctx.fillRect( 0, 0, width, height );

	// empty
	ctx.fillStyle = '#424242';
	ctx.fillRect( 1, 1, width-2, height-2 );
	
	//zIndex
	this.canvas.style.zIndex = this.entity.objecttype === Entity.TYPE_PC ? 2 : 1;

	// Display HP
	if (this.entity.objecttype === Entity.TYPE_MOB || this.entity.objecttype === Entity.TYPE_NPC_ABR || this.entity.objecttype === Entity.TYPE_NPC_BIONIC) {
		ctx.fillStyle = ( hp_per < 0.25 ) ? '#FFFF00' : '#FF00E7';
	}
	else if (this.entity.objecttype === Entity.TYPE_PET) {
		ctx.fillStyle = ( hp_per < 0.25 ) ? '#FFFF00' : '#FFE7E7';
	}
	else {
		ctx.fillStyle = ( hp_per < 0.25 ) ? '#FF0000' : '#10ef21';
	}

	ctx.fillRect( 1, 1, Math.round( (width-2) * hp_per ), 3 );

	// Display SP
	if (sp) {
		ctx.fillStyle = '#10189c';
		ctx.fillRect( 0, 4, width, 1);
		ctx.fillStyle = '#1863de';
		ctx.fillRect( 1, 5, Math.round( (width-2) * sp_per ), 3 );
	}

	if (ap) {
		ctx.fillStyle = '#424242';
		ctx.fillRect( 1, 9, width, 1 );
		ctx.fillStyle = '#ffc663';
		ctx.fillRect( 1, 9, Math.round( (width-2) * ap_per ), 3 );
	}

	if (hunger){
		ctx.fillStyle = '#424242';
		ctx.fillRect( 1, 9, width, 1 );
		ctx.fillStyle = ( hunger_per < 0.25 ) ? '#FFFF00' : '#FFE7E7';
		ctx.fillRect( 1, 9, Math.round( (width-2) * hunger_per ), 3 );
	}
};

Life.prototype.render = function Render( matrix )
{
	var canvas = this.canvas;
	var z;

	// Cast position
	_pos[0] =  0.0;
	_pos[1] = -0.5;
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

	canvas.style.top  = (_pos[1] | 0 ) + 'px';
	canvas.style.left = ((_pos[0] - canvas.width / 2) | 0) + 'px';

	// Append to body
	if (!canvas.parentNode) {
		document.body.appendChild(canvas);
	}
};

export default function Init()
{
	this.life        = new Life();
	this.life.entity = this;
};
