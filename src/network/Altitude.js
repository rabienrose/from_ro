
import BinaryReader from '../utils/BinaryReader';

function GAT( data )
{
	if (data) {
		this.load( data );
	}
}

GAT.TYPE = {
	NONE:     1 << 0,
	WALKABLE: 1 << 1,
	WATER:    1 << 2,
	SNIPABLE: 1 << 3
};

GAT.TYPE_TABLE = {
	0: GAT.TYPE.WALKABLE | GAT.TYPE.SNIPABLE,                  // walkable ground
	1: GAT.TYPE.NONE,                                          // non-walkable ground
	2: GAT.TYPE.WALKABLE | GAT.TYPE.SNIPABLE,                  // ???
	3: GAT.TYPE.WALKABLE | GAT.TYPE.SNIPABLE | GAT.TYPE.WATER, // walkable water
	4: GAT.TYPE.WALKABLE | GAT.TYPE.SNIPABLE,                  // ???
	5: GAT.TYPE.SNIPABLE,                                      // gat (snipable)
	6: GAT.TYPE.WALKABLE | GAT.TYPE.SNIPABLE,                  // ???

	[-1]: GAT.TYPE.NONE,                                       // NoGat (-1)
		[0x80000000]: GAT.TYPE.WALKABLE | GAT.TYPE.SNIPABLE,       // Weird0 (Int32.MinValue)
		[0x80000001]: GAT.TYPE.NONE,                               // Weird1
		[0x80000002]: GAT.TYPE.WALKABLE | GAT.TYPE.SNIPABLE,       // Weird2
		[0x80000003]: GAT.TYPE.WALKABLE | GAT.TYPE.SNIPABLE | GAT.TYPE.WATER, // Weird3
		[0x80000004]: GAT.TYPE.NONE,                               // Weird4
		[0x80000005]: GAT.TYPE.WALKABLE | GAT.TYPE.SNIPABLE,       // Weird5
		[0x80000006]: GAT.TYPE.WALKABLE | GAT.TYPE.SNIPABLE,       // Weird6
		[0x80000007]: GAT.TYPE.NONE,                               // Weird7
		[0x80000008]: GAT.TYPE.NONE,                               // Weird8
		[0x80000009]: GAT.TYPE.NONE                                // Weird9
};

GAT.prototype.load = function load( data )
{
	var fp, header, cells;
	var version, width, height, i, count;
	fp        = new BinaryReader(data);
	header    = fp.getBinaryString(4);
	if ( header !== 'GRAT' ) {
		throw new Error('GAT::load() - Invalid header "'+ header + '", must be "GRAT"');
	}
	version   = fp.getUint8() + fp.getUint8()/10;
	width     = fp.getUint32();
	height    = fp.getUint32();
	cells     = new Float32Array(width * height * 5);
	for ( i=0, count=width*height; i<count; ++i ) {
		cells[i * 5 + 0] = fp.getFloat32() * 0.2;           // height 1
		cells[i * 5 + 1] = fp.getFloat32() * 0.2;           // height 2
		cells[i * 5 + 2] = fp.getFloat32() * 0.2;           // height 3
		cells[i * 5 + 3] = fp.getFloat32() * 0.2;           // height 4
		cells[i * 5 + 4] = GAT.TYPE_TABLE[fp.getUint32()]; // type
	}
	this.width   = width;
	this.height  = height;
	this.cells   = cells;
	this.version = version;
};

GAT.prototype.compile = function compile()
{
	return {
		cells:        this.cells,
		width:        this.width,
		height:       this.height,
	};
};

export default GAT;
