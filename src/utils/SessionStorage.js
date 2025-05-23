export default{
		
	isTouchDevice: false,
	isRenewal: false,
	TouchTargeting: false,
	AutoTargeting: false,
	
	FreezeUI:    false,

	AuthCode:    0,
	AID:         0,
	GID:         0,
	UserLevel:   0,
	Sex:         0,
	LangType:    0,
	ServerName:  null,
	ratesInfo:	 null,
	ServerLogin: null,
	ServerChar: null,

	Character:   null,
	Entity:      null,

	AdminList:   [],

	underAutoCounter: false,

	moveAction:  null,

	zeny:        0,
	weight:      0,
	max_weight:  0,

	petId:       0,
	pet:		{},

	hasParty:      false,
	isPartyLeader: false,

	hasGuild:      false,
	guildRight:    0,
	isGuildMaster: false,

	Playing: false,
	hasCart: false,
	CartNum: 0,
	
	homCustomAI: false,
	merCustomAI: false,
	
	autoFollow:       false,
	autoFollowTarget: null,
	
	ping: {
		pingTime: 0,
		pongTime: 0,
		returned: false,
		value: 0,
	},
	
	serverTick: 0,

	mapState:  {
		property        : 0,
		type            : 0,
		flag            : 0,
		isPVPZone       : false,
		isAgitZone      : false,
		isPVP           : false,
		isGVG           : false,
		isSiege         : false,
		isNoLockOn      : false,
		showPVPCounter  : false,
		showBFCounter   : false,
		isBattleField   : false,
	},
};

