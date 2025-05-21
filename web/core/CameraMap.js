import { mat4, vec3, mat3, vec2 } from 'gl-matrix';
import { translateZ_m4, toInverseMat3_m4, perspective_custom_m4 } from '../../src/utils/glm_ex.js';
import RendererTool from './RendererTool.js';


var Camera = {};
var mousePos = { x: 0, y: 0 };
var pointer = { x: 0, y: 0 };
var btn_downs = [false, false, false];
Camera.projection = mat4.create();
Camera.modelView = mat4.create();
Camera.normalMat = mat3.create();
Camera.zoom      = 0;
Camera.angle      = vec2.create();
Camera.position = vec3.create();
Camera.vFov = 30.0;

Camera.init = function Init()
{
	Camera.angle[0]      = -95;//240.0;
	Camera.angle[1]      = 0;
	Camera.position[0] = 100;
	Camera.position[1] = 100;
	Camera.position[2] =  0;
	Camera.zoom      = 480;
	RendererTool.canvas.addEventListener('mousedown', function(e) {
    btn_downs[e.button] = true;
		Camera.onMouseDown(pointer);
  });

  RendererTool.canvas.addEventListener('mouseup', function(e) {
    btn_downs[e.button] = false;
  });

  RendererTool.canvas.addEventListener('mousemove', function(e) {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
		pointer.x = ( e.clientX / window.innerWidth ) * 2 - 1;
  	pointer.y = - ( e.clientY / window.innerHeight ) * 2 + 1;
    if (btn_downs[1]) {
      var panSpeed = 0.00055*Camera.zoom;
      const yaw = Camera.angle[1] * Math.PI / 180;
      const dx = -e.movementX*panSpeed;
      const dy = e.movementY*panSpeed;
      Camera.position[0] += dx * Math.cos(yaw) - dy * Math.sin(yaw);
      Camera.position[1] += dx * Math.sin(yaw) + dy * Math.cos(yaw);
    }

    if (btn_downs[2]) {
			
      Camera.angle[0] += e.movementY;
      Camera.angle[1] -= e.movementX;
			if(Camera.angle[0]<-180) {
				Camera.angle[0] = -180;
			}
			if(Camera.angle[0]>-90) {
				Camera.angle[0] = -90;
			}
    }
		
  });

	RendererTool.canvas.addEventListener('wheel', function(e) {
		e.preventDefault();
		const zoomSpeed = 0.3;
		Camera.zoom += e.deltaY * zoomSpeed;
		if (Camera.zoom < 10) Camera.zoom = 10;
		if (Camera.zoom > 1000) Camera.zoom = 1000;
	}, { passive: false });

	perspective_custom_m4( Camera.vFov, RendererTool.canvas.width/RendererTool.canvas.height, 10, 1000, Camera.projection );
};
var _position = vec3.create();

Camera.update = function Update( tick )
{
	_position[0] = -Camera.position[0];
	_position[1] = Camera.position[2] ;
	_position[2] = -Camera.position[1];
	Camera.angle[0]    %=   360;
	Camera.angle[1]    %=   360;

	var matrix = Camera.modelView;
	mat4.identity( matrix );
	translateZ_m4( matrix, -Camera.zoom);
	// console.log("Camera.modelView: ", matrix);
	mat4.rotateX( matrix, matrix, Camera.angle[0] / 180 * Math.PI );
	mat4.rotateY( matrix, matrix, Camera.angle[1] / 180 * Math.PI );
	mat4.translate( matrix, matrix, _position );
	
	toInverseMat3_m4(matrix, Camera.normalMat);
	mat3.transpose(Camera.normalMat, Camera.normalMat);
};

export default Camera;