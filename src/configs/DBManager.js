var DB={}

DB.EmotionsConst= {
ET_SURPRISE:            0,
ET_QUESTION:            1,
ET_DELIGHT:             2,
ET_THROB:               3,
ET_SWEAT:               5,
ET_AHA:                 6,
ET_FRET:                7,
ET_ANGER:               8,
ET_MONEY:               9,
ET_THINK:               10,
ET_ROCK:                11,
ET_SCISSOR:             12,
ET_WRAP:                13,
ET_FLAG:                14,
ET_BIGTHROB:            4,
ET_THANKS:              15,
ET_KEK:                 16,
ET_SORRY:               17,
ET_SMILE:               18,
ET_PROFUSELY_SWEAT:     19,
ET_SCRATCH:             20,
ET_BEST:                21,
ET_STARE_ABOUT:         22,
ET_HUK:                 23,
ET_O:                   24,
ET_X:                   25,
ET_HELP:                26,
ET_GO:                  27,
ET_CRY:                 28,
ET_KIK:                 29,
ET_CHUP:                30,
ET_CHUPCHUP:            31,
ET_HNG:                 32,
ET_OK:                  33,
// ET_CHAT_PROHIBIT:       1000,
ET_INDONESIA_FLAG:      34,
ET_STARE:               35,
ET_HUNGRY:              36,
ET_COOL:                37,
ET_MERONG:              38,
ET_SHY:                 39,
ET_GOODBOY:             40,
ET_SPTIME:              41,
ET_SEXY:                42,
ET_COMEON:              43,
ET_SLEEPY:              44,
ET_CONGRATULATION:      45,
ET_HPTIME:              46,
ET_PH_FLAG:             47,
ET_MY_FLAG:             48,
ET_SI_FLAG:             49,
ET_BR_FLAG:             50,
ET_SPARK:               51,
ET_CONFUSE:             52,
ET_OHNO:                53,
ET_HUM:                 54,
ET_BLABLA:              55,
ET_OTL:                 56,
ET_DICE1:               57,
ET_DICE2:               58,
ET_DICE3:               59,
ET_DICE4:               60,
ET_DICE5:               61,
ET_DICE6:               62,
ET_INDIA_FLAG:          63,
ET_LUV:                 64,
ET_FLAG8:               65,
ET_FLAG9:               66,
ET_MOBILE:              67,
ET_MAIL:                68,
ET_ANTENNA0:            69,
ET_ANTENNA1:            70,
ET_ANTENNA2:            71,
ET_ANTENNA3:            72,
ET_HUM2:                73,
ET_ABS:                 74,
ET_OOPS:                75,
ET_SPIT:                76,
ET_ENE:                 77,
ET_PANIC:               78,
ET_WHISP:               79,        
};

DB.AllMountTable = {};

DB.MountTable = {};

DB.SkillUnitConst = {
	UNT_SAFETYWALL:		126,	//0x7E
	UNT_FIREWALL:		127,	//0x7F
	UNT_WARPPORTAL:		128,	//0x80
	UNT_PRE_WARPPORTAL:		129,	//0x81
	UNT_BENEDICTIO :		130,	//0x82
	UNT_SANCTUARY:		131,	//0x83
	UNT_MAGNUS:		132,	//0x84
	UNT_PNEUMA:		133,	//0x85
	UNT_DUMMYSKILL :		134,	//0x86	//These show no effect on the client
	UNT_FIREPILLAR_WAITING:		135,	//0x87
	UNT_FIREPILLAR_ACTIVE:		136,	//0x88
	UNT_HIDDEN_TRAP :		137,	//0x89
	UNT_MAX:		400	//0x190
};

DB.EffectTable={
	0: [{	//EF_HIT1	Regular hit
		type: '3D',
		duplicate: 4,
		timeBetweenDupli: 0,
		file: 'effect/pok3.tga',
		duration: 300,
		alphaMax: 0.8,
		alphaMin: 0.3,
		fadeIn: true,
		fadeOut: true,
		poszStart: 1,
		posxStart: 0,
		posyStart: 0,
		posxEndRand: 2,
		posyEndRand: 2,
		poszEndRand: 2,
		zIndex: 1,
		size: 10,
		red: 1,
		green: 1,
		blue: 1,
		sizeRand: 20,
		sizeSmooth: true,
		attachedEntity: false,
		sparkling: true,
	}],

	1:[
		{
			alphaMax: 12,
			angleRand: [0,35],
			attachedEntity: false,
			duration: 250,
			durationRand: [200,350],
			fadeOut: true,
			fade: true,
			file: 'effect/lens1.tga',
			sizeEndX: 1,
			sizeRandEndY: [250,300],
			sizeRandStartX: [25,40],
			sizeRandStartY: [10,10],
			circlePattern: true,
			circleOuterSizeRand: [5,6],
			circleInnerSize: 2.2,
			type: '2D',
			zIndex: 1,
			wav: 'effect/ef_hit2'
		},
		{
			alphaMax: 12,
			angleRand: [50,85],
			attachedEntity: false,
			duration: 250,
			durationRand: [200,350],
			fadeOut: true,
			fade: true,
			file: 'effect/lens2.tga',
			sizeEndX: 1,
			sizeRandEndY: [250,300],
			sizeRandStartX: [25,40],
			sizeRandStartY: [10,10],
			circlePattern: true,
			circleOuterSizeRand: [5,6],
			circleInnerSize: 2.2,
			type: '2D',
			zIndex: 1,
		},
		{
			alphaMax: 12,
			angleRand: [100,135],
			attachedEntity: false,
			duration: 250,
			durationRand: [200,350],
			fadeOut: true,
			fade: true,
			file: 'effect/lens1.tga',
			sizeEndX: 1,
			sizeRandEndY: [250,300],
			sizeRandStartX: [25,40],
			sizeRandStartY: [10,10],
			circlePattern: true,
			circleOuterSizeRand: [5,6],
			circleInnerSize: 2.2,
			type: '2D',
			zIndex: 1,
		},
		{
			alphaMax: 12,
			angleRand: [150,185],
			attachedEntity: false,
			duration: 250,
			durationRand: [200,350],
			fadeOut: true,
			fade: true,
			file: 'effect/lens2.tga',
			sizeEndX: 1,
			sizeRandEndY: [250,300],
			sizeRandStartX: [25,40],
			sizeRandStartY: [10,10],
			circlePattern: true,
			circleOuterSizeRand: [5,6],
			circleInnerSize: 2.2,
			type: '2D',
			zIndex: 1,
		},
		{
			alphaMax: 12,
			angleRand: [200,235],
			attachedEntity: false,
			duration: 250,
			durationRand: [200,350],
			fadeOut: true,
			fade: true,
			file: 'effect/lens1.tga',
			sizeEndX: 1,
			sizeRandEndY: [250,300],
			sizeRandStartX: [25,40],
			sizeRandStartY: [10,10],
			circlePattern: true,
			circleOuterSizeRand: [5,6],
			circleInnerSize: 2.2,
			type: '2D',
			zIndex: 1,
		},
		{
			alphaMax: 12,
			angleRand: [255,290],
			attachedEntity: false,
			duration: 250,
			durationRand: [200,350],
			fadeOut: true,
			fade: true,
			file: 'effect/lens2.tga',
			sizeEndX: 1,
			sizeRandEndY: [250,300],
			sizeRandStartX: [25,40],
			sizeRandStartY: [10,10],
			circlePattern: true,
			circleOuterSizeRand: [5,6],
			circleInnerSize: 2.2,
			type: '2D',
			zIndex: 1,
		},
		{
			alphaMax: 12,
			angleRand: [300,335],
			attachedEntity: false,
			duration: 250,
			durationRand: [200,350],
			fadeOut: true,
			fade: true,
			file: 'effect/lens1.tga',
			sizeEndX: 1,
			sizeRandEndY: [250,300],
			sizeRandStartX: [25,40],
			sizeRandStartY: [10,10],
			circlePattern: true,
			circleOuterSizeRand: [5,6],
			circleInnerSize: 2.2,
			type: '2D',
			zIndex: 1,
		},
		{
			alphaMax: 12,
			angleRand: [340,360],
			attachedEntity: false,
			duration: 250,
			durationRand: [200,350],
			fadeOut: true,
			fade: true,
			file: 'effect/lens2.tga',
			sizeEndX: 1,
			sizeRandEndY: [250,300],
			sizeRandStartX: [25,40],
			sizeRandStartY: [10,10],
			circlePattern: true,
			circleOuterSizeRand: [5,6],
			circleInnerSize: 2.2,
			type: '2D',
			zIndex: 1,
		}
	],

	2: [{	//EF_HIT3	Melee Skill Hit
		type: 'CYLINDER',
		textureName: 'lens2',
		angleX: -90,
		posZ: 1,
		rotateWithCamera: true,
		bottomSize: 0.37,
		topSize: 1,
		height: 4,
		animation: 1,
		fade: true,
		duration: 150,
		alphaMax: 0.8,
		wav: 'effect/ef_hit3',
		attachedEntity: true
	}, {
		type: 'CYLINDER',
		textureName: 'lens2',
		angleX: -90,
		posZ: 1,
		rotateWithCamera: true,
		bottomSize: 0.37,
		topSize: 0.37,
		height: 4,
		animation: 1,
		fade: true,
		duration: 150,
		alphaMax: 0.8,
		wav: 'effect/ef_hit3',
		attachedEntity: true
	}],


	3: [{	//EF_HIT4	Melee Skill Hit
		type: 'CYLINDER',
		textureName: 'lens2',
		angleX: -90,
		posZ: 1,
		rotateWithCamera: true,
		bottomSize: 0.15,
		topSize: 1,
		height: 4,
		animation: 1,
		fade: true,
		duration: 150,
		alphaMax: 0.8,
		wav: 'effect/ef_hit4',
		attachedEntity: true
	}],


	4: [{	//EF_HIT5	Melee Skill Hit
		alphaMax: 1,
		angle: 90,
		attachedEntity: false,
		duration: 400,
		fadeOut: true,
		file: 'effect/lens2.tga',
		posz: 1,
		rotate: true,
		sizeEndY: 200,
		sizeStartY: 10,
		sizeX: 15,
		toAngle: 0,
		type: '3D',
		wav: 'effect/ef_hit5'
	}, {
		alphaMax: 1,
		angle: 180,
		attachedEntity: false,
		duration: 400,
		fadeOut: true,
		file: 'effect/lens2.tga',
		posz: 1,
		rotate: true,
		sizeEndY: 200,
		sizeStartY: 10,
		sizeX: 15,
		toAngle: 90,
		type: '3D',
		wav: 'effect/ef_hit5'
	}],


	5: [{	//EF_HIT6	Melee Skill Hit
		alphaMax: 1,
		angle: 90,
		attachedEntity: false,
		duration: 400,
		fadeOut: true,
		file: 'effect/lens2.tga',
		posz: 1,
		rotate: true,
		sizeEndY: 150,
		sizeStartY: 10,
		sizeX: 10,
		toAngle: 0,
		type: '2D',
		wav: 'effect/ef_hit6'
	}, {
		alphaMax: 1,
		angle: 180,
		attachedEntity: false,
		duration: 400,
		fadeOut: true,
		file: 'effect/lens2.tga',
		posz: 1,
		rotate: true,
		sizeEndY: 150,
		sizeStartY: 10,
		sizeX: 10,
		toAngle: 90,
		type: '2D',
		wav: 'effect/ef_hit6'
	}],


	6: [{ //portal - entering the new map	//EF_ENTRY	Being Warped
		//type: 'FUNC',
		//file: 'effect/ring_blue',
		alphaMax: 0.62,
		animation: 1,
		attachedEntity: false,
		blendMode: 8,
		bottomSize: 0.9,
		duration: 500,
		fade: true,
		height: 7.5,
		rotate: true,
		textureName: 'ring_blue',
		topSize: 0.9,
		type: 'CYLINDER',
		wav: 'effect/ef_portal'
	}, {
		alphaMax: 0.62,
		animation: 1,
		attachedEntity: true,
		blendMode: 8,
		bottomSize: 0.85,
		duration: 500,
		fade: true,
		height: 8,
		rotate: true,
		textureName: 'ring_blue',
		topSize: 0.85,
		type: 'CYLINDER'
	}, {
		alphaMax: 0.8,
		animation: 1,
		attachedEntity: true,
		blendMode: 8,
		bottomSize: 0.9,
		duration: 500,
		fade: true,
		height: 1,
		rotate: true,
		textureName: 'ring_blue',
		topSize: 1.5,
		type: 'CYLINDER'
	}],


	7: [{	//EF_EXIT	Item Heal effect
		alphaMax: 0.2,
		animation: 1,
		attachedEntity: true,
		blendMode: 2,
		bottomSize: 0.95,
		duration: 2000,
		fade: true,
		height: 10,
		textureName: 'alpha_down',
		topSize: 0.95,
		type: 'CYLINDER',
		wav: '_heal_effect'
	}, {
		alphaMax: 0.8,
		attachedEntity: true,
		blendMode: 2,
		duration: 1000,
		delayOffset: 400,
		duplicate: 6,
		fadeIn: true,
		fadeOut: true,
		file: 'effect/pok3.tga',
		posxRand: 1.5,
		posyRand: 1.5,
		poszEndRand: 3,
		poszEndRandMiddle: 6,
		poszStart: 0,
		size: 9,
		sizeRand: 2,
		sparkling: true,
		sparkNumber: 2,
		timeBetweenDupli: 80,
		type: '3D',
		zIndex: 1
	}, {
		alphaMax: 0.8,
		attachedEntity: true,
		blendMode: 2,
		duration: 900,
		delayLate: 200,
		duplicate: 3,
		fadeIn: true,
		fadeOut: true,
		file: 'effect/pok3.tga',
		posxRand: 1,
		posyRand: 1,
		poszEnd: 6,
		poszStartRand: 1,
		poszStartRandMiddle: 0,
		size: 9,
		sizeRand: 2,
		sparkling: true,
		sparkNumber: 2,
		timeBetweenDupli: 200,
		type: '3D',
		zIndex: 1
	}],


	8: [{	//EF_WARP	Yellow Ripple Effect
		alphaMax: 0.8,
		animation: 4,
		attachedEntity: true,
		bottomSize: 10,
		duration: 1000,
		duplicate: 4,
		fade: true,
		height: 0,
		posZ: 0.1,
		textureName: 'ring_yellow',
		timeBetweenDupli: 300,
		topSize: 13,
		type: 'CYLINDER'
	}],


	9: [{	//EF_ENHANCE	Different Type of Heal
		alphaMax: 0.2,
		animation: 1,
		attachedEntity: true,
		blendMode: 2,
		bottomSize: 0.95,
		duration: 2000,
		fade: true,
		height: 10,
		textureName: 'alpha_down',
		topSize: 0.95,
		type: 'CYLINDER'
	}, {
		alphaMax: 0.8,
		attachedEntity: true,
		duration: 1000,
		delayLate: 500,
		duplicate: 7,
		fadeOut: true,
		file: 'effect/ac_center2.tga',
		posxRand: 1.5,
		posyRand: 1,
		poszEndRand: 1,
		poszEndRandMiddle: 6,
		poszStartRand: 1,
		poszStartRandMiddle: 1,
		sizeRandY: 15,
		sizeRandYMiddle: 45,
		sizeX: 2.5,
		type: '3D',
		zIndex: 0
	}, {
		alphaMax: 0.8,
		attachedEntity: true,
		duration: 1000,
		delayOffset: 400,
		duplicate: 3,
		fadeOut: true,
		file: 'effect/ac_center2.tga',
		posxRand: 1.5,
		posyRand: 1,
		poszEndRand: 1,
		poszEndRandMiddle: 6,
		poszStartRand: 1,
		poszStartRandMiddle: 1,
		sizeRandY: 15,
		sizeRandYMiddle: 45,
		sizeX: 2.5,
		type: '3D',
		zIndex: 0
	}],
}

DB.MapAlias = {
	"new_1-1.rsw": "new_zone01.rsw",
	"new_2-1.rsw": "new_zone01.rsw", 
	"new_3-1.rsw": "new_zone01.rsw",
	"new_4-1.rsw": "new_zone01.rsw",
	"new_5-1.rsw": "new_zone01.rsw",
	"new_1-2.rsw": "new_zone02.rsw",
	"new_2-2.rsw": "new_zone02.rsw",
	"new_3-2.rsw": "new_zone02.rsw", 
	"new_4-2.rsw": "new_zone02.rsw",
	"new_5-2.rsw": "new_zone02.rsw",
	"new_1-3.rsw": "new_zone03.rsw",
	"new_2-3.rsw": "new_zone03.rsw",
	"new_3-3.rsw": "new_zone03.rsw",
	"new_5-3.rsw": "new_zone03.rsw",
	"new_1-4.rsw": "new_zone04.rsw",
	"new_3-4.rsw": "new_zone04.rsw",
	"new_4-4.rsw": "new_zone04.rsw",
	"new_5-4.rsw": "new_zone04.rsw",
}

var JobId = {
	NOVICE:                0,
	SWORDMAN:              1,
	MAGICIAN:              2,
	ARCHER:                3,
	ACOLYTE:               4,
	MERCHANT:              5,
	THIEF:                 6,
}

DB.WeaponType={
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
	MAX:                    12
}

var WeaponNameTable = {};
WeaponNameTable[DB.WeaponType.NONE]                  = "";
WeaponNameTable[DB.WeaponType.SHORTSWORD]            = "_\xb4\xdc\xb0\xcb";
WeaponNameTable[DB.WeaponType.SWORD]                 = "_\xb0\xcb";
WeaponNameTable[DB.WeaponType.TWOHANDSWORD]          = "_\xb0\xcb";
WeaponNameTable[DB.WeaponType.SPEAR]                 = "_\xc3\xa2";
WeaponNameTable[DB.WeaponType.TWOHANDSPEAR]          = "_\xc3\xa2";
WeaponNameTable[DB.WeaponType.AXE]                   = "_\xb5\xb5\xb3\xa2";
WeaponNameTable[DB.WeaponType.TWOHANDAXE]            = "_\xb5\xb5\xb3\xa2";
WeaponNameTable[DB.WeaponType.MACE]                  = "_\xc5\xac\xb7\xb4";
WeaponNameTable[DB.WeaponType.TWOHANDMACE]           = "_\xc5\xac\xb7\xb4";
WeaponNameTable[DB.WeaponType.ROD]                   = "_\xb7\xd4\xb5\xe5";
WeaponNameTable[DB.WeaponType.BOW]                   = "_\xc8\xb0";

var JobHitSoundTable = {};
JobHitSoundTable[JobId.NOVICE]           = ["player_clothes.wav"];
JobHitSoundTable[JobId.SWORDMAN]         = ["player_metal.wav"];
JobHitSoundTable[JobId.MAGICIAN]         = ["player_clothes.wav"];
JobHitSoundTable[JobId.ARCHER]           = ["player_wooden_male.wav"];
JobHitSoundTable[JobId.ACOLYTE]          = ["player_clothes.wav"];
JobHitSoundTable[JobId.MERCHANT]         = ["player_clothes.wav"];
JobHitSoundTable[JobId.THIEF]            = ["player_wooden_male.wav"];

var WeaponHitSoundTable = {};
WeaponHitSoundTable[DB.WeaponType.NONE]                  = ["_hit_fist1.wav", "_hit_fist2.wav", "_hit_fist3.wav", "_hit_fist4.wav"];
WeaponHitSoundTable[DB.WeaponType.SHORTSWORD]            = ["_hit_dagger.wav"];
WeaponHitSoundTable[DB.WeaponType.SWORD]                 = ["_hit_sword.wav"];
WeaponHitSoundTable[DB.WeaponType.TWOHANDSWORD]          = ["_hit_sword.wav"];
WeaponHitSoundTable[DB.WeaponType.SPEAR]                 = ["_hit_spear.wav"];
WeaponHitSoundTable[DB.WeaponType.TWOHANDSPEAR]          = ["_hit_spear.wav"];
WeaponHitSoundTable[DB.WeaponType.AXE]                   = ["_hit_axe.wav"];
WeaponHitSoundTable[DB.WeaponType.TWOHANDAXE]            = ["_hit_axe.wav"];
WeaponHitSoundTable[DB.WeaponType.MACE]                  = ["_hit_mace.wav"];
WeaponHitSoundTable[DB.WeaponType.TWOHANDMACE]           = ["_hit_mace.wav"];
WeaponHitSoundTable[DB.WeaponType.ROD]                   = ["_hit_rod.wav"];
WeaponHitSoundTable[DB.WeaponType.BOW]                   = ["_hit_arrow.wav"];

var WeaponSoundTable = {};
WeaponSoundTable[DB.WeaponType.NONE]                  = ["attack_fist.wav"];
WeaponSoundTable[DB.WeaponType.SHORTSWORD]            = ["attack_short_sword.wav", "attack_short_sword_.wav"];
WeaponSoundTable[DB.WeaponType.SWORD]                 = ["attack_sword.wav"];
WeaponSoundTable[DB.WeaponType.TWOHANDSWORD]          = ["attack_twohand_sword.wav"];
WeaponSoundTable[DB.WeaponType.SPEAR]                 = ["attack_spear.wav"];
WeaponSoundTable[DB.WeaponType.TWOHANDSPEAR]          = ["attack_spear.wav"];
WeaponSoundTable[DB.WeaponType.AXE]                   = ["attack_axe.wav"];
WeaponSoundTable[DB.WeaponType.TWOHANDAXE]            = ["attack_axe.wav"];
WeaponSoundTable[DB.WeaponType.MACE]                  = ["attack_mace.wav"];
WeaponSoundTable[DB.WeaponType.TWOHANDMACE]           = ["attack_mace.wav"];
WeaponSoundTable[DB.WeaponType.ROD]                   = ["attack_rod.wav"];
WeaponSoundTable[DB.WeaponType.BOW]                   = ["attack_bow1.wav", "attack_bow2.wav"];

var MapInfo = {}
MapInfo["cmd_fild03.rsw"] = {
	"mp3":"63.mp3",
	"isIndoor":false
}

MapInfo["prt_fild06.rsw"] = {
	"mp3":"12.mp3",
	"isIndoor":false
}

var WeaponAction = {};
WeaponAction[JobId.NOVICE] =  [new function(){
	// female
	this[ DB.WeaponType.NONE ]         = 0;
	this[ DB.WeaponType.ROD ]          = 1;
	this[ DB.WeaponType.TWOHANDROD ]   = 1;
	this[ DB.WeaponType.SWORD ]        = 1;
	this[ DB.WeaponType.TWOHANDSWORD ] = 1;
	this[ DB.WeaponType.AXE ]          = 1;
	this[ DB.WeaponType.TWOHANDAXE ]   = 1;
	this[ DB.WeaponType.MACE ]         = 1;
	this[ DB.WeaponType.TWOHANDMACE ]  = 1;
	this[ DB.WeaponType.SHORTSWORD ]   = 2;
}, new function(){
	// male
	this[ DB.WeaponType.NONE ]         = 0;
	this[ DB.WeaponType.SHORTSWORD ]   = 1;
	this[ DB.WeaponType.ROD ]          = 2;
	this[ DB.WeaponType.TWOHANDROD ]   = 2;
	this[ DB.WeaponType.SWORD ]        = 2;
	this[ DB.WeaponType.TWOHANDSWORD ] = 2;
	this[ DB.WeaponType.AXE ]          = 2;
	this[ DB.WeaponType.TWOHANDAXE ]   = 2;
	this[ DB.WeaponType.MACE ]         = 2;
	this[ DB.WeaponType.TWOHANDMACE ]  = 2;
}];

WeaponAction[JobId.SWORDMAN] = new function(){
	this[ DB.WeaponType.NONE ]         = 0;
	this[ DB.WeaponType.SHORTSWORD ]   = 1;
	this[ DB.WeaponType.SWORD ]        = 1;
	this[ DB.WeaponType.TWOHANDSWORD ] = 1;
	this[ DB.WeaponType.AXE ]          = 1;
	this[ DB.WeaponType.TWOHANDAXE ]   = 1;
	this[ DB.WeaponType.MACE ]         = 1;
	this[ DB.WeaponType.TWOHANDMACE ]  = 1;
	this[ DB.WeaponType.SPEAR ]        = 2;
	this[ DB.WeaponType.TWOHANDSPEAR ] = 2;
};

WeaponAction[JobId.MAGICIA] = new function(){
	this[ DB.WeaponType.NONE ]       = 0;
	this[ DB.WeaponType.ROD ]        = 1;
	this[ DB.WeaponType.TWOHANDROD ] = 1;
	this[ DB.WeaponType.SHORTSWORD ] = 2;
};

WeaponAction[JobId.ARCHER] = new function(){
	this[ DB.WeaponType.NONE ]       = 0;
	this[ DB.WeaponType.BOW ]        = 1;
	this[ DB.WeaponType.SHORTSWORD ] = 2;
};

WeaponAction[JobId.ACOLYTE] = new function(){
	this[ DB.WeaponType.NONE ]        = 0;
	this[ DB.WeaponType.ROD  ]        = 1;
	this[ DB.WeaponType.TWOHANDROD ]  = 1;
	this[ DB.WeaponType.MACE ]        = 1;
	this[ DB.WeaponType.TWOHANDMACE ] = 1;
};

WeaponAction[JobId.MERCHANT] = new function(){
	this[ DB.WeaponType.NONE ]         = 0;
	this[ DB.WeaponType.MACE ]         = 1;
	this[ DB.WeaponType.TWOHANDMACE ]  = 1;
	this[ DB.WeaponType.AXE  ]         = 1;
	this[ DB.WeaponType.TWOHANDAXE ]   = 1;
	this[ DB.WeaponType.SWORD ]        = 1;
	this[ DB.WeaponType.TWOHANDSWORD ] = 1;
	this[ DB.WeaponType.SHORTSWORD ]   = 2;
};

WeaponAction[JobId.THIEF] = new function(){
	this[ DB.WeaponType.NONE ]         = 0;
	this[ DB.WeaponType.SWORD ]        = 1;
	this[ DB.WeaponType.TWOHANDSWORD ] = 1;
	this[ DB.WeaponType.SHORTSWORD ]   = 1;
	this[ DB.WeaponType.BOW ]          = 2;
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

var MonsterTable = {};
MonsterTable[46] = "1_ETC_01";
MonsterTable[86] = "4_M_04";
MonsterTable[105] = "8W_SOLDIER";
MonsterTable[727] = "4_F_JOB_HUNTER";
MonsterTable[1002] = "Poring";
MonsterTable[1008] = "Pupa";
MonsterTable[1048] = "Thief_bug_egg";
MonsterTable[1063] = "Lunatic";
MonsterTable[1051] = "Thief_bug_larva";
MonsterTable[1080] = "GREEN_PLANT";

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
WeaponTrailTable[DB.WeaponType.NONE] = "";
WeaponTrailTable[DB.WeaponType.SHORTSWORD] = "_\xb4\xdc\xb0\xcb_\xb0\xcb\xb1\xa4"; //_´Ü°Ë_°Ë±¤ - dagger_trail
WeaponTrailTable[DB.WeaponType.SWORD] = "_\xb0\xcb_\xb0\xcb\xb1\xa4"; //_°Ë_°Ë±¤ - sword_trail
WeaponTrailTable[DB.WeaponType.TWOHANDSWORD] = "_\xb0\xcb_\xb0\xcb\xb1\xa4";
WeaponTrailTable[DB.WeaponType.SPEAR] = "_\xc3\xa2_\xb0\xcb\xb1\xa4";
WeaponTrailTable[DB.WeaponType.TWOHANDSPEAR] = "_\xc3\xa2_\xb0\xcb\xb1\xa4";
WeaponTrailTable[DB.WeaponType.AXE] = "_\xb5\xb5\xb3\xa2_\xb0\xcb\xb1\xa4";
WeaponTrailTable[DB.WeaponType.TWOHANDAXE] = "_\xb5\xb5\xb3\xa2_\xb0\xcb\xb1\xa4";
WeaponTrailTable[DB.WeaponType.MACE] = "_\xc5\xac\xb7\xb4_\xb0\xcb\xb1\xa4";
WeaponTrailTable[DB.WeaponType.TWOHANDMACE] = "_\xc5\xac\xb7\xb4_\xb0\xcb\xb1\xa4";
WeaponTrailTable[DB.WeaponType.ROD] = "_\xb7\xd4\xb5\xe5_\xb0\xcb\xb1\xa4";
WeaponTrailTable[DB.WeaponType.BOW] = "_\xc8\xb0_\xb0\xcb\xb1\xa4";

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
ItemTable[1201]={
	Name:"Dagger",
	Res: "\xb3\xaa\xc0\xcc\xc7\xc1",
	slotCount: 3,
	ClassNum: 1
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
	if (type === DB.WeaponType.NONE) {
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
	return false;
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
		if (id < DB.WeaponType.MAX) {
			return id;
		}

		// Based on view id
		if (id in ItemTable) {
			if (ItemTable[id].ClassNum) {
				return ItemTable[id].ClassNum;
			}
		}

		// Weapon ID starting at 1100
		if (id < 1100) {
			return DB.WeaponType.NONE;
		}

		// Specific weapon range inside other range (wtf gravity ?)
		if (id >= 1116 && id <= 1118) return DB.WeaponType.TWOHANDSWORD;
		if (id >= 1314 && id <= 1315) return DB.WeaponType.TWOHANDAXE;
		if (id >= 1410 && id <= 1412) return DB.WeaponType.TWOHANDSPEAR;
		if (id >= 1472 && id <= 1473) return DB.WeaponType.ROD;
		if (id === 1599) return DB.WeaponType.MACE;
		if (gunGatling.indexOf(id) > -1) return DB.WeaponType.GUN_GATLING;
		if (gunShotGun.indexOf(id) > -1) return DB.WeaponType.GUN_SHOTGUN;
		if (gunGranade.indexOf(id) > -1) return DB.WeaponType.GUN_GRANADE;

		// Ranges
		return (
			id < 1150 ? DB.WeaponType.SWORD :
				id < 1200 ? DB.WeaponType.TWOHANDSWORD :
					id < 1250 ? DB.WeaponType.SHORTSWORD :
						id < 1300 ? DB.WeaponType.KATAR :
							id < 1350 ? DB.WeaponType.AXE :
								id < 1400 ? DB.WeaponType.TWOHANDAXE :
									id < 1450 ? DB.WeaponType.SPEAR :
										id < 1500 ? DB.WeaponType.TWOHANDSPEAR :
											id < 1550 ? DB.WeaponType.MACE :
												id < 1600 ? DB.WeaponType.BOOK :
													id < 1650 ? DB.WeaponType.ROD :
														id < 1700 ? DB.WeaponType.NONE :
															id < 1750 ? DB.WeaponType.BOW :
																id < 1800 ? DB.WeaponType.NONE :
																	id < 1850 ? DB.WeaponType.KNUKLE :
																		id < 1900 ? DB.WeaponType.NONE :
																			id < 1950 ? DB.WeaponType.INSTRUMENT :
																				id < 2000 ? DB.WeaponType.WHIP :
																					id < 2050 ? DB.WeaponType.TWOHANDROD :
																						id < 13000 ? DB.WeaponType.NONE :
																							id < 13050 ? DB.WeaponType.SHORTSWORD :
																								id < 13100 ? DB.WeaponType.NONE :
																									id < 13150 ? DB.WeaponType.GUN_HANDGUN :
																										id < 13200 ? DB.WeaponType.GUN_RIFLE :
																											id < 13300 ? DB.WeaponType.NONE :
																												id < 13350 ? DB.WeaponType.SYURIKEN :
																													id < 13400 ? DB.WeaponType.NONE :
																														id < 13450 ? DB.WeaponType.SWORD :
																															id < 18100 ? DB.WeaponType.NONE :
																																id < 18150 ? DB.WeaponType.BOW :
																																	DB.WeaponType.NONE
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
			return '/resources/sprite/\xb5\xb5\xb6\xf7\xc1\xb7/\xb8\xf6\xc5\xeb/' + SexTable[sex] + '/' + (JobNameTable[id]) + '_' + SexTable[sex];
		}

		// TODO: check for alternative 3rd and MADO alternative sprites
		return '/resources/sprite/\xc0\xce\xb0\xa3\xc1\xb7/\xb8\xf6\xc5\xeb/' + SexTable[sex] + '/' + (JobNameTable[id]) + '_' + SexTable[sex];
	}

	// NPC
	if (isNPC(id)) {
		console.log("isNPC: ",id);
		return '/resources/sprite/npc/' + (MonsterTable[id]).toLowerCase();
	}

	// MERC
	if (isMercenary(id)) {
		// archer - female path | lancer and swordman - male path
		// mercenary entry on monster table have sex path included
		return '/resources/sprite/\xc0\xce\xb0\xa3\xc1\xb7/\xb8\xf6\xc5\xeb/' + MonsterTable[id];
	}

	// HOMUN
	if (isHomunculus(id)) {
		return '/resources/sprite/homun/' + (MonsterTable[id]).toLowerCase();
	}

	// MONSTER
	return '/resources/sprite/\xb8\xf3\xbd\xba\xc5\xcd/' + (MonsterTable[id]).toLowerCase();
};

DB.getBodyPalPath = function getBodyPalettePath(id, pal, sex) {
	if (id === 0 || !(id in PalNameTable)) {
		return null;
	}

	return '/resources/palette/\xb8\xf6/' + PalNameTable[id] + '_' + SexTable[sex] + '_' + pal + '.pal';
};

DB.getHeadPath = function getHeadPath(id, job, sex, orcish) {
	if (!HairIndexTable[sex][id]) {
		console.log("getHeadPath failed: ",id, job, sex);
	}
	// ORC HEAD
	if (orcish) {
		return '/resources/sprite/\xc0\xcc\xc6\xd1\xc6\xae/orcface';
	}

	// DORAM
	if (isDoram(job)) {
		return '/resources/sprite/\xb5\xb5\xb6\xf7\xc1\xb7/\xb8\xd3\xb8\xae\xc5\xeb/' + SexTable[sex] + '/' + (HairIndexTable[sex + 2][id]) + '_' + SexTable[sex];
	}

	return '/resources/sprite/\xc0\xce\xb0\xa3\xc1\xb7/\xb8\xd3\xb8\xae\xc5\xeb/' + SexTable[sex] + '/' + (HairIndexTable[sex][id]) + '_' + SexTable[sex];
};

DB.getHeadPalPath = function getHeadPalPath(id, pal, job, sex) {
	if (!HairIndexTable[sex][id]) {
		console.log("getHeadPalPath failed: ",id, pal, sex);
	}
	if (job === 4218 || job === 4220) {
		return '/resources/palette/\xb5\xb5\xb6\xf7\xc1\xb7/\xb8\xd3\xb8\xae/\xb8\xd3\xb8\xae' + (HairIndexTable[sex + 2][id]) + '_' + SexTable[sex] + '_' + pal + '.pal';
	}
	var path='/resources/palette/\xb8\xd3\xb8\xae/\xb8\xd3\xb8\xae' + (HairIndexTable[sex][id]) + '_' + SexTable[sex] + '_' + pal + '.pal';

	return path
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
	if (!WeaponTrailTable[id]) {
		console.log("getWeaponTrail failed: ",id, WeaponTrailTable[id]);
	}
	return (
		'/resources/sprite/\xc0\xce\xb0\xa3\xc1\xb7/'+baseClass +'/'+baseClass +'_'+SexTable[sex]+WeaponTrailTable[id]
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

	if (!ShieldTable[id]) {
		console.log("getShieldPath failed: ",id, ShieldTable[id]);
	}
	return '/resources/sprite/\xb9\xe6\xc6\xd0/' + baseClass + '/' + baseClass + '_' + SexTable[sex] + '_' + (ShieldTable[id]);
};

DB.getWeaponPath = function getWeaponPath(id, job, sex, leftid = false) {
	if (id === 0) {
		return null;
	}

	var baseClass = JobNameTable[job] || JobNameTable[0];

	// ItemID to View Id
	if ((id in ItemTable) && ('ClassNum' in ItemTable[id])) {
		id = ItemTable[id].ClassNum;
	}

	if (leftid) {
		if ((leftid in ItemTable) && ('ClassNum' in ItemTable[leftid])) {
			leftid = ItemTable[leftid].ClassNum;
		}

		// Create dualhand Id
		var right = Object.keys(DB.WeaponType).find(key => DB.WeaponType[key] === id);
		var left = Object.keys(DB.WeaponType).find(key => DB.WeaponType[key] === leftid);
		if (right && left) {
			id = DB.WeaponType[right + '_' + left];
		}
	}
	if (!WeaponNameTable[id]) {
		console.log("getWeaponPath failed: ",id, WeaponNameTable[id]);
	}
	
	return '/resources/sprite/\xc0\xce\xb0\xa3\xc1\xb7/' + baseClass + '/' + baseClass + '_' + SexTable[sex] + (WeaponNameTable[id] || ('_' + id));
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
	if (!HatTable[id]) {	
		console.log("getHatPath failed: ",id, HatTable[id]);
	}
	return '/resources/sprite/\xbe\xc7\xbc\xbc\xbb\xe7\xb8\xae/' + SexTable[sex] + '/' + SexTable[sex] + HatTable[id];
};

DB.getWeaponType = function getWeaponType(itemID) {
	if (itemID == 0) {
		return DB.WeaponType.NONE;
	} else if (itemID >= 1100 && itemID <= 1199) {
		return DB.WeaponType.SWORD;
	} else if (itemID >= 1901 && itemID < 1999) {
		return DB.WeaponType.INSTRUMENT;
	} else if (itemID >= 1201 && itemID <= 1249) {
		return DB.WeaponType.SHORTSWORD;
	} else if (itemID >= 1250 && itemID <= 1299) {
		return DB.WeaponType.KATAR;
	} else if (itemID >= 1350 && itemID <= 1399) {
		return DB.WeaponType.AXE;
	} else if (itemID >= 1301 && itemID <= 1349) {
		return DB.WeaponType.TWOHANDAXE;//˫�ָ�
	} else if (itemID >= 1450 && itemID <= 1499) {
		return DB.WeaponType.SPEAR;
	} else if (itemID >= 1401 && itemID <= 1449) {
		return DB.WeaponType.TWOHANDSPEAR;
	} else if (itemID >= 1501 && itemID <= 1599) {
		return DB.WeaponType.MACE;
	} else if (itemID >= 1601 && itemID <= 1699) {
		return DB.WeaponType.ROD;
	} else if (itemID >= 1701 && itemID <= 1749) {
		return DB.WeaponType.BOW;
	} else if (itemID >= 1801 && itemID <= 1899) {
		return DB.WeaponType.KNUKLE;
	} else if (itemID >= 2001 && itemID <= 2099) {
		return DB.WeaponType.TWOHANDSWORD;
	}
	return -1;
}

DB.getPCAttackMotion = function getPCAttackMotion(job, sex, weapon, isDualWeapon) {

	if (isDualWeapon) {
		switch (job) {
			case JobId.THIEF:
			case JobId.THIEF_H:
				return 5.75;
				break;
			case JobId.MERCHANT:
			case JobId.MERCHANT_H:
				return 5.85;
				break;
		}
	} else {
		switch (job) {
			case JobId.NOVICE:
			case JobId.NOVICE_H:
			case JobId.NOVICE_B:
			case JobId.SUPERNOVICE:
			case JobId.SUPERNOVICE_B:
			case JobId.SUPERNOVICE2:
			case JobId.SUPERNOVICE2_B:
			case JobId.HYPER_NOVICE:
				switch (sex) {
					case 1:
						return 5.85;
						break;
				}
				break;
			case JobId.ASSASSIN:
			case JobId.ASSASSIN_H:
			case JobId.ASSASSIN_B:
			case JobId.GUILLOTINE_CROSS:
			case JobId.GUILLOTINE_CROSS_H:
			case JobId.GUILLOTINE_CROSS_B:
			case JobId.SHADOW_CROSS:
				switch (DB.getWeaponType(weapon)) {
					case DB.WeaponType.KATAR:
					case DB.WeaponType.SHORTSWORD_SHORTSWORD:
					case DB.WeaponType.SWORD_SWORD:
					case DB.WeaponType.AXE_AXE:
					case DB.WeaponType.SHORTSWORD_SWORD:
					case DB.WeaponType.SHORTSWORD_AXE:
					case DB.WeaponType.SWORD_AXE:
						return 3.0;
				}
				break;
		}
	}
	return 6;
}

DB.isDualWeapon = function isDualWeapon(job, sex, weapon) {
	return false;
}

DB.getEffectInfo = function getEffectInfo(effectId) {
	console.log("getEffectInfo: ", effectId);
	return EffectTable[effectId];
}

export default DB;