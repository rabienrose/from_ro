import jQuery from '../utils/jQuery.js';

var BGM = {};

BGM.stat        = 0;
BGM.position    = null;
BGM.filename    = null;
BGM.volume      = 1;
BGM.isPlaying   = 'false';
BGM.audio       = document.createElement('audio');
BGM.isInit      = false;
BGM.muted       = true;

BGM.initHTML5 = function initHTML5()
{
	if (BGM.isInit) {
		return;
	}
	BGM.isInit = true;
	if (typeof BGM.audio.loop === 'boolean') {
		BGM.audio.loop = true;
		return;
	}

	// Work around
	BGM.audio.addEventListener('ended', function(){
		BGM.audio.currentTime = 0;
		BGM.audio.play();
	}, false);
};

BGM.play = function play( filename )
{
	// Nothing to play
	if (!filename) {
		return;
	}

	// If it's the same file, check if it's already playing
	if (this.filename === filename) {
		if (!this.audio.paused) {
				return;
		}
	}
	else {
		this.filename = filename;
	}

	BGM.load('resources/bgm/' + filename);
};

BGM.load = function load(url)
{
	if (BGM.muted) {
		return;
	}
	console.log(url);
	BGM.audio.src    = url;
	BGM.audio.volume = this.volume;
	BGM.audio.play();
};

BGM.stop = function stop()
{
	BGM.audio.pause();
};

BGM.setVolume = function setVolume( volume )
{
	BGM.volume  = volume;
	BGM.audio.volume = volume;
};

export default BGM;