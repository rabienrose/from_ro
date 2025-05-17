import PACKET from './PacketStructure.js';
import Network from './NetworkManager.js';
import Session from '../utils/SessionStorage.js';
import MapRenderer from '../render/MapRenderer.js';
import EntityManager from '../render/EntityManager.js';
import Entity from '../render/entity/Entity.js';
import Camera from '../render/Camera.js';
import MapControl from '../control/MapControl.js';
import KEYS from '../control/KeyEventHandler.js';
import Events from '../utils/Events.js';
import Renderer from '../render/Renderer.js';
import Mouse from '../control/MouseEventHandler.js';
import Altitude from '../render/map/Altitude.js';
import EntityNet from './EntityNet.js';
import ENUM_StatusProperty from '../configs/StatusProperty.js';


var Map = {};
var _isInitialised=false;
var _mapName = "";
var _walkTimer = null;
var _walkLastTick = 0;


Map.init = function init()
{
	_mapName = Session.ServerChar.mapName;
	var ip = Network.utilsLongToIP( Session.ServerChar.ip );
	Network.connect(ip, Session.ServerChar.port, function onconnect( success ) 
	{
		MapRenderer.currentMap = '';
		if (!success) {
			return;
		}
		var pkt        = new PACKET.CZ.ENTER();
		pkt.AID        = Session.AID;
		pkt.GID        = Session.GID;
		pkt.AuthCode   = Session.AuthCode;
		pkt.clientTime = Date.now();
		pkt.Sex        = Session.Sex;
		Network.sendPacket(pkt);

		Network.read(function(fp){
			if (fp.length === 4) {
				Session.Character.GID = fp.readLong();
			}
		});

		var ping, SP;
		SP = Session.ping;
		ping = new PACKET.CZ.REQUEST_TIME();
		var startTick = Date.now();
		Network.setPing(function(){
			ping.clientTime = Date.now() - startTick;
			if(!SP.returned && SP.pingTime)	{ console.warn('[Network] The server did not answer the previous PING!'); }
			SP.pingTime = ping.clientTime;
			SP.returned = false;
			Network.sendPacket(ping);
		});
		Session.Playing = true;
	}, true);

	if (!_isInitialised) {
		_isInitialised = true;
		MapControl.init();
		MapControl.onRequestWalk     = onRequestWalk;
		MapControl.onRequestStopWalk = onRequestStopWalk;
		MapControl.onRequestDropItem = onDropItem;
		// Hook packets
		Network.hookPacket( PACKET.ZC.AID,                 onReceiveAccountID );
		Network.hookPacket( PACKET.ZC.ACCEPT_ENTER2,       onConnectionAccepted );
		Network.hookPacket( PACKET.ZC.NOTIFY_PLAYERMOVE,           onPlayerMove );
		Network.hookPacket( PACKET.ZC.PAR_CHANGE,                  onParameterChange );
		Network.hookPacket( PACKET.ZC.LONGPAR_CHANGE,              onParameterChange );
		Network.hookPacket( PACKET.ZC.COUPLESTATUS,                onParameterChange );
		Network.hookPacket( PACKET.ZC.NOTIFY_TIME,         onPong );
		Network.hookPacket( PACKET.ZC.ATTACK_FAILURE_FOR_DISTANCE, onPlayerTooFarToAttack );
		Network.hookPacket(PACKET.ZC.NOTIFY_SKILL2, onEntityUseSkillToAttack);
		EntityNet.call();

	}
};

function onEntityUseSkillToAttack(pkt) {

	return;
	var SkillAction = {};	//Corresponds to e_damage_type in clif.hpp
	SkillAction.NORMAL = 0;	/// damage [ damage: total damage, div: amount of hits, damage2: assassin dual-wield damage ]
	SkillAction.PICKUP_ITEM = 1;	/// pick up item
	SkillAction.SIT_DOWN = 2;	/// sit down
	SkillAction.STAND_UP = 3;	/// stand up
	SkillAction.ENDURE = 4;	/// damage (endure)
	SkillAction.SPLASH = 5;	/// (splash?)
	SkillAction.SKILL = 6;	/// (skill?)
	SkillAction.REPEAT = 7;	/// (repeat damage?)
	SkillAction.MULTI_HIT = 8;	/// multi-hit damage
	SkillAction.MULTI_HIT_ENDURE = 9;	/// multi-hit damage (endure)
	SkillAction.CRITICAL = 10;	/// critical hit
	SkillAction.LUCY_DODGE = 11;	/// lucky dodge
	SkillAction.TOUCH = 12;	/// (touch skill?)
	SkillAction.MULTI_HIT_CRITICAL = 13;	/// multi-hit critical


	var srcEntity = EntityManager.get(pkt.AID);
	var dstEntity = EntityManager.get(pkt.targetID);
	var srcWeapon;

	if (srcEntity) {
		pkt.attackMT = Math.min(9999, pkt.attackMT); // FIXME: cap value ?
		pkt.attackMT = Math.max(1, pkt.attackMT);
		srcEntity.attack_speed = pkt.attackMT;

		srcEntity.amotionTick = Renderer.tick + pkt.attackMT * 2; // Add amotion delay

		srcWeapon = 0;
		if (srcEntity.weapon) {
			srcWeapon = srcEntity.weapon;
		}

		// Don't display skill names for
		//  - hiding skills
		//  - non-player or player owned entity
		//  - skill level < 0
		//  - skill ID < 0
		if (!SkillNameDisplayExclude.includes(pkt.SKID)
			&&
			(srcEntity.objecttype === Entity.TYPE_PC || srcEntity.objecttype === Entity.TYPE_DISGUISED ||
				srcEntity.objecttype === Entity.TYPE_PET || srcEntity.objecttype === Entity.TYPE_HOM ||
				srcEntity.objecttype === Entity.TYPE_MERC || srcEntity.objecttype === Entity.TYPE_ELEM)
			&&
			!(pkt.level < 0)
			&&
			!(pkt.SKID < 0)
		) {
			// srcEntity.dialog.set(((SkillInfo[pkt.SKID] && SkillInfo[pkt.SKID].SkillName) || 'Unknown Skill') + ' !!');
		}

		//Action handling
		if (srcEntity.action !== srcEntity.ACTION.DIE && srcEntity.action !== srcEntity.ACTION.SIT) {
			if (pkt.SKID in SkillActionTable) {
				var action = SkillActionTable[pkt.SKID];
				if (action) {
					srcEntity.setAction(action(srcEntity, Renderer.tick));
				}
			} else {
				srcEntity.setAction(SkillActionTable['DEFAULT'](srcEntity, Renderer.tick));
			}

			//Pet Talk
			if (srcEntity.GID === Session.Entity.GID && (Session.pet.friendly > 900 && (Session.pet.lastTalk || 0) + 10000 < Date.now())) {
				var talkRate = parseInt((Math.random() * 10));
				if (talkRate < 3) {
					var hunger = DB.getPetHungryState(Session.pet.oldHungry);
					var talk = DB.getPetTalkNumber(Session.pet.job, PetMessageConst.PM_HUNTING, hunger);

					var talkPkt = new PACKET.CZ.PET_ACT();
					talkPkt.data = talk;
					Network.sendPacket(talkPkt);
					Session.pet.lastTalk = Date.now();
				}
			}
		}

		if (srcEntity.falcon) {
			if (pkt.SKID == SkillId.HT_BLITZBEAT || pkt.SKID == SkillId.SN_FALCONASSAULT) {
				srcEntity.falcon.action = srcEntity.action;
				srcEntity.falcon.walk.speed = 25;

				srcEntity.falcon.walkToNonWalkableGround(
					srcEntity.falcon.position[0],
					srcEntity.falcon.position[1],
					dstEntity.position[0],
					dstEntity.position[1],
					0,
					true,
					true,
				);
			}
		}

		if (srcEntity.wug) {
			if (pkt.SKID == SkillId.RA_WUGSTRIKE || pkt.SKID == SkillId.RA_WUGBITE) {
				srcEntity.wug.action = srcEntity.action;
				srcEntity.wug.walk.speed = 35;

				srcEntity.wug.walkToNonWalkableGround(
					srcEntity.wug.position[0],
					srcEntity.wug.position[1],
					dstEntity.position[0],
					dstEntity.position[1],
					1,
					false,
					true,
				);
			}
		}
	}

	if (dstEntity) {
		var target = pkt.damage ? dstEntity : srcEntity;

		if (pkt.damage && target && !(srcEntity == dstEntity && pkt.action == SkillAction.SKILL)) {

			// Will be hit actions
			onEntityWillBeHitSub(pkt, dstEntity);

			var isCombo = target.objecttype !== Entity.TYPE_PC && pkt.count > 1;
			var isBlueCombo = SkillBlueCombo.includes(pkt.SKID);

			var addDamage = function (i, startTick) {

				if (pkt.damage) { // Only if hits
					EffectManager.spamSkillHit(pkt.SKID, pkt.targetID, startTick, pkt.AID);
				}

				if (!isCombo && isBlueCombo) { // Blue 'crit' non-combo EG: Rampage Blaster that hits
					Damage.add(pkt.damage / pkt.count, target, startTick, srcWeapon, Damage.TYPE.COMBO_B | ((i + 1) === pkt.count ? Damage.TYPE.COMBO_FINAL : 0));
				} else {
					Damage.add(pkt.damage / pkt.count, target, startTick, srcWeapon); // Normal
				}

				// Only display combo if the target is not entity and
				// there are multiple attacks and actually hits
				if (isCombo) {
					Damage.add(
						pkt.damage / pkt.count * (i + 1),
						target,
						startTick,
						srcWeapon,
						(isBlueCombo ? Damage.TYPE.COMBO_B : Damage.TYPE.COMBO) | ((i + 1) === pkt.count ? Damage.TYPE.COMBO_FINAL : 0)
					);
				}
			};

			for (var i = 0; i < pkt.count; ++i) {
				EffectManager.spamSkillBeforeHit(pkt.SKID, pkt.targetID, Renderer.tick + (C_MULTIHIT_DELAY * i), pkt.AID);
				addDamage(i, Renderer.tick + pkt.attackMT + (C_MULTIHIT_DELAY * i));
			}
		}
	}

	if (srcEntity && dstEntity && pkt.action != SkillAction.SPLASH) { // && pkt.action != SkillAction.MULTI_HIT
		EffectManager.spamSkill(pkt.SKID, pkt.targetID, null, Renderer.tick + pkt.attackMT, pkt.AID);
	}
}


function onDropItem( index, count )
{
	if (count) {
		var pkt   = new PACKET.CZ.ITEM_THROW();
		pkt.Index = index;
		pkt.count = count;
		Network.sendPacket(pkt);
	}
}

function onRequestWalk()
{
	Events.clearTimeout(_walkTimer);

	// If siting, update direction
	if (Session.Entity.action === Session.Entity.ACTION.SIT || KEYS.SHIFT) {
		Session.Entity.lookTo( Mouse.world.x, Mouse.world.y );

		var pkt = new PACKET.CZ.CHANGE_DIRECTION();
		pkt.headDir = Session.Entity.headDir;
		pkt.dir     = Session.Entity.direction;
		Network.sendPacket(pkt);
		return;
	}

	walkIntervalProcess();
}

function checkFreeCell(x, y, range, out)
{
	var _x, _y, r;
	var d_x = Session.Entity.position[0] < x ? -1 : 1;
	var d_y = Session.Entity.position[1] < y ? -1 : 1;

	// Search possible positions
	for (r = 0; r <= range; ++r) {
		for (_x = -r; _x <= r; ++_x) {
			for (_y = -r; _y <= r; ++_y) {
				if (isFreeCell(x + _x * d_x, y + _y * d_y)) {
					out[0] = x + _x * d_x;
					out[1] = y + _y * d_y;
					return true;
				}
			}
		}
	}

	return false;
}

function isFreeCell(x, y)
{
	if (!(Altitude.getCellType(x, y) & Altitude.TYPE.WALKABLE)) {
		return false;
	}

	var free = true;

	EntityManager.forEach(function(entity){
		if (entity.objecttype != entity.constructor.TYPE_EFFECT &&
			entity.objecttype != entity.constructor.TYPE_UNIT &&
			entity.objecttype != entity.constructor.TYPE_TRAP &&
			Math.round(entity.position[0]) === x &&
			Math.round(entity.position[1]) === y) {
			free = false;
			return false;
		}

		return true;
	});

	return free;
}

function walkIntervalProcess()
{
	// setTimeout isn't accurate, so reduce the value
	// to avoid possible errors.
	if (_walkLastTick + 200 > Renderer.tick) {
		return;
	}

	var isWalkable   = (Mouse.world.x > -1 && Mouse.world.y > -1);
	var isCurrentPos = (Math.round(Session.Entity.position[0]) === Mouse.world.x &&
											Math.round(Session.Entity.position[1]) === Mouse.world.y);

	if (isWalkable && !isCurrentPos) {
		var pkt = new PACKET.CZ.REQUEST_MOVE();
		if (!checkFreeCell(Mouse.world.x, Mouse.world.y, 9, pkt.dest)) {
			pkt.dest[0] = Mouse.world.x;
			pkt.dest[1] = Mouse.world.y;
		}
		Network.sendPacket(pkt);
	}

	Events.clearTimeout(_walkTimer);
	_walkTimer    =  Events.setTimeout( walkIntervalProcess, 500);
	_walkLastTick = +Renderer.tick;
}

function onPlayerTooFarToAttack( pkt )
{
	var entity = EntityManager.get(pkt.targetAID);
	if (entity) {
		entity.onFocus();
	}
}

function onRequestStopWalk()
{
	Events.clearTimeout(_walkTimer);
}

function onPong( pkt )
{
	var SP = Session.ping;
	
	SP.returned = true;
	SP.pongTime = 0;
	SP.value = SP.pongTime - SP.pingTime;
	
	Session.serverTick = pkt.time + (SP.value/2); // Adjust with half ping
}

function onPlayerMove( pkt )
{
	Session.Entity.walkTo(
		pkt.MoveData[0],
		pkt.MoveData[1],
		pkt.MoveData[2],
		pkt.MoveData[3]
	);
}

function onConnectionAccepted( pkt )
{
	Session.Entity = new Entity( Session.Character );
	Session.Entity.onWalkEnd = onWalkEnd;

	if ('sex' in pkt && pkt.sex < 2) {
		Session.Entity.sex = pkt.sex;
	}

	// Reset
	Session.petId         =     0;
	Session.hasParty      = false;
	Session.isPartyLeader = false;
	Session.hasGuild      = false;
	Session.guildRight    =     0;

	Session.homunId       =     0;

	Session.Entity.clevel = Session.Character.level;

	Session.mapState =  {
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
	};
	onMapChange({
		xPos:    pkt.PosDir[0],
		yPos:    pkt.PosDir[1],
		mapName: _mapName
	});
}

function onMapChange( pkt )
{
	MapRenderer.onLoad = function(){
		Session.Entity.set({
			PosDir: [ pkt.xPos, pkt.yPos, 0 ],
			GID: Session.Character.GID
		});
		EntityManager.add( Session.Entity );
		Camera.setTarget( Session.Entity );
		Camera.init();
		Renderer.rendering = true;
		Network.sendPacket(
			new PACKET.CZ.NOTIFY_ACTORINIT()
		);
		Map.onEnterMap();
	};
	Renderer.rendering = false;
	MapRenderer.setProgress=Map.setProgress;
	MapRenderer.setMap( pkt.mapName );
}

function onReceiveAccountID( pkt )
{
	Session.Character.GID = pkt.AID;
}

function onRestartRequest()
{
	var pkt = new PACKET.CZ.RESTART();
	pkt.type = 1;
	Network.sendPacket(pkt);
}

function onReturnSavePointRequest()
{
	var pkt = new PACKET.CZ.RESTART();
	pkt.type = 0;
	Network.sendPacket(pkt);
}

function onParameterChange( pkt )
{
	var amount = 0, type;

	if (pkt.hasOwnProperty('varID')) {
		type = pkt.varID;
	}
	else if (pkt.hasOwnProperty('statusType')) {
		type = pkt.statusType;
	}
	else if (pkt.hasOwnProperty('statusID')) {
		type = pkt.statusID;
	}
	else if (pkt.hasOwnProperty('type')) {
		type = pkt.type;
		}
	else {
		type = -1; // goto "default".
	}

	if (pkt.hasOwnProperty('amount')) {
		amount = pkt.amount;
	}
	else if (pkt.hasOwnProperty('count')) {
		amount = pkt.count;
	}
	else if (pkt.hasOwnProperty('value')) {
		amount = pkt.value;
	}

	switch (type) {

		case ENUM_StatusProperty.ENUM_SPEED:
			Session.Entity.walk.speed = amount;
			break;

		case ENUM_StatusProperty.ENUM_EXP:
			break;

		case ENUM_StatusProperty.ENUM_JOBEXP:
			break;

		// (not used ?)
		case ENUM_StatusProperty.ENUM_VIRTUE:
		case ENUM_StatusProperty.ENUM_HONOR:
			break;

		case ENUM_StatusProperty.ENUM_HP:
			Session.Entity.life.hp = amount;
			Session.Entity.life.update();

			if (Session.Entity.life.hp_max > -1) {
				if (Session.hasParty) {
					
				}
			}
			//Danger
			if(Session.Entity.life.hp <= (25/100*Session.Entity.life.hp_max)){
				//Pet Talk
				if(Session.pet.friendly > 900 && (Session.pet.lastTalk || 0) + 10000 < Date.now()){
					const hunger = DB.getPetHungryState(Session.pet.oldHungry);
					const talk = DB.getPetTalkNumber(Session.pet.job, PetMessageConst.PM_DANGER, hunger);

					// var pkt    = new PACKET.CZ.PET_ACT();
					// pkt.data = talk;
					// Network.sendPacket(pkt);
					// Session.pet.lastTalk = Date.now();
				}
			}
			//Died
			if(Session.Entity.life.hp <= 1){
				//Pet Talk
				// if(Session.pet.friendly > 900 ){
				// 	const hunger = DB.getPetHungryState(Session.pet.oldHungry);
				// 	const talk = DB.getPetTalkNumber(Session.pet.job, PetMessageConst.PM_DEAD, hunger);

				// 	var pkt    = new PACKET.CZ.PET_ACT();
				// 	pkt.data = talk;
				// 	Network.sendPacket(pkt);
				// 	Session.pet.lastTalk = Date.now();
				// }

			}
			break;

		case ENUM_StatusProperty.ENUM_MAXHP:
			Session.Entity.life.hp_max = amount;
			Session.Entity.life.update();

			if (Session.Entity.life.hp > -1) {
				// BasicInfo.getUI().update('hp', Session.Entity.life.hp, Session.Entity.life.hp_max);

				if (Session.hasParty) {
					// PartyUI.updateMemberLife(Session.AID, Session.Entity.life.canvas, Session.Entity.life.hp, Session.Entity.life.hp_max);
				}
			}
			break;

		case ENUM_StatusProperty.ENUM_SP:
			Session.Entity.life.sp = amount;
			Session.Entity.life.update();

			if (Session.Entity.life.sp_max > -1) {
				// BasicInfo.getUI().update('sp', Session.Entity.life.sp, Session.Entity.life.sp_max);
			}
			break;

		case ENUM_StatusProperty.ENUM_MAXSP:
			Session.Entity.life.sp_max = amount;
			Session.Entity.life.update();

			if (Session.Entity.life.sp > -1) {
				// BasicInfo.getUI().update('sp', Session.Entity.life.sp, Session.Entity.life.sp_max);
			}
			break;

		case ENUM_StatusProperty.ENUM_POINT:
			// WinStats.getUI().update('statuspoint', amount);
			break;

		case ENUM_StatusProperty.ENUM_CLEVEL:
			Session.Entity.clevel = amount;
			// load aura on levelup
			// Session.Entity.aura.load( EffectManager );
			// BasicInfo.getUI().update('blvl', amount);
			// Equipment.getUI().onLevelUp();
			// ChangeCart.onLevelUp(amount);

			//Pet Talk
			// if(Session.pet.friendly > 900){
			// 	const hunger = DB.getPetHungryState(Session.pet.oldHungry);
			// 	const talk = DB.getPetTalkNumber(Session.pet.job, PetMessageConst.PM_LEVELUP, hunger);

			// 	var pkt    = new PACKET.CZ.PET_ACT();
			// 	pkt.data = talk;
			// 	Network.sendPacket(pkt);
			// 	Session.pet.lastTalk = Date.now();
			// }
			break;

		case ENUM_StatusProperty.ENUM_SKPOINT:
			// SkillList.getUI().setPoints(amount);
			break;

		case ENUM_StatusProperty.ENUM_STR:
			// WinStats.getUI().update('str',  pkt.defaultStatus);
			// WinStats.getUI().update('str2', pkt.plusStatus);
			break;

		case ENUM_StatusProperty.ENUM_AGI:
			// WinStats.getUI().update('agi',  pkt.defaultStatus);
			// WinStats.getUI().update('agi2', pkt.plusStatus);
			break;

		case ENUM_StatusProperty.ENUM_VIT:
			// WinStats.getUI().update('vit',  pkt.defaultStatus);
			// WinStats.getUI().update('vit2', pkt.plusStatus);
			break;

		case ENUM_StatusProperty.ENUM_INT:
			// WinStats.getUI().update('int',  pkt.defaultStatus);
			// WinStats.getUI().update('int2', pkt.plusStatus);
			break;

		case ENUM_StatusProperty.ENUM_DEX:
			// WinStats.getUI().update('dex',  pkt.defaultStatus);
			// WinStats.getUI().update('dex2', pkt.plusStatus);
			break;

		case ENUM_StatusProperty.ENUM_LUK:
			// WinStats.getUI().update('luk',  pkt.defaultStatus);
			// WinStats.getUI().update('luk2', pkt.plusStatus);
			break;

		case ENUM_StatusProperty.ENUM_MONEY:
			// BasicInfo.getUI().update('zeny', amount);
			break;

		case ENUM_StatusProperty.ENUM_MAXEXP:
			// BasicInfo.getUI().base_exp_next = amount;
			// if (BasicInfo.getUI().base_exp > -1) {
			// 	BasicInfo.getUI().update('bexp', BasicInfo.getUI().base_exp, BasicInfo.getUI().base_exp_next );
			// }
			break;

		case ENUM_StatusProperty.ENUM_MAXJOBEXP:
			// BasicInfo.getUI().job_exp_next = amount;
			// if (BasicInfo.getUI().job_exp > -1) {
			// 	BasicInfo.getUI().update('jexp', BasicInfo.getUI().job_exp, BasicInfo.getUI().job_exp_next );
			// }
			break;

		case ENUM_StatusProperty.ENUM_WEIGHT:
			// Session.Character.weight = amount;	// Save weight in Session instead of UI
			// if (BasicInfo.getUI().weight_max > -1) {
			// 	BasicInfo.getUI().update('weight', Session.Character.weight, BasicInfo.getUI().weight_max );
			// }
			break;

		case ENUM_StatusProperty.ENUM_MAXWEIGHT:
			Session.Character.max_weight = amount;	// Save max weight in Session instead of UI only
			// BasicInfo.getUI().weight_max = amount;
			// if (BasicInfo.getUI().weight > -1) {
			// 	BasicInfo.getUI().update('weight', Session.Character.weight, BasicInfo.getUI().weight_max );
			// }
			break;

		case ENUM_StatusProperty.ENUM_STANDARD_STR:

			break;

		case ENUM_StatusProperty.ENUM_STANDARD_AGI:
			// WinStats.getUI().update('agi3', amount);
			break;

		case ENUM_StatusProperty.ENUM_STANDARD_VIT:
			// WinStats.getUI().update('vit3', amount);
			break;

		case ENUM_StatusProperty.ENUM_STANDARD_INT:
			// WinStats.getUI().update('int3', amount);
			break;

		case ENUM_StatusProperty.ENUM_STANDARD_DEX:
			// WinStats.getUI().update('dex3', amount);
			break;

		case ENUM_StatusProperty.ENUM_STANDARD_LUK:
			// WinStats.getUI().update('luk3', amount);
			break;

		case ENUM_StatusProperty.ENUM_ATTPOWER:
			// WinStats.getUI().update('atak', amount);
			break;

		case ENUM_StatusProperty.ENUM_REFININGPOWER:
			// WinStats.getUI().update('atak2', amount);
			break;

		case ENUM_StatusProperty.ENUM_MAX_MATTPOWER:
			// WinStats.getUI().update('matak', amount);
			break;

		case ENUM_StatusProperty.ENUM_MIN_MATTPOWER:
			// WinStats.getUI().update('matak2', amount);
			break;

		case ENUM_StatusProperty.ENUM_ITEMDEFPOWER:
			// WinStats.getUI().update('def', amount);
			break;

		case ENUM_StatusProperty.ENUM_PLUSDEFPOWER:
			// WinStats.getUI().update('def2', amount);
			break;

		case ENUM_StatusProperty.ENUM_MDEFPOWER:
			// WinStats.getUI().update('mdef', amount);
			break;

		case ENUM_StatusProperty.ENUM_PLUSMDEFPOWER:
			// WinStats.getUI().update('mdef2', amount);
			break;

		case ENUM_StatusProperty.ENUM_HITSUCCESSVALUE:
			// WinStats.getUI().update('hit', amount);
			break;

		case ENUM_StatusProperty.ENUM_AVOIDSUCCESSVALUE:
			// WinStats.getUI().update('flee', amount);
			break;

		case ENUM_StatusProperty.ENUM_PLUSAVOIDSUCCESSVALUE:
			// WinStats.getUI().update('flee2', amount);
			break;

		case ENUM_StatusProperty.ENUM_CRITICALSUCCESSVALUE:
			// WinStats.getUI().update('critical', amount);
			break;

		case ENUM_StatusProperty.ENUM_ASPD:
			// WinStats.getUI().update('aspd', amount);
			break;

		case ENUM_StatusProperty.ENUM_JOBLEVEL:
			// BasicInfo.getUI().update('jlvl', amount);
			// SkillList.getUI().onLevelUp();
			break;

		case ENUM_StatusProperty.ENUM_VAR_SP_POW:
			// WinStats.getUI().update('pow', 	pkt.defaultStatus);
			// WinStats.getUI().update('pow2', pkt.plusStatus);
			break;

		case ENUM_StatusProperty.ENUM_VAR_SP_STA:
			// WinStats.getUI().update('sta', 	pkt.defaultStatus);
			// WinStats.getUI().update('sta2', pkt.plusStatus);
			break;

		case ENUM_StatusProperty.ENUM_VAR_SP_WIS:
			WinStats.getUI().update('wis', 	pkt.defaultStatus);
			WinStats.getUI().update('wis2', pkt.plusStatus);
			break;

		case ENUM_StatusProperty.ENUM_VAR_SP_SPL:
			// WinStats.getUI().update('spl', 	pkt.defaultStatus);
			// WinStats.getUI().update('spl2', pkt.plusStatus);
			break;

		case ENUM_StatusProperty.ENUM_VAR_SP_CON:
			// WinStats.getUI().update('con', 	pkt.defaultStatus);
			// WinStats.getUI().update('con2', pkt.plusStatus);
			break;

		case ENUM_StatusProperty.ENUM_VAR_SP_CRT:
			// WinStats.getUI().update('crt', 	pkt.defaultStatus);
			// WinStats.getUI().update('crt2', pkt.plusStatus);
			break;

		case ENUM_StatusProperty.ENUM_VAR_SP_PATK:
			// WinStats.getUI().update('patk', amount);
			break;

		case ENUM_StatusProperty.ENUM_VAR_SP_SMATK:
			// WinStats.getUI().update('smatk', amount);
			break;

		case ENUM_StatusProperty.ENUM_VAR_SP_RES:
			// WinStats.getUI().update('res', amount);
			break;

		case ENUM_StatusProperty.ENUM_VAR_SP_MRES:
			// WinStats.getUI().update('mres', amount);
			break;

		case ENUM_StatusProperty.ENUM_VAR_SP_HPLUS:
			// WinStats.getUI().update('hplus', amount);
			break;

		case ENUM_StatusProperty.ENUM_VAR_SP_CRATE:
			// WinStats.getUI().update('crate', amount);
			break;

		case ENUM_StatusProperty.ENUM_VAR_SP_TRAITPOINT:
			// WinStats.getUI().update('trait_point', amount);
			break;

		case ENUM_StatusProperty.ENUM_VAR_SP_AP:
			Session.Entity.life.ap = amount;
			Session.Entity.life.update();

			if (Session.Entity.life.ap_max > -1) {
				// BasicInfo.getUI().update('ap', Session.Entity.life.ap, Session.Entity.life.ap_max);
			}
			break;

		case ENUM_StatusProperty.ENUM_VAR_SP_MAXAP:
			Session.Entity.life.ap_max = amount;
			Session.Entity.life.update();

			if (Session.Entity.life.ap > -1) {
				// BasicInfo.getUI().update('ap', Session.Entity.life.ap, Session.Entity.life.ap_max);
			}
			break;

		case ENUM_StatusProperty.ENUM_VAR_SP_UPOW:
			// WinStats.getUI().update('pow3', amount);
			break;

		case ENUM_StatusProperty.ENUM_VAR_SP_USTA:
			// WinStats.getUI().update('sta3', amount);
			break;

		case ENUM_StatusProperty.ENUM_VAR_SP_UWIS:
			// WinStats.getUI().update('wis3', amount);
			break;

		case ENUM_StatusProperty.ENUM_VAR_SP_USPL:
			// WinStats.getUI().update('spl3', amount);
			break;

		case ENUM_StatusProperty.ENUM_VAR_SP_UCON:
			// WinStats.getUI().update('con3', amount);
			break;

		case ENUM_StatusProperty.ENUM_VAR_SP_UCRT:
			// WinStats.getUI().update('crt3', amount);
			break;

		default:
			console.log( 'Main::onParameterChange() - Unsupported type', pkt);
	}
}

function onWalkEnd()
{
	// No action to do ?
	if (Session.moveAction) {
		// Not sure why, but there is a synchronization error with the
		// server when moving to attack (wrong position).
		// So wait 50ms to be sure we are at the correct position before
		// performing an action
		Events.setTimeout(function(){
			if (Session.moveAction) {
				Network.sendPacket(Session.moveAction);
				Session.moveAction = null;
			}
		}, 50);
	}
}

export default Map;