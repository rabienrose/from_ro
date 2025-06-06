import * as glMatrix from 'gl-matrix';
import PathFinding from '../../utils/PathFinding.js';
import Mouse from '../../control/MouseEventHandler.js';

var Altitude = {};
Altitude.width = 0;
Altitude.height = 0;
Altitude.TYPE = {
	NONE:     1 << 0,
	WALKABLE: 1 << 1,
	WATER:    1 << 2,
	SNIPABLE: 1 << 3
};
Altitude.MAX_INTERSECT_COUNT = 200;
var _cells = null;
var _types = null;
Altitude.init = function init( data )
{
	// Extract 'type' from cells
	var cells = data.cells;
	var i, count = cells.length/5;
	var types = new Uint8Array(count);

	for (i = 0; i < count; ++i) {
		types[i] = cells[i*5+4];
	}

	// Save information
	_cells          = data.cells;
	_types          = types;
	Altitude.width  = data.width;
	Altitude.height = data.height;

	// Initialize PathFinding
	PathFinding.setGat({
		width:  Altitude.width,
		height: Altitude.height,
		cells:  types,
		types:  Altitude.TYPE
	});
};

Altitude.getCell = function getCellClosure()
{
	var tmp = new Float32Array(5);

	return function getCell(x, y)
	{
		var index = (Math.floor(x) + Math.floor(y) * Altitude.width) * 5;

		tmp[0] = _cells[index+0];
		tmp[1] = _cells[index+1];
		tmp[2] = _cells[index+2];
		tmp[3] = _cells[index+3];
		tmp[4] = _cells[index+4];

		return tmp;
	};
}();

Altitude.getCellType = function getCellType(x, y)
{
	return _types[ x + y * Altitude.width ];
};

Altitude.getCellHeight = function getCellHeight( x, y )
{
	// Map not loaded yet ?
	if (!_cells) {
		return 0.0;
	}

	var index, x1, x2;

	// Should be at the middle of the cell
	x     += 0.5;
	y     += 0.5;

	index  = (Math.floor(x) + Math.floor(y) * Altitude.width) * 5;

	x     %= 1.0;
	y     %= 1.0;

	x1     = _cells[index+0] + (_cells[index+1]-_cells[index+0]) * x;
	x2     = _cells[index+2] + (_cells[index+3]-_cells[index+2]) * x;

	return - (x1 + ( x2 - x1 ) * y);
};

const TYPE_TABLE = {
	0: Altitude.TYPE.WALKABLE | Altitude.TYPE.SNIPABLE,                  // walkable ground
	1: Altitude.TYPE.NONE,                                          // non-walkable ground
	2: Altitude.TYPE.WALKABLE | Altitude.TYPE.SNIPABLE,                  // ???
	3: Altitude.TYPE.WALKABLE | Altitude.TYPE.SNIPABLE | Altitude.TYPE.WATER, // walkable water
	4: Altitude.TYPE.WALKABLE | Altitude.TYPE.SNIPABLE,                  // ???
	5: Altitude.TYPE.SNIPABLE,                                      // gat (snipable)
	6: Altitude.TYPE.WALKABLE | Altitude.TYPE.SNIPABLE,                  // ???

	/* Taken from Grf Editor */
	[-1]: Altitude.TYPE.NONE,                                       // NoGat (-1)
		[0x80000000]: Altitude.TYPE.WALKABLE | Altitude.TYPE.SNIPABLE,  // Weird0 (Int32.MinValue)
		[0x80000001]: Altitude.TYPE.NONE,                               // Weird1
		[0x80000002]: Altitude.TYPE.WALKABLE | Altitude.TYPE.SNIPABLE,  // Weird2
		[0x80000003]: Altitude.TYPE.WALKABLE | Altitude.TYPE.SNIPABLE | Altitude.TYPE.WATER, // Weird3
		[0x80000004]: Altitude.TYPE.NONE,                               // Weird4
		[0x80000005]: Altitude.TYPE.WALKABLE | Altitude.TYPE.SNIPABLE,  // Weird5
		[0x80000006]: Altitude.TYPE.WALKABLE | Altitude.TYPE.SNIPABLE,  // Weird6
		[0x80000007]: Altitude.TYPE.NONE,                               // Weird7
		[0x80000008]: Altitude.TYPE.NONE,                               // Weird8
		[0x80000009]: Altitude.TYPE.NONE                                // Weird9
};

Altitude.setCellType = function setCellType(x, y, type){
	_types[ x + y * Altitude.width ] = TYPE_TABLE[type];
	PathFinding.updateGat(x, y, TYPE_TABLE[type]);
}

Altitude.intersect = function intersectClosure()
{
	var mat4    = glMatrix.mat4;
	var vec3    = glMatrix.vec3;
	var vec4    = glMatrix.vec4;

	var _from   = vec3.create();
	var _to     = vec4.create();
	var _unit   = vec3.create();
	var _matrix = mat4.create();

	return function intersect( modelView, projection, out )
	{
		var i, count = Altitude.MAX_INTERSECT_COUNT;

		// Extract camera position
		mat4.invert( _matrix, modelView );
		_from[0] = _matrix[12];
		_from[1] = _matrix[13];
		_from[2] = _matrix[14];

		// set two vectors with opposing z values
		_to[0] = (Mouse.screen.x / Mouse.screen.width)  * 2 - 1;
		_to[1] =-(Mouse.screen.y / Mouse.screen.height) * 2 + 1;
		_to[2] =  1.0;
		_to[3] =  1.0;

		// Unproject
		mat4.multiply( _matrix, projection, modelView);
		mat4.invert( _matrix, _matrix );
		vec4.transformMat4( _to, _to, _matrix );

		_to[0] /= _to[3];
		_to[1] /= _to[3];
		_to[2] /= _to[3];

		// Extract direction
		vec3.sub( _unit, _to, _from );
		vec3.normalize(_unit, _unit);

		// Search
		for (i = 0; i < count; ++i) {
			_from[0] += _unit[0];
			_from[1] += _unit[1];
			_from[2] += _unit[2];

			if (Math.abs(Altitude.getCellHeight( _from[0], _from[2]) + _from[1]) < 0.5) {
				out[0] = _from[0];
				out[1] = _from[2];
				return true;
			}
		}

		return false;
	};
}();

Altitude.generatePlane = function generatePlaneClosure()
{
	var buffer1x1   = new Float32Array(1*1*30);
	var buffer5x5   = new Float32Array(5*5*30);
	var buffer7x7   = new Float32Array(7*7*30);
	var buffer13x13 = new Float32Array(13*13*30);

	return function generatePlane(pos_x, pos_y, size)
	{
		if (!_cells) {
			return null;
		}

		var x, y, index, i;
		var buffer;
		var middle = Math.floor(size / 2);

		pos_x  = Math.floor(pos_x);
		pos_y  = Math.floor(pos_y);
		i      = 0;

		// Avoid memory allocation
		switch (size) {
			case 1:  buffer = buffer1x1;   break;
			case 5:  buffer = buffer5x5;   break;
			case 7:  buffer = buffer7x7;   break;
			case 13: buffer = buffer13x13; break;
			default:
				buffer = new Float32Array(size*size*30);
				break;
		}

		for (x = -middle; x <= middle; ++x) {
			for (y = -middle; y <= middle; ++y, i+=30) {

				index = ((pos_x + x) + ( pos_y + y) * Altitude.width) * 5;

				// Triangle 1
				buffer[i+0 ] = pos_x + x + 0;
				buffer[i+1 ] = _cells[index+0];
				buffer[i+2 ] = pos_y + y + 0;
				buffer[i+3 ] = (x + 0 + middle) / size;
				buffer[i+4 ] = (y + 0 + middle) / size;

				buffer[i+5 ] = pos_x + x + 1;
				buffer[i+6 ] = _cells[index+1];
				buffer[i+7 ] = pos_y + y + 0;
				buffer[i+8 ] = (x + 1 + middle) / size;
				buffer[i+9 ] = (y + 0 + middle) / size;

				buffer[i+10] = pos_x + x + 1;
				buffer[i+11] = _cells[index+3];
				buffer[i+12] = pos_y + y + 1;
				buffer[i+13] = (x + 1 + middle) / size;
				buffer[i+14] = (y + 1 + middle) / size;

				// Triangle 2
				buffer[i+15] = pos_x + x + 1;
				buffer[i+16] = _cells[index+3];
				buffer[i+17] = pos_y + y + 1;
				buffer[i+18] = (x + 1 + middle) / size;
				buffer[i+19] = (y + 1 + middle) / size;

				buffer[i+20] = pos_x + x + 0;
				buffer[i+21] = _cells[index+2];
				buffer[i+22] = pos_y + y + 1;
				buffer[i+23] = (x + 0 + middle) / size;
				buffer[i+24] = (y + 1 + middle) / size;

				buffer[i+25] = pos_x + x + 0;
				buffer[i+26] = _cells[index+0];
				buffer[i+27] = pos_y + y + 0;
				buffer[i+28] = (x + 0 + middle) / size;
				buffer[i+29] = (y + 0 + middle) / size;
			}
		}

		return buffer;
	};
}();

export default Altitude;