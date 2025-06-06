import Renderer from '../Renderer.js';
import SpriteRenderer from '../SpriteRenderer.js';
import Camera from '../Camera.js';
import Ground from '../map/Ground.js';
import Altitude from '../map/Altitude.js';
import Session from '../../utils/SessionStorage.js';
import JobId from '../../configs/DBManager.js';
import * as glMatrix from 'gl-matrix';
import FileManager from '../../network/FileManager.js';

function render( modelView, projection )
{
	// Process action
	this.animations.process();

	// Always process walk. It will decide it for itself if it is walking or not and handles it accordingly.
	this.walkProcess();
	this.entitiesWalkProcess(); // falcon/wug

	this.boundingRect.x1 =  Infinity;
	this.boundingRect.y1 = -Infinity;
	this.boundingRect.x2 = -Infinity;
	this.boundingRect.y2 =  Infinity;

	// Render it only if visible
	if (this.effectColor[3]) {
		this.renderEntity();
		this.attachments.render(Renderer.tick);
	}

	// Update character UI (life, dialog, etc.)
	renderGUI( this, modelView, projection );
}

var renderGUI = function renderGUIClosure()
{
	var mat4	= glMatrix.mat4;
	var vec4	= glMatrix.vec4;
	var _matrix = mat4.create();
	var _vector = vec4.create();

	return function renderGUI( entity, modelView, projection )
	{
		// Move to camera
		_vector[0] =  entity.position[0] + 0.5;
		_vector[1] = -entity.position[2];
		_vector[2] =  entity.position[1] + 0.5;
		mat4.translate( _matrix, modelView, _vector);

		// Set-up Spherical billboard
		_matrix[0] = 1.0; _matrix[1] = 0.0; _matrix[2]  = 0.0;
		_matrix[4] = 0.0; _matrix[5] = 1.0; _matrix[6]  = 0.0;
		_matrix[8] = 0.0; _matrix[9] = 0.0; _matrix[10] = 1.0;

		// Project to screen
		mat4.multiply( _matrix, projection, _matrix );

		if (entity.effectColor[3] && entity._job !== 139) {
			calculateBoundingRect( entity, _matrix );
		}

		// Get depth for rendering order
		_vector[0] = 0.0;
		_vector[1] = 0.0;
		_vector[2] = 0.0;
		_vector[3] = 1.0;

		vec4.transformMat4( _vector, _vector, _matrix );
		entity.depth = _vector[3];

		// Display UI
		if (entity.life.display)	entity.life.render( _matrix );
		// if (entity.emblem.display)  entity.emblem.render( _matrix );
		if (entity.display.display) entity.display.render( _matrix );
		// if (entity.dialog.display)  entity.dialog.render( _matrix );
		// if (entity.cast.display)	entity.cast.render( _matrix );
		// if (entity.room.display)	entity.room.render( _matrix );
		// if (entity.signboard.display)	entity.signboard.render( _matrix );
	};
}();

var calculateBoundingRect = function calculateBoundingRectClosure()
{
	var vec4   = glMatrix.vec4;
	var size   = glMatrix.vec2.create();
	var vector = vec4.create();
	var out	= vec4.create();

	function projectPoint(x, y, matrix) {
		vector[0] = x;
		vector[1] = y;
		vector[2] = 0.0;
		vector[3] = 1.0;

		vec4.transformMat4(out, vector, matrix);

		out[3]  = (out[3] === 0.0) ? 1.0 : (1.0 / out[3]);
		out[0] *= out[3];
		out[1] *= out[3];
	}


	return function calculateBoundingRect( entity, matrix )
	{
		var minSize, fx, fy;
		var tmp, rect;

		fx = entity.xSize / 175;
		fy = entity.ySize / 175;

		size[0] = Renderer.width  * 0.5;
		size[1] = Renderer.height * 0.5;

		rect	= entity.boundingRect;
		minSize = (entity.objecttype === entity.constructor.TYPE_ITEM) ? 30 : 60;

		// No body ? Default picking (sprite 110 for example)
		if (rect.x1 === Infinity || rect.x2 ===-Infinity ||
			rect.y1 ===-Infinity || rect.y2 === Infinity) {
			rect.x1 = -25;
			rect.x2 = +25;
			rect.y1 = +45;
			rect.y2 =   0;
		}

		// Swap x1 and x2 if needed
		if (rect.x1 > rect.x2) {
			tmp	 = rect.x1;
			rect.x1 = rect.x2;
			rect.x2 = tmp;
		}

		// Top left
		projectPoint(rect.x1 * fx, rect.y1 * fy, matrix);
		rect.x1 = size[0] + (size[0] * out[0]);
		rect.y1 = size[1] - (size[1] * out[1]);

		// Bottom right
		projectPoint(rect.x2 * fx, rect.y2 * fy, matrix);
		rect.x2 = size[0] + (size[0] * out[0]);
		rect.y2 = size[1] - (size[1] * out[1]);

		// Cap it to minSize
		if (rect.x2 - rect.x1 < minSize) {
			rect.x1 = (rect.x1 + rect.x2) * 0.5 - (minSize * 0.5);
			rect.x2 = rect.x1 + minSize;
		}

		if (rect.y2 - rect.y1 < minSize) {
			rect.y1 = (rect.y1 + rect.y2) * 0.5 - (minSize * 0.5);
			rect.y2 = rect.y1 + minSize;
		}
	};
}();

var renderEntity = function renderEntityClosure()
{
	var _position = new Int32Array(2);

	return function renderEntity()
	{
		if(this.hideEntity) return;
		

		// Update shadow
		SpriteRenderer.shadow = Ground.getShadowFactor( this.position[0], this.position[1] );
		SpriteRenderer.zIndex = 1;

		var animation  = this.animation;
		var Entity	 = this.constructor;
		_position[0]   = 0;
		_position[1]   = 0;

		// Animation change ! Get it now
		if (animation.save && animation.delay < Renderer.tick) {
			this.setAction(animation.save);
		}

		// Avoid look up, render as IDLE all not supported frames
		var action	= this.action < 0 ? this.ACTION.IDLE : this.action;
		var direction = (Camera.direction + this.direction + 8) % 8;
		var behind	= direction > 1 && direction < 6;

		// Render shadow (shadow isn't render when player is sit or dead).
		if (action !== this.ACTION.DIE && action !== this.ACTION.SIT && this.job !== 45 && !this.hideShadow) {

			// Shadow is base on gat height
			SpriteRenderer.position[0] = this.position[0];
			SpriteRenderer.position[1] = this.position[1];
			SpriteRenderer.position[2] = Altitude.getCellHeight(this.position[0], this.position[1]);

			renderElement( this, this.files.shadow, 'shadow', _position, false );

		}

		SpriteRenderer.position.set(this.position);

		// Everything right after the shadow should also be adjusted in height to ensure the sprites are above the shadow
		if (this.objecttype === Entity.TYPE_PC || this.objecttype === Entity.TYPE_MOB || this.objecttype === Entity.TYPE_NPC || this.objecttype === Entity.TYPE_MERC) {
			SpriteRenderer.position[2] = SpriteRenderer.position[2] + .1;
		}

		// Shield is behind on some position, seems to be hardcoded by the client
		if (this.objecttype === Entity.TYPE_PC && this.shield && behind) {
			renderElement( this, this.files.shield, 'shield', _position, true );
		}


		if(direction > 2 && direction < 6)
		{
			renderElement( this, this.files.body, 'body', _position, true );

			// Draw Robe
			if (this.robe > 0) {
				renderElement( this, this.files.robe, 'robe', _position, true);
			}

			if(Session.Playing == true && this.hasCart == true)
			{
				var cartidx = [
						JobId.NOVICE,
						JobId.SUPERNOVICE,
						JobId.SUPERNOVICE_B,
						JobId.SUPERNOVICE2,
						JobId.SUPERNOVICE2_B
					].includes(this._job)? 0 : this.CartNum;
				renderElement( this, this.files.cart_shadow, 'cartshadow', _position, false);
				renderElement( this, this.files.cart[cartidx], 'cart', _position, false);
			}
		}
		else
		{
			if(Session.Playing == true && this.hasCart == true)
			{
				var cartidx = [
						JobId.NOVICE,
						JobId.SUPERNOVICE,
						JobId.SUPERNOVICE_B,
						JobId.SUPERNOVICE2,
						JobId.SUPERNOVICE2_B
					].includes(this._job)? 0 : this.CartNum;
					renderElement( this, this.files.cart_shadow, 'cartshadow', _position, false);
				renderElement( this, this.files.cart[cartidx], 'cart', _position, false);
			}
			// Draw Robe
			if (this.robe > 0) {
				renderElement( this, this.files.robe, 'robe', _position, true);
			}
			renderElement( this, this.files.body, 'body', _position, true );
		}



		if (this.objecttype === Entity.TYPE_PC || this.objecttype === Entity.TYPE_MERC) {
			// Draw Head
			renderElement( this, this.files.head, 'head', _position, false);

			// Hat Bottom
			if (this.accessory > 0) {
				renderElement( this, this.files.accessory, 'head', _position, false);
			}

			// Hat Middle
			if (this.accessory3 > 0 && this.accessory3 !== this.accessory) { // accessory already rendered, avoid render same item again
				renderElement( this, this.files.accessory3, 'head', _position, false);
			}

			// Hat Top
			if (this.accessory2 > 0 && this.accessory2 !== this.accessory && this.accessory2 !== this.accessory3) { // accessory and accessory3 already rendered, avoid render same item again
				renderElement( this, this.files.accessory2, 'head', _position, false);
			}

			// Draw Others elements
			if (this.weapon > 0) {
				renderElement( this, this.files.weapon, 'weapon', _position, true );
				renderElement( this, this.files.weapon_trail, 'weapon_trail', _position, true );
			}

			if (this.shield > 0 && !behind) {
				renderElement( this, this.files.shield, 'shield', _position, true );
			}
		}
	};
}();

var renderElement = function renderElementClosure()
{
	var _position = new Int32Array(2);

	return function renderElement( entity, files, type, position, is_main )
	{
		var isBlendModeOne = false;

		// Nothing to render
		if (typeof files === 'undefined' || !files.spr || !files.act)
		{
			return;
		}
		
		// Get back sprite and act
		var spr = FileManager.read(files.spr);
		var act = FileManager.read(files.act);
		// Not loaded yet
		if (!spr || !act) {
			return;
		}

		

		// If palette, load palette, else get back sprite palette
		var pal = (files.pal && FileManager.read(files.pal)) || spr;

		// Obtain animations from the action and direction.
		var action = act.actions[
			(( entity.action * 8 ) +						 // Action
			( Camera.direction + entity.direction + 8 ) % 8  // Direction
			) % act.actions.length ];						// Avoid overflow on action (ex: if there is just one action)

		// Find animation
		var animation_id = calcAnimation( entity, action, type, Renderer.tick - entity.animation.tick);
		var animation	= action.animations[animation_id];
		var layers	   = animation.layers;

		// Play sound
		if (animation.sound > -1) {
			entity.sound.play( act.sounds[animation.sound], entity.action, animation_id );
		}

		_position[0] = 0;
		_position[1] = 0;

		if (animation.pos.length && !is_main)
		{
			_position[0] = position[0] - animation.pos[0].x;
			_position[1] = position[1] - animation.pos[0].y;
		}

		if(type === 'cart' || type === 'cartshadow')
		{
			var direction = (Camera.direction + entity.direction + 8) % 8;

			switch(direction)
			{
			case 0:
				{
					_position[0] = 0;
					_position[1] = -30;
				}
			break;
			case 1:
				_position[0] = 30;
				_position[1] = -10;
			break;
			case 2:
				_position[0] = 40;
				_position[1] = 0;
			break;
			case 3:
				_position[0] = 30;
				_position[1] = 10;
			break;
			case 4:
				{
					_position[0] = 0;
					_position[1] = 20;
				}
			break;
			case 5:
				_position[0] = -30;
				_position[1] = 10;
			break;
			case 6:
				_position[0] = -40;
				_position[1] = 0;
			break;
			case 7:
				_position[0] = -30;
				_position[1] = -10;
				break;
				}
		}

		// Render all frames
		for (var i=0, count=layers.length; i<count; ++i) {
			entity.renderLayer( layers[i], spr, pal, files.size, _position, type, isBlendModeOne);
		}

		// Save reference
		if (is_main && animation.pos.length) {
			position[0] = animation.pos[0].x;
			position[1] = animation.pos[0].y;
		}
	};
}();

function getAnimationDelay(type, entity, act) {
	if (type === 'body' && entity.action === entity.ACTION.WALK) {
		return act.delay / 150 * entity.walk.speed;
	}

	// Delay on attack
	if (entity.action === entity.ACTION.ATTACK  ||
		entity.action === entity.ACTION.ATTACK1 ||
		entity.action === entity.ACTION.ATTACK2 ||
		entity.action === entity.ACTION.ATTACK3) {
		return entity.attack_speed / act.animations.length;
	}

	return act.delay;
}

function calcAnimation( entity, act, type, tick)
{
	// Fix for shadow
	if (type === 'shadow' || type === 'cartshadow') {
		return 0;
	}

	// To avoid look up
	var ACTION	= entity.ACTION;
	var action	= entity.action;
	var animation = entity.animation;
	var animCount = act.animations.length;
	var animSize  = animCount;
	var animLastIndex = animSize-1;
	var isIdle	= (action === ACTION.IDLE || action === ACTION.SIT);
	var delay	 = getAnimationDelay(type, entity, act);
	var headDir   = 0;
	var anim	  = 0;

	//overrides
	if(animation.length){
		animCount = animation.length;
	}
	if(animation.speed){
		delay = animation.speed;
	}

	if(type === 'cart' && isIdle){
		return 0;
	}

	// Get rid of doridori

	if ((type === 'body' || type === 'robe') &&
		(entity.objecttype === entity.constructor.TYPE_PC ||
			entity.objecttype === entity.constructor.TYPE_MERC) &&
		isIdle) {
		if(entity.headDir <= animLastIndex)
			return entity.headDir;
		return animLastIndex;
	}

	// If hat/hair, divide to 3 since there is doridori include
	// TODO: fixed, just on IDLE and SIT ?
	if (type === 'head' &&
		(entity.objecttype === entity.constructor.TYPE_PC ||
			entity.objecttype === entity.constructor.TYPE_MERC) &&
		isIdle) {
		animCount = Math.floor(animCount / 3);
		headDir = entity.headDir <= animLastIndex ? entity.headDir : animLastIndex;
	}

	// Don't play, so stop at the current frame.
	if (animation.play === false) {
		anim += animCount * headDir; // get rid of doridori
		anim += animation.frame;	 // set frame
		anim %= animSize;			// avoid overflow

		return anim;
	}

	// Repeatable
	if (animation.repeat) {
		anim = Math.floor(tick / delay);

		entity.sound.freeOnAnimationEnd(anim, animCount);

		anim %= animCount;
		anim += animCount * headDir; // get rid of doridori
		anim += animation.frame;	 // don't forget the previous frame
		anim %= animSize;			// avoid overflow

		return anim;
	}

	// No repeat
	anim = Math.min(tick / delay | 0, animCount || animCount -1);  // Avoid an error if animation = 0, search for -1 :(

	anim %= animCount;
	anim += animCount * headDir // get rid of doridori
	anim += animation.frame	 // previous frame
	anim %= animSize;			// avoid overflow

	var lastFrame = animation.frame + animSize-1;

	if (type === 'body' && anim >= lastFrame) {
		animation.frame = anim = lastFrame;
		animation.play  = false;
		if (animation.next) {
			entity.setAction( animation.next );
		}
	}

	return Math.min( anim, animSize-1 );
}

function renderLayer( layer, spr, pal, size, pos, type, isBlendModeOne )
{
	// If there is nothing to render
	if (layer.index < 0) {
		return;
	}

	SpriteRenderer.image.palette = null;
	SpriteRenderer.sprite		= spr.frames[layer.index];
	SpriteRenderer.palette	   = pal.palette;

	var index   = layer.index + 0;
	var is_rgba = layer.spr_type === 1 || spr.rgba_index === 0;

	if (!is_rgba) {
		SpriteRenderer.image.palette = pal.texture;
		SpriteRenderer.image.size[0] = spr.frames[ index ].width;
		SpriteRenderer.image.size[1] = spr.frames[ index ].height;
	}

	// RGBA is at the end of the spr.
	else if (layer.spr_type === 1) {
		index += spr.old_rgba_index;
	}

	var frame  = spr.frames[ index ];
	var width  = frame.width;
	var height = frame.height;

	// Apply the scale
	width  *= layer.scale[0] * size;
	height *= layer.scale[1] * size;


	// Get the entity bounding rect
	if (type === 'body') {
		var w = (frame.originalWidth  * layer.scale[0] * size) / 2;
		var h = (frame.originalHeight * layer.scale[1] * size) / 2;

		this.boundingRect.x1 = Math.min( this.boundingRect.x1,  (layer.pos[0] + pos[0]) - w );
		this.boundingRect.y1 = Math.max( this.boundingRect.y1, -(layer.pos[1] + pos[1]) + h );
		this.boundingRect.x2 = Math.max( this.boundingRect.x2,  (layer.pos[0] + pos[0]) + w );
		this.boundingRect.y2 = Math.min( this.boundingRect.y2, -(layer.pos[1] + pos[1]) - h );
	}

	// Image inverted
	if (layer.is_mirror) {
		width = -width;
	}

	// copy color
	if (type !== 'shadow') {
		SpriteRenderer.color[0] = layer.color[0]// * this.effectColor[0];
		SpriteRenderer.color[1] = layer.color[1] //* this.effectColor[1];
		SpriteRenderer.color[2] = layer.color[2] //* this.effectColor[2];
		SpriteRenderer.color[3] = layer.color[3] //* this.effectColor[3];
	} else {
		SpriteRenderer.color[0] = layer.color[0];
		SpriteRenderer.color[1] = layer.color[1];
		SpriteRenderer.color[2] = layer.color[2];
		SpriteRenderer.color[3] = layer.color[3];
	}

	// apply disapear
	if (this.remove_tick) {
		SpriteRenderer.color[3] *= 1 - ( Renderer.tick - this.remove_tick  ) / this.remove_delay;
	}

	// Store shader info
	SpriteRenderer.angle		 = layer.angle;
	SpriteRenderer.size[0]	   = width;
	SpriteRenderer.size[1]	   = height;
	SpriteRenderer.offset[0]	 = layer.pos[0] + pos[0];
	SpriteRenderer.offset[1]	 = layer.pos[1] + pos[1];
	SpriteRenderer.xSize		 = this.xSize;
	SpriteRenderer.ySize		 = this.ySize;
	SpriteRenderer.image.texture = frame.texture;

	// Draw Sprite
	SpriteRenderer.render(isBlendModeOne);
}

export default function Init()
{
	this.render		 = render;
	this.renderLayer	= renderLayer;
	this.renderEntity   = renderEntity;
};

