import * as glMatrix from 'gl-matrix';
import EffectManager from '../EffectManager';
var vec3   = glMatrix.vec3;
var _list  = [];

function add( mapEffect )
{
	_list.push( mapEffect );
}

function free()
{
	_list.length = 0;
}

function get(GID) {
	var mapEffect;
	var count = _list.length;
	for (var i = 0; i < count; ++i) {
		mapEffect = _list[i];
		if (mapEffect.name == GID) return mapEffect;
	}
	return null;
}

function remove(GID) {
	var mapEffect;
	var count = _list.length;
	for (var i = 0; i < count; ++i) {
		mapEffect = _list[i];
		if (mapEffect.name == GID){
			_list.splice(i, 1);
			break;
		}
	}
}

function spam( position, tick )
{
	var mapEffect;
	var i, count = _list.length;

	for (i = 0; i < count; ++i) {
		mapEffect = _list[i];
		if (!mapEffect.isVisible && vec3.dist(mapEffect.pos, position) < 25) {
			
			var EF_Init_Par = {
				effectId: mapEffect.id,
				ownerAID: mapEffect.name,
				position: mapEffect.pos,
				startTick: tick,
				persistent: true
			};
			EffectManager.spam( EF_Init_Par );
			mapEffect.isVisible = true;
		} else if (mapEffect.isVisible && vec3.dist(mapEffect.pos, position) >= 25){
			EffectManager.remove(null, mapEffect.name);
			mapEffect.isVisible = false;
		}
	}
}

export default {
	add:    add,
	free:   free,
	get:	get,
	remove: remove,
	spam:   spam
};