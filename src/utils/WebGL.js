import Texture from './Texture';

function getContext( canvas, parameters )
{
	var gl = null;
	var args = ['webgl2', 'webgl'];
	var i, count = args.length;
	if (!parameters) {
		parameters = {
			alpha:              false,
			depth:              true,
			stencil:            false,
			antialias:          false,
			premultipliedAlpha: false,
			preserveDrawingBuffer: true,
		};
	}
	if (canvas.getContext && window.WebGLRenderingContext) {
		for (i = 0; i < count; ++i) {
			try {
				gl = canvas.getContext( args[i], parameters );
				if (gl)
					break;
			} catch(e) {}
		}
	}
	if (!gl) {
		throw new Error('WebGL::getContext() - Can\'t find a valid context, is WebGL supported ?');
	}
	return gl;
}

function compileShader( gl, source, type)
{
	var shader, error;
	shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		error = gl.getShaderInfoLog(shader);
		gl.deleteShader(shader);
		throw new Error('WebGL::CompileShader() - Fail to compile shader : ' + error);
	}
	return shader;
}

function createShaderProgram( gl, vertexShader, fragmentShader )
{
	var shaderProgram,
			vs, fs,
		attrib, uniform,
		i, count,
		error;
	shaderProgram = gl.createProgram();
	vs = compileShader( gl, vertexShader  , gl.VERTEX_SHADER );
	fs = compileShader( gl, fragmentShader, gl.FRAGMENT_SHADER );
	gl.attachShader(shaderProgram, vs);
	gl.attachShader(shaderProgram, fs);
	gl.linkProgram(shaderProgram);
	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		error = gl.getProgramInfoLog(shaderProgram);
		gl.deleteProgram(shaderProgram);
		gl.deleteShader(vs);
		gl.deleteShader(fs);
		throw new Error('WebGL::CreateShaderProgram() - Fail to link shaders : ' + error);
	}
	count = gl.getProgramParameter(shaderProgram, gl.ACTIVE_ATTRIBUTES);
	shaderProgram.attribute = {};
	for (i = 0; i < count; i++) {
		attrib = gl.getActiveAttrib(shaderProgram, i);
		shaderProgram.attribute[attrib.name] = gl.getAttribLocation(shaderProgram, attrib.name);
	}
	count = gl.getProgramParameter(shaderProgram, gl.ACTIVE_UNIFORMS);
	shaderProgram.uniform = {};
	for (i = 0; i < count; i++) {
		uniform = gl.getActiveUniform(shaderProgram, i);
		shaderProgram.uniform[uniform.name] = gl.getUniformLocation(shaderProgram, uniform.name);
	}
	return shaderProgram;
}

function toPowerOfTwo( num )
{
	return Math.pow( 2, Math.ceil( Math.log(num)/Math.log(2) ) );
}

function texture( gl, url, callback )
{
	var args = Array.prototype.slice.call(arguments, 3);
	Texture.load( url, function( success ) {
		if (!success) {
			return;
		}
		var canvas, ctx, texture;
		canvas        = document.createElement('canvas');
		canvas.width  = toPowerOfTwo(this.width);
		canvas.height = toPowerOfTwo(this.height);
		ctx           = canvas.getContext('2d');
		ctx.drawImage( this, 0, 0, canvas.width, canvas.height );
		texture = gl.createTexture();
		gl.bindTexture( gl.TEXTURE_2D, texture );
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.generateMipmap( gl.TEXTURE_2D );
		args.unshift( texture );
		callback.apply( null, args );
	});
}

export default {
	getContext,
	compileShader,
	createShaderProgram,
	toPowerOfTwo,
	texture,
};
