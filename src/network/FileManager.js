import Sprite from './Sprite.js';
import Action from './Action.js';
import Str from './Str.js';
import World from './World.js';
import Model from './Model.js';
import print_d from '../utils/Debug.js';
import Altitude from './Altitude.js';
import Ground from './Ground.js';
import Memory from '../utils/MemoryManager.js';
import Renderer from '../render/Renderer.js';
import NetworkManager from './NetworkManager.js';
import Texture from '../utils/Texture.js';
import Globals from "../utils/Globals.js"

var FileManager = {};
FileManager.remoteClient = 'http://'+Globals.root_ip+':8002';
FileManager.filesAlias = {};
var _onload_promise = {};


FileManager.send_debug_int= function(name, val){
	let info = {
		name:name,
		val:val
	}
	console.log("send_debug_int: ",info);
	fetch(FileManager.remoteClient+'/debug',{
		method:'POST',
		headers:{
			'Content-Type':'application/json',
		},
		body:JSON.stringify(info)
	})
}
FileManager.get = function GetHTTP( filename )
{
	filename = filename.replace(/\\/g, '\/');
	filename = Globals.convert_2_readable(filename);
	filename = filename.toLowerCase();
	var url = this.remoteClient + filename;
	return fetch(url, {
		headers: {
			'Cache-Control': 'default'
		}
	})
	.then(response => {
		if (!response.ok) {
			console.log("%cfile not found: ", "color: red", filename	);
		}
		return response.arrayBuffer();
	})
};

FileManager.read = function Read( filename ){
	return Memory.get(filename);
}

FileManager.fetch = function Fetch( filename )
{
	var promise = this.get(filename)
		.then(buffer => {
			Memory.set(filename, buffer);
			return buffer;
		});
	return promise;
}

FileManager.load = function Load( filename, args )
{
	if (Memory.get(filename)){
		return Promise.resolve(Memory.get(filename));
	}
	if (_onload_promise[filename]) {
		return _onload_promise[filename];
	}
	// console.log("load3: ",filename);
	var promise = this.get(filename)
		.then(buffer => {
			var ext    = filename.match(/.[^\.]+$/).toString().substr(1).toLowerCase();
			var result = null;
			switch (ext) {
				case 'bmp':
					result = URL.createObjectURL(
						new Blob( [buffer], { type: 'image/' + ext })
					);
					result = new Promise((resolve, reject) => {
						Texture.load( result, function(){
							Memory.set( filename, this.toDataURL());
							resolve(this.toDataURL());
						});
					});
					break;
				case 'jpg':
				case 'jpeg':
				case 'gif':
				case 'png':
					result = URL.createObjectURL(
						new Blob( [buffer], { type: 'image/' + ext })
					);
					Memory.set(filename, result);
					break;
				case 'wav':
				case 'mp3':
				case 'ogg':
					if (buffer instanceof ArrayBuffer) {
						result = URL.createObjectURL(
							new Blob( [buffer], { type: 'audio/' + ext })
						);
						break;
					}
					result = buffer;
					Memory.set(filename, result);
					break;
				case 'tga':
					result = buffer;
					Memory.set(filename, result);
					break;
				case 'txt':
				case 'xml':
				case 'lua':
					var i, count, str, uint8;
					uint8 = new Uint8Array(buffer);
					count = uint8.length;
					str   = '';

					for (i = 0; i < count; ++i) {
						if (uint8[i] === 0) {
							break;
						}
						str += String.fromCharCode( uint8[i] );
					}
					result = str;
					Memory.set(filename, result);
					break;
				case 'spr':
					var spr = new Sprite(buffer);
					if (args && args.to_rgba) {
						spr.switchToRGBA();
					}
					result = spr.compile();
					var gl     = Renderer.getContext();
					var frames = result.frames;
					var count  = frames.length;
					for (i = 0; i < count; i++) {
						frames[i].texture = gl.createTexture();
						var precision  = frames[i].type ? gl.LINEAR : gl.NEAREST;
						var size       = frames[i].type ? gl.RGBA   : gl.LUMINANCE;
						gl.bindTexture( gl.TEXTURE_2D, frames[i].texture );
						gl.texImage2D(gl.TEXTURE_2D, 0, size, frames[i].width, frames[i].height, 0, size, gl.UNSIGNED_BYTE, frames[i].data );
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, precision);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, precision);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
					}
					if (result.rgba_index !== 0) {
						result.texture = gl.createTexture();
						gl.bindTexture( gl.TEXTURE_2D, result.texture );
						gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, result.palette );
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
						gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
					}
					Memory.set(filename, result);
					break;
				case 'rsw':
					result = new World(buffer);
					Memory.set(filename, result);
					break;

				case 'gnd':
					result = new Ground(buffer);
					Memory.set(filename, result);
					break;

				case 'gat':
					result = new Altitude(buffer);
					Memory.set(filename, result);
					break;

				case 'rsm':
				case 'rsm2':
					result = new Model(buffer);
					Memory.set(filename, result);
					break;

				case 'act':
					result = new Action(buffer).compile();
					Memory.set(filename, result);
					break;

				case 'str':
					var str = new Str(buffer, args?.texturePath ?? '');
					var layers = str.layers;
					var promises_all=[];
					for (let i = 0; i < str.layernum; ++i) {
						layers[i].materials = new Array(layers[i].texcnt);
						for (let j = 0; j < layers[i].texcnt; ++j) {
							var promise =	FileManager.load(layers[i].texname[j])
								.then(texture=>{
									layers[i].materials[j] = texture;
								});
							promises_all.push(promise);
						}
					}
					result = Promise.all(promises_all)
						.then(()=>{
							Memory.set(filename, str);
							return str;
						});
					break;
				case 'pal':
					var gl      = Renderer.getContext();
					var texture = gl.createTexture();
					var palette = new Uint8Array(buffer);
					gl.bindTexture( gl.TEXTURE_2D, texture );
					gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, palette );
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
					gl.generateMipmap( gl.TEXTURE_2D );
					result = { palette:palette, texture:texture };
					Memory.set(filename, result);
					break;
				default:
					result = buffer;
					Memory.set(filename, result);
					break;
			}
			return result;
		})
	_onload_promise[filename] = promise;
	return promise;
};

export default FileManager;