import Renderer from './Renderer.js';
import Camera from './Camera.js';
import Ground from './map/Ground.js';
import MapLoader from '../network/MapLoader.js';
import SoundManager from '../audio/SoundManager.js';
import BGM from '../audio/BGM.js';
import Altitude from './map/Altitude.js';
import Water from './map/Water.js';
import Sounds from './map/Sounds.js';
import Models from './map/Models.js';
import DB from '../configs/DBManager.js';
import MemoryManager from '../utils/MemoryManager.js';
import Session from '../utils/SessionStorage.js';
// import Sky from './Effects/Sky.js';
// import SpriteRenderer from './SpriteRenderer.js';
// import Damage from './Effects/Damage.js';
// import EffectManager from './EffectManager.js';

var MapRenderer = {};
MapRenderer.currentMap = '';
MapRenderer.light = null;
MapRenderer.water = null;
MapRenderer.sounds = null;
MapRenderer.effects = null;
MapRenderer.loading = false;
MapRenderer.fog = {
	use:    true,
	exist:  true,
	far:    30,
	near:   180,
	factor: 1.0,
	color:  new Float32Array([1,1,1])
};

MapRenderer.setMap = function loadMap( mapname )
{
	if (MapRenderer.loading) {
		return;
	}
	console.log("setMap:",mapname);
	mapname = mapname
		.replace(/^(\d{3})(\d@)/, '$2') // 0061@tower   -> 1@tower
		.replace(/^\d{3}#/, '');        // 003#prontera -> prontera
	SoundManager.stop();
	Renderer.stop();
	if (MapRenderer.currentMap !== mapname) {
		MapRenderer.loading = true;
		BGM.stop();
		MapRenderer.currentMap = mapname;
		var filename = mapname.replace(/\.gat$/i, '.rsw');
		console.log(filename);
		MapRenderer.free();
		// Renderer.remove();
		MapLoader.MAP_WORLD=onWorldComplete.bind(MapRenderer)
		MapLoader.MAP_GROUND=onGroundComplete.bind(MapRenderer)
		MapLoader.MAP_ALTITUDE=onAltitudeComplete.bind(MapRenderer)
		MapLoader.MAP_MODELS=onModelsComplete.bind(MapRenderer)
		MapLoader.MAP_PROGRESS=onProgressUpdate.bind(MapRenderer)
		MapLoader.MAP_COMPLETE=onMapComplete.bind(MapRenderer)
		MapLoader.load(filename);
		return;
	}
};

MapRenderer.free = function Free()
{
	var gl = Renderer.getContext();

	SoundManager.stop();
	BGM.stop();

	MapRenderer.light   = null;
	MapRenderer.water   = null;
	MapRenderer.sounds  = null;
	MapRenderer.effects = null;
};

function onProgressUpdate( percent )
{
	Background.setPercent( percent );
}

function onWorldComplete( data )
{
	MapRenderer.light   = data.light;
	MapRenderer.water   = data.water;
	MapRenderer.sounds  = data.sound;
	MapRenderer.effects = data.effect;


	MapRenderer.light.direction = new Float32Array(3);
	var longitude        = MapRenderer.light.longitude * Math.PI / 180;
	var latitude         = MapRenderer.light.latitude  * Math.PI / 180;

	MapRenderer.light.direction[0] = -Math.cos(longitude) * Math.sin(latitude);
	MapRenderer.light.direction[1] = -Math.cos(latitude);
	MapRenderer.light.direction[2] = -Math.sin(longitude) * Math.sin(latitude);
}

function onGroundComplete( data )
{
	var gl = Renderer.getContext();

	MapRenderer.water.mesh      = data.waterMesh;
	MapRenderer.water.vertCount = data.waterVertCount;

	Ground.init( gl, data );
	Water.init( gl, MapRenderer.water );

	var i, count, tmp;

	count = MapRenderer.sounds.length;
	for (i = 0; i < count; ++i) {
		tmp                    = -MapRenderer.sounds[i].pos[1];
		MapRenderer.sounds[i].pos[0] += data.width;
		MapRenderer.sounds[i].pos[1]  = MapRenderer.sounds[i].pos[2] + data.height;
		MapRenderer.sounds[i].pos[2]  = tmp;
		MapRenderer.sounds[i].range  *= 0.2;
		MapRenderer.sounds[i].tick    =   0;
		MapRenderer.sounds[i].cycle    =   !MapRenderer.sounds[i].cycle ? 7:MapRenderer.sounds[i].cycle;
		Sounds.add(MapRenderer.sounds[i]);
	}
	count = MapRenderer.effects.length;
	for (i = 0; i < count; ++i) {
		// Note: effects objects do not need to be centered in a cell
		// as we apply +0.5 in the shader, we have to revert it.
		tmp                     = -MapRenderer.effects[i].pos[1] + 1; //WTF????????
		MapRenderer.effects[i].pos[0] += data.width - 0.5;
		MapRenderer.effects[i].pos[1]  = MapRenderer.effects[i].pos[2] + data.height - 0.5;
		MapRenderer.effects[i].pos[2]  = tmp;

		MapRenderer.effects[i].tick    = 0;

		// Effects.add(MapRenderer.effects[i]);
	}

	MapRenderer.effects.length = 0;
	MapRenderer.sounds.length  = 0;
}

function onAltitudeComplete( data )
{
	Altitude.init( data );
}

function onModelsComplete( data )
{
	Models.init( Renderer.getContext(), data );
}

function onMapComplete( success, error )
{
	var worldResource = MapRenderer.currentMap.replace(/\.gat$/i, '.rsw');
	var mapInfo       = DB.getMap(worldResource);

	BGM.play((mapInfo && mapInfo.mp3) || '01.mp3');

	// MapRenderer.fog.exist = !!(mapInfo && mapInfo.fog);
	// if (MapRenderer.fog.exist) {
	// 	MapRenderer.fog.near   = mapInfo.fog.near * 240;
	// 	MapRenderer.fog.far    = mapInfo.fog.far  * 240;
	// 	MapRenderer.fog.factor = mapInfo.fog.factor;
	// 	MapRenderer.fog.color.set( mapInfo.fog.color );
	// }

	// Initialize renderers
	Renderer.init();
	var gl = Renderer.getContext();
	MapRenderer.loading = false;
	// Sky.setUpCloudData();

	// Display game
	// Renderer.show();
	Renderer.render( MapRenderer.onRender );

	// SpriteRenderer.init(gl);
	// Sky.init( gl, worldResource );
	// Damage.init(gl);
	// EffectManager.init(gl);
	MapRenderer.onLoad();
}

MapRenderer.onRender = function OnRender( tick, gl )
{
	var fog   = MapRenderer.fog;
	fog.use   = false;
	var light = MapRenderer.light;

	var modelView, projection, normalMat;
	var x, y;

	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	Camera.update( tick );

	modelView  = Camera.modelView;
	projection = Camera.projection;
	normalMat  = Camera.normalMat;

	// Spam map effects
	// Effects.spam( Session.Entity.position, tick);

	Ground.render(gl, modelView, projection, normalMat, fog, light );
	Models.render(gl, modelView, projection, normalMat, fog, light );

	// Water.render( gl, modelView, projection, fog, light, tick );
	// Sounds.render( Session.Entity.position, tick );
	MemoryManager.clean(gl, tick);
};

export default MapRenderer;