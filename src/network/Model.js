import BinaryReader from '../utils/BinaryReader.js';
import { calcNormal_v3, extractRotation_m4, toMat4_m3 } from '../utils/glm_ex.js';
import * as glMatrix from 'gl-matrix';

var vec3 = glMatrix.vec3;
var mat4 = glMatrix.mat4;

function RSM( data )
{
	if (data) {
		this.load(data);
	}
}

RSM.SHADING = {
	NONE:   0,
	FLAT:   1,
	SMOOTH: 2
};

RSM.Box = function BoundingBox()
{
	this.max    = vec3.fromValues( -Infinity, -Infinity, -Infinity );
	this.min    = vec3.fromValues(  Infinity,  Infinity,  Infinity );
	this.offset = vec3.create();
	this.range  = vec3.create();
	this.center = vec3.create();
};

RSM.prototype.load = function Load( data )
{
	var fp, header;
	var i, count;
	var nodes, posKeyframes, volumebox;
	var textures = [];
	var additionalTextures = [];
	fp      = new BinaryReader(data);
	header  = fp.getBinaryString(4);
	if (header !== 'GRSM' && header !== "GRSX") {
		throw new Error('RSM::load() - Incorrect header "' + header + '", must be "GRSM"');
	}
	this.version    = fp.getInt8() + fp.getInt8()/10;
	this.animLen    = fp.getInt32();
	this.shadeType  = fp.getInt32();
	this.main_node  = null;
	this.alpha      =   ( this.version >= 1.4 ) ? fp.getUint8() / 255.0 : 1.0;
	if (this.version >= 2.3) {
		this.frameRatePerSecond = fp.getFloat32();
		count = fp.getInt32();

		for (var i = 0; i < count; i++) {
			textures.push(fp.getBinaryString(fp.getInt32()));
		}
	}else if (this.version >= 2.2) {
		this.frameRatePerSecond = fp.getFloat32();
		count     = fp.getInt32();
		for (i = 0; i < count; ++i) {
			additionalTextures.push(fp.getBinaryString(fp.getInt32()));
		}
		count = fp.getInt32();
		for (var i = 0; i < count; i++) {
			textures.push(fp.getBinaryString(fp.getInt32()));
		}
	}else {
		fp.seek(16, BinaryReader.SEEK_CUR);
		count     = fp.getInt32();
		for (i = 0; i < count; ++i) {
			additionalTextures.push(fp.getBinaryString(40));
		}
		textures.push(fp.getBinaryString(40));
	}
	count = fp.getInt32();
	nodes  =  new Array(count);
	for (i = 0; i < count; ++i) {
		nodes[i] =  new RSM.Node( this, fp, count === 1 );
		if (nodes[i].name === textures) {
			this.main_node = nodes[i];
		}
	}
	if (this.main_node === null) {
		this.main_node = nodes[0];
	}
	if (this.version < 1.6) {
		count         = fp.getInt32();
		posKeyframes  = new Array(count);

		for (i = 0; i < count; ++i) {
			posKeyframes[i] = {
				frame: fp.getInt32(),
				px:    fp.getFloat32(),
				py:    fp.getFloat32(),
				pz:    fp.getFloat32(),
				data:  fp.getFloat32()
			};
		}
		this.posKeyframes = posKeyframes;
	} else {
		this.posKeyframes = [];
	}
	count       = (fp.offset >= fp.length) ? 0 : fp.getInt32();
	volumebox   = new Array(count);
	for (i = 0; i < count; ++i) {
		volumebox[i] = {
			size: [ fp.getFloat32(), fp.getFloat32(), fp.getFloat32() ],
			pos:  [ fp.getFloat32(), fp.getFloat32(), fp.getFloat32() ],
			rot:  [ fp.getFloat32(), fp.getFloat32(), fp.getFloat32() ],
			flag: ( this.version >= 1.3 ) ? fp.getInt32() : 0
		};
	}
	this.textures     = additionalTextures;
	this.nodes        = nodes;
	if (this.version >= 2.3) {
		for (i = 0; i < this.main_node.textures.length; i++) {
			if (!this.textures.includes(this.main_node.textures[i])) {
				let texture = this.main_node.textures[i];
				this.textures.push(texture);
				this.main_node.textures[i] = this.textures.indexOf(texture);
			}
		}
		this.nodes.forEach(node => {
			for (i = 0; i < node.textures.length; i++) {
				if (typeof node.textures[i] !== "number") {
					let texture = node.textures[i];
					if (!this.textures.includes(texture)) {
						this.textures.push(texture);
					}
					node.textures[i] = this.textures.indexOf(texture);
				}
			}
		});
	}
	this.volumebox    = volumebox;
	this.instances    = [];
	this.box          = new RSM.Box();
	this.calcBoundingBox();
};

RSM.prototype.createInstance = function CreateInstance( model, width, height )
{
	var matrix = mat4.create();
	mat4.identity( matrix );
	mat4.translate( matrix, matrix, [ model.position[0] + width, model.position[1], model.position[2] + height ] );
	mat4.rotateZ(   matrix, matrix,  model.rotation[2]/180*Math.PI );
	mat4.rotateX(   matrix, matrix, model.rotation[0]/180*Math.PI );
	mat4.rotateY(   matrix, matrix, model.rotation[1]/180*Math.PI );
	mat4.scale(     matrix, matrix, model.scale );
	if (this.main_node.main.version >= 2.2) {
		mat4.scale(matrix, matrix, this.main_node.flip);
		mat4.translate(matrix, matrix, this.main_node.offset);
		mat4.translate(matrix, matrix, [0.0, this.box.range[1], 0.0]);
		mat4.translate(matrix, matrix, this.box.offset);
	}
	this.instances.push(matrix);
};

RSM.prototype.calcBoundingBox = function CalcBoundingBox()
{
	var i, j, count;
	var box         = this.box;
	var matrix      = mat4.create();
	var nodes       = this.nodes;
	var min = Math.min, max = Math.max;
	count           = nodes.length;
	mat4.identity(matrix);
	this.main_node.calcBoundingBox(matrix);
	for (i = 0; i < 3; ++i) {
		for (j = 0; j < count; ++j) {
			box.max[i] = max( box.max[i], nodes[j].box.max[i] );
			box.min[i] = min( box.min[i], nodes[j].box.min[i] );
		}
		box.offset[i] = (box.max[i] + box.min[i]) / 2.0;
		box.range[i]  = (box.max[i] - box.min[i]) / 2.0;
		box.center[i] =  box.min[i] + box.range[i]     ;
	}
};

RSM.prototype.compile = function Compile()
{
	var nodes     = this.nodes;
	var instances = this.instances;
	var node_count     = nodes.length;
	var instance_count = instances.length;
	var i, j, k;
	var meshes = new Array(node_count * instance_count);
	for (i = 0, k = 0; i < node_count; ++i) {
		for ( j = 0; j < instance_count; ++j, k++) {
			meshes[k] = nodes[i].compile( instances[j] );
		}
	}
	return {
		meshes:    meshes,
		textures:  this.textures
	};
};

RSM.Node = function Node( rsm, fp, only ) {
	var i, j, count, version = rsm.version;
	var vertices, tvertices, faces, posKeyframes, rotKeyframes, scaleKeyFrames, textureKeyFrameGroup;
	var textures = [];
	this.main     =  rsm;
	this.is_only  =  only;
	if (version >= 2.2) {
		this.name = fp.getBinaryString(fp.getInt32());
		this.parentname = fp.getBinaryString(fp.getInt32());
	} else {
		this.name = fp.getBinaryString(40);
		this.parentname = fp.getBinaryString(40);
	}
	count = fp.getInt32();
	textures = new Array(count);
	for (let i = 0; i < count; i++) {
			textures[i] = version >= 2.3 ? fp.getBinaryString(fp.getInt32()) : fp.getInt32();
	}
	this.mat3 = [
		fp.getFloat32(), fp.getFloat32(), fp.getFloat32(),
		fp.getFloat32(), fp.getFloat32(), fp.getFloat32(),
		fp.getFloat32(), fp.getFloat32(), fp.getFloat32()
	];
	this.offset = [fp.getFloat32(), fp.getFloat32(), fp.getFloat32()];
	if (version >= 2.2) {
		this.pos = [0, 0, 0];
		this.rotangle = 0;
		this.rotaxis = [0, 0, 0];
		this.scale = [1, 1, 1];
		this.flip = [1, -1, 1];
	} else {
		this.pos = [fp.getFloat32(), fp.getFloat32(), fp.getFloat32()];
		this.rotangle = fp.getFloat32();
		this.rotaxis = [fp.getFloat32(), fp.getFloat32(), fp.getFloat32()];
		this.scale = [fp.getFloat32(), fp.getFloat32(), fp.getFloat32()];
		this.flip = [1, 1, 1];
	}
	count = fp.getInt32();
	vertices = new Array(count);
	for (i = 0; i < count; ++i) {
		vertices[i] = [fp.getFloat32(), fp.getFloat32(), fp.getFloat32()];
	}
	count = fp.getInt32();
	tvertices = new Float32Array(count * 6);
	for (i = 0, j = 0; i < count; ++i, j += 6) {
		if (version >= 1.2) {
			tvertices[j + 0] = fp.getUint8() / 255;
			tvertices[j + 1] = fp.getUint8() / 255;
			tvertices[j + 2] = fp.getUint8() / 255;
			tvertices[j + 3] = fp.getUint8() / 255;
		}
		tvertices[j + 4] = fp.getFloat32() * 0.98 + 0.01;
		tvertices[j + 5] = fp.getFloat32() * 0.98 + 0.01;
	}
	count = fp.getInt32();
	faces = new Array(count);
	for (i = 0; i < count; ++i) {
		var len = -1;
		if (version >= 2.2) {
			len = fp.getInt32();
		}
		faces[i] = {
					vertidx: [fp.getUint16(), fp.getUint16(), fp.getUint16()],
					tvertidx: [fp.getUint16(), fp.getUint16(), fp.getUint16()],
					texid: fp.getUint16(),
					padding: fp.getUint16(),
					twoSide: fp.getInt32()
		};
		if (version >= 1.2) {
			faces[i].smoothGroup = fp.getInt32();
			if (len > 24) {
				faces[i].smoothGroup_1 = fp.getInt32();
			}
			if (len > 28) {
				faces[i].smoothGroup_2 = fp.getInt32();
			}
			if (len > 32) {
				fp.seek(len - 32, BinaryReader.SEEK_CUR);
			}
		}
	}
	if (version >= 1.6) {
		count = fp.getInt32();
		scaleKeyFrames = new Array(count);
		for (i = 0; i < count; i++) {
			scaleKeyFrames[i] = {
				Frame: fp.getInt32(),
				Scale: [fp.getFloat32(), fp.getFloat32(), fp.getFloat32()],
				Data: fp.getFloat32()
			}
		}
	}
	count = fp.getInt32();
	rotKeyframes = new Array(count);
	for (i = 0; i < count; ++i) {
		rotKeyframes[i] = {
			frame: fp.getInt32(),
			q: [fp.getFloat32(), fp.getFloat32(), fp.getFloat32(), fp.getFloat32()]
		};
	}
	if (version >= 2.2) {
		count = fp.getInt32();
		posKeyframes = new Array(count);
		for (i = 0; i < count; ++i) {
			posKeyframes[i] = {
				frame: fp.getInt32(),
				px: fp.getFloat32(),
				py: fp.getFloat32(),
				pz: fp.getFloat32(),
				Data: fp.getInt32()
			};
		}
	}
	if (version >= 2.3) {
			count = fp.getInt32();
			textureKeyFrameGroup = new Array(count);
			for (i = 0; i < count; ++i) {
					var textureId = fp.getInt32();
					var amountTextureAnimations = fp.getInt32();
					if (!textureKeyFrameGroup[i]) {
							textureKeyFrameGroup[i] = [];
					}
					if (!textureKeyFrameGroup[i][textureId]) {
							textureKeyFrameGroup[i][textureId] = [];
					}
					for (var j = 0; j < amountTextureAnimations; ++j) {
							var type = fp.getInt32();
							var amountFrames = fp.getInt32();
							if (!textureKeyFrameGroup[i][textureId][type]) {
									textureKeyFrameGroup[i][textureId][type] = [];
							}
							for (var k = 0; k < amountFrames; ++k) {
									textureKeyFrameGroup[i][textureId][type].push({
											frame: fp.getInt32(),
											offset: fp.getFloat32()
									});
							}
					}
			}
	}
	this.box = new RSM.Box();
	this.matrix = mat4.create();
	this.textures = textures;
	this.vertices = vertices;
	this.tvertices = tvertices;
	this.faces = faces;
	this.rotKeyframes = rotKeyframes;
	this.posKeyframes = posKeyframes;
	this.scaleKeyFrames = scaleKeyFrames;
	this.textureKeyFrameGroup = textureKeyFrameGroup;
};

RSM.Node.prototype.calcBoundingBox = function NodeCalcBoundingBox( _matrix )
{
	var i, j, count;
	var v = vec3.create();
	var box      = this.box;
	var nodes    = this.main.nodes;
	var matrix   = mat4.create();
	var vertices = this.vertices;
	var max = Math.max, min = Math.min;
	var x, y, z;
	mat4.copy( this.matrix, _matrix );
	mat4.translate( this.matrix, this.matrix, this.pos );
	if (!this.rotKeyframes.length) {
		mat4.rotate( this.matrix, this.matrix, this.rotangle, this.rotaxis );
	}
	else {
		rotateQuat_m4( this.matrix, this.matrix, this.rotKeyframes[0].q );
	}
	mat4.scale( this.matrix, this.matrix, this.scale );
	mat4.copy( matrix, this.matrix );
	if (!this.is_only) {
		mat4.translate( matrix, matrix, this.offset );
	}
	mat4.multiply( matrix, matrix, toMat4_m3(this.mat3) );
	for (i = 0, count = vertices.length; i < count; ++i) {
		x = vertices[i][0];
		y = vertices[i][1];
		z = vertices[i][2];
		v[0] = matrix[0] * x + matrix[4] * y + matrix[8]  * z + matrix[12];
		v[1] = matrix[1] * x + matrix[5] * y + matrix[9]  * z + matrix[13];
		v[2] = matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14];
		for (j = 0; j < 3; j++) {
			box.min[j] = min(v[j], box.min[j]);
			box.max[j] = max(v[j], box.max[j]);
		}
	}
	for (i = 0; i < 3; i++) {
		box.offset[i] = (box.max[i] + box.min[i]) / 2.0;
		box.range[i]  = (box.max[i] - box.min[i]) / 2.0;
		box.center[i] =  box.min[i] + box.range[i]     ;
	}
	for (i = 0, count = nodes.length; i < count; ++i) {
		if (nodes[i].parentname === this.name && this.name !== this.parentname) {
			nodes[i].calcBoundingBox( this.matrix );
		}
	}
};

RSM.Node.prototype.compile = function( instance_matrix )
{
	var matrix;
	var modelViewMat = mat4.create();
	var normalMat    = mat4.create();
	var textures     = this.textures;
	var faces        = this.faces;
	var vertices     = this.vertices;
	var mesh      = {};
	var mesh_size = [];
	var vert, face_normal;
	var shadeGroup     = new Array(32);
	var shadeGroupUsed = new Array(32);
	var i, x, y, z, count;
	matrix = mat4.create();
	mat4.identity( matrix );
	mat4.translate( matrix, matrix, [ -this.main.box.center[0], -this.main.box.max[1], -this.main.box.center[2] ] );
	mat4.multiply( matrix, matrix, this.matrix );
	if (!this.is_only) {
		mat4.translate( matrix, matrix, this.offset );
	}
	mat4.multiply( matrix, matrix, toMat4_m3(this.mat3) );
	mat4.multiply( modelViewMat, instance_matrix, matrix );
	extractRotation_m4( normalMat, modelViewMat );
	count = vertices.length;
	vert  = new Float32Array(count*3);
	for (i = 0; i < count; ++i) {
		x = vertices[i][0];
		y = vertices[i][1];
		z = vertices[i][2];
		vert[i*3+0] = modelViewMat[0] * x + modelViewMat[4] * y + modelViewMat[8]  * z + modelViewMat[12];
		vert[i*3+1] = modelViewMat[1] * x + modelViewMat[5] * y + modelViewMat[9]  * z + modelViewMat[13];
		vert[i*3+2] = modelViewMat[2] * x + modelViewMat[6] * y + modelViewMat[10] * z + modelViewMat[14];
	}
	face_normal = new Float32Array(faces.length*3);
	for (i = 0, count = textures.length; i < count; ++i) {
		mesh_size[ textures[i] ] = 0;
	}
	for (i = 0, count = faces.length; i < count; ++i) {
		mesh_size[ textures[ faces[i].texid ] ]++;
	}
	for (i = 0, count = textures.length; i < count; ++i) {
		mesh[textures[i]] = new Float32Array(mesh_size[textures[i]]*9*3);
	}
	switch (this.main.shadeType) {
		default:
		case RSM.SHADING.NONE:
			this.calcNormal_NONE( face_normal );
			this.generate_mesh_FLAT( vert, face_normal, mesh );
			break;
		case RSM.SHADING.FLAT:
			this.calcNormal_FLAT( face_normal, normalMat, shadeGroupUsed );
			this.generate_mesh_FLAT( vert, face_normal, mesh );
			break;
		case RSM.SHADING.SMOOTH:
			this.calcNormal_FLAT( face_normal, normalMat, shadeGroupUsed );
			this.calcNormal_SMOOTH( face_normal, shadeGroupUsed, shadeGroup );
			this.generate_mesh_SMOOTH( vert, shadeGroup, mesh );
			break;
	}
	return mesh;
};

RSM.Node.prototype.calcNormal_NONE = function calcNormalNone( out )
{
	var i, count;
	for (i = 1, count = out.length; i < count; i+= 3) {
		out[i] = -1;
	}
};

RSM.Node.prototype.calcNormal_FLAT = function calcNormalFlat( out, normalMat, groupUsed)
{
	var i, j, count;
	var face;
	var temp_vec = vec3.create();
	var faces    = this.faces;
	var vertices = this.vertices;
	for (i = 0, j = 0, count = faces.length; i < count; ++i, j+=3) {
		face = faces[i];
		calcNormal_v3(
			vertices[ face.vertidx[0] ],
			vertices[ face.vertidx[1] ],
			vertices[ face.vertidx[2] ],
			temp_vec
		);
		out[j  ] = normalMat[0] * temp_vec[0] + normalMat[4] * temp_vec[1] + normalMat[8]  * temp_vec[2] + normalMat[12];
		out[j+1] = normalMat[1] * temp_vec[0] + normalMat[5] * temp_vec[1] + normalMat[9]  * temp_vec[2] + normalMat[13];
		out[j+2] = normalMat[2] * temp_vec[0] + normalMat[6] * temp_vec[1] + normalMat[10] * temp_vec[2] + normalMat[14];
		groupUsed[face.smoothGroup] = true;
	}
};

RSM.Node.prototype.calcNormal_SMOOTH = function calcNormalSmooth(normal, groupUsed, group)
{
	var i, j, k, l, v, x, y, z, len;
	var size  = this.vertices.length;
	var faces = this.faces;
	var face, norm;
	var count = faces.length;
	for (j = 0; j < 32; ++j) {
		if (!groupUsed[j]) {
			continue;
		}
		group[j] = new Float32Array(size*3);
		norm     = group[j];
		for (v = 0, l = 0; v < size; ++v, l+=3) {
			x = 0;
			y = 0;
			z = 0;
			for (i = 0, k = 0; i < count; ++i, k+=3) {
				face = faces[i];
				if (face.smoothGroup === j && (face.vertidx[0] === v || face.vertidx[1] === v || face.vertidx[2] === v)) {
					x += normal[k  ];
					y += normal[k+1];
					z += normal[k+2];
				}
			}
			len = 1 / Math.sqrt(x*x + y*y + z*z);
			norm[l  ] = x * len;
			norm[l+1] = y * len;
			norm[l+2] = z * len;
		}
	}
};

RSM.Node.prototype.generate_mesh_FLAT = function generateMeshFlat( vert, norm, mesh )
{
	var a, b, o, i, j, k, t, count;
	var faces    = this.faces;
	var textures = this.textures;
	var tver     = this.tvertices;
	var alpha    = this.main.alpha;
	var offset   = [];
	var face, idx, tidx, out;
	for (i = 0, count = textures.length; i < count; ++i) {
		offset[ textures[i] ] = 0;
	}
	for (i = 0, o = 0, k = 0, count = faces.length; i < count; ++i, k+=3) {
		face = faces[i];
		idx  = face.vertidx;
		tidx = face.tvertidx;
		t    = textures[face.texid];
		out  = mesh[t];
		o    = offset[t];
		for (j = 0; j < 3; j++, o+=9) {
			a =  idx[j] * 3;
			b = tidx[j] * 6;
			out[o+0]  = vert[a+0];   out[o+1]  = vert[a+1];   out[o+2] = vert[a+2];
			out[o+3]  = norm[k+0];   out[o+4]  = norm[k+1];   out[o+5] = norm[k+2];
			out[o+6]  = tver[b+4];   out[o+7]  = tver[b+5];
			out[o+8]  = alpha;
		}
		offset[t] = o;
	}
};

RSM.Node.prototype.generate_mesh_SMOOTH = function generateMeshSmooth( vert, shadeGroup, mesh )
{
	var a, b, o, i, j, t, count;
	var faces    = this.faces;
	var textures = this.textures;
	var tver     = this.tvertices;
	var alpha    = this.main.alpha;
	var offset   = [];
	var norm, face, idx, tidx, out;
	for (i = 0, count = textures.length; i < count; ++i) {
		offset[ textures[i] ] = 0;
	}
	for (i = 0, o = 0, count = faces.length; i < count; ++i) {
		face = faces[i];
		norm = shadeGroup[ face.smoothGroup ];
		idx  = face.vertidx;
		tidx = face.tvertidx;
		t    = textures[face.texid];
		out  = mesh[t];
		o    = offset[t];
		for (j = 0; j < 3; j++, o+=9) {
			a =  idx[j] * 3;
			b = tidx[j] * 6;
			out[o+0]  = vert[a+0];   out[o+1]  = vert[a+1];   out[o+2] = vert[a+2];
			out[o+3]  = norm[a+0];   out[o+4]  = norm[a+1];   out[o+5] = norm[a+2];
			out[o+6]  = tver[b+4];   out[o+7]  = tver[b+5];
			out[o+8]  = alpha;
		}
		offset[t] = o;
	}
};

export default RSM;
