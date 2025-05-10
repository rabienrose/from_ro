import jQuery from '../utils/jQuery.js';

var BGM = {};

BGM.stat        = 0;
BGM.position    = null;
BGM.filename    = null;
BGM.volume      = Preferences.BGM.volume;
BGM.isPlaying   = 'false';

BGM.audio       = document.createElement('audio');
BGM.useHTML5    = false;
BGM.extension   = 'mp3';
BGM.isInit      = false;

BGM.initHTML5 = function initHTML5()
{
	if (BGM.isInit) {
		return;
	}

	BGM.isInit = true;

	// Buggy looping for HTM5 Audio...
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

BGM.setAvailableExtensions = function setAvailableExtensions( extensions )
{
	this.useHTML5  = true;
	BGM.initHTML5();
};

BGM.play = function play( filename )
{
	// Nothing to play
	if (!filename) {
		return;
	}

	// Remove the "BGM/" part
	if (filename.match(/bgm/i)) {
		filename = filename.match(/\w+\.mp3/i).toString();
	}

	// If it's the same file, check if it's already playing
	if (this.filename === filename) {
		if ((!this.useHTML5 && this.isPlaying == 'true') ||
			( this.useHTML5 && !this.audio.paused)) {
				return;
		}
	}
	else {
		this.filename = filename;
	}

	// Just if flash is loaded, load the file.
	if ((this.useHTML5 || this.position !== null) && Preferences.BGM.play) {
		Client.loadFile( 'BGM/' + filename, function(url) {
			BGM.load(url);
		});
	}
};

BGM.load = function load(url)
{
	if (!Preferences.BGM.play) {
		return;
	}

	// Add support for other extensions, only supported with
	// remote audio files.
	if (!url.match(/^(blob|data)\:/) && BGM.useHTML5){
		url = url.replace(/mp3$/i, BGM.extension);
	}

	// HTML5 audio
	if (BGM.useHTML5) {
		BGM.audio.src    = url;
		BGM.audio.volume = this.volume;
		BGM.audio.play();
	}

	// Flash fallback
	else if (BGM.flash.SetVariable) {
		BGM.flash.SetVariable('method:setUrl', url );
		BGM.flash.SetVariable('method:play', null );
		BGM.flash.SetVariable('enabled', 'true');
	}
};

BGM.stop = function stop()
{
	if (BGM.useHTML5) {
		BGM.audio.pause();
	}
	else if (BGM.flash.SetVariable) {
		BGM.flash.SetVariable('method:pause', null );
	}
};

BGM.setVolume = function setVolume( volume )
{
	BGM.volume  = volume;
	Preferences.BGM.volume = volume;
	Preferences.save();

	if (BGM.useHTML5) {
		BGM.audio.volume = volume;
	}
	else if (BGM.flash.SetVariable) {
		BGM.flash.SetVariable('method:setVolume', volume*100 );
	}
};

export default BGM;