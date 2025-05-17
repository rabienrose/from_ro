import * as glMatrix from 'gl-matrix';
import Session from "../utils/SessionStorage";
import FileManager from '../network/FileManager.js';
const C_MAX_SOUND_INSTANCES = 10; //starting max, later balanced based on mediaPlayerCount
const C_MAX_CACHED_SOUND_INSTANCES = 30; //starting max, later balanced based on mediaPlayerCount
const C_MAX_MEDIA_PLAYERS = 800; //Browsers are limited to 1000 media players max (in Chrome). Let's not go all the way.
const C_SAME_SOUND_DELAY = 100 //ms
const C_CACHE_CLEANUP_TIME = 30000; //ms

var _sounds = {};
var _cache = {};
var mediaPlayerCount = 0;
var SoundManager = {};
SoundManager.volume = 1;

var play_sound=function(audio){
	audio.play()
	.then(
		() => {
		},
		() => {
		}
	)
}

SoundManager.play = function play( filename, vol ) {
	var volume;
	
	// Sound volume * Global volume
	if (vol) {
		volume = vol * this.volume;
	}
	else {
		volume = this.volume;
	}
	
	if(!(filename in _sounds)){
		_sounds[filename] = {};
		_sounds[filename].instances = [];
		_sounds[filename].lastTick = 0;
	}

	// Re-usable sound
	var sound = getSoundFromCache(filename);
	if (sound) {
		sound.volume  = Math.min(volume,1.0);
		sound._volume = volume;
		play_sound(sound);
		_sounds[filename].instances.push(sound);
		_sounds[filename].lastTick = Date.now();
		return;
	}
	var sound;
	if (!(filename in _sounds)){
		return;
	}
	// Wait a delay to replay a sound and don't play too many times (self balancing formula based on total media players)
	if (filename in _sounds && (_sounds[filename].lastTick > Date.now() - C_SAME_SOUND_DELAY ||  _sounds[filename].instances.length > balancedMax(C_MAX_SOUND_INSTANCES))) {
		return;
	}

	// Initialiaze the sound and play it
	sound             = document.createElement('audio');
	mediaPlayerCount++;
	sound.filename    = filename;
	sound.src         = FileManager.remoteClient+'/resources/wav/' + filename;
	sound.volume      = Math.min(volume,1.0);
	sound._volume     = volume;
	
	sound.addEventListener('error', onSoundError, false);
	sound.addEventListener('ended', onSoundEnded, false);
	play_sound(sound);

	// Add it to the list
	_sounds[filename].instances.push(sound);
	_sounds[filename].lastTick = Date.now();
};

SoundManager.playPosition = function playPosition(filename, srcPosition)
{
	const dist = Math.floor(glMatrix.vec2.dist(srcPosition, Session.Entity.position));
	const vol = Math.max(((1-Math.abs((dist - 1) * (1 - 0.01) / (25 - 1) + 0.01))), 0.1 );
	SoundManager.play(filename, vol);
}

SoundManager.stop = function stop( filename )
{
	var i, count, list;

	if (filename) {
		if(filename in _sounds){
			while (_sounds[filename].instances.length > 0){
				var sound = _sounds[filename].instances.shift();
				sound.pause();
				sound.remove();
				mediaPlayerCount--;
			}
			delete _sounds[filename];
		}
		return;
	}

	// Remove from memory
	Object.keys(_sounds).forEach(key => {
		while (_sounds[key].instances.length > 0){
			var sound = _sounds[key].instances.shift();
			sound.pause();
			sound.remove();
			mediaPlayerCount--
		}
		delete _sounds[key];
	});
};

SoundManager.setVolume = function setVolume( volume )
{
	this.volume  = Math.min( volume, 1.0);

	Preferences.Audio.Sound.volume = this.volume;
	Preferences.Audio.save();
	
	Object.keys(_sounds).forEach(key => {
		_sounds[key].instances.forEach(sound => {
			sound.volume = Math.min( sound._volume * this.volume, 1.0);
		});
	});
};

function onSoundEnded()
{
	if(_sounds[this.filename]){
		var pos = _sounds[this.filename].instances.indexOf(this);

		if (pos !== -1) {
			_sounds[this.filename].instances.splice( pos, 1);
			if(_sounds[this.filename].instances.length == 0){
				delete _sounds[this.filename]; //This can cause some errors, but whatever. Everything for performance!
			}
		}
		
		addSoundToCache(this);
	}
}

function onSoundError()
{
	console.log("onSoundError: ", this);
	var pos = _sounds[this.filename].instances.indexOf(this);

	if (pos !== -1) {
		_sounds[this.filename].instances.splice( pos, 1);
		if(_sounds[this.filename].instances.length == 0){
			delete _sounds[this.filename];
		}
	}

	this.remove();
	mediaPlayerCount--;
}

function addSoundToCache(sound){
	if(sound.filename){
		if(!(sound.filename in _cache)){
			_cache[sound.filename] = new Object();
			_cache[sound.filename].instances = new Array();
		}
		
		//Don't cache too many instances (self balancing formula based on total media players)
		if(_cache[sound.filename].instances.length < balancedMax(C_MAX_CACHED_SOUND_INSTANCES)){
			
			sound.currentTime = 0; //reset to start to save seeking time on next play THIS IS IMPORTANT! It improves the performance by 10 fold for whatever reason...
			
			sound.cleanupHandle = setTimeout(function(){ cleanupCache(sound); }, C_CACHE_CLEANUP_TIME);
			_cache[sound.filename].instances.push(sound); //put to the end
		} else {
			sound.remove(); //remove from dom if too many instances are already stored
			mediaPlayerCount--;
		}
		
	}
}

function getSoundFromCache(filename)
{
	var out = null;

	if(filename in _cache){
		if(_cache[filename].instances.length > 0){
			var out = _cache[filename].instances.pop(); //remove last instance from cache (newest)
			if(out.cleanupHandle){
				clearTimeout(out.cleanupHandle); //cancel cleanup
			}
		}
	}

	return out;
}

function cleanupCache(sound){
	if(sound.filename && sound.filename in _cache && _cache[sound.filename].instances.length > 0){
		
		var pos = _cache[sound.filename].instances.indexOf(sound);

		if (pos !== -1) {
			_cache[sound.filename].instances.splice( pos, 1);
			/*if(_cache[sound.filename].instances.length == 0){
				delete _cache[sound.filename];
			}*/
			//don't remove the key itself from the cache, because that can cause conflict in the push to instances
			sound.remove();
			mediaPlayerCount--;
		}
	}
}

function balancedMax (maxConst){
	return Math.ceil( maxConst * (1 - mediaPlayerCount/C_MAX_MEDIA_PLAYERS) );
}

export default SoundManager;
