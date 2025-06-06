import FileManager from '../../network/FileManager.js';
import Renderer from '../Renderer.js';
import SpriteRenderer from '../SpriteRenderer.js';
import Camera from '../Camera.js';

function AttachmentManager( entity )
{
	this.list   = [];
	this.entity = entity;
}

AttachmentManager.prototype.add = function add( attachment )
{
	if (attachment.uid) {
		this.remove(attachment.uid);
	}

	attachment.startTick     = Renderer.tick;
	attachment.opacity       = !isNaN(attachment.opacity) ? attachment.opacity : 1.0;
	attachment.direction     = attachment.hasOwnProperty('frame')   ? false : true;
	attachment.frame         = attachment.frame     || 0;
	attachment.depth         = attachment.depth     || 0.0;
	attachment.head          = attachment.head      || false;

	attachment.position = false;
			if (attachment.yOffset || attachment.xOffset) attachment.position = new Int16Array(2);
			if (attachment.xOffset) attachment.position[0] = attachment.xOffset;
			if (attachment.yOffset) attachment.position[1] = attachment.yOffset;

	attachment.repeat        = attachment.repeat    || false;
	attachment.duplicate 	 = attachment.duplicate || 0;
	attachment.stopAtEnd     = attachment.stopAtEnd || false;
	attachment.delay = attachment.delay || false;

	if (attachment.completeFile) {
					attachment.spr = attachment.completeFile + '.spr';
					attachment.act = attachment.completeFile + '.act';
			} else if (attachment.file) {
		attachment.spr = '/sprite/c0ccc6d1c6ae/' + attachment.file + '.spr';
		attachment.act = '/sprite/c0ccc6d1c6ae/' + attachment.file + '.act';
	}

	// Start rendering once sprite is loaded
	FileManager.load(attachment.act);
	FileManager.load(attachment.spr, {to_rgba:true})
	.then(()=>{
		this.list.push(attachment);
	});
};

AttachmentManager.prototype.get = function get( uid ) {
			var i, length = this.list.length;
			for (i = 0; i < length; ++i) {
					if (this.list[i].uid == uid) return this.list[i];
			}
			return null;
	};

AttachmentManager.prototype.remove = function remove( uid )
{
	var i, count;
	var list;

	list  = this.list;
	count = list.length;

	for (i = 0; i < count; ++i) {
		if (list[i].uid === uid) {
			this.removeIndex(i);
			i--;
			count--;
		}
	}
};

AttachmentManager.prototype.removeIndex = function removeIndex( index )
{
	this.list.splice(index, 1);

	// Is effect and no attachment, clean up
	if (this.list.length === 0 && this.entity.objecttype === this.entity.constructor.TYPE_EFFECT) {
		this.entity.remove();
	}
};

AttachmentManager.prototype.render = function renderClosure()
{
	var effectColor = new Float32Array(4);
	var resetColor  = new Float32Array([1.0, 1.0, 1.0, 1.0]);

	return function render( tick )
	{
		var list;
		var i, count;

		list  = this.list;
		count = list.length;

		effectColor.set(this.entity.effectColor);
		this.entity.effectColor.set(resetColor);

		for (i = 0; i < count; ++i) {
			if (this.renderAttachment( this.list[i], tick)) {
				this.removeIndex(i);
				i--;
				count--;
			}
		}

		SpriteRenderer.depth = 0.0;
		this.entity.effectColor.set(effectColor);
	};
}();

AttachmentManager.prototype.renderAttachment = function renderAttachmentClosure()
{
	var position = new Int16Array(2);

	return function renderAttachment( attachment, tick)
	{
		// Nothing to render yet
		if (attachment.startTick > tick) {
			return;
		}

		var i, count;
		var spr, act, delay, frame;
		var animation, animations, layers;
		var clean = false;

		var spr = FileManager.read(attachment.spr);
		var act = FileManager.read(attachment.act);


		if (!spr || !act) {
			return clean;
		}

		this.entity.effectColor[3]  = attachment.opacity;
		if(!attachment.position){
			position[1] = attachment.head ? -100 : 0;
		} else if(attachment.position){
			position = attachment.position;
		}
		frame                       = attachment.direction ? (Camera.direction + this.entity.direction + 8) % 8 : attachment.frame;
		frame                      %= act.actions.length;
		animations                  = act.actions[frame].animations;
		delay                       = attachment.delay || act.actions[frame].delay;
		SpriteRenderer.depth        = attachment.depth;

		// pause
		if ('animationId' in attachment) {
			layers = animations[attachment.animationId].layers;
		}

		// repeat animation
		else if (attachment.repeat) {
			layers = animations[ Math.floor((tick - attachment.startTick) / delay) % animations.length].layers;
		}

		// repeat duplicate times
		else if (attachment.duplicate > 0){
			var index = Math.floor((tick - attachment.startTick) / delay) % animations.length;
			layers = animations[index].layers;
			if(index == animations.length - 1) attachment.duplicate--;
		}

		// stop at end
		else {
			animation = Math.min( Math.floor((tick - attachment.startTick) / delay), animations.length-1);
			layers    = animations[animation].layers;

			if (animation === animations.length - 1 && !attachment.stopAtEnd) {
				clean = true;
			}
		}

		// render layers
		for (i = 0, count = layers.length; i < count; ++i) {
			this.entity.renderLayer(layers[i], spr, spr, 1.0, position, false);
		}

		return clean;
	};
}();

export default function init()
{
	this.attachments = new AttachmentManager(this);
};
