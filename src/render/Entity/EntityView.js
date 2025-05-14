import DB from '../../configs/DBManager.js';
import EntityAction from './EntityAction.js';
import FileManager from '../../network/FileManager.js';
import Entity from './Entity.js';

function ViewFiles( spr, act, pal )
{
	this.spr  = spr || null;
	this.act  = act || null;
	this.pal  = pal || null;
	this.size = 1.0;
}

function View()
{
	this.body       = new ViewFiles();
	this.head       = new ViewFiles();
	this.weapon     = new ViewFiles();
	this.weapon_trail     = new ViewFiles();
	this.shield     = new ViewFiles();
	this.accessory  = new ViewFiles();
	this.accessory2 = new ViewFiles();
	this.accessory3 = new ViewFiles();
	this.robe       = new ViewFiles();
	this.shadow     = new ViewFiles('/resources/sprite/shadow.spr', '/resources/sprite/shadow.act');
}

function UpdateSex( sex )
{
	// Not defined yet, no update others
	if (this._sex === -1) {
		this._sex = sex;
		return;
	}

	// Update other elements
	this._sex        = sex;
	this.job         = this._job;  // will update body, body palette, weapon, shield
	this.head        = this._head; // will update hair color
	this.accessory   = this._accessory;
	this.accessory2  = this._accessory2;
	this.accessory3  = this._accessory3;
	this.robe        = this._robe;
}

function UpdateBody( job )
{
	var baseJob, path;
	var Entity;

	if (job < 0) {
		return;
	}

	// Clothes keep the old job in memory
	// and show the costum if used
	this._job = job;
	if (this.costume) {
		job = this.costume;
	}

	// Resize character
	this.xSize = this.ySize = DB.isBaby(job) ? 4 : 5;


	this.files.shadow.size = job in DB.ShadowTable ? DB.ShadowTable[job] : 1.0;
	path                   = this.isAdmin ? DB.getAdminPath(this._sex) : DB.getBodyPath( job, this._sex );
	Entity                 = this.constructor;

	// Define Object type based on its id
	if (this.objecttype === Entity.TYPE_UNKNOWN) {
		var objecttype = (
			job < 45   ? Entity.TYPE_PC   :
			job < 46   ? Entity.TYPE_WARP :
			job < 1000 ? Entity.TYPE_NPC  :
			job < 1000 ? Entity.TYPE_NPC2 :
			job < 4000 ? Entity.TYPE_MOB  :
			job < 4000 ? Entity.TYPE_NPC_ABR :
			job < 4000 ? Entity.TYPE_NPC_BIONIC :
			job < 6000 ? Entity.TYPE_PC   :
			job < 7000 ? Entity.TYPE_HOM  :
										Entity.TYPE_MERC
		);

		// Clean up action frames
		if (objecttype !== this.objecttype) {
			this.objecttype = objecttype;
			EntityAction.call(this);
		}
	}

	// Invisible sprites
	if (job === 111 || job === 139 || job === 45) {
		this.files.body.spr = null;
		this.files.body.act = null;
		return;
	}

	this.files.body.act = path + '.act';
	this.files.body.spr = path + '.spr';
	this.bodypalette = this._bodypalette;
	this.weapon      = this._weapon;
	this.shield      = this._shield;

	FileManager.load(this.files.body.act);
	FileManager.load(this.files.body.spr);
	
}

function UpdateBodyPalette( pal )
{
	this._bodypalette = pal;

	// Internal palette
	if (pal <= 0) {
		this.files.body.pal = null;
		return;
	}

	// Wait body to be loaded
	if (this._job === -1) {
		return;
	}

	this.files.body.pal = DB.getBodyPalPath( this._job, this._bodypalette, this._sex);
}

function UpdateHead( head)
{
	var path;

	if (head < 0) {
		return;
	}

	this._head  = head;
	path        = DB.getHeadPath( head, this.job, this._sex, this.isOrcish);
	this.files.head.act = path + '.act';
	this.files.head.spr = path + '.spr';
	FileManager.load(this.files.head.act)
	FileManager.load(this.files.head.spr, {to_rgba: this.objecttype !== Entity.TYPE_PC})
}

function UpdateHeadPalette( pal )
{
	this._headpalette = pal;

	// Using internal palette stored in sprite
	if (pal <= 0) {
		this.files.head.pal = null;
		return;
	}

	// Wait head to load before
	if (this._head === -1) {
		return;
	}
	this.files.head.pal = DB.getHeadPalPath( this._head, this._headpalette, this.job, this._sex);
}

function UpdateGeneric( type, func )
{
	return function (val) {
		var path;
		var _val  = val;

		// Nothing to load
		if (val <= 0) {
			this['_'+type] = 0;
			return;
		}

		// Find file path
		switch (type) {
			case 'weapon':
			case 'shield':
			case 'robe':
				path  = DB[func]( val, this.job, this._sex );
				break;

			default:
				path  = DB[func]( val, this._sex );
				break;
		}

		// No path found, remove current files used
		if (!path) {
			this.files[type].spr = null;
			this.files[type].act = null;
			this.files[type].pal = null;

			// Load weapon sound
			if (type === 'weapon') {
				this.sound.attackFile = DB.getWeaponSound( val );
			}

			return;
		}
		this['_'+type] = _val;
		this.files[type].spr = path + '.spr';
		this.files[type].act = path + '.act';
		FileManager.load(this.files[type].spr,{to_rgba:true});
		FileManager.load(this.files[type].act);
		if (type === 'weapon') {
			this.attackFile = DB.getWeaponSound( _val );
			const trail_file = DB.getWeaponTrail(_val, this.job, this._sex);
			if(trail_file){
				this.files['weapon_trail'].spr = trail_file + '.spr';
				this.files['weapon_trail'].act = trail_file + '.act';
				FileManager.load(this.files['weapon_trail'].spr);
				FileManager.load(this.files['weapon_trail'].act);
			}
		}
	}
}

export default function Init()
{
	this.files = new View();

	Object.defineProperty(this, 'sex', {
		get: function(){ return this._sex; },
		set: UpdateSex
	});

	Object.defineProperty(this, 'job', {
		get: function(){ return this.costume || this._job; },
		set: UpdateBody
	});

	Object.defineProperty(this, 'bodypalette', {
		get: function(){ return this._bodypalette; },
		set: UpdateBodyPalette
	});

	Object.defineProperty(this, 'head', {
		get: function(){ return this._head; },
		set: UpdateHead
	});

	Object.defineProperty(this, 'headpalette', {
		get: function(){ return this._headpalette; },
		set: UpdateHeadPalette
	});

	Object.defineProperty(this, 'weapon', {
		get: function(){ return this._weapon; },
		set: UpdateGeneric('weapon', 'getWeaponPath', 'getWeaponViewID')
	});

	Object.defineProperty(this, 'shield', {
		get: function(){ return this._shield; },
		set: UpdateGeneric('shield', 'getShieldPath')
	});

	Object.defineProperty(this, 'accessory', {
		get: function(){ return this._accessory; },
		set: UpdateGeneric('accessory', 'getHatPath')
	});

	Object.defineProperty(this, 'accessory2', {
		get: function(){ return this._accessory2; },
		set: UpdateGeneric('accessory2', 'getHatPath')
	});

	Object.defineProperty(this, 'accessory3', {
		get: function(){ return this._accessory3; },
		set: UpdateGeneric('accessory3', 'getHatPath')
	});

	Object.defineProperty(this, 'robe', {
		get: function(){ return this._robe; },
		set: UpdateGeneric('robe', 'getRobePath')
	});
};
