import SoundManager from '../../audio/SoundManager.js';
import glMatrix from '../../utils/gl-matrix.js';

var vec2   = glMatrix.vec2;
var _list  = [];

function add( sound )
{
	_list.push( sound );
}

function free()
{
	_list.length = 0;
}

function render( position, tick )
{
	var sound;
	var i, count = _list.length;

	for (i = 0; i < count; ++i) {
		sound = _list[i];
		var dist = Math.floor(vec2.dist(sound.pos, position));
		if (sound.tick < tick && dist <= sound.range) {
			SoundManager.playPosition( sound.file, sound.pos);
			sound.tick = tick + sound.cycle * 1000;
		}
	}
}

export default {
	add:    add,
	free:   free,
	render: render
};
