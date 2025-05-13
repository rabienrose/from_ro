import FileManager from './FileManager.js';

var MapLoader={};

MapLoader.fileCount = 0;
MapLoader.progress = 0;
MapLoader.offset = 0;
MapLoader.map_root = '/resources/maps/';
MapLoader.texture_root = '/resources/texture/';
MapLoader.model_root = '/resources/model/';

MapLoader.setProgress = function setProgress( percent ){
	var progress = Math.min(100, Math.floor(percent));
	if (progress !== MapLoader.progress) {
		if (MapLoader.onprogress) {
			MapLoader.onprogress(progress);
		}
		MapLoader.progress = progress;
	}
};

MapLoader.load = function Load( mapname ){
	MapLoader.fileCount = 0;
	MapLoader.offset = 0;
	MapLoader.setProgress( 0 );
	var world;
	function getFilePath( path ) {
		if (path in FileManager.filesAlias) {
			return FileManager.filesAlias[path];
		}
		return path;
	}
	var world;
	var altitude;
	var ground;
	FileManager.load(MapLoader.map_root + getFilePath(mapname))
	.then((res) => {
		world = res;
		MapLoader.setProgress( 1 );
		return FileManager.load(MapLoader.map_root + getFilePath(world.files.gat));
	})
	.then((res) => {
		altitude = res;
		MapLoader.setProgress( 2 );
		altitude.compile();
		MapLoader.MAP_ALTITUDE(altitude);
		return FileManager.load(MapLoader.map_root + getFilePath(world.files.gnd));
	})
	.then((res) => {
		ground=res;
		MapLoader.setProgress( 3 );
		if (ground && ground.version >= 1.8) {
			world.water = ground.water;
		}
		var compiledGround = ground.compile( world.water.level, world.water.waveHeight );
		MapLoader.fileCount = ground.textures.length + world.models.length * 3;
		if (compiledGround.waterVertCount) {
			MapLoader.fileCount += 32;
		}
		var i, count;
		var textures_water = [];
		if (compiledGround.waterVertCount) {
			var path = MapLoader.texture_root + '\xbf\xf6\xc5\xcd/water' + world.water.type;
			for (i = 0; i < 32; ++i) {
				textures_water.push(path + ( i<10 ? '0'+i : i) + '.jpg');
			}
		}
		var textures = [];
		for (i = 0, count = ground.textures.length; i < count; ++i ) {
			textures.push(MapLoader.texture_root + ground.textures[i]);
		}
		var promises_water = textures_water.map(filename => {
			return FileManager.load(filename);
		});
		var promises = textures.map(filename => {
			return FileManager.load(filename);
		});
		Promise.all(promises_water).then((res) => {
			MapLoader.setProgress(4);
			world.water.images      = res;
			MapLoader.MAP_WORLD(world.compile());
		})
		.then(() => {
			return Promise.all(promises).then((res) => {
				MapLoader.setProgress(4);
				compiledGround.textures = res;
				MapLoader.MAP_GROUND(compiledGround);
			});
		})
	})
	.then(() => {
		var models = world.models;
		var i, count;
		var files = [];
		for (i = 0, count = models.length; i < count; ++i) {
			models[i].filename = MapLoader.model_root + models[i].filename;
			if (files.indexOf(models[i].filename) < 0) {
				files.push(models[i].filename);
			}
		}
		var promises = files.map(filename => {
			return FileManager.load(filename, {keep_name:true});
		});
		return Promise.all(promises).then((res) => {
			MapLoader.setProgress(5);
			var filenames=res.map(r=>r.filename);
			var objects=res.map(r=>r.result);
			var i, count, pos;
			for (i = 0, count = models.length; i < count; ++i) {
				pos = filenames.indexOf(models[i].filename);
				if (pos === -1) {
					continue;
				}
				objects[pos].filename = filenames[pos];
				objects[pos].createInstance(
					models[i],
					ground.width,
					ground.height
				);
			}
			MapLoader.compileModels(objects);
		});
	});
};

MapLoader.compileModels = function CompileModels( objects )
{
	var i, j, count, size, bufferSize;
	var object, nodes, meshes;
	var index;
	var progress = MapLoader.progress;
	var models = [];
	bufferSize = 0;
	
	
	for (i = 0, count = objects.length; i < count; ++i) {
		object = objects[i].compile();
		nodes  = object.meshes;
		for (j = 0, size = nodes.length; j < size; ++j) {
			meshes = nodes[j];
			for (index in meshes) {
				models.push({
					texture: MapLoader.texture_root + object.textures[index],
					alpha:   objects[i].alpha,
					mesh:    meshes[index]
				});
				bufferSize += meshes[index].length;
			}
		}
		MapLoader.setProgress( progress + (100-progress) / count * (i+1) / 2 );
	}
	MapLoader.mergeMeshes( models, bufferSize);
};

function SortMeshByTextures( a, b )
{
	var reg_tga = /\.tga$/i;
	if (a.texture.match(reg_tga)) {
		return  1;
	}
	if (b.texture.match(reg_tga)) {
		return -1;
	}
	if (a.alpha !== b.alpha) {
		return a.alpha < b.alpha ? 1 : 0;
	}
	if (a.texture < b.texture) {
		return -1;
	}
	if (a.texture > b.texture) {
		return 1;
	}
	return 0;
}

MapLoader.mergeMeshes = function MergeMeshes( objects, bufferSize )
{
	var i, j, count, size, offset;
	var object, texture;
	var textures = [], infos = [];
	var buffer;
	var fcount = 1 / 9;
	buffer = new Float32Array(bufferSize);
	offset = 0;
	objects.sort(SortMeshByTextures);
	for (i = 0, j = 0, count = objects.length; i < count; ++i) {
		object = objects[i];
		size   = object.mesh.length;
		if (texture === object.texture) {
			infos[j-1].vertCount += size * fcount;
		}
		else {
			texture = object.texture;
			textures.push(texture);
			infos[j++] = {
				filename:   texture,
				vertOffset: offset * fcount,
				vertCount:  size   * fcount
			};
		}
		buffer.set( object.mesh, offset );
		offset += size;
	}
	var promises = textures.map(filename => {
		var promise = FileManager.load(filename, {keep_name:true});
		return promise;
	});
	return Promise.all(promises).then((res) => {
		MapLoader.setProgress(7);
		var i, count, pos;
		var filenames=res.map(r=>r.filename);
		for (i = 0, count = infos.length; i < count; ++i) {
			pos = filenames.indexOf(infos[i].filename);
			infos[i].texture = res[pos].result;
		}
		MapLoader.MAP_MODELS({buffer, infos});
		MapLoader.MAP_COMPLETE();
		
	});
};

export default MapLoader;