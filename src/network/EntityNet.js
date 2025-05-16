import EntityManager from '../render/EntityManager.js';
import Entity from '../render/entity/Entity.js';
import Altitude from '../render/map/Altitude.js';
import Network from './NetworkManager.js';
import PACKET from './PacketStructure.js';
import DB from '../configs/DBManager.js';
import Emotions from '../configs/Emotions.js';
import Events from '../utils/Events.js';
import Sound from '../audio/SoundManager.js';
import EffectManager from '../render/EffectManager.js';
import EffectConst from '../configs/EffectConst.js';
import Damage from '../render/effects/Damage.js';
import Renderer from '../render/Renderer.js';


const C_MULTIHIT_DELAY = 200; // PLUSATTACKED_MOTIONTIME
const AVG_ATTACK_SPEED = 432;
const AVG_ATTACKED_SPEED = 288;
const MAX_ATTACKMT = AVG_ATTACK_SPEED * 2;


function onEntitySpam(pkt) {
	var entity = EntityManager.get(pkt.GID);
	if (entity) {
		entity.set(pkt);
	}
	else {
		entity = new Entity();
		entity.set(pkt);
		EntityManager.add(entity);
	}
}

function onEntityVanish(pkt) {
	var entity = EntityManager.get(pkt.GID);
	if (entity) {
		entity.remove(pkt.type);
	}
}

function onEntityMove(pkt) {
	var entity = EntityManager.get(pkt.GID);
	if (entity) {
		entity.walkTo(pkt.MoveData[0], pkt.MoveData[1], pkt.MoveData[2], pkt.MoveData[3]);
	}
}

function onEntityStopMove(pkt) {
	var entity = EntityManager.get(pkt.AID);
	if (entity) {
		entity.position[0] = pkt.xPos;
		entity.position[1] = pkt.yPos;
		entity.position[2] = Altitude.getCellHeight(pkt.xPos, pkt.yPos);

		entity.resetRoute();

		if (entity.action === entity.ACTION.WALK) {
			entity.setAction({
				action: entity.ACTION.IDLE,
				frame: 0,
				repeat: true,
				play: true
			});
		}
	}
}

function onEntityIdentity(pkt) {
	var entity = EntityManager.get(pkt.AID);
	if (entity) {
		if (entity.display.name) {
			entity.display.fakename = pkt.CName;
		} else {
			entity.display.name = pkt.CName;
		}

		entity.display.party_name = pkt.PName || '';
		entity.display.guild_name = pkt.GName || '';
		entity.display.guild_rank = pkt.RName || '';
		entity.display.title_name = pkt.Title || '';

		entity.display.load = entity.display.TYPE.COMPLETE;

		if (entity.GUID) {
			Guild.requestGuildEmblem(entity.GUID, entity.GEmblemVer, function (image) {
				entity.display.emblem = image;
				entity.display.update(
					entity.objecttype === Entity.TYPE_MOB ? entity.display.STYLE.MOB :
						entity.objecttype === Entity.TYPE_NPC_ABR ? entity.display.STYLE.MOB :
							entity.objecttype === Entity.TYPE_NPC_BIONIC ? entity.display.STYLE.MOB :
								entity.objecttype === Entity.TYPE_DISGUISED ? entity.display.STYLE.MOB :
									entity.objecttype === Entity.TYPE_NPC ? entity.display.STYLE.NPC :
										entity.objecttype === Entity.TYPE_NPC2 ? entity.display.STYLE.NPC :
											(entity.objecttype === Entity.TYPE_PC && entity.isAdmin) ? entity.display.STYLE.ADMIN :
												entity.display.STYLE.DEFAULT
				)
				entity.emblem.emblem = image;
				entity.emblem.update();

				if (Session.mapState.isSiege && entity.GUID !== Session.Entity.GUID) {
					entity.emblem.display = true;
				}
			});
		} else if (pkt.GID) {
			DB.loadGroupEmblem(pkt.GID, function (image) {
				entity.display.emblem = image;
				entity.display.update(
					entity.objecttype === Entity.TYPE_MOB ? entity.display.STYLE.MOB :
						entity.objecttype === Entity.TYPE_NPC_ABR ? entity.display.STYLE.MOB :
							entity.objecttype === Entity.TYPE_NPC_BIONIC ? entity.display.STYLE.MOB :
								entity.objecttype === Entity.TYPE_DISGUISED ? entity.display.STYLE.MOB :
									entity.objecttype === Entity.TYPE_NPC ? entity.display.STYLE.NPC :
										entity.objecttype === Entity.TYPE_NPC2 ? entity.display.STYLE.NPC :
											(entity.objecttype === Entity.TYPE_PC && entity.isAdmin) ? entity.display.STYLE.ADMIN :
												entity.display.STYLE.DEFAULT
				)
				entity.emblem.emblem = image;
				entity.emblem.update();
			});
		}
		else {
			entity.display.emblem = null;
		}
		entity.display.update(
			entity.objecttype === Entity.TYPE_MOB ? entity.display.STYLE.MOB :
				entity.objecttype === Entity.TYPE_NPC_ABR ? entity.display.STYLE.MOB :
					entity.objecttype === Entity.TYPE_NPC_BIONIC ? entity.display.STYLE.MOB :
						entity.objecttype === Entity.TYPE_DISGUISED ? entity.display.STYLE.MOB :
							entity.objecttype === Entity.TYPE_NPC ? entity.display.STYLE.NPC :
								entity.objecttype === Entity.TYPE_NPC2 ? entity.display.STYLE.NPC :
									(entity.objecttype === Entity.TYPE_PC && entity.isAdmin) ? entity.display.STYLE.ADMIN :
										entity.display.STYLE.DEFAULT
		);

		if (EntityManager.getOverEntity() === entity) {
			entity.display.add();
		}
	}
}

function onEntityLifeUpdate(pkt) {
	var entity = EntityManager.get(pkt.AID);
	if (entity) {
		entity.life.hp = pkt.hp;
		entity.life.hp_max = pkt.maxhp;
		entity.life.update();
	}
}

function onEntityFastMove(pkt) {
	var entity = EntityManager.get(pkt.AID);
	if (entity) {
		entity.walkTo(entity.position[0], entity.position[1], pkt.targetXpos, pkt.targetYpos);

		if (entity.walk.path.length) {
			var speed = entity.walk.speed;
			entity.walk.speed = 10;
			entity.walk.onEnd = function onWalkEnd() {
				entity.walk.speed = speed;
			};
		}
	}
}

function onEntityDirectionChange(pkt) {
	var entity = EntityManager.get(pkt.AID);
	if (entity) {
		entity.direction = ([4, 3, 2, 1, 0, 7, 6, 5])[pkt.dir];
		entity.headDir = pkt.headDir;
	}
}

function onEntityWillBeHitSub(pkt, dstEntity) {
	// only if has damage > 0 and type is not endure and not lucky
	if ((pkt.damage > 0 || pkt.leftDamage > 0) && pkt.action !== 4 && pkt.action !== 9 && pkt.action !== 11) {

		var count = pkt.count || 1;

		function impendingAttack() { // Get hurt when attack happens
			if (dstEntity.action !== dstEntity.ACTION.DIE) {
				dstEntity.setAction({
					action: dstEntity.ACTION.HURT,
					frame: 0,
					repeat: false,
					play: true,
					next: {
						action: dstEntity.ACTION.READYFIGHT, // Wiggle-wiggle
						delay: pkt.attackedMT + 0,
						frame: 0,
						repeat: true,
						play: true,
					}
				});
			}
		}

		function resumeWalk() {
			// Try resuming walk when targeting something.
			if (dstEntity.action !== dstEntity.ACTION.DIE && EntityManager.getFocusEntity() && dstEntity.walk.index < dstEntity.walk.total) {
				dstEntity.setAction({
					action: dstEntity.ACTION.WALK,
					frame: 0,
					repeat: false,
					play: true
				});
			}
		}

		for (var i = 0; i < count; i++) {
			if (pkt.damage) {
				Events.setTimeout(impendingAttack, pkt.attackMT + (C_MULTIHIT_DELAY * i));
			}
			if (pkt.leftDamage) {
				Events.setTimeout(impendingAttack, pkt.attackMT + ((C_MULTIHIT_DELAY * 1.75) * i));
			}
		}

		Events.setTimeout(resumeWalk, pkt.attackMT + (C_MULTIHIT_DELAY * (pkt.leftDamage ? 1.75 : 1) * (count - 1)) + pkt.attackedMT);
	}
}

function onEntityAction(pkt) {
	console.log("onEntityAction: ", pkt);
	var srcEntity = EntityManager.get(pkt.GID);
	// Entity out of the screen ?
	if (!srcEntity) {
		return;
	}
	var dstEntity = EntityManager.get(pkt.targetGID);
	var target;
	var srcWeapon = srcEntity.weapon ? srcEntity.weapon : 0;
	var srcWeaponLeft = srcEntity.shield ? srcEntity.shield : 0;


	srcEntity.targetGID = pkt.targetGID;

	switch (pkt.action) {

		// Damage
		case 0:  // regular [DMG_NORMAL]
		//case 1: // [DMG_PICKUP_ITEM]
		//case 2: // [DMG_SIT_DOWN]
		//case 3: // [DMG_STAND_UP]
		case 4:  // absorbed [DMG_ENDURE]
		//case 5: [DMG_SPLASH]
		//case 5: [DMG_SKILL]
		//case 7: [DMG_REPEAT]
		//case 11: [DMG_TOUCH] probably something new.
		case 8:  // double attack [DMG_MULTI_HIT]
		case 9:  // endure [DMG_MULTI_HIT_ENDURE]
		case 10: // critital [DMG_CRITICAL]
		case 11: // lucky
		case 13: // multi-hit critical
			if (pkt.attackMT > MAX_ATTACKMT) {
				pkt.attackMT = MAX_ATTACKMT;
			}
			srcEntity.attack_speed = pkt.attackMT;

			let animSpeed = 0;
			let soundTime = 0;
			let delayTime = pkt.attackMT;

			var WSnd = DB.getWeaponSound(srcWeapon);
			var weaponSound = WSnd ? WSnd[0] : false;
			var weaponSoundRelease = WSnd ? WSnd[1] : false;

			var WSndL = DB.getWeaponSound(srcWeaponLeft);
			var weaponSoundLeft = WSndL ? WSndL[0] : false;
			var weaponSoundReleaseLeft = WSndL ? WSndL[1] : false;

			if (srcEntity.objecttype === Entity.TYPE_PC) {
				const factorOfmotionSpeed = pkt.attackMT / AVG_ATTACK_SPEED;
				const isDualWeapon = DB.isDualWeapon(srcEntity._job, srcEntity._sex, srcEntity.weapon);
				let m_attackMotion = DB.getPCAttackMotion(srcEntity._job, srcEntity._sex, srcEntity.weapon, isDualWeapon);
				let m_motionSpeed = 1; // need to find out where is it come from? maybe from act delay with some calculate //actRes->GetDelay(action); [MrUnzO]
				if (m_motionSpeed < 1) m_motionSpeed = 1;
				m_motionSpeed *= factorOfmotionSpeed;

				soundTime = delayTime = m_attackMotion * m_motionSpeed * 24.0;
				animSpeed = pkt.attackMT / m_attackMotion;

				// Display throw arrow effect when using bows, not an elegant conditional but it works.. [Waken]
				if (DB.getWeaponType(srcEntity.weapon) == DB.WeaponType.BOW) {
					delayTime = (m_attackMotion + (8 / m_motionSpeed)) * m_motionSpeed * 24.0;
					pkt.attackMT += delayTime;
					var EF_Init_Par = {
						effectId: 'ef_arrow_projectile',
						ownerAID: dstEntity.GID,
						otherAID: srcEntity.GID,
						startTick: Renderer.tick + pkt.attackMT,
						otherPosition: srcEntity.position
					};
					EffectManager.spam(EF_Init_Par);
				}

			}

			//attack sound
			if (weaponSound) {
				Events.setTimeout(function () {
					Sound.playPosition(weaponSound, srcEntity.position);
				}, soundTime * 2);
			}
			//attack release sound for bow and dagger
			if (weaponSoundRelease) {
				Events.setTimeout(function () {
					Sound.playPosition(weaponSoundRelease, srcEntity.position);
				}, delayTime * 2);
			}

			//second hit (double attack)
			if (pkt.count == 2) {
				if (weaponSound) {
					Events.setTimeout(function () {
						Sound.play(weaponSound);
					}, C_MULTIHIT_DELAY);
				}
				if (weaponSoundRelease) {
					Events.setTimeout(function () {
						Sound.play(weaponSoundRelease);
					}, (pkt.attackMT * 0.25) + C_MULTIHIT_DELAY);
				}
			}
			//left hand
			if (pkt.leftDamage) {
				if (weaponSoundLeft) {
					Events.setTimeout(function () {
						Sound.play(weaponSoundLeft);
					}, C_MULTIHIT_DELAY * 1.75);
				}
				if (weaponSoundReleaseLeft) {
					Events.setTimeout(function () {
						Sound.play(weaponSoundRelease);
					}, (pkt.attackMT * 0.25) + (C_MULTIHIT_DELAY * 1.75));
				}
			}


			if (dstEntity) {
				// only if damage and do not have endure
				// and damage isn't absorbed (healing)

				// Will be hit actions
				onEntityWillBeHitSub(pkt, dstEntity);

				// damage blocking status effect display
				if (pkt.action == 0 && pkt.damage == 0 && pkt.leftDamage == 0) {

				}

				target = pkt.damage ? dstEntity : srcEntity;

				// damage or miss display
				if (target) {
					if (dstEntity.objecttype === Entity.TYPE_MOB || dstEntity.objecttype === Entity.TYPE_NPC_ABR || dstEntity.objecttype === Entity.TYPE_NPC_BIONIC) {
						if (pkt.damage > 0) {
							var EF_Init_Par = {
								effectId: EffectConst.EF_HIT1,
								ownerAID: pkt.targetGID,
								startTick: Renderer.tick + pkt.attackMT,
							};
							console.log("EF_Init_Par: ", EF_Init_Par);
							EffectManager.spam(EF_Init_Par);
						}
					}

					var type = null;
					switch (pkt.action) {

						// Single damage
						case 10: // critical
							type = Damage.TYPE.CRIT;
						case 0: // regular damage
						case 4: // regular damage (endure)
							Damage.add(pkt.damage, target, Renderer.tick + pkt.attackMT, srcWeapon, type);
							if (pkt.leftDamage) {
								Damage.add(pkt.leftDamage, target, Renderer.tick + pkt.attackMT + (C_MULTIHIT_DELAY * 1.75), srcWeapon, type);
							}
							break;

						// Combo
						case 13: //multi-hit critical
							type = Damage.TYPE.CRIT;
						case 8: // multi-hit damage
						case 9: // multi-hit damage (endure)

							// Display combo only if entity is mob and the attack don't miss
							if ((dstEntity.objecttype === Entity.TYPE_MOB || dstEntity.objecttype === Entity.TYPE_NPC_ABR || dstEntity.objecttype === Entity.TYPE_NPC_BIONIC) && pkt.damage > 0) {
								if (pkt.damage > 1) { // Can't divide 1 damage
									Damage.add(pkt.damage / 2, dstEntity, Renderer.tick + pkt.attackMT, srcWeapon, Damage.TYPE.COMBO);
								}
								if (pkt.leftDamage) {
									Damage.add(pkt.damage, dstEntity, Renderer.tick + pkt.attackMT + (C_MULTIHIT_DELAY / 2), srcWeapon, Damage.TYPE.COMBO);
									Damage.add(pkt.damage + pkt.leftDamage, dstEntity, Renderer.tick + pkt.attackMT + (C_MULTIHIT_DELAY * 1.75), srcWeapon, Damage.TYPE.COMBO | Damage.TYPE.COMBO_FINAL);
								} else {
									Damage.add(pkt.damage, dstEntity, Renderer.tick + pkt.attackMT + C_MULTIHIT_DELAY, srcWeapon, Damage.TYPE.COMBO | Damage.TYPE.COMBO_FINAL);
								}
							}

							var div = 1;
							if (pkt.damage > 1) { // Can't divide 1 damage
								div = 2;
								Damage.add(pkt.damage / div, target, Renderer.tick + pkt.attackMT, srcWeapon, type);
							}
							if (pkt.leftDamage) {
								Damage.add(pkt.damage / div, target, Renderer.tick + pkt.attackMT + (C_MULTIHIT_DELAY / 2), srcWeapon, type);
								Damage.add(pkt.leftDamage, target, Renderer.tick + pkt.attackMT + (C_MULTIHIT_DELAY * 1.75), srcWeapon, type);
							} else {
								Damage.add(pkt.damage / div, target, Renderer.tick + pkt.attackMT + C_MULTIHIT_DELAY, srcWeapon, type);
							}
							break;

						// TODO: lucky miss
						case 11:
							dstEntity.attachments.add({
								frame: 3,
								file: 'msg',
								uid: 'lucky',
								play: true,
								head: true,
								repeat: false,
							});
							break;

					}
				}

				// Update entity position
				srcEntity.lookTo(dstEntity.position[0], dstEntity.position[1]);
			}

			srcEntity.attack_speed = pkt.attackMT;


			if (pkt.leftDamage) {
				// KAGEROU, OBORO does not use ATTCK3 for left
				const useATTACK = (srcEntity.job == JobId.KAGEROU || srcEntity.job == JobId.KAGEROU_B || srcEntity.job == JobId.OBORO || srcEntity.job == JobId.OBORO_B);
				srcEntity.setAction({
					action: useATTACK ? srcEntity.ACTION.ATTACK : srcEntity.ACTION.ATTACK3,
					frame: 0,
					repeat: false,
					play: true,
					next: {
						delay: Renderer.tick + pkt.attackMT + delayTime,
						action: srcEntity.ACTION.READYFIGHT,
						frame: 0,
						repeat: true,
						play: true,
						next: false
					}
				});
			} else {
				srcEntity.setAction({
					action: srcEntity.ACTION.ATTACK,
					speed: animSpeed,
					frame: 0,
					repeat: false,
					play: true,
					next: {
						delay: Renderer.tick + pkt.attackMT,
						action: srcEntity.ACTION.READYFIGHT,
						frame: 0,
						repeat: true,
						play: true,
						next: false
					}
				});
			}
			break;

		// Pickup item
		case 1:
			srcEntity.setAction({
				action: srcEntity.ACTION.PICKUP,
				frame: 0,
				repeat: false,
				play: true,
				next: {
					action: srcEntity.ACTION.IDLE,
					frame: 0,
					repeat: true,
					play: true,
					next: false
				}
			});
			if (dstEntity) {
				srcEntity.lookTo(dstEntity.position[0], dstEntity.position[1]);
			}
			break;

		// Sit Down
		case 2:
			srcEntity.setAction({
				action: srcEntity.ACTION.SIT,
				frame: 0,
				repeat: true,
				play: true
			});
			break;

		// Stand up
		case 3:
			srcEntity.setAction({
				action: srcEntity.ACTION.IDLE,
				frame: 0,
				repeat: true,
				play: true
			});
			break;
	}
}

function onEntityCastSkill(pkt) {

}

function onEntityEmotion(pkt) {
	var entity = EntityManager.get(pkt.GID);
	if (entity && (pkt.type in Emotions.indexes)) {
		entity.attachments.add({
			frame: Emotions.indexes[pkt.type],
			file: 'emotion',
			play: true,
			head: true,
			depth: 5.0
		});
	}
}

export default function Net() {
	Network.hookPacket(PACKET.ZC.NOTIFY_NEWENTRY8, onEntitySpam);
	Network.hookPacket(PACKET.ZC.NOTIFY_MOVEENTRY8, onEntitySpam);
	Network.hookPacket(PACKET.ZC.NOTIFY_STANDENTRY8, onEntitySpam);
	Network.hookPacket(PACKET.ZC.NOTIFY_VANISH, onEntityVanish);
	Network.hookPacket(PACKET.ZC.NOTIFY_ACT3, onEntityAction);
	Network.hookPacket(PACKET.ZC.NOTIFY_MONSTER_HP, onEntityLifeUpdate);
	Network.hookPacket(PACKET.ZC.ACK_REQNAME, onEntityIdentity);
	Network.hookPacket(PACKET.ZC.USESKILL_ACK2, onEntityCastSkill);
	Network.hookPacket(PACKET.ZC.EMOTION, onEntityEmotion);

};
