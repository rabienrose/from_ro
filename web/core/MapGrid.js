
import WebGL from "../../src/utils/WebGL.js";
import * as THREE from 'three';


var _vertexShader   = `
	#version 100
	#pragma vscode_glsllint_stage : vert
	precision highp float;
	attribute vec3 aPosition;
	uniform mat4 uModelViewMat;
	uniform mat4 uProjectionMat;

	void main(void) {
    gl_PointSize = 5.0;
		gl_Position     = uProjectionMat * uModelViewMat * vec4( aPosition, 1.0);
	}
`;

var _fragmentShader = `
	#version 100
	#pragma vscode_glsllint_stage : frag
	precision highp float;

	void main(void) {
		gl_FragColor = vec4(1.0, 0, 0, 0.2);
	}
`;

var MapGrid = {};
var _program = null;
var _buffer = null;
var _vertCount=0;

MapGrid.init = function(gl, data, threejs_scene) {
  if (!_buffer) {
		_buffer = gl.createBuffer();
	}
	if (!_program) {
		_program = WebGL.createShaderProgram( gl, _vertexShader, _fragmentShader );
	}

	gl.bindBuffer( gl.ARRAY_BUFFER, _buffer );
	var mesh = data.mesh;
	var groupSize = 72;
	var numGroups = Math.floor(mesh.length / groupSize);
	var buf = new Float32Array(numGroups * 3);
	for (var i = 0; i < numGroups; ++i) {
		buf[i * 3 + 0] = mesh[i * groupSize + 0];
		buf[i * 3 + 1] = mesh[i * groupSize + 1]-0.1;
		buf[i * 3 + 2] = mesh[i * groupSize + 2];
	}

	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute('position', new THREE.BufferAttribute(buf, 3));
	const material = new THREE.PointsMaterial({ color: 0x00ff00, size: 1, opacity: 0.5, transparent: true });
	const points = new THREE.Points(geometry, material);
	threejs_scene.add(points);

	_vertCount = numGroups;
	gl.bufferData( gl.ARRAY_BUFFER, buf, gl.STATIC_DRAW );
}

MapGrid.render = function(gl, modelView, projection) {
  var uniform = _program.uniform;
	var attribute = _program.attribute;
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.useProgram( _program );
	gl.uniformMatrix4fv( uniform.uModelViewMat,  false, modelView );
	gl.uniformMatrix4fv( uniform.uProjectionMat, false, projection );
	gl.enableVertexAttribArray( attribute.aPosition );
	gl.bindBuffer( gl.ARRAY_BUFFER, _buffer );
	gl.vertexAttribPointer( attribute.aPosition,       3, gl.FLOAT, false, 3*4,  0   );
	gl.uniform1i( uniform.uTileColor, 2 );
	gl.drawArrays(  gl.POINTS, 0, _vertCount );
	gl.disableVertexAttribArray( attribute.aPosition );
	gl.disable(gl.BLEND);
}

function free( gl )
{
	if (_buffer) {
		gl.deleteBuffer( _buffer );
		_buffer = null;
	}
	_vertCount = 0;
}

export default MapGrid;