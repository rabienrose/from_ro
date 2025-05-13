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

var WeaponHitSoundTable = {};
WeaponHitSoundTable[WeaponType.NONE]                  = ["_hit_fist1.wav", "_hit_fist2.wav", "_hit_fist3.wav", "_hit_fist4.wav"];
WeaponHitSoundTable[WeaponType.SHORTSWORD]            = ["_hit_dagger.wav"];
WeaponHitSoundTable[WeaponType.SWORD]                 = ["_hit_sword.wav"];
WeaponHitSoundTable[WeaponType.TWOHANDSWORD]          = ["_hit_sword.wav"];
WeaponHitSoundTable[WeaponType.SPEAR]                 = ["_hit_spear.wav"];
WeaponHitSoundTable[WeaponType.TWOHANDSPEAR]          = ["_hit_spear.wav"];
WeaponHitSoundTable[WeaponType.AXE]                   = ["_hit_axe.wav"];
WeaponHitSoundTable[WeaponType.TWOHANDAXE]            = ["_hit_axe.wav"];
WeaponHitSoundTable[WeaponType.MACE]                  = ["_hit_mace.wav"];
WeaponHitSoundTable[WeaponType.TWOHANDMACE]           = ["_hit_mace.wav"];
WeaponHitSoundTable[WeaponType.ROD]                   = ["_hit_rod.wav"];
WeaponHitSoundTable[WeaponType.BOW]                   = ["_hit_arrow.wav"];

var WeaponSoundTable = {};
WeaponSoundTable[WeaponType.NONE]                  = ["attack_fist.wav"];
WeaponSoundTable[WeaponType.SHORTSWORD]            = ["attack_short_sword.wav", "attack_short_sword_.wav"];
WeaponSoundTable[WeaponType.SWORD]                 = ["attack_sword.wav"];
WeaponSoundTable[WeaponType.TWOHANDSWORD]          = ["attack_twohand_sword.wav"];
WeaponSoundTable[WeaponType.SPEAR]                 = ["attack_spear.wav"];
WeaponSoundTable[WeaponType.TWOHANDSPEAR]          = ["attack_spear.wav"];
WeaponSoundTable[WeaponType.AXE]                   = ["attack_axe.wav"];
WeaponSoundTable[WeaponType.TWOHANDAXE]            = ["attack_axe.wav"];
WeaponSoundTable[WeaponType.MACE]                  = ["attack_mace.wav"];
WeaponSoundTable[WeaponType.TWOHANDMACE]           = ["attack_mace.wav"];
WeaponSoundTable[WeaponType.ROD]                   = ["attack_rod.wav"];
WeaponSoundTable[WeaponType.BOW]                   = ["attack_bow1.wav", "attack_bow2.wav"];

var MapInfo = {}
MapInfo["cmd_fild03.rsw"] = {
	"mp3":"63.mp3",
	"isIndoor":false
}

var WeaponAction = {};
WeaponAction[JobId.NOVICE] =  [new function(){
	// female
	this[ WeaponType.NONE ]         = 0;
	this[ WeaponType.ROD ]          = 1;
	this[ WeaponType.TWOHANDROD ]   = 1;
	this[ WeaponType.SWORD ]        = 1;
	this[ WeaponType.TWOHANDSWORD ] = 1;
	this[ WeaponType.AXE ]          = 1;
	this[ WeaponType.TWOHANDAXE ]   = 1;
	this[ WeaponType.MACE ]         = 1;
	this[ WeaponType.TWOHANDMACE ]  = 1;
	this[ WeaponType.SHORTSWORD ]   = 2;
}, new function(){
	// male
	this[ WeaponType.NONE ]         = 0;
	this[ WeaponType.SHORTSWORD ]   = 1;
	this[ WeaponType.ROD ]          = 2;
	this[ WeaponType.TWOHANDROD ]   = 2;
	this[ WeaponType.SWORD ]        = 2;
	this[ WeaponType.TWOHANDSWORD ] = 2;
	this[ WeaponType.AXE ]          = 2;
	this[ WeaponType.TWOHANDAXE ]   = 2;
	this[ WeaponType.MACE ]         = 2;
	this[ WeaponType.TWOHANDMACE ]  = 2;
}];

WeaponAction[JobId.SWORDMAN] = new function(){
	this[ WeaponType.NONE ]         = 0;
	this[ WeaponType.SHORTSWORD ]   = 1;
	this[ WeaponType.SWORD ]        = 1;
	this[ WeaponType.TWOHANDSWORD ] = 1;
	this[ WeaponType.AXE ]          = 1;
	this[ WeaponType.TWOHANDAXE ]   = 1;
	this[ WeaponType.MACE ]         = 1;
	this[ WeaponType.TWOHANDMACE ]  = 1;
	this[ WeaponType.SPEAR ]        = 2;
	this[ WeaponType.TWOHANDSPEAR ] = 2;
};

WeaponAction[JobId.MAGICIA] = new function(){
	this[ WeaponType.NONE ]       = 0;
	this[ WeaponType.ROD ]        = 1;
	this[ WeaponType.TWOHANDROD ] = 1;
	this[ WeaponType.SHORTSWORD ] = 2;
};

WeaponAction[JobId.ARCHER] = new function(){
	this[ WeaponType.NONE ]       = 0;
	this[ WeaponType.BOW ]        = 1;
	this[ WeaponType.SHORTSWORD ] = 2;
};

WeaponAction[JobId.ACOLYTE] = new function(){
	this[ WeaponType.NONE ]        = 0;
	this[ WeaponType.ROD  ]        = 1;
	this[ WeaponType.TWOHANDROD ]  = 1;
	this[ WeaponType.MACE ]        = 1;
	this[ WeaponType.TWOHANDMACE ] = 1;
};

WeaponAction[JobId.MERCHANT] = new function(){
	this[ WeaponType.NONE ]         = 0;
	this[ WeaponType.MACE ]         = 1;
	this[ WeaponType.TWOHANDMACE ]  = 1;
	this[ WeaponType.AXE  ]         = 1;
	this[ WeaponType.TWOHANDAXE ]   = 1;
	this[ WeaponType.SWORD ]        = 1;
	this[ WeaponType.TWOHANDSWORD ] = 1;
	this[ WeaponType.SHORTSWORD ]   = 2;
};

WeaponAction[JobId.THIEF] = new function(){
	this[ WeaponType.NONE ]         = 0;
	this[ WeaponType.SWORD ]        = 1;
	this[ WeaponType.TWOHANDSWORD ] = 1;
	this[ WeaponType.SHORTSWORD ]   = 1;
	this[ WeaponType.BOW ]          = 2;
};

var SexTable = ['\xbf\xa9', '\xb3\xb2'];

var JobNameTable = {};
JobNameTable[JobId.NOVICE]           = "\xC3\xCA\xBA\xB8\xC0\xDA";
JobNameTable[JobId.SWORDMAN]         = "\xB0\xCB\xBB\xE7";
JobNameTable[JobId.MAGICIAN]         = "\xB8\xB6\xB9\xFD\xBB\xE7";
JobNameTable[JobId.ARCHER]           = "\xB1\xC3\xBC\xF6";
JobNameTable[JobId.ACOLYTE]          = "\xBC\xBA\xC1\xF7\xC0\xDA";
JobNameTable[JobId.MERCHANT]         = "\xBB\xF3\xC0\xCE";
JobNameTable[JobId.THIEF]            = "\xB5\xB5\xB5\xCF";

var MonsterNameTable = {};
MonsterNameTable[1001] = "Scorpion";
MonsterNameTable[1002] = "Poring";
MonsterNameTable[1004] = "Hornet";
MonsterNameTable[1005] = "Familiar";
MonsterNameTable[1007] = "Fabre";
MonsterNameTable[1008] = "Pupa";
MonsterNameTable[1009] = "Condor";
MonsterNameTable[1010] = "Willow";

DB.ShadowTable = {};
DB.ShadowTable[111]  = 0.0;
DB.ShadowTable[139]  = 0.0;
DB.ShadowTable[1004] = 0.5;
DB.ShadowTable[1005] = 0.5;
DB.ShadowTable[1007] = 0.5;
DB.ShadowTable[1008] = 0.3;
DB.ShadowTable[1009] = 0.7;
DB.ShadowTable[1011] = 0.5;
DB.ShadowTable[1013] = 1.2;
DB.ShadowTable[1018] = 0.7;
DB.ShadowTable[1019] = 1.2;
DB.ShadowTable[1020] = 0.0;
DB.ShadowTable[1025] = 0.0;

var PalNameTable = {};
PalNameTable[JobId.NOVICE]           = JobNameTable[JobId.NOVICE];
PalNameTable[JobId.SWORDMAN]         = JobNameTable[JobId.SWORDMAN];
PalNameTable[JobId.MAGICIAN]         = JobNameTable[JobId.MAGICIAN];
PalNameTable[JobId.ARCHER]           = JobNameTable[JobId.ARCHER];
PalNameTable[JobId.ACOLYTE]          = JobNameTable[JobId.ACOLYTE];
PalNameTable[JobId.MERCHANT]         = JobNameTable[JobId.MERCHANT];
PalNameTable[JobId.THIEF]            = JobNameTable[JobId.THIEF];

var HairIndexTable =[
	// Human_F
	[2, 2, 4, 7, 1, 5, 3, 6, 12, 10, 9, 11, 8],
	// Human_M
	[2, 2, 1, 7, 5, 4, 3, 6, 8, 9, 10, 12, 11],
	// Doram_F
	[0, 1, 2, 3, 4, 5, 6],
	// Doram_M
	[0, 1, 2, 3, 4, 5, 6]
]

var WeaponTrailTable = {};
WeaponTrailTable[WeaponType.NONE] = "";
WeaponTrailTable[WeaponType.SHORTSWORD] = "_\xb4\xdc\xb0\xcb_\xb0\xcb\xb1\xa4"; //_´Ü°Ë_°Ë±¤ - dagger_trail
WeaponTrailTable[WeaponType.SWORD] = "_\xb0\xcb_\xb0\xcb\xb1\xa4"; //_°Ë_°Ë±¤ - sword_trail
WeaponTrailTable[WeaponType.TWOHANDSWORD] = "_\xb0\xcb_\xb0\xcb\xb1\xa4";
WeaponTrailTable[WeaponType.SPEAR] = "_\xc3\xa2_\xb0\xcb\xb1\xa4";
WeaponTrailTable[WeaponType.TWOHANDSPEAR] = "_\xc3\xa2_\xb0\xcb\xb1\xa4";
WeaponTrailTable[WeaponType.AXE] = "_\xb5\xb5\xb3\xa2_\xb0\xcb\xb1\xa4";
WeaponTrailTable[WeaponType.TWOHANDAXE] = "_\xb5\xb5\xb3\xa2_\xb0\xcb\xb1\xa4";
WeaponTrailTable[WeaponType.MACE] = "_\xc5\xac\xb7\xb4_\xb0\xcb\xb1\xa4";
WeaponTrailTable[WeaponType.TWOHANDMACE] = "_\xc5\xac\xb7\xb4_\xb0\xcb\xb1\xa4";
WeaponTrailTable[WeaponType.ROD] = "_\xb7\xd4\xb5\xe5_\xb0\xcb\xb1\xa4";
WeaponTrailTable[WeaponType.BOW] = "_\xc8\xb0_\xb0\xcb\xb1\xa4";

var RobeTable = {};
RobeTable[1] = "Ãµ»ç³¯°³";
RobeTable[2] = "¸ðÇè°¡¹è³¶";
RobeTable[3] = "Å¸¶ôÃµ»çÀÇ³¯°³";
RobeTable[4] = "¾Æ¹Ì½ºÆ®¸£°¡¹æ";
RobeTable[5] = "¾Æ¹öÁö»ç¶û³¯°³2012";
RobeTable[6] = "±â¸°ÀÇ³¯°³";
RobeTable[7] = "ÇÇ¾Æ¸äÆ®ÀÇ¸®º»";
RobeTable[8] = "·çµå¶óÀÇ³¯°³";


var ShieldTable = {};
ShieldTable[1] = "\xb0\xa1\xb5\xe5";
ShieldTable[2] = "\xb9\xf6\xc5\xac\xb7\xaf";
ShieldTable[3] = "\xbd\xaf\xb5\xe5";
ShieldTable[4] = "\xb9\xcc\xb7\xaf\xbd\xaf\xb5\xe5";

var HatTable={}
HatTable[1] = "_\xb0\xed\xb1\xdb";
HatTable[2] = "_\xb0\xed\xbe\xe7\xc0\xcc\xb8\xd3\xb8\xae\xb6\xec";
HatTable[3] = "_\xb1\xdb\xb7\xa1\xbd\xba";
HatTable[4] = "_\xb2\xc9";
HatTable[5] = "_\xb2\xc9\xb8\xd3\xb8\xae\xb6\xec";
HatTable[6] = "_\xb5\xce\xb0\xc7";
HatTable[7] = "_\xb5\xd5\xb1\xd9\xb8\xf0\xc0\xda";
HatTable[8] = "_\xb8\xb6\xbd\xba\xc5\xa9";
HatTable[9] = "_\xb8\xd3\xb8\xae\xb6\xec";

var ItemTable={}
ItemTable[0]={
	Name:"Toy Shield",
	Res: "\xc5\xe4\xc0\xcc\xbd\xaf\xb5\xe5",
	ClassNum : 0,
	slotCount: 1,
}

function isNPC(jobid) {
	return (jobid >= 45 && jobid < 1000) || (jobid >= 10001 && jobid < 19999);
}

function isMercenary(jobid) {
	return (jobid >= 6017 && jobid <= 6046);
}

function isHomunculus(jobid) {
	return (jobid >= 6001 && jobid <= 6016) || (jobid >= 6048 && jobid <= 6052);
}

function isMonster(jobid) {
	return (jobid >= 1001 && jobid <= 3999) || jobid >= 20000;
}

function isPlayer(jobid) {
	return jobid < 45 || (jobid >= 4001 && jobid <= 4317) || jobid == 4294967294;
}

function isDoram(jobid) {
	return (jobid >= 4217 && jobid <= 4220) || jobid === 4308 || jobid === 4315;
}

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

DB.getWeaponAction = function getWeaponAction(id, job, sex) {
	var type = DB.getWeaponViewID(id);

	if (job in WeaponAction) {
		if (WeaponAction[job] instanceof Array) {
			if (type in WeaponAction[job][sex]) {
				return WeaponAction[job][sex][type];
			}
		}
		else if (type in WeaponAction[job]) {
			return WeaponAction[job][type];
		}
	}

	return 0;
};

DB.getWeaponViewID = function getWeaponViewIdClosure() {
	var gunGatling = [13157, 13158, 13159, 13172, 13177];
	var gunShotGun = [13154, 13155, 13156, 13167, 13168, 13169, 13173, 13178];
	var gunGranade = [13160, 13161, 13162, 13174, 13179];

	return function getWeaponViewID(id) {
		// Already weapon type.
		if (id < WeaponType.MAX) {
			return id;
		}

		console.log("getWeaponViewID:", id);

		// Based on view id
		if (id in ItemTable) {
			if (ItemTable[id].ClassNum) {
				return ItemTable[id].ClassNum;
			}
		}

		// Weapon ID starting at 1100
		if (id < 1100) {
			return WeaponType.NONE;
		}

		// Specific weapon range inside other range (wtf gravity ?)
		if (id >= 1116 && id <= 1118) return WeaponType.TWOHANDSWORD;
		if (id >= 1314 && id <= 1315) return WeaponType.TWOHANDAXE;
		if (id >= 1410 && id <= 1412) return WeaponType.TWOHANDSPEAR;
		if (id >= 1472 && id <= 1473) return WeaponType.ROD;
		if (id === 1599) return WeaponType.MACE;
		if (gunGatling.indexOf(id) > -1) return WeaponType.GUN_GATLING;
		if (gunShotGun.indexOf(id) > -1) return WeaponType.GUN_SHOTGUN;
		if (gunGranade.indexOf(id) > -1) return WeaponType.GUN_GRANADE;

		// Ranges
		return (
			id < 1150 ? WeaponType.SWORD :
				id < 1200 ? WeaponType.TWOHANDSWORD :
					id < 1250 ? WeaponType.SHORTSWORD :
						id < 1300 ? WeaponType.KATAR :
							id < 1350 ? WeaponType.AXE :
								id < 1400 ? WeaponType.TWOHANDAXE :
									id < 1450 ? WeaponType.SPEAR :
										id < 1500 ? WeaponType.TWOHANDSPEAR :
											id < 1550 ? WeaponType.MACE :
												id < 1600 ? WeaponType.BOOK :
													id < 1650 ? WeaponType.ROD :
														id < 1700 ? WeaponType.NONE :
															id < 1750 ? WeaponType.BOW :
																id < 1800 ? WeaponType.NONE :
																	id < 1850 ? WeaponType.KNUKLE :
																		id < 1900 ? WeaponType.NONE :
																			id < 1950 ? WeaponType.INSTRUMENT :
																				id < 2000 ? WeaponType.WHIP :
																					id < 2050 ? WeaponType.TWOHANDROD :
																						id < 13000 ? WeaponType.NONE :
																							id < 13050 ? WeaponType.SHORTSWORD :
																								id < 13100 ? WeaponType.NONE :
																									id < 13150 ? WeaponType.GUN_HANDGUN :
																										id < 13200 ? WeaponType.GUN_RIFLE :
																											id < 13300 ? WeaponType.NONE :
																												id < 13350 ? WeaponType.SYURIKEN :
																													id < 13400 ? WeaponType.NONE :
																														id < 13450 ? WeaponType.SWORD :
																															id < 18100 ? WeaponType.NONE :
																																id < 18150 ? WeaponType.BOW :
																																	WeaponType.NONE
		);
	};
}();

DB.isBaby = function isBaby(job) {
	return false;
}

DB.getAdminPath = function getAdminPath(sex) {
	return '/resources/sprite/\xc0\xce\xb0\xa3\xc1\xb7/\xb8\xf6\xc5\xeb/' + SexTable[sex] + '/\xbf\xee\xbf\xb5\xc0\xda_' + SexTable[sex];
};



DB.getBodyPath = function getBodyPath(id, sex, alternative) {
	// TODO: Warp STR file
	if (id === 45) {
		return null;
	}

	// Not visible sprite
	if (id === 111 || id === 139 || id == 2337) {
		return null;
	}
	// PC
	if (isPlayer(id)) {
		// DORAM
		if (isDoram(id)) {
			return '/resources/sprite/\xb5\xb5\xb6\xf7\xc1\xb7/\xb8\xf6\xc5\xeb/' + SexTable[sex] + '/' + (JobNameTable[id] || JobNameTable[0]) + '_' + SexTable[sex];
		}

		// TODO: check for alternative 3rd and MADO alternative sprites
		return '/resources/sprite/\xc0\xce\xb0\xa3\xc1\xb7/\xb8\xf6\xc5\xeb/' + SexTable[sex] + '/' + (JobNameTable[id] || JobNameTable[0]) + '_' + SexTable[sex];
	}

	// NPC
	if (isNPC(id)) {
		return '/resources/sprite/npc/' + (MonsterNameTable[id] || MonsterNameTable[46]).toLowerCase();
	}

	// MERC
	if (isMercenary(id)) {
		// archer - female path | lancer and swordman - male path
		// mercenary entry on monster table have sex path included
		return '/resources/sprite/\xc0\xce\xb0\xa3\xc1\xb7/\xb8\xf6\xc5\xeb/' + MonsterNameTable[id];
	}

	// HOMUN
	if (isHomunculus(id)) {
		return '/resources/sprite/homun/' + (MonsterNameTable[id] || MonsterNameTable[1002]).toLowerCase();
	}


	// MONSTER
	return '/resources/sprite/\xb8\xf3\xbd\xba\xc5\xcd/' + (MonsterNameTable[id] || MonsterNameTable[1001]).toLowerCase();
};

DB.getBodyPalPath = function getBodyPalettePath(id, pal, sex) {
	if (id === 0 || !(id in PalNameTable)) {
		return null;
	}

	return '/resources/palette/\xb8\xf6/' + PalNameTable[id] + '_' + SexTable[sex] + '_' + pal + '.pal';
};

DB.getHeadPath = function getHeadPath(id, job, sex, orcish) {
	// ORC HEAD
	if (orcish) {
		return '/resources/sprite/\xc0\xcc\xc6\xd1\xc6\xae/orcface';
	}

	// DORAM
	if (isDoram(job)) {
		return '/resources/sprite/\xb5\xb5\xb6\xf7\xc1\xb7/\xb8\xd3\xb8\xae\xc5\xeb/' + SexTable[sex] + '/' + (HairIndexTable[sex + 2][id] || id) + '_' + SexTable[sex];
	}

	return '/resources/sprite/\xc0\xce\xb0\xa3\xc1\xb7/\xb8\xd3\xb8\xae\xc5\xeb/' + SexTable[sex] + '/' + (HairIndexTable[sex][id] || id) + '_' + SexTable[sex];
};

DB.getHeadPalPath = function getHeadPalPath(id, pal, job, sex) {
	if (job === 4218 || job === 4220) {
		return '/resources/palette/\xb5\xb5\xb6\xf7\xc1\xb7/\xb8\xd3\xb8\xae/\xb8\xd3\xb8\xae' + (HairIndexTable[sex + 2][id] || id) + '_' + SexTable[sex] + '_' + pal + '.pal';
	}

	return '/resources/palette/\xb8\xd3\xb8\xae/\xb8\xd3\xb8\xae' + (HairIndexTable[sex][id] || id) + '_' + SexTable[sex] + '_' + pal + '.pal';
};

DB.getWeaponSound = function getWeaponSound(id) {
	var type = DB.getWeaponViewID(id);
	return WeaponSoundTable[type];
};

DB.getWeaponTrail = function getWeaponTrail(id, job, sex) {
	if (id === 0) {
		return null;
	}

	const baseClass = JobNameTable[job] || JobNameTable[0];

	// ItemID to View Id
	if (id in ItemTable && 'ClassNum' in ItemTable[id]) {
		id = ItemTable[id].ClassNum;
	}

	return (
		'/resources/sprite/\xc0\xce\xb0\xa3\xc1\xb7/' +
		baseClass +
		'/' +
		baseClass +
		'_' +
		SexTable[sex] +
		WeaponTrailTable[id]
	);
};

DB.getShieldPath = function getShieldPath(id, job, sex) {
	if (id === 0) {
		return null;
	}

	// Dual weapon (based on range id)
	if (id > 500 && (id < 2100 || id > 2200)) {
		return DB.getWeaponPath(id, job, sex);
	}

	var baseClass = WeaponJobTable[job] || WeaponJobTable[0];

	// ItemID to View Id
	if ((id in ItemTable) && ('ClassNum' in ItemTable[id])) {
		id = ItemTable[id].ClassNum;
	}

	return '/resources/sprite/\xb9\xe6\xc6\xd0/' + baseClass + '/' + baseClass + '_' + SexTable[sex] + '_' + (ShieldTable[id] || ShieldTable[1]);
};

DB.getRobePath = function getRobePath(id, job, sex) {
	if (id === 0 || !(id in RobeTable)) {
		return null;
	}

	return '/resources/sprite/\xb7\xce\xba\xea/' + RobeTable[id] + '/' + SexTable[sex] + '/' + (JobNameTable[job] || JobNameTable[0]) + '_' + SexTable[sex];
};

DB.getHatPath = function getHatPath(id, sex) {
	if (id === 0 || !(id in HatTable)) {
		return null;
	}
	return '/resources/sprite/\xbe\xc7\xbc\xbc\xbb\xe7\xb8\xae/' + SexTable[sex] + '/' + SexTable[sex] + HatTable[id];
};

export default DB;