
import Preferences from '../configs/Preferences';
import DB from '../configs/DBManager';
import Renderer from './Renderer';
import EntityManager from './EntityManager';
import Events from '../utils/Events';
import Sound from '../audio/SoundManager';
import Cylinder from './effects/Cylinder';
import StrEffect from './effects/StrEffect';
import TwoDEffect from './effects/TwoDEffect';
import ThreeDEffect from './effects/ThreeDEffect';

let _gl;
let _list = {};
const EffectManager = {};
let _uniqueId = 1;
EffectManager.init = function init(gl) {
	_gl = gl;
};

function PrepareInit(callParams) {
	const Params = {
		effectId:      -1,
		skillId:       null,
		ownerAID:      null,
		position:      null,
		startTick:     null,
		duration:      null,
		persistent:    false,
		repeatEnd:     null,
		repeatDelay:   0,
		otherAID:      null,
		otherPosition: null
	};
	Object.assign(Params, callParams);
	if (!Params.startTick) {
		Params.startTick = Renderer.tick;
	}
	Params.ownerEntity = EntityManager.get(Params.ownerAID);
	Params.otherEntity = EntityManager.get(Params.otherAID);
	return Params;
}


EffectManager.add = function add(effect, Params) {
	const name = (effect.constructor.name || effect.constructor._uid || (effect.constructor._uid = (_uniqueId++)));

	if (!(name in _list)) {
		_list[name] = [];

		if (effect.constructor.init) {
			effect.constructor.needInit = true;
		}

		if (!effect.constructor.renderBeforeEntities) {
			effect.constructor.renderBeforeEntities = false;
		}
	}

	if (effect.init) {
		effect.needInit = true;
	}
	effect._Params = Params;
	_list[name].push(effect);
};

EffectManager.remove = function removeClosure() {
	function clean(name, AID, effectID) {
		const effectIdList = Array.isArray(effectID) ? effectID : [effectID];
		let list, i, count;

		list  = _list[name];
		count = list.length;

		for (i = 0; i < count; ++i) {
			if ((!AID || (AID && list[i]._Params.Init.ownerAID === AID)) && (!effectID || (effectID && effectIdList.includes(list[i]._Params.Inst.effectID)))) {
				if (list[i].free) {
					list[i].free(_gl);
				}
				list.splice(i, 1);
				i--;
				count--;
			}
		}

		if (!count) {
			//if (effect.free) {
			//	effect.free(_gl);
			//}
			delete _list[name];
		}
	}

	return function remove(effect, AID, effectID) {
		if (!effect || !(effect.name in _list)) {
			const keys = Object.keys(_list);
			let i, count;

			for (i = 0, count = keys.length; i < count; ++i) {
				clean(keys[i], AID, effectID);
			}

		} else {
			clean(effect.name, AID, effectID);
		}

		// Remove entity effects
		if (!(AID == null)) {
			var entity = EntityManager.get(AID);
			if (entity) {
				if (entity.objecttype === entity.constructor.TYPE_EFFECT) {
					EntityManager.remove(AID); // Whole entity is an effect, just remove it
				} else if (!(effectID == null)) {
					entity.attachments.remove(effectID); // Only remove attached effect
				}
			}
		}
	};
}();


EffectManager.free = function free(gl) {
	const keys = Object.keys(_list);
	let i, j, size, count, list, constructor;

	for (i = 0, count = keys.length; i < count; ++i) {
		list        = _list[keys[i]];
		constructor = list[0].constructor;

		for (j = 0, size = list.length; j < size; ++j) {
			if (list[j].free) {
				list[j].free(gl);
			}
		}

		if (constructor.free) {
			constructor.free(gl);
		}
		delete _list[keys[i]];
	}
};

EffectManager.render = function render(gl, modelView, projection, fog, tick, renderBeforeEntities) {
	const keys  = Object.keys(_list);
	const count = keys.length;
	let i, j, size, list, constructor;

	for (i = 0; i < count; ++i) {
		list = _list[keys[i]];

		if (!list.length) {
			delete _list[keys[i]];
			continue;
		}

		constructor = list[0].constructor;

		// Will be render after/before.
		if (constructor.renderBeforeEntities !== renderBeforeEntities) {
			continue;
		}

		if (!(constructor.ready) && constructor.needInit) {
			constructor.init(gl);
			constructor.needInit = false;
		}

		if (constructor.ready) {
			constructor.beforeRender(gl, modelView, projection, fog, tick);

			for (j = 0, size = list.length; j < size; ++j) {
				if (!(list[j].ready) && list[j].needInit) {
					list[j].init(gl);
					list[j].needInit = false;
				}

				if (list[j].ready) {
					list[j].render(gl, tick);
				}

				// Try repeating the effect.
				// This will increase the list size if successful
				size += repeatEffect(list[j]);

				if (list[j].needCleanUp) {
					if (list[j].free) {
						list[j].free(gl);
					}
					list.splice(j, 1);
					j--;
					size--;
				}
			}

			constructor.afterRender(gl);

			if (size === 0) {
				if (constructor.free) {
					constructor.free(gl);
				}
				delete _list[keys[i]];
			}
		}
	}
};

function repeatEffect(effect) {
	const Params    = effect._Params;
	let restartTick = false, RepeatParams, EF_Inst_Par
	if ((Params.Inst.persistent || Params.Inst.repeatEnd) && !(effect._AlreadyRepeated)) {
		if (Params.Inst.duration && Params.Inst.duration > 0 && (Renderer.tick > Params.Inst.endTick + Params.Inst.repeatDelay)) { // Has predefined duration and time to repeat (negative delay)
			if ((!Params.Inst.repeatEnd) || (Params.Inst.repeatEnd > Params.Inst.endTick + Params.Inst.repeatDelay)) { // Repeat period not ended
				restartTick = Params.Inst.endTick + Params.Inst.repeatDelay; // Reference original timing to avoid timing going crazy
			}
		} else if (effect.needCleanUp) { // Finished rendering and need to set a repeat (0 or positive delay)

			if ((!Params.Inst.repeatEnd) || (Params.Inst.repeatEnd > Renderer.tick + Params.Inst.repeatDelay)) { // Repeat period not ended
				restartTick = Renderer.tick + Params.Inst.repeatDelay;
			}
		}
		if (restartTick) {
			// Re-spam effect if needed to repeat
			EF_Inst_Par = {
				effectID:    Params.Inst.effectID,
				duplicateID: Params.Inst.duplicateID,
				startTick:   restartTick,
				noDelay:     true // Offsets and delays are no longer used
			}

			RepeatParams = {
				effect: Params.effect,
				Inst:   EF_Inst_Par,
				Init:   Params.Init
			}

			EffectManager.spamEffect(RepeatParams);
			effect._AlreadyRepeated = true;
			return 1;
		}

	}
	return 0;
}

EffectManager.endRepeat = function endRepeatClosure() {
	function cleanRepeat(name, AID, effectID) {
		let list, i, count;
		const effectIdList = Array.isArray(effectID) ? effectID : [effectID];

		list  = _list[name];
		count = list.length;

		for (i = 0; i < count; ++i) {
			if ((!AID || (AID && list[i]._Params.Init.ownerAID === AID)) && (!effectID || (effectID && effectIdList.includes(list[i].effectID)))) {
				if (list[i]._Params.Inst.persistent) {
					list[i]._Params.Inst.persistent = false;
				}

				if (list[i]._Params.Inst.repeatEnd) {
					list[i]._Params.Inst.repeatEnd = false;
				}
			}
		}
	}

	return function endRepeat(effect, AID, effectID) {
		if (!effect || !(effect.name in _list)) {
			let i, count;
			const keys = Object.keys(_list);

			for (i = 0, count = keys.length; i < count; ++i) {
				cleanRepeat(keys[i], AID, effectID);
			}

			return;
		}

		cleanRepeat(effect.name, AID, effectID);
	};
}();

EffectManager.spam = function spam(EF_Init_Par) {
	// Empty call
	if (!EF_Init_Par) {
		return;
	}
	if (!Preferences.Map.effect) {
		return;
	}
	EF_Init_Par = PrepareInit(EF_Init_Par);

	// Not found
	if (!(EF_Init_Par.effectId in DB.EffectTable)) {
		console.log("Effect not found: ", EF_Init_Par.effectId);
		return;
	}

	let effects = DB.EffectTable[EF_Init_Par.effectId], EF_Inst_Par, Params;
	let i, j, count;

	for (i = 0, count = effects.length; i < count; ++i) {

		if (effects[i].duplicate == -1) {
			effects[i].duplicate = 999;
		} else {
			effects[i].duplicate = effects[i].duplicate ? Math.min(effects[i].duplicate, 999) : 1;
		}

		effects[i].timeBetweenDupli = !isNaN(effects[i].timeBetweenDupli) ? effects[i].timeBetweenDupli : 200;

		for (j = 0; j < effects[i].duplicate; ++j) {
			EF_Inst_Par = {
				effectID:    EF_Init_Par.effectId,
				duplicateID: j,
				startTick:   EF_Init_Par.startTick + (effects[i].timeBetweenDupli * j)
			}

			Params = {
				effect: effects[i],
				Inst:   EF_Inst_Par,
				Init:   EF_Init_Par
			}

			EffectManager.spamEffect(Params);
		}
	}
};

EffectManager.spamEffect = function spamEffect(Params) {
	let filename;

	Params.Inst.position      = Params.Init.position;
	Params.Inst.otherPosition = Params.Init.otherPosition;

	if (!Params.Inst.position) {
		if (!Params.Init.ownerEntity) {
			return;
		}
		Params.Inst.position = Params.Init.ownerEntity.position;
	}

	if (!Params.Inst.otherPosition) {
		if (Params.Init.otherEntity) {
			Params.Inst.otherPosition = Params.Init.otherEntity.position;
		} else {
			Params.Inst.otherPosition = [Params.Inst.position[0] - 5
				, Params.Inst.position[1] + 5
				, Params.Inst.position[2]];
		}

	}

	// Copy instead of get reference
	Params.Inst.position = Params.effect.attachedEntity ? Params.Inst.position : [Params.Inst.position[0], Params.Inst.position[1], Params.Inst.position[2]];

	// Repeat
	Params.Inst.persistent = Params.Init.persistent || false;

	if (typeof Params.effect.repeat !== 'undefined' && Params.effect.repeat !== null) {
		Params.Inst.persistent = Params.effect.repeat; // Effect conf overrides. We can selecively enable/disable repeat on parts using this.
	}

	Params.Inst.repeatEnd   = Params.Init.repeatEnd ? Params.Init.repeatEnd : Params.effect.repeatEnd || 0; // Main has priority
	Params.Inst.repeatDelay = Params.effect.repeatDelay ? Params.effect.repeatDelay : Params.Init.repeatDelay; // Instance has priority

	// Play sound
	if (Params.effect.wav) {
		filename = Params.effect.wav;

		if (Params.effect.rand) {
			filename = filename.replace('%d', Math.round(Params.effect.rand[0] + (Params.effect.rand[1] - Params.effect.rand[0]) * Math.random()));
		}

		Events.setTimeout(function () {
			//calculate the sound volume from distance
			Sound.playPosition(filename + '.wav', Params.Inst.position);
		}, Params.Inst.startTick + (!isNaN(Params.effect.delayWav) ? Params.effect.delayWav : 0) - Renderer.tick);
	}

	Params.Inst.direction = (Params.effect.attachedEntity && Params.Init.ownerEntity) ? Params.Init.ownerEntity.direction : 0;

	//Set delays
	Params.Inst.duration = !isNaN(Params.effect.duration) ? Params.effect.duration : Params.Init.duration;

	Params.Inst.delayOffsetDelta = !isNaN(Params.effect.delayOffsetDelta) ? Params.effect.delayOffsetDelta * Params.Inst.duplicateID : 0;
	Params.Inst.delayLateDelta   = !isNaN(Params.effect.delayLateDelta) ? Params.effect.delayLateDelta * Params.Inst.duplicateID : 0;

	Params.Inst.delayOffset = !isNaN(Params.effect.delayOffset) ? Params.effect.delayOffset + Params.Inst.delayOffsetDelta : 0;
	Params.Inst.delayLate   = !isNaN(Params.effect.delayLate) ? Params.effect.delayLate + Params.Inst.delayLateDelta : 0;

	//Start and End
	Params.Inst.startTick = Params.Inst.startTick + (Params.Inst.noDelay ? Params.Inst.delayOffset + Params.Inst.delayLate : 0);
	Params.Inst.endTick   = Params.Inst.duration > 0 ? Params.Inst.startTick + (Params.Inst.noDelay ? Params.Inst.delayOffset : 0) + Params.Inst.duration : -1;
	console.log("Params.effect.type:", Params.effect.type);
	switch (Params.effect.type) {
		case 'SPR':
			spamSprite(Params);
			break;

		case 'STR':
			spamSTR(Params);
			break;

		case 'CYLINDER':
			EffectManager.add(new Cylinder(Params.effect, Params.Inst, Params.Init), Params);
			break;

		case '2D':
			EffectManager.add(new TwoDEffect(Params.effect, Params.Inst, Params.Init), Params);
			break;

		case '3D':
			EffectManager.add(new ThreeDEffect(Params.effect, Params.Inst, Params.Init), Params);
			break;

		case 'RSM':
		case 'RSM2':
			// EffectManager.add(new RsmEffect(Params), Params);
			break;

		case 'QuadHorn':
			// EffectManager.add(new QuadHorn(Params.effect, Params.Inst, Params.Init), Params);
			break;

		case 'FUNC':
			if (Params.effect.func) {
				if (Params.effect.attachedEntity) {
					if (Params.Init.ownerEntity) {
						Params.effect.func.call(this, Params);
					}
				} else {
					Params.effect.func.call(this, Params);
				}
			}
			break;
	}
};

function spamSTR(Params) {
	let filename;
	const texturePath = Params.effect.texturePath || '';

	// Get STR file
	if (Preferences.mineffect && Params.effect.min) {
		filename = Params.effect.min;
	} else {
		filename = Params.effect.file;
	}

	// Randomize STR file name
	if (Params.effect.rand) {
		filename = filename.replace('%d', Math.round(Params.effect.rand[0] + (Params.effect.rand[1] - Params.effect.rand[0]) * Math.random()));
	}

	// Start effect
	EffectManager.add(new StrEffect('data/texture/effect/' + filename + '.str', Params.Inst.position, Params.Inst.startTick, texturePath), Params);
}

function spamSprite(Params) {
	let entity      = Params.Init.ownerEntity;
	let isNewEntity = false;

	if (!entity) {
		entity            = new Entity();
		entity.GID        = Params.Init.ownerAID;
		entity.position   = Params.Inst.position;
		entity.objecttype = entity.constructor.TYPE_EFFECT;
		isNewEntity       = true;
	} else if (!Params.effect.attachedEntity) {
		entity            = new Entity();
		entity.GID        = -1;
		entity.position   = Params.Inst.position;
		entity.objecttype = entity.constructor.TYPE_EFFECT;
		isNewEntity       = true;
	}

	entity.attachments.add({
		uid:       Params.effect.effectID,
		file:      Params.effect.file,
		head:      !!Params.effect.head,
		direction: !!Params.effect.direction,
		repeat:    Params.effect.repeat || Params.Inst.persistent,
		duplicate: Params.effect.duplicate,
		stopAtEnd: Params.effect.stopAtEnd,
		xOffset:   Params.effect.xOffset,
		yOffset:   Params.effect.yOffset,
		frame:     Params.effect.frame,
		delay:     Params.effect.delayFrame
	});

	if (isNewEntity) {
		EntityManager.add(entity);
	}
}

// TODO: Move these somewhere else, maybe a DB file
/** for the EffectManager.spamSkillZone */
const targetableUnits = [
	DB.SkillUnitConst.UNT_ICEWALL,
	DB.SkillUnitConst.UNT_REVERBERATION,
];

/** for the EffectManager.spamSkillZone */
const traps = [
	DB.SkillUnitConst.UNT_TRAP,
	DB.SkillUnitConst.UNT_BLASTMINE,
	DB.SkillUnitConst.UNT_SKIDTRAP,
	DB.SkillUnitConst.UNT_ANKLESNARE,
	DB.SkillUnitConst.UNT_LANDMINE,
	DB.SkillUnitConst.UNT_SHOCKWAVE,
	DB.SkillUnitConst.UNT_SANDMAN,
	DB.SkillUnitConst.UNT_FLASHER,
	DB.SkillUnitConst.UNT_FREEZINGTRAP,
	DB.SkillUnitConst.UNT_CLAYMORETRAP,
	DB.SkillUnitConst.UNT_TALKIEBOX,
	DB.SkillUnitConst.UNT_MAGENTATRAP,
	DB.SkillUnitConst.UNT_COBALTTRAP,
	DB.SkillUnitConst.UNT_MAIZETRAP,
	DB.SkillUnitConst.UNT_VERDURETRAP,
	DB.SkillUnitConst.UNT_FIRINGTRAP,
	DB.SkillUnitConst.UNT_ICEBOUNDTRAP,
	DB.SkillUnitConst.UNT_ELECTRICSHOCKE,
	DB.SkillUnitConst.UNT_CLUSTERBOMB,
	DB.SkillUnitConst.UNT_ICEMINE
];

EffectManager.spamSkillZone = function spamUnit(unit_id, xPos, yPos, uid, creatorUid) {
	let effectId, entity, isNewEntity = false, EF_Init_Par;

	// No effect mode (/effect)
	if (!Preferences.effect) {
		return;
	}

	if (!(unit_id in SkillUnit)) {
		return;
	}

	effectId = SkillUnit[unit_id];

	if (!(effectId in EffectDB)) {
		return;
	}

	// Remove old version if present (effect & entity)
	EffectManager.remove(null, uid);

	// New Entity
	entity            = new Entity();
	entity.GID        = uid;
	entity.position   = [xPos, yPos, Altitude.getCellHeight(xPos, yPos)];
	entity.hideShadow = true;
	entity.objecttype = traps.includes(unit_id) ? entity.constructor.TYPE_TRAP : (targetableUnits.includes(unit_id) ? entity.constructor.TYPE_UNIT : entity.constructor.TYPE_EFFECT);
	entity.creatorGID = creatorUid;

	EntityManager.add(entity);

	// Effect
	EF_Init_Par = {
		effectId:   effectId,
		ownerAID:   uid,
		position:   [xPos, yPos, Altitude.getCellHeight(xPos, yPos)],
		startTick:  Renderer.tick,
		persistent: true,
		duration:   -1, // Infinite by default but the effect param can have a duration that overrides this
		otherAID:   creatorUid
	};

	EffectManager.spam(EF_Init_Par);
};

EffectManager.spamSkill = function spamSkill(skillId, destAID, position, tick, srcAID) {
	let effects, EF_Init_Par;
	if (!(skillId in SkillEffect)) {
		return;
	}

	if (SkillEffect[skillId].effectId) {
		effects = Array.isArray(SkillEffect[skillId].effectId) ? SkillEffect[skillId].effectId : [SkillEffect[skillId].effectId];

		effects.forEach(effectId => {
			EF_Init_Par = {
				effectId:  effectId,
				ownerAID:  destAID,
				position:  position,
				startTick: tick,
				otherAID:  srcAID
			};

			EffectManager.spam(EF_Init_Par);
		});
	}

	if (SkillEffect[skillId].effectIdOnCaster && srcAID) {
		effects = Array.isArray(SkillEffect[skillId].effectIdOnCaster) ? SkillEffect[skillId].effectIdOnCaster : [SkillEffect[skillId].effectIdOnCaster];

		effects.forEach(effectId => {
			EF_Init_Par = {
				effectId:  effectId,
				ownerAID:  srcAID,
				position:  position,
				startTick: tick,
				otherAID:  destAID
			};

			EffectManager.spam(EF_Init_Par);
		});
	}
};

EffectManager.spamSkillSuccess = function spamSkillSuccess(skillId, destAID, tick, srcAID) {
	let effects, EF_Init_Par;
	if (!(skillId in SkillEffect)) {
		return;
	}

	if (SkillEffect[skillId].successEffectId) {
		effects = Array.isArray(SkillEffect[skillId].successEffectId) ? SkillEffect[skillId].successEffectId : [SkillEffect[skillId].successEffectId];

		effects.forEach(effectId => {
			EF_Init_Par = {
				effectId:  effectId,
				ownerAID:  destAID,
				startTick: tick,
				otherAID:  srcAID
			};

			EffectManager.spam(EF_Init_Par);
		});
	}

	if (SkillEffect[skillId].successEffectIdOnCaster) {
		effects = Array.isArray(SkillEffect[skillId].successEffectIdOnCaster) ? SkillEffect[skillId].successEffectIdOnCaster : [SkillEffect[skillId].successEffectIdOnCaster];

		effects.forEach(effectId => {
			EF_Init_Par = {
				effectId:  effectId,
				ownerAID:  srcAID,
				startTick: tick,
				otherAID:  destAID
			};

			EffectManager.spam(EF_Init_Par);
		});
	}
};

EffectManager.spamSkillHit = function spamSkillHit(skillId, destAID, tick, srcAID) {
	let effects, EF_Init_Par;
	if (!(skillId in SkillEffect)) {
		return;
	}

	if (SkillEffect[skillId].hitEffectId) {
		effects = Array.isArray(SkillEffect[skillId].hitEffectId) ? SkillEffect[skillId].hitEffectId : [SkillEffect[skillId].hitEffectId];

		effects.forEach(effectId => {
			EF_Init_Par = {
				effectId:  effectId,
				ownerAID:  destAID,
				startTick: tick,
				otherAID:  srcAID
			};

			EffectManager.spam(EF_Init_Par);
		});
	}
};

EffectManager.spamSkillBeforeHit = function spamSkillBeforeHit(skillId, destAID, tick, srcAID) {
	let effects, EF_Init_Par;
	if (!(skillId in SkillEffect)) {
		return;
	}

	if (SkillEffect[skillId].beforeHitEffectId) {
		effects = Array.isArray(SkillEffect[skillId].beforeHitEffectId) ? SkillEffect[skillId].beforeHitEffectId : [SkillEffect[skillId].beforeHitEffectId];

		effects.forEach(effectId => {
			EF_Init_Par = {
				effectId:  effectId,
				ownerAID:  destAID,
				startTick: tick,
				otherAID:  srcAID
			};

			EffectManager.spam(EF_Init_Par);
		});
	}

	if (SkillEffect[skillId].beforeHitEffectIdOnCaster) {
		effects = Array.isArray(SkillEffect[skillId].beforeHitEffectIdOnCaster) ? SkillEffect[skillId].beforeHitEffectIdOnCaster : [SkillEffect[skillId].beforeHitEffectIdOnCaster];

		// var EF_Init_Par = { // Unused
		// 	effectId: effectId,
		// 	ownerAID: srcAID,
		// 	startTick: tick,
		// 	otherAID: destAID
		// };

		effects.forEach(effectId => {
			EF_Init_Par = {
				effectId:  effectId,
				ownerAID:  srcAID,
				startTick: tick,
				otherAID:  destAID
			};

			EffectManager.spam(EF_Init_Par);
		});
	}
};

EffectManager.spamSkillCast = function spamSkillCast(skillId, destAID, tick, srcAID) {
	let effects, EF_Init_Par;
	if (!(skillId in SkillEffect)) {
		return;
	}

	if (SkillEffect[skillId].beginCastEffectId) {
		effects = Array.isArray(SkillEffect[skillId].beginCastEffectId) ? SkillEffect[skillId].beginCastEffectId : [SkillEffect[skillId].beginCastEffectId];

		effects.forEach(effectId => {
			EF_Init_Par = {
				effectId:  effectId,
				ownerAID:  destAID,
				startTick: tick,
				otherAID:  srcAID
			};

			EffectManager.spam(EF_Init_Par);
		});
	}
};

EffectManager.spamItem = function spamItem(itemId, destAID, position, tick, srcAID) {
	let effects, EF_Init_Par;
	if (!(itemId in ItemEffect)) {
		return;
	}

	if (ItemEffect[itemId].effectId) {
		effects = Array.isArray(ItemEffect[itemId].effectId) ? ItemEffect[itemId].effectId : [ItemEffect[itemId].effectId];

		effects.forEach(effectId => {
			EF_Init_Par = {
				effectId:  effectId,
				ownerAID:  destAID,
				position:  position,
				startTick: tick,
				otherAID:  srcAID
			};

			EffectManager.spam(EF_Init_Par);
		});
	}

	if (ItemEffect[itemId].effectIdOnCaster && srcAID) {
		effects = Array.isArray(ItemEffect[itemId].effectIdOnCaster) ? ItemEffect[itemId].effectIdOnCaster : [ItemEffect[itemId].effectIdOnCaster];

		effects.forEach(effectId => {
			EF_Init_Par = {
				effectId:  effectId,
				ownerAID:  srcAID,
				position:  position,
				startTick: tick,
				otherAID:  destAID
			};

			EffectManager.spam(EF_Init_Par);
		});
	}
};

EffectManager.debug = function(){
	console.log( '%c[DEBUG] EffectManager _list: ', 'color:#F5B342', _list );
};

export default EffectManager;