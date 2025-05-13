import SoundManager from '../../audio/SoundManager.js';

function Sound()
{
	this._lastActionId    = -1;
	this._lastAnimationId = -1;
	this._lastFileName    = null;
	this._animCounter     = -1;

	this.attackFile       = null;
}

Sound.prototype.play = function play( fileName, action, animation )
{
	// Pet does not produce sound
	if (this.entity.objecttype === this.entity.constructor.TYPE_PET) {
		return;
	}

	// Do not replay the sound if there is no updates
	if (this._lastActionId    === action &&
		this._lastAnimationId === animation &&
		this._lastFileName    === fileName) {
		return;
	}

	this._lastActionId    = action;
	this._lastAnimationId = animation;
	this._lastFileName    = fileName;

	// Find Audio filename
	if (fileName === 'atk') {
		if (!this.attackFile) {
			return;
		}

		fileName = this.attackFile;
	}

	SoundManager.playPosition(fileName, this.entity.position);
};

Sound.prototype.free = function free()
{
	this._lastActionId    = -1;
	this._lastAnimationId = -1;
	this._lastFileName    = null;
	this._animCounter     = -1;
};

Sound.prototype.freeOnAnimationEnd = function freeOnAnimationEnd (anim, size)
{
	if (anim < size) {
		return;
	}

	var count = Math.floor(anim / size);

	if (this._animCounter !== count) {
		this.free();
		this._animCounter = count;
	}
};

export default function init()
{
	this.sound = new Sound();
	this.sound.entity = this;
};
