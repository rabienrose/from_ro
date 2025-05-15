import Camera from "../render/Camera";
import Mouse from "./MouseEventHandler";
import EntityManager from "../render/EntityManager";
import Entity from "../render/entity/Entity";
import Preferences from "../configs/Preferences";
import Network from "../network/NetworkManager";
import Events from "../utils/Events";
import PACKET from "../network/PacketStructure";
import Mobile from "./Mobile";
import Renderer from "../render/Renderer";
import KEYS from "./KeyEventHandler";
import Altitude from "../render/map/Altitude";
import Session from "../utils/SessionStorage";

var _rightClickPosition = new Int16Array(2);

var MapControl = {};
MapControl.onRequestWalk = function(){};
MapControl.onRequestStopWalk = function(){};
MapControl.onRequestDropItem = function(){};
MapControl.init = function init()
{
	Mobile.init();
	Mobile.onTouchStart = onMouseDown.bind(this);
	Mobile.onTouchEnd   = onMouseUp.bind(this);

	Renderer.canvas.addEventListener('wheel', onMouseWheel);
	Renderer.canvas.addEventListener('dragover', onDragOver);
	Renderer.canvas.addEventListener('drop', onDrop.bind(this));

	window.addEventListener('mousedown', onMouseDown.bind(this));
	window.addEventListener('mouseup', onMouseUp.bind(this));
};

function onMouseDown( event )
{
	var action = event && event.which || 1;
	if (!Mouse.intersect) {
		return;
	}
	var entityFocus = EntityManager.getFocusEntity();
	var entityOver  = EntityManager.getOverEntity();
	
	switch (action) {
		case 1:
			Session.moveAction = null;
			Session.autoFollow = false;

			var stop        = false;
			if(entityOver != Session.Entity){
				if (entityFocus && entityFocus != entityOver) {
					if(!(Session.TouchTargeting && !entityOver)) {
						entityFocus.onFocusEnd();
						EntityManager.setFocusEntity(null);
					}
				}
				if (entityOver) {
					stop = stop || entityOver.onMouseDown();
					stop = stop || entityOver.onFocus();
					EntityManager.setFocusEntity(entityOver);

					// Know if propagate to map mousedown
					if (stop) {
						return;
					}
				}
			}
			if (this.onRequestWalk) {
				this.onRequestWalk();
			}
			break;
		case 3:
			_rightClickPosition[0] = Mouse.screen.x;
			_rightClickPosition[1] = Mouse.screen.y;

			if (entityOver && entityOver != Session.Entity && entityOver.objecttype != Entity.TYPE_EFFECT && entityOver.objecttype != Entity.TYPE_TRAP) {
				if (KEYS.SHIFT) {	// Shift + Right click on an entity
					Session.autoFollowTarget = entityOver;
					Session.autoFollow = true;
					onAutoFollow();

				}
				// Right click on a NPC/Mob/Unit
				entityOver.onMouseDown();
				entityOver.onFocus();
				EntityManager.setFocusEntity(entityOver);
			}
			Camera.rotate( true );
			break;
	}
}

function onMouseUp( event )
{
	var entity, ET;
	var action = event && event.which || 1;

	if (!Mouse.intersect) {
		return;
	}

	switch (action) {

		case 1:
			// Remove entity picking ?
			entity = EntityManager.getFocusEntity();

			if (entity) {
				ET = entity.constructor;
				entity.onMouseUp();

				// Entity lock is only on MOB type (except when Touch Targeting is active)
				if (Preferences.Controls.noctrl === false || (![ET.TYPE_MOB, ET.TYPE_NPC_ABR, ET.TYPE_NPC_BIONIC].includes(entity.objecttype) && !Session.TouchTargeting )) {
					EntityManager.setFocusEntity(null);
					entity.onFocusEnd();
				}
			}

			// stop walking
			if (this.onRequestStopWalk) {
				this.onRequestStopWalk();
			}
			break;

		// Right Click
		case 3:
			Camera.rotate( false );

			// Seems like it's how the official client handle the contextmenu
			// Just check for the same position on mousedown and mouseup
			if (_rightClickPosition[0] === Mouse.screen.x && _rightClickPosition[1] === Mouse.screen.y && !KEYS.SHIFT) {
				entity = EntityManager.getOverEntity();

				if (entity && entity !== Session.Entity) {
					entity.onContextMenu();
				}
			}
			break;
	}
}

function onMouseWheel( event )
{
	var delta;
	if (event.wheelDelta) {
		delta = -event.wheelDelta / 120 ;
	}
	Camera.setZoom(delta);
}

function onDragOver(event)
{
	event.stopImmediatePropagation();
	return false;
}

function onDrop( event )
{
	return false;
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

function onAutoFollow(){
	if(Session.autoFollow){
		var player = Session.Entity;
		var target = Session.autoFollowTarget;

		var dx = Math.abs(player.position[0] - target.position[0]);
		var dy = Math.abs(player.position[1] - target.position[1]);

		// Use square based range check instead of Pythagorean because of diagonals
		if( dx>1 || dy>1 ){
			var dest = [0,0];

			// If there is valid cell send move packet
			if (checkFreeCell(Math.round(target.position[0]), Math.round(target.position[1]), 1, dest)) {
				var pkt;
				pkt         = new PACKET.CZ.REQUEST_MOVE();
				pkt.dest = dest;
				Network.sendPacket(pkt);
			}
		}

		Events.setTimeout( onAutoFollow, 500);
	}
}

export default MapControl;