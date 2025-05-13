import Sprite from '../network/Sprite.js';
import Action from '../network/Action.js';
import Str from '../network/Str.js';
import World from '../network/World.js';
import Model from '../network/Model.js';
import print_d from '../utils/Debug.js';
import Altitude from '../network/Altitude.js';
import Ground from '../network/Ground.js';

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
	return this.get(filename)
		.then(buffer => {
			var ext    = filename.match(/.[^\.]+$/).toString().substr(1).toLowerCase();
			var result = null;
			switch (ext) {
				case 'jpg':
				case 'jpeg':
				case 'bmp':
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
					if (args && args.compile) {
						result = spr.compile();
					} else {
						result = spr;
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
					break;

				default:
					result = buffer;
					break;
			}
			if (args && args.keep_name) {
				result={filename, result}
			}
			return result;
		});
};

export default FileManager;