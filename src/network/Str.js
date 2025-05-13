import BinaryReader from '../utils/BinaryReader.js';

class STR
{
	constructor(data, texturePath) {
		this.version = 0.0;
		this.texturePath = texturePath ?? '';

		if (data) {
			this.load(data);
		}
	}
	load( data ){
		var fp, i;
		fp          = new BinaryReader(data);
		this.header = fp.getBinaryString(4);
		if (this.header !== 'STRM') {
			throw new Error('STR::load()');
		}
		this.version = fp.getUint32();
		if (this.version !== 0x94) {
			throw new Error('STR - Invalid version "'+ this.version +'", not supported');
		}
		this.fps      = fp.getUint32();
		this.maxKey   = fp.getUint32();
		this.layernum = fp.getUint32();
		fp.seek(16, BinaryReader.SEEK_CUR);
		this.layers   = new Array(this.layernum);
		for (i = 0; i < this.layernum; ++i) {
			this.layers[i] = new STRLayer(fp, this.texturePath);
		}
	}
}


class STRLayer
{
	constructor(fp, texturePath) {
		var i;

		this.texcnt  = fp.getInt32();
		this.texname = new Array(this.texcnt);

		for (i = 0; i < this.texcnt; ++i) {
			this.texname[i] = '/resources/texture/effect/' + texturePath + fp.getBinaryString(128);
		}

		this.anikeynum  = fp.getInt32();
		this.animations = new Array(this.anikeynum);

		for (i = 0; i < this.anikeynum; ++i) {
			this.animations[i] = new STRAnimation(fp);
		}
	}
}

class STRAnimation
{	
	constructor(fp) {
		this.frame     = fp.getInt32();
		this.type      = fp.getUint32();
		this.pos       = new Float32Array([ fp.getFloat32(), fp.getFloat32() ]);
		this.uv        = new Float32Array([ fp.getFloat32(), fp.getFloat32(), fp.getFloat32(), fp.getFloat32(), fp.getFloat32(), fp.getFloat32(), fp.getFloat32(), fp.getFloat32() ]);
		this.xy        = new Float32Array([ fp.getFloat32(), fp.getFloat32(), fp.getFloat32(), fp.getFloat32(), fp.getFloat32(), fp.getFloat32(), fp.getFloat32(), fp.getFloat32() ]);
		this.aniframe  = fp.getFloat32();
		this.anitype   = fp.getUint32();
		this.delay     = fp.getFloat32();
		this.angle     = fp.getFloat32() / (1024/360);
		this.color     = new Float32Array([ fp.getFloat32() / 255.0, fp.getFloat32() / 255.0, fp.getFloat32() / 255.0, fp.getFloat32() / 255.0 ]);
		this.srcalpha  = fp.getUint32();
		this.destalpha = fp.getUint32();
		this.mtpreset  = fp.getUint32();
	}
}

export default STR;