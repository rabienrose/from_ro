import * as glMatrix from 'gl-matrix';
import { translateZ_m4, toInverseMat3_m4 } from '../utils/glm_ex.js';
import Preferences from '../configs/Preferences.js';
import DB from '../configs/DBManager.js';
import MapRenderer from './MapRenderer.js';
import KEYS from '../control/KeyEventHandler.js';
import Mouse from '../control/MouseEventHandler.js';
import Session from '../utils/SessionStorage.js';
import Events from '../utils/Events.js';
import Renderer from './Renderer.js';

var mat4        = glMatrix.mat4;
var mat3        = glMatrix.mat3;
var vec2        = glMatrix.vec2;
var vec3        = glMatrix.vec3;
var _position   = vec3.create();
const C_MIN_ZOOM = 1;
const C_MAX_ZOOM = 5;
const C_MIN_V_ANGLE_ISOMETRIC = 190;
const C_MAX_V_ANGLE_ISOMETRIC = 270;
const C_THIRDPERSON_TRESHOLD_ZOOM = 1;
const C_MIN_V_ANGLE_3RDPERSON = 175;
const C_MAX_V_ANGLE_3RDPERSON = 270;
const C_QUAKE_MULT = 0.1;

var Camera = {};
Camera.projection = mat4.create();
Camera.modelView = mat4.create();
Camera.normalMat = mat3.create();
Camera.zoom      = 125;
Camera.zoomFinal = 125;
Camera.angle      = vec2.create();
Camera.angleFinal = vec2.create();
Camera.position = vec3.create();
Camera.target = null;
Camera.lastTick = 0;
Camera.MIN_ZOOM = C_MIN_ZOOM;
Camera.MAX_ZOOM = C_MAX_ZOOM;
Camera.MIN_V_ANGLE = C_MIN_V_ANGLE_ISOMETRIC;
Camera.MAX_V_ANGLE = C_MAX_V_ANGLE_ISOMETRIC;
Camera.direction    =    0;
Camera.altitudeFrom =    0;
Camera.altitudeTo   =  -65;
Camera.altitudeRange = 15;
Camera.rotationFrom = -360;
Camera.rotationTo   =  360;
Camera.range        =  230; //240;
Camera.zoomStep     =  15;
Camera.zoomStepMult =  1;

Camera.currentMap 			= '';
Camera.indoorRotationFrom 	= -60;
Camera.indoorRotationTo 	= -25;
Camera.indoorRange 			= 240;

Camera.MAX_ZOOM_INDOOR 				= 2.5;
Camera.MIN_ALTITUDE_INDOOR 		= 220;
Camera.MAX_ALTITUDE_INDOOR 		= 240;

Camera.enable3RDPerson = false;
Camera.enable1STPerson = false;

Camera.states = {
	isometric: 0,
	third_person: 1,
	first_person: 2
};

Camera.action = {
	active: false,
	tick:   0,
	x:      0,
	y:      0
};
Camera.quakes = [];
Camera.setTarget = function SetTarget( target )
{
	Camera.target = target;
};

Camera.getLatitude = function GetLatitude()
{
	return Camera.angle[0] - 180.0;
};

Camera.setQuake = function SetQuake( start, duration, xAmt, yAmt, zAmt )
{
	var quake = {};
	quake.startTick = start;
	quake.duration = duration || 650;
	quake.sideQuake = xAmt || 1.0;
	quake.latitudeQuake = yAmt || 0.2;
	quake.zoomQuake = zAmt || 0.24;
	quake.active = true;
	Camera.quakes.push( quake );
};

Camera.processQuake = function processQuake( tick )
{
	for(var i=0; i<Camera.quakes.length; i++){
		if(Camera.quakes[i].active){
			if(Camera.quakes[i].startTick <= tick){
				if(Camera.quakes[i].startTick + Camera.quakes[i].duration > tick){
					var step = (tick - Camera.quakes[i].startTick) / Camera.quakes[i].duration;
					Camera.position[0] += (((Math.random()*5)-2.5)/10 + Camera.quakes[i].sideQuake) * Math.cos(Camera.angle[1] * (Math.PI/180)) * C_QUAKE_MULT;
					Camera.position[1] += (((Math.random()*5)-2.5)/10 + Camera.quakes[i].sideQuake) * -Math.sin(Camera.angle[1] * (Math.PI/180)) * C_QUAKE_MULT;
					Camera.quakes[i].sideQuake *= -1;
					Camera.zoom += (((Math.random()*5)-2.5)/10 + Camera.quakes[i].zoomQuake) * C_QUAKE_MULT;
					Camera.quakes[i].zoomQuake *= -1;
					Camera.angle[0] += (((Math.random()*5)-2.5)/15 + Camera.quakes[i].latitudeQuake) * C_QUAKE_MULT;
					Camera.quakes[i].latitudeQuake *= -1
				} else {
					Camera.quakes[i].active = false;
				}
			}
		} else {
			Camera.quakes.splice(i, 1);
		}
	}
};

Camera.init = function Init()
{
	Camera.enable3RDPerson = false;
	Camera.enable1STPerson = false;
	Camera.MAX_ZOOM = 5;
	Camera.lastTick  = Date.now();
	Camera.angle[0]      = Camera.range % 360.0;//240.0;
	Camera.angle[1]      = Camera.rotationFrom % 360.0;
	Camera.angleFinal[0] = Camera.range % 360.0;
	Camera.angleFinal[1] = Camera.rotationFrom % 360.0;
	Camera.position[0] = -Camera.target.position[0];
	Camera.position[1] = -Camera.target.position[1];
	Camera.position[2] =  Camera.target.position[2];
	Camera.altitudeRange = Camera.altitudeTo - Camera.altitudeFrom;
	if(Camera.enable1STPerson){
		Camera.MIN_ZOOM = 0;
	} else if(Camera.enable3RDPerson){
		Camera.MIN_ZOOM = 0.2;
	} else {
		Camera.MIN_ZOOM = C_MIN_ZOOM;
	}
	Camera.currentMap = MapRenderer.currentMap;
	if (DB.isIndoor(Camera.currentMap)) {
		Camera.zoomFinal = Preferences.Camera.indoorZoom || 125;
		Camera.angleFinal[0] = 230;
		Camera.angleFinal[1] = -40;
	} else {
		Camera.zoomFinal = Preferences.Camera.zoom || 125;
	}
};

Camera.save = function SaveClosure()
{
	var _pending = false;
	function save() {
		_pending         = false;
		if (!DB.isIndoor(Camera.currentMap)) {
			Preferences.Camera.zoom = Camera.zoomFinal;
		}else{
			Preferences.Camera.indoorZoom = Camera.zoomFinal;
		}
		Preferences.Camera.save();
	}
	return function saving() {
		// Save camera settings after 3 seconds
		if (!_pending) {
			Events.setTimeout( save, 3000);
			_pending = true;
		}
	};
}();

Camera.rotate = function Rotate( active )
{
	var action = Camera.action;
	var tick   = Date.now();
	if (!active) {
		action.active = false;
		return;
	}
	if (action.tick + 500 > tick &&
			Math.abs(action.x-Mouse.screen.x) < 10 && // Check the mouse position to avoid bug while rotating
			Math.abs(action.y-Mouse.screen.y) < 10) { // to fast the camera...
		if (KEYS.SHIFT) {
			if (DB.isIndoor(Camera.currentMap)){
				Camera.angleFinal[0] = +Camera.indoorRange;
			} else {
				Camera.angleFinal[0] = +Camera.range;
			}
		}
		if (KEYS.CTRL) {
			Camera.zoomFinal = 125.0;
		}
		else {
			if (DB.isIndoor(Camera.currentMap)){
				Camera.angleFinal[1] = Camera.indoorRotationTo;
			} else {
				Camera.angleFinal[1] = 0.0;
			}
		}
	}

	action.x       = Mouse.screen.x;
	action.y       = Mouse.screen.y;
	action.tick    = tick;
	action.active  = true;
};

Camera.processMouseAction = function ProcessMouseAction()
{
	if (KEYS.SHIFT) {
		Camera.angleFinal[0] += ( Mouse.screen.y - Camera.action.y ) / Mouse.screen.height * 300;
		if (DB.isIndoor(Camera.currentMap)) {
			Camera.angleFinal[0] = Math.max(Camera.angleFinal[0], Camera.MIN_ALTITUDE_INDOOR);
			Camera.angleFinal[0] = Math.min(Camera.angleFinal[0], Camera.MAX_ALTITUDE_INDOOR);
		}else{
			Camera.angleFinal[0]  = Math.max( Camera.angleFinal[0], Camera.MIN_V_ANGLE );
			Camera.angleFinal[0]  = Math.min( Camera.angleFinal[0], Camera.MAX_V_ANGLE );
		}

	}
	else if (KEYS.CTRL) {
		Camera.zoomFinal -= ( Mouse.screen.y - Camera.action.y  ) * (Camera.zoomStep * Camera.zoomStepMult / 10);
		if (DB.isIndoor(Camera.currentMap)){
			Camera.zoomFinal = Math.min( Camera.zoomFinal, Math.abs(Camera.altitudeRange) * Camera.MAX_ZOOM_INDOOR );
		}else{
			Camera.zoomFinal  = Math.min( Camera.zoomFinal, Math.abs(Camera.altitudeRange) * Camera.MAX_ZOOM );
		}
		Camera.zoomFinal  = Math.max( Camera.zoomFinal, Math.abs(Camera.altitudeRange) * Camera.MIN_ZOOM );
	}
	else {
		Camera.angleFinal[1] -= ( Mouse.screen.x - Camera.action.x ) / Mouse.screen.width * 720;

		if (Camera.angle[1] > 180 && Camera.angleFinal[1] > 180) {
			Camera.angle[1]      -= 360;
			Camera.angleFinal[1] -= 360;
		}
		else if (Camera.angle[1] < -180 && Camera.angleFinal[1]) {
			Camera.angle[1]      += 360;
			Camera.angleFinal[1] += 360;
		}
		if (DB.isIndoor(Camera.currentMap)) {
			Camera.angleFinal[1] = Math.max( Camera.angleFinal[1], Camera.indoorRotationFrom );
			Camera.angleFinal[1] = Math.min( Camera.angleFinal[1], Camera.indoorRotationTo );
		}else{
			Camera.angleFinal[1] = Math.max( Camera.angleFinal[1], Camera.rotationFrom );
			Camera.angleFinal[1] = Math.min( Camera.angleFinal[1], Camera.rotationTo );
		}
		if(Camera.state == Camera.states.first_person || Camera.state == Camera.states.third_person){
			Camera.angleFinal[0] += ( Mouse.screen.y - Camera.action.y ) / Mouse.screen.height * 300;
			Camera.angleFinal[0]  = Math.max( Camera.angleFinal[0], Camera.MIN_V_ANGLE );
			Camera.angleFinal[0]  = Math.min( Camera.angleFinal[0], Camera.MAX_V_ANGLE );
		}
	}
	Camera.action.x = +Mouse.screen.x ;
	Camera.action.y = +Mouse.screen.y ;
	Camera.updateState();
	Camera.save();
};

Camera.setZoom = function SetZoom( delta )
{
	if(delta){
		Camera.zoomFinal += delta * Camera.zoomStep * Camera.zoomStepMult;
		if (DB.isIndoor(Camera.currentMap)) {
			Camera.zoomFinal = Math.min( Camera.zoomFinal, Math.abs(Camera.altitudeRange) * Camera.MAX_ZOOM_INDOOR );
		}else{
			Camera.zoomFinal  = Math.min( Camera.zoomFinal, Math.abs(Camera.altitudeRange) * Camera.MAX_ZOOM );
		}
		Camera.zoomFinal  = Math.max( Camera.zoomFinal, Math.abs(Camera.altitudeRange) * Camera.MIN_ZOOM );
		Camera.updateState();
		Camera.save();
	}
};

Camera.updateState = function UpdateState(){
	if(this.enable1STPerson && this.zoomFinal == 0){
		if(this.state != this.states.first_person){
			this.MIN_V_ANGLE = C_MIN_V_ANGLE_1STPERSON;
			this.MAX_V_ANGLE = C_MAX_V_ANGLE_1STPERSON;
			Renderer.vFov = 50;
			Renderer.resize();
			this.zoomStepMult = 0.3;
			this.state = this.states.first_person;
			if(Session.Entity){
				Session.Entity.hideEntity = true;
			}
		}
	} else if (this.enable3RDPerson &&  this.zoomFinal < (Math.abs(this.altitudeRange) * C_THIRDPERSON_TRESHOLD_ZOOM)){
		if(this.state != this.states.third_person){
			this.MIN_V_ANGLE = C_MIN_V_ANGLE_3RDPERSON;
			this.MAX_V_ANGLE = C_MAX_V_ANGLE_3RDPERSON;
			Renderer.vFov = 30;
			Renderer.resize();
			this.zoomStepMult = 0.3;
			this.state = this.states.third_person;
			if(Session.Entity){
				Session.Entity.hideEntity = false;
			}
		}
	} else {
		if(this.state != this.states.isometric){
			this.MIN_V_ANGLE = C_MIN_V_ANGLE_ISOMETRIC;
			this.MAX_V_ANGLE = C_MAX_V_ANGLE_ISOMETRIC;
			Renderer.vFov = 15;
			Renderer.resize();
			this.zoomStepMult = 1;
			this.state = this.states.isometric;
			if(Session.Entity){
				Session.Entity.hideEntity = false;
			}
		}
	}
}

Camera.update = function Update( tick )
{
	var lerp      = Math.min( (tick - Camera.lastTick) * 0.006, 1.0);
	Camera.lastTick = tick;
	if (Camera.action.x !== -1 && Camera.action.y !== -1 && Camera.action.active) {
		Camera.processMouseAction();
	}
	Camera.processQuake( tick );
	if (Preferences.Camera.smooth && Camera.state != Camera.states.first_person) {
		Camera.position[0] += ( -Camera.target.position[0] - Camera.position[0] ) * lerp ;
		Camera.position[1] += ( -Camera.target.position[1] - Camera.position[1] ) * lerp ;
		Camera.position[2] += (  Camera.target.position[2] - Camera.position[2] ) * lerp ;
	}else {
		Camera.position[0] = -Camera.target.position[0];
		Camera.position[1] = -Camera.target.position[1];
		Camera.position[2] =  Camera.target.position[2];
	}
	Camera.zoom        += ( Camera.zoomFinal - Camera.zoom ) * lerp * 2.0;
	var zOffset = 0;
	if(Camera.state == Camera.states.first_person){
		zOffset = 2;
	} else if (Camera.state == Camera.states.third_person && Camera.zoomFinal < (Math.abs(Camera.altitudeRange) * C_THIRDPERSON_TRESHOLD_ZOOM) ){
		zOffset = 1.5;
	}
	// console.log(Camera.zoomFinal);
	Camera.angle[0]    += ( Camera.angleFinal[0] - Camera.angle[0] ) * lerp * 2.0;
	Camera.angle[1]    += ( Camera.angleFinal[1] - Camera.angle[1] ) * lerp * 2.0;
	Camera.angle[0]    %=   360;
	Camera.angle[1]    %=   360;
	Camera.direction    = Math.floor( ( Camera.angle[1] + 22.5 ) / 45 ) % 8;
	var matrix = Camera.modelView;
	mat4.identity( matrix );
	translateZ_m4( matrix, (Camera.altitudeFrom - Camera.zoom) / 2);
	mat4.rotateX( matrix, matrix, Camera.angle[0] / 180 * Math.PI );
	mat4.rotateY( matrix, matrix, Camera.angle[1] / 180 * Math.PI );
	_position[0] = Camera.position[0] - 0.5;
	_position[1] = Camera.position[2] + zOffset;
	_position[2] = Camera.position[1] - 0.5;
	mat4.translate( matrix, matrix, _position );
	toInverseMat3_m4(matrix, Camera.normalMat);
	mat3.transpose(Camera.normalMat, Camera.normalMat);
};

export default Camera;