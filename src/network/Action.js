import BinaryReader from '../utils/BinaryReader.js';
	
class ACT
{
	constructor(data) {
		this.fp       = null;
		this.versions = 0.0;
		this.actions  = [];
		this.sounds   = [];

		if (data) {
			this.load(data);
		}
	}

	load( data ){
		var i, count;
		this.fp     = new BinaryReader(data);
		this.header = this.fp.getBinaryString(2);
		if (this.header !== 'AC') {
			throw new Error('ACT::load()');
		}
		this.version = this.fp.getUint8()/10 + this.fp.getUint8();
		this.readActions();
		if (this.version >= 2.1) {
			count             = this.fp.getInt32();
			this.sounds.length = count;
			for (i = 0; i < count; ++i) {
				this.sounds[i] = this.fp.getBinaryString(40);
			}
			if (this.version >= 2.2) {
				for (i = 0, count = this.actions.length; i < count; ++i) {
					this.actions[i].delay = this.fp.getFloat32()*25;
				}
			}
		}
	}

	readActions(){
		var i, count = this.fp.getUint16();
		var actions  = this.actions;
		this.fp.seek( 10, BinaryReader.SEEK_CUR );
		actions.length = count;
		for (i = 0; i < count; ++i) {
			actions[i] = {
				animations: this.readAnimations(),
				delay:      150
			};
		}
	}

	readAnimations(){
		var fp        = this.fp;
		var i, count  = fp.getUint32();
		var anim      = new Array(count);
		for (i = 0; i < count; ++i) {
			fp.seek( 32, BinaryReader.SEEK_CUR );
			anim[i] = this.readLayers();
		}
		return anim;
	}

	readLayers(){
		var fp     = this.fp;
		var count  = fp.getUint32();
		var layers = new Array(count);
		var layer, sound;
		var version = this.version;
		var i, pos;
		for (i = 0; i < count; ++i) {
			layer = layers[i] = {
				pos:       [ fp.getInt32(), fp.getInt32() ],
				index:       fp.getInt32(),
				is_mirror:   fp.getInt32(),
				scale:     [ 1.0, 1.0 ],
				color:     [ 1.0, 1.0, 1.0, 1.0 ],
				angle:       0,
				spr_type:    0,
				width:       0,
				height:      0
			};
			if (version >= 2.0) {
				layer.color[0] = fp.getUint8()/255;
				layer.color[1] = fp.getUint8()/255;
				layer.color[2] = fp.getUint8()/255;
				layer.color[3] = fp.getUint8()/255;
				layer.scale[0] = fp.getFloat32();
				layer.scale[1] = version <= 2.3 ? layer.scale[0] : fp.getFloat32();
				layer.angle    = fp.getInt32();
				layer.spr_type = fp.getInt32();
				if (version >= 2.5) {
					layer.width  = fp.getInt32();
					layer.height = fp.getInt32();
				}
			}
		}
		sound = version >= 2.0 ? fp.getInt32() : -1;
		pos   = [];
		if (version >= 2.3) {
			count      = fp.getInt32();
			pos.length = count;
			for (i = 0; i < count; ++i) {
				fp.seek(4, BinaryReader.SEEK_CUR); 
				pos[i] = { x : fp.getInt32(), y: fp.getInt32() };
				fp.seek(4, BinaryReader.SEEK_CUR); 
			}
		}
		return {
			layers: layers,
			sound:  sound,
			pos:    pos
		};
	}

	compile()
	{
		return {
			actions: this.actions,
			sounds:  this.sounds
		};
	}
}

export default ACT;
