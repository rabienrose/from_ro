import glMatrix from "../utils/gl-matrix";
import Preferences from "../configs/Preferences";
import PathFinding from "../utils/PathFinding";
var mat4    = glMatrix.mat4;
var vec2    = glMatrix.vec2;

function onMouseDown()
{
	var Entity = this.constructor;
	var pkt;

	switch (this.objecttype) {
		case Entity.TYPE_PET:
		case Entity.TYPE_HOM:
		case Entity.TYPE_MERC:
			break;

		case Entity.TYPE_ITEM:
			pkt = new PACKET.CZ.ITEM_PICKUP();
			pkt.ITAID = this.GID;
			if (vec2.distance(Session.Entity.position, this.position) > 2) {
				Session.moveAction = pkt;
				pkt = new PACKET.CZ.REQUEST_MOVE();
				pkt.dest[0] = Mouse.world.x;
				pkt.dest[1] = Mouse.world.y;
				Network.sendPacket(pkt);
				return true;
			}
			Network.sendPacket(pkt);
			Session.Entity.lookTo( this.position[0], this.position[1] );
			return true;

		case Entity.TYPE_NPC:
		case Entity.TYPE_NPC2:
			return true;

		case Entity.TYPE_WARP:
			var i = 1, out = [], j, x, y;
			PathFinding.search(
				Session.Entity.position[0] | 0, Session.Entity.position[1] | 0,
				this.position[0] | 0, this.position[1] | 0,
				i,
				out
			);
			for (j = out.length; j > 1; j -= 2) {
				x = out[j - 2];
				y = out[j - 1];
				if (Altitude.getCellType(x, y) & Altitude.TYPE.WALKABLE) {
					break
				}
			}
			pkt         = new PACKET.CZ.REQUEST_MOVE();
			pkt.dest[0] = x;
			pkt.dest[1] = y;
			Network.sendPacket(pkt);
			return true;
	}

	return false;
}


/**
 * Stop clicking on an entity
 */
function onMouseUp()
{
}

function onContextMenu()
{
	var Entity = this.constructor;
	var entity = this;

	switch (this.objecttype) {
		case Entity.TYPE_PET:
			if (Session.petId === this.GID) {
			}
			break;
		case Entity.TYPE_PC:
			break;
		case Entity.TYPE_HOM:
			break;
		case Entity.TYPE_MERC:
			if (Session.mercId === this.GID) {
			}
			break;
	}
	return false;
}


function onFocus()
{
	var Entity = this.constructor;
	var main   = Session.Entity;
	var pkt;

	switch (this.objecttype) {
		case Entity.TYPE_PC:
		case Entity.TYPE_ELEM:
		case Entity.TYPE_HOM:
			// TODO: add check for PVP/WOE mapflag
			if (KEYS.SHIFT === false && Preferences.Controls.noshift === false && !this.canAttackEntity())  {
				if(!Session.TouchTargeting && !Session.autoFollow){
					break;
				}
			}
		case Entity.TYPE_MOB:
		case Entity.TYPE_UNIT:
		case Entity.TYPE_NPC_ABR:
		case Entity.TYPE_NPC_BIONIC:
			// this.attachments.add({
			// 	uid:    'lockon',
			// 	spr:    'data/sprite/cursors.spr',
			// 	act:    'data/sprite/cursors.act',
			// 	frame:   Cursor.ACTION.LOCK,
			// 	repeat:  true,
			// 	depth:   10.0,
			// });

			if(!Session.TouchTargeting && !Session.autoFollow){
				var out   = [];
				var count = PathFinding.search(
					main.position[0] | 0, main.position[1] | 0,
					this.position[0] | 0, this.position[1] | 0,
					main.attack_range + 1,
					out
				);

				// Can't attack
				if (!count) {
					return true;
				}

				if(main.isOverWeight){
					ChatBox.addText( DB.getMessage(243), ChatBox.TYPE.ERROR, ChatBox.FILTER.PUBLIC_LOG);
					return true;
				}

				if(PACKETVER.value >= 20180307) {
					pkt        = new PACKET.CZ.REQUEST_ACT2();
				} else {
					pkt        = new PACKET.CZ.REQUEST_ACT();
				}
				pkt.action    = 7;
				pkt.targetGID = this.GID;

				if (count < 2) {
					Network.sendPacket(pkt);
					return true;
				}

				Session.moveAction = pkt;
				pkt         = new PACKET.CZ.REQUEST_MOVE();
				pkt.dest[0] = out[(count-1)*2 + 0];
				pkt.dest[1] = out[(count-1)*2 + 1];
				Network.sendPacket(pkt);
			}
			return true;
	}

	return false;
}

function onFocusEnd()
{
	var Entity = this.constructor;

	switch (this.objecttype) {
		case Entity.TYPE_PC:
		case Entity.TYPE_ELEM:
		case Entity.TYPE_HOM:
		case Entity.TYPE_MOB:
		case Entity.TYPE_UNIT:
		case Entity.TYPE_NPC_ABR:
		case Entity.TYPE_NPC_BIONIC:
			if (Entity.Manager.getFocusEntity()) {
				Network.sendPacket(new PACKET.CZ.CANCEL_LOCKON());
			}
	}
	// this.display.display = false;
	// this.display.remove();
	// this.attachments.remove('lockon');
}


function canAttackEntity() {
		if(this === Session.Entity) {
			return false;
		}
		else if ( Session.mapState.isPVP ) {
			return true;
		} 
		else if( Session.mapState.isGVG ) {
			if(Session.Entity.GUID > 0 && this.GUID !== Session.Entity.GUID || (this.GUID == 0 && this !== Session.Entity)) { // 0 = no guild, can be attacked by anyone
				return true;
			}
		}
		return false;
}

export default function Init()
{
	this.onMouseOver   = onMouseOver;
	this.onMouseOut    = onMouseOut;
	this.onMouseDown   = onMouseDown;
	this.onMouseUp     = onMouseUp;
	this.onFocus       = onFocus;
	this.onFocusEnd    = onFocusEnd;
	this.onContextMenu = onContextMenu;
	this.canAttackEntity = canAttackEntity;
};