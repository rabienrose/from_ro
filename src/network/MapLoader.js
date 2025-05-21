import FileManager from './FileManager.js';
import DB from '../configs/DBManager.js';
var MapLoader={};

MapLoader.fileCount = 0;
MapLoader.progress = 0;
MapLoader.offset = 0;
MapLoader.map_root = '/maps/';
MapLoader.texture_root = '/texture/';
MapLoader.model_root = '/model/';

MapLoader.load = function Load( mapname ){
	if (DB.MapAlias[mapname]) {
		mapname = DB.MapAlias[mapname];
	}
	MapLoader.fileCount = 0;
	MapLoader.offset = 0;
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
		return FileManager.load(MapLoader.map_root + getFilePath(world.files.gat));
	})
	.then((res) => {
		altitude = res;
		altitude.compile();
		MapLoader.MAP_ALTITUDE(altitude);
		return FileManager.load(MapLoader.map_root + getFilePath(world.files.gnd));
	})
	.then((res) => {
		ground=res;
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
			world.water.images = res;
			MapLoader.MAP_WORLD(world.compile());
		})
		.then(() => {
			return Promise.all(promises).then(
				(res) => {
					compiledGround.textures = res;
					MapLoader.MAP_GROUND(compiledGround);
				}, 
				(err) => {
					console.log("Error: ", err);
				}
			);
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
			return FileManager.load(filename)
			.then(result=>{
				return {
					filename:filename,
					result:result,
				}
			})
		});
		return Promise.all(promises).then((res) => {
			var filenames=res.map(r=>r.filename);
			var rsms=res.map(r=>r.result);
			var i, count, pos;
			for (i = 0, count = models.length; i < count; ++i) {
				pos = filenames.indexOf(models[i].filename);
				if (pos === -1) {
					continue;
				}
				rsms[pos].filename = filenames[pos];
				rsms[pos].createInstance(
					models[i],
					ground.width,
					ground.height,
					i
				);
			}
			MapLoader.compileModels(rsms);
		});
	});
};

MapLoader.compileModels = function CompileModels( rsms )
{
	var i, j, count, size, bufferSize;
	var rsm_c, inst_meshes, frag_meshes_in_inst;
	var tex_id;
	var frag_mesh_total = [];
	bufferSize = 0;
	
	for (i = 0, count = rsms.length; i < count; ++i) {
		rsm_c = rsms[i].compile();
		inst_meshes  = rsm_c.meshes;
		for (j = 0, size = inst_meshes.length; j < size; ++j) {
			frag_meshes_in_inst = inst_meshes[j];
			for (tex_id in frag_meshes_in_inst) {
				frag_mesh_total.push({
					texture: MapLoader.texture_root + rsm_c.textures[tex_id],
					alpha:   rsms[i].alpha,
					mesh:    frag_meshes_in_inst[tex_id],
					inst_id:     rsm_c.inst_ids[j],
					tex_id:     tex_id,
					mesh_id:     rsm_c.node_ids[j]
				});
				bufferSize += frag_meshes_in_inst[tex_id].length;
			}
		}
	}
	MapLoader.mergeMeshes( frag_mesh_total, bufferSize, rsms);
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

MapLoader.mergeMeshes = function MergeMeshes( frag_mesh_total, bufferSize, rsms )
{;
	var i, j, count, mesh_size, offset;
	var frag_mesh, texture;
	var textures = [], infos = [];
	var buffer;
	var fcount = 1 / 9;
	var raw_mapping={};
	buffer = new Float32Array(bufferSize);
	offset = 0;
	frag_mesh_total.sort(SortMeshByTextures);
	for (i = 0, j = 0, count = frag_mesh_total.length; i < count; ++i) {
		frag_mesh = frag_mesh_total[i];
		mesh_size   = frag_mesh.mesh.length;
		if (texture === frag_mesh.texture) {
			infos[j-1].vertCount += mesh_size * fcount;
		}else {
			texture = frag_mesh.texture;
			textures.push(texture);
			infos[j++] = {
				filename:   texture,
				vertOffset: offset * fcount,
				vertCount:  mesh_size   * fcount,
			};
		}
		var buf_seg=[offset * fcount, mesh_size * fcount, frag_mesh.tex_id, frag_mesh.mesh_id]
		if (frag_mesh.inst_id in raw_mapping) {
			raw_mapping[frag_mesh.inst_id].push(buf_seg);
		}
		else {
			raw_mapping[frag_mesh.inst_id]=[buf_seg];
		}
		buffer.set( frag_mesh.mesh, offset );
		offset += mesh_size;
	}
	var promises = textures.map(filename => {
		var promise = FileManager.load(filename)
		.then(result=>{
			return {
				filename:filename,
				result:result
			}
		})
		return promise;
	});
	return Promise.all(promises).then((res) => {
		var i, count, pos;
		var filenames=res.map(r=>r.filename);
		for (i = 0, count = infos.length; i < count; ++i) {
			pos = filenames.indexOf(infos[i].filename);
			infos[i].texture = res[pos].result;
		}
		MapLoader.MAP_MODELS({buffer, infos, raw_mapping, rsms});
		MapLoader.MAP_COMPLETE();
		
	});
};

export default MapLoader;