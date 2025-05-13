import WebGL from '../../utils/WebGL.js';
import FileManager from '../../network/FileManager.js';
import Session from '../../utils/SessionStorage.js';
import SpriteRenderer from '../SpriteRenderer.js';
import vec3 from '../../utils/gl-matrix.js';

var Weather = {};
Weather.sky = {};
Weather.sky['airplane.rsw']    = { skyColor:[0.4, 0.6, 0.8, 1.0], cloudColor:[1.0, 1.0, 1.0] };
Weather.sky['airplane_01.rsw'] = { skyColor:[0.4, 0.6, 0.8, 1.0], cloudColor:[1.0, 1.0, 1.0] };
Weather.sky['gonryun.rsw']     = { skyColor:[0.4, 0.6, 0.8, 1.0], cloudColor:[1.0, 1.0, 1.0] };
Weather.sky['gon_dun02.rsw']   = { skyColor:[0.4, 0.6, 0.8, 1.0], cloudColor:[1.0, 1.0, 1.0] };
Weather.sky['himinn.rsw']      = { skyColor:[0.4, 0.6, 0.8, 1.0], cloudColor:[1.0, 1.0, 1.0] };
Weather.sky['ra_temsky.rsw']   = { skyColor:[0.4, 0.6, 0.8, 1.0], cloudColor:[1.0, 1.0, 1.0] };
Weather.sky['rwc01.rsw']       = { skyColor:[0.4, 0.6, 0.8, 1.0], cloudColor:[1.0, 1.0, 1.0] };
Weather.sky['sch_gld.rsw']     = { skyColor:[0.4, 0.6, 0.8, 1.0], cloudColor:[1.0, 1.0, 1.0] };
Weather.sky['valkyrie.rsw']    = { skyColor:[0.4, 0.6, 0.8, 1.0], cloudColor:[1.0, 1.0, 1.0] };
Weather.sky['yuno.rsw']        = { skyColor:[0.4, 0.6, 0.8, 1.0], cloudColor:[1.0, 1.0, 1.0] };
Weather.sky['5@tower.rsw']     = { skyColor:[0.2, 0.0, 0.2, 1.0],    cloudColor:[1.0, 0.7, 0.7] };
Weather.sky['thana_boss.rsw']  = { skyColor:[0.88, 0.83, 0.76, 1.0], cloudColor:[0.37, 0.0, 0.0] };

var MAX_CLOUDS = 150;
var _clouds = new Array(MAX_CLOUDS);
var _textures = [];
var _color = null;
var _display     = true;

function init( gl, mapname )
{
	var color;
	var i;

	// Not found on weather, black sky, no cloud.
	if (!Weather.sky[mapname]) {
		gl.clearColor( 0.0, 0.0, 0.0, 1.0);
		_display = false;
		return;
	}

	// Save color
	_color   = Weather.sky[mapname].cloudColor;
	color    = Weather.sky[mapname].skyColor;
	_display = true;

	gl.clearColor( color[0], color[1], color[2], color[3]);

	// Add images to GPU
	if (!_textures.length) {
		_textures.length = 8;

		for (i = 0; i < 7; i++) {
			loadCloudTexture(gl, i);
		}
	}
}

function loadCloudTexture( gl, i )
{
	FileManager.load('data/texture/effect/cloud' + (i+1) + '.tga', function(buffer) {
		WebGL.texture( gl, buffer, function(texture) {
			_textures[i] = texture;
		});
	});
}

function setUpCloudData()
{
	var i;

	// Add sprites to scene
	for (i = 0; i < MAX_CLOUDS; i++) {
		if (!_clouds[i]) {
			_clouds[i] = {
				position:   vec3.create(),
				direction:  vec3.create(),
				born_tick:  0,
				death_tick: 0
			};
		}
		cloudInit(_clouds[i]);
		_clouds[i].sprite     = (Math.random()*(_textures.length-1)) | 0;
		_clouds[i].death_tick = _clouds[i].born_tick + Math.random()*8000;
		_clouds[i].born_tick  -= 2000;
	}

	// Sort by textures
	_clouds.sort(function(a,b){
		return a.sprite-b.sprite;
	});
}

function cloudInit( cloud )
{
	var pos = Session.Entity.position;

	cloud.position[0]  = pos[0] + (Math.random()*35 | 0) * (Math.random() > 0.5 ? 1 : -1);
	cloud.position[1]  = pos[1] + (Math.random()*35 | 0) * (Math.random() > 0.5 ? 1 : -1);
	cloud.position[2]  = -10.0;

	cloud.direction[0] = Math.random()*0.02  - 0.01;
	cloud.direction[1] = Math.random()*0.02  - 0.01;
	cloud.direction[2] = Math.random()*0.002 - 0.001;

	cloud.born_tick    = cloud.death_tick ? cloud.death_tick + 2000 : Date.now();
	cloud.death_tick   = cloud.born_tick + 6000;
}

function render( gl, modelView, projection, fog, tick )
{
	if (!_display) {
		return;
	}

	var i, cloud, opacity;

	// Init program
	SpriteRenderer.bind3DContext( gl, modelView, projection, fog );

	// Base parameters
	SpriteRenderer.color.set(_color);
	SpriteRenderer.shadow        = 1.0;
	SpriteRenderer.angle         = 0;
	SpriteRenderer.size[0]       = 500;
	SpriteRenderer.size[1]       = 500;
	SpriteRenderer.offset[0]     = 0;
	SpriteRenderer.offset[1]     = 0;
	SpriteRenderer.image.palette = null;
	SpriteRenderer.depth         = 0;
	gl.depthMask(false);

	for (i = 0; i < MAX_CLOUDS; i++) {
		cloud = _clouds[i];

		// Appear
		if (cloud.born_tick + 1000 > tick) {
			opacity = (tick - cloud.born_tick) / 1000;
		}

		// Remove
		else if (cloud.death_tick + 2000 < tick) {
			cloudInit(cloud);
			opacity = 0.0;
		}

		// Disapear
		else if (cloud.death_tick < tick) {
			opacity = 1.0 - (tick - cloud.death_tick) / 2000;
		}

		// Default
		else {
			opacity = 1.0;
		}

		SpriteRenderer.zIndex        = 0;
		SpriteRenderer.color[3]      = opacity;
		SpriteRenderer.image.texture = _textures[cloud.sprite];

		// Calculate position
		vec3.add( cloud.position, cloud.position, cloud.direction );
		SpriteRenderer.position.set(cloud.position);
		SpriteRenderer.render();
	}

	// Clean up
	SpriteRenderer.unbind(gl);
	gl.depthMask(true);
}

export default {
	init:           init,
	setUpCloudData: setUpCloudData,
	render:         render
};
