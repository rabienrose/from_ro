import Preferences from '../configs/Preferences.js';
import Global from '../utils/Globals.js';
import Events from '../utils/Events.js';
var BGM = {};

BGM.stat        = 0;
BGM.position    = null;
BGM.filename    = null;
BGM.volume      = 1;
BGM.isPlaying   = 'false';
BGM.audio       = document.createElement('audio');
BGM.isInit      = false;
BGM.muted       = !Preferences.Audio.BGM.play;

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

	BGM.load( "http://" + Global.root_ip + ':8002/resources/bgm/' + filename);
};

BGM.delay_play = function delay_play()
{
	Events.setTimeout(
		()=>{
			BGM.audio.play().then(
				() => {
				},
				() => {
					BGM.delay_play();
				}
			);
		}, 
		1000
	);
}

BGM.load = function load(url_str)
{
	if (BGM.muted) {
		return;
	}
	BGM.audio.src    =url_str;
	BGM.audio.volume = this.volume;
	BGM.delay_play();
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