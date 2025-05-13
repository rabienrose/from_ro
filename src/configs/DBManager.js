var DB={}

var JobId = {
	NOVICE:                0,
	SWORDMAN:              1,
	MAGICIAN:              2,
	ARCHER:                3,
	ACOLYTE:               4,
	MERCHANT:              5,
	THIEF:                 6,
}

var WeaponType={
	NONE:                   0,
	SHORTSWORD:             1,
	SWORD:                  2,
	TWOHANDSWORD:           3,
	SPEAR:                  4,
	TWOHANDSPEAR:           5,
	AXE:                    6,
	TWOHANDAXE:             7,
	MACE:                   8,
	TWOHANDMACE:            9,
	ROD:                   10,
	BOW:                   11,
}

var JobHitSoundTable = {};
JobHitSoundTable[JobId.NOVICE]           = ["player_clothes.wav"];
JobHitSoundTable[JobId.SWORDMAN]         = ["player_metal.wav"];
JobHitSoundTable[JobId.MAGICIAN]         = ["player_clothes.wav"];
JobHitSoundTable[JobId.ARCHER]           = ["player_wooden_male.wav"];
JobHitSoundTable[JobId.ACOLYTE]          = ["player_clothes.wav"];
JobHitSoundTable[JobId.MERCHANT]         = ["player_clothes.wav"];
JobHitSoundTable[JobId.THIEF]            = ["player_wooden_male.wav"];

var WeaponSound = {};
WeaponSound[WeaponType.NONE]                  = ["_hit_fist1.wav", "_hit_fist2.wav", "_hit_fist3.wav", "_hit_fist4.wav"];
WeaponSound[WeaponType.SHORTSWORD]            = ["_hit_dagger.wav"];
WeaponSound[WeaponType.SWORD]                 = ["_hit_sword.wav"];
WeaponSound[WeaponType.TWOHANDSWORD]          = ["_hit_sword.wav"];
WeaponSound[WeaponType.SPEAR]                 = ["_hit_spear.wav"];
WeaponSound[WeaponType.TWOHANDSPEAR]          = ["_hit_spear.wav"];
WeaponSound[WeaponType.AXE]                   = ["_hit_axe.wav"];
WeaponSound[WeaponType.TWOHANDAXE]            = ["_hit_axe.wav"];
WeaponSound[WeaponType.MACE]                  = ["_hit_mace.wav"];
WeaponSound[WeaponType.TWOHANDMACE]           = ["_hit_mace.wav"];
WeaponSound[WeaponType.ROD]                   = ["_hit_rod.wav"];
WeaponSound[WeaponType.BOW]                   = ["_hit_arrow.wav"];

var MapInfo = {}
MapInfo["cmd_fild03.rsw"] = {
	"mp3":"63.mp3",
	"isIndoor":false
},

DB.getWeaponHitSound = function getWeaponHitSound(id) {
	var type = DB.getWeaponViewID(id);
	if (type === WeaponType.NONE) {
		return [WeaponHitSoundTable[type][Math.floor(Math.random() * 4)]];
	}
	return WeaponHitSoundTable[type];
};

DB.getJobHitSound = function getJobHitSound(job_id) {
	if (!job_id) {
		return JobHitSoundTable[0];
	}
	return JobHitSoundTable[job_id] || JobHitSoundTable[0];
};

DB.getMap = function getMap(mapname) {
	var map = mapname.replace('.gat', '.rsw');
	return MapInfo[map] || null;
};

DB.isIndoor = function isIndoor(mapname) {
	return mapname["isIndoor"];
};


export default DB;