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
import Texture from '../utils/Texture.js';


var FileManager = {};
FileManager.remoteClient = '';
FileManager.filesAlias = {};

FileManager.get = function GetHTTP( filename )
{
	filename = filename.replace(/^\s+|\s+$/g, '');
	filename = filename.replace( /\\/g, '/');
	var url  = filename.replace(/[^//]+/g, function(a){return encodeURIComponent(a);});
	url = this.remoteClient + url;
	if (filename.match(/\.(mp3|wav)$/)) {
		return;
	}
	return fetch(url)
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.arrayBuffer();
		})
		.catch(error => {
			console.error('Can\'t get file:', error);
		});
};

FileManager.load = function Load( filename, args )
{
	var result=Memory.get(filename);
	if (result) {
		return Promise.resolve(result);
	}
	return this.get(filename)
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
					break;

				case 'tga':
					result = buffer;
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
					break;
				case 'rsw':
					result = new World(buffer);
					break;

				case 'gnd':
					result = new Ground(buffer);
					break;

				case 'gat':
					result = new Altitude(buffer);
					break;

				case 'rsm':
				case 'rsm2':
					result = new Model(buffer);
					break;

				case 'act':
					result = new Action(buffer).compile();
					break;

				case 'str':
					result = new Str(buffer, args?.texturePath ?? '');
					var layers = result.layers;
					var promises_all=[];
					for (let i = 0; i < result.layernum; ++i) {
						layers[i].materials = new Array(layers[i].texcnt);
						for (let j = 0; j < layers[i].texcnt; ++j) {
							var promise =	FileManager.load(layers[i].texname[j])
								.then(texture=>{
									layers[i].materials[j] = texture;
								});
							promises_all.push(promise);
						}
					}
					result = Promise.all(promises_all);
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
					break;
				default:
					result = buffer;
					break;
			}
			return result;
		})
};

export default FileManager;