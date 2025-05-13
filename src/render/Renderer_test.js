
import Renderer from './Renderer.js';

var test_renderer = function() {

// const canvas = document.createElement('canvas');
// canvas.style.position = 'absolute';
// canvas.style.zIndex = '-1';
// canvas.style.width = '100%';
// canvas.style.height = '100%';
// document.body.appendChild(canvas);

const gl = Renderer.gl;
// console.log("sss",Renderer.canvas.width, Renderer.canvas.height);
// gl.viewport(0, 0, Renderer.canvas.width, Renderer.canvas.height);
const vertices = [
	-0.5, -0.5, 0.0, 1.0, 0.0, 0.0, // 左下角，红色
	 0.5, -0.5, 0.0, 0.0, 1.0, 0.0, // 右下角，绿色
	 0.0,  0.5, 0.0, 0.0, 0.0, 1.0  // 顶部，蓝色
];

// 创建缓冲区
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

// 顶点着色器
const vertexShaderSource = `
	attribute vec4 aVertexPosition;
	attribute vec4 aVertexColor;
	varying vec4 vColor;
	void main(void) {
			gl_Position = aVertexPosition;
			vColor = aVertexColor;
	}
`;

// 片元着色器
const fragmentShaderSource = `
	precision mediump float;
	varying vec4 vColor;
	void main(void) {
			gl_FragColor = vColor;
	}
`;

// 编译着色器
function loadShader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
			gl.deleteShader(shader);
			return null;
	}
	return shader;
}

// 创建着色器程序
const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);

if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
	console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
}

gl.useProgram(shaderProgram);

// 获取 attribute 位置
const position = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
const color = gl.getAttribLocation(shaderProgram, 'aVertexColor');

// 设置 attribute 数据
gl.enableVertexAttribArray(position);
gl.enableVertexAttribArray(color);

gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);

// 清除画布
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// 绘制三角形
gl.drawArrays(gl.TRIANGLES, 0, 3);

}

export default {
	test_renderer,
};

