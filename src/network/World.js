import BinaryReader from '../utils/BinaryReader.js';

class RSW
{
	constructor(data) {
		this.sounds  = [];
		this.lights  = [];
		this.effects = [];
		this.models  = [];
		this.files = {
			buildnumber: null,
			ini: null,
			gnd: null,
			gat: null,
			src: null
		};
		this.ground = {
			top:   -500,
			bottom: 500,
			left:  -500,
			right:  500
		}
		this.water    = {
			level:       0,
			type:        0,
			waveHeight:  0,
			waveSpeed:   0,
			wavePitch:   0,
			animSpeed:   0,
			splitWidth:  0,
			splitHeight: 0,
			images:     new Array(32)
		}
		this.light = {
			longitude: 45,
			latitude:  45,
			diffuse:   [ 1.0, 1.0, 1.0 ],
			ambient:   [ 0.3, 0.3, 0.3 ],
			opacity:   1.0,
		}
		if (data) {
			this.load(data);
		}
	}
}

RSW.prototype.load = function Load( data ){
	var header, version;
	var i, count;
	var fp;
	fp      = new BinaryReader(data);
	header  = fp.getBinaryString(4);
	version = fp.getUint8() + fp.getUint8()/10;
	if (header != 'GRSW') {
		throw new Error('RSW::load() - Invalid header "' + header + '", must be "GRSW"');
	}
	if (version >= 2.5) {
		this.files.buildnumber = fp.getInt32();
	}
	if (version >= 2.2) {
		fp.readByte();
	}
	this.files.ini = fp.getBinaryString(40);
	this.files.gnd = fp.getBinaryString(40);
	this.files.gat = fp.getBinaryString(40);
	if (version >= 1.4) {
		this.files.src = fp.getBinaryString(40);
	}
	this.water = Object.assign({}, RSW.prototype.water);
	if (version < 2.6) {
		if (version >= 1.3) {
			this.water.level = fp.getFloat32() / 5;
		} else {
			this.water.level = 0.0;
		}
		if (version >= 1.8) {
			this.water.type       = fp.getInt32();
			this.water.waveHeight = fp.getFloat32()/5;
			this.water.waveSpeed  = fp.getFloat32();
			this.water.wavePitch  = fp.getFloat32();
		} else {
			this.water.type = 0;
			this.water.waveHeight = 1.0;
			this.water.waveSpeed  = 2.0;
			this.water.wavePitch  = 50.0;
		}
		if (version >= 1.9) {
				this.water.animSpeed = fp.getInt32();
		} else {
			this.water.animSpeed = 3;
		}
	}
	if (version >= 1.5) {
		this.light.longitude = fp.getInt32();
		this.light.latitude  = fp.getInt32();
		this.light.diffuse   = [ fp.getFloat32(), fp.getFloat32(), fp.getFloat32() ];
		this.light.ambient   = [ fp.getFloat32(), fp.getFloat32(), fp.getFloat32() ];
		if (version >= 1.7) {
			this.light.opacity = fp.getFloat32();
		}
	}
	if (version >= 1.6) {
		this.ground.top    =  fp.getInt32();
		this.ground.bottom =  fp.getInt32();
		this.ground.left   =  fp.getInt32();
		this.ground.right  =  fp.getInt32();
	}
	if (version >= 2.7) {
		const count = fp.getInt32(); 
		fp.seek(4 * count, RSW.SEEK_CUR);
	}
	var models  = this.models;
	var lights  = this.lights;
	var sounds  = this.sounds;
	var effects = this.effects;
	var m=0, l=0, s=0, e=0;
	count = fp.getInt32();
	models.length = lights.length = sounds.length = effects.length = count;
	for (i = 0; i < count; ++i) {
		switch (fp.getInt32()) {
			case 1:
				models[m++] = {
					name:      version >= 1.3 ? fp.getBinaryString(40) : null,
					animType:  version >= 1.3 ? fp.getInt32()  : 0,
					animSpeed: version >= 1.3 ? fp.getFloat32() : 1.0,
					blockType: version >= 1.3 ? fp.getInt32()  : 0,
					UnknownByte: (version >= 2.6 && this.files.buildnumber >= 186) ? fp.readByte() : 0,
					UnknownByte2: (version >= 2.7) ? fp.getInt32() : 0,
					filename:  fp.getBinaryString(80),
					nodename:  fp.getBinaryString(80),
					position:[ fp.getFloat32()/5, fp.getFloat32()/5, fp.getFloat32()/5 ],
					rotation:[ fp.getFloat32(),   fp.getFloat32(),   fp.getFloat32() ],
					scale:   [ fp.getFloat32()/5, fp.getFloat32()/5, fp.getFloat32()/5 ]
				};
				continue;
			case 2:
				lights[l++] = {
					name:    fp.getBinaryString(80),
					pos:   [ fp.getFloat32()/5, fp.getFloat32()/5, fp.getFloat32()/5 ],
					color: [ fp.getInt32(),    fp.getInt32(),    fp.getInt32()  ],
					range:   fp.getFloat32()
				};
				continue;
			case 3:
				sounds[s++] = {
					name:     fp.getBinaryString(80),
					file:     fp.getBinaryString(80),
					pos:    [ fp.getFloat32()/5, fp.getFloat32()/5, fp.getFloat32()/5 ],
					vol:      fp.getFloat32(),
					width:    fp.getInt32(),
					height:   fp.getInt32(),
					range:    fp.getFloat32(),
					cycle:    version >= 2.0 ? fp.getFloat32() : 0.0
				};
				continue;
			case 4:
				effects[e++] = {
					name:   fp.getBinaryString(80),
					pos:  [ fp.getFloat32()/5, fp.getFloat32()/5, fp.getFloat32()/5 ],
					id:     fp.getInt32(),
					delay:  fp.getFloat32() * 10,
					param: [ fp.getFloat32(), fp.getFloat32(), fp.getFloat32(), fp.getFloat32() ] // effectClass.apply(effect, effect.param) ?
				};
		}
	}
	models.length  = m;
	sounds.length  = s;
	lights.length  = l;
	effects.length = e;
};

RSW.prototype.compile = function Compile(){
	return {
		water: this.water,
		light: this.light,
		sound: this.sounds,
		effect: this.effects
	};
};

export default RSW;