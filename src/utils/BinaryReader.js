import Struct from './Struct.js';

class BinaryReader {
	static SEEK_CUR = 1;
	static SEEK_SET = 2;
	static SEEK_END = 3;

	constructor( mixed, start, end ) {
		var buffer;

		if (typeof mixed === 'string') {
			var uint8;
			var i, length;

			length = mixed.length;
			buffer = new ArrayBuffer(length);
			uint8  = new Uint8Array(buffer);

			for ( i=0; i<length; ++i ) {
				uint8[i] = mixed.charCodeAt(i) & 0xff;
			}
		}
		else if (mixed instanceof ArrayBuffer) {
			buffer = mixed;
		}
		else if (mixed instanceof Uint8Array) {
			buffer = mixed.buffer;
		}
		else {
			throw new Error('BinaryReader() - Undefined buffer type');
		}

		this.bf_byteBuff = new ArrayBuffer(4);
		this.bf_wba      = new Int8Array(this.bf_byteBuff);
		this.bf_wia      = new Int32Array(this.bf_byteBuff);

		this.buffer = buffer;
		this.view   = new DataView( buffer, start || 0 , end || buffer.byteLength);
		this.offset = 0;
		this.length = ( end || buffer.byteLength ) - ( start || 0 );
	}

	getInt8(){
		return this.view.getInt8( this.offset++ );
	}

	getUint8(){
		return this.view.getUint8( this.offset++ );
	}

	getInt16(){
		var data = this.view.getInt16( this.offset, true );
		this.offset += 2;
		return data;
	}

	getUint16(){
		var data = this.view.getUint16( this.offset, true );
		this.offset += 2;
		return data;
	}

	getInt32(){
		var data = this.view.getInt32( this.offset, true );
		this.offset += 4;
		return data;
	}

	getUint32(){
		var data = this.view.getUint32( this.offset, true );
		this.offset += 4;
		return data;
	}

	getFloat32(){
		var data = this.view.getFloat32( this.offset, true );
		this.offset += 4;
		return data;
	}

	getFloat64(){
		var data = this.view.getFloat64( this.offset, true );
		this.offset += 8;
		return data;
	}

	readUInt64(){
		const left =  this.view.getUint32(this.offset, true);
		const right = this.view.getUint32(this.offset+4, true);
		const combined = left + 2**32*right; // little endian
		if (!Number.isSafeInteger(combined))
			console.warn(combined, 'exceeds MAX_SAFE_INTEGER. Precision may be lost');
		this.offset += 8;
		return combined;
	}

	tell(){
		return this.offset;
	}

	getString( len ){
		var offset = this.offset + 0;
		var i, uint8, data = new Uint8Array(len);
		for (i = 0; i < len; ++i) {
			if (!(uint8 = this.getUint8())) {
				break;
			}
			data[i] = uint8;
		}
		this.offset = offset + len;
		const decoder = new TextDecoder("utf-8");
		return decoder.decode(data.subarray(0, i));
	}

	getBinaryString( len ){
		var offset = this.offset + 0, i;
		var uint8, out = '';
		for (i = 0; i < len; ++i) {
			if (!(uint8 = this.getUint8())) {
				break;
			}
			out += String.fromCharCode(uint8);
		}
		this.offset = offset + len;
		return out;
	}

	getStruct( struct ){
		if (!(struct instanceof Struct)) {
			throw new Error('BinaryReader::getStruct() - Invalid data as argument');
		}
		var list = struct._list;
		var name;
		var out={}, current, keys;
		var i, j, count;
		keys = Object.keys(list);
		count = keys.length;
		for (j = 0; j < count; ++j) {
			name    = keys[j];
			current = list[name];

			if (current.count > 1) {
				out[name] = new Array(current.count);
				for (i = 0; i < current.count; ++i) {
					out[name][i] = this[ current.func ]();
				}
			}
			else {
				out[name] = this[ current.func ]();
			}
		}
		return out;
	}

	seek( index, type ){
		type    = type || BinaryReader.SEEK_SET;
		this.offset =
			type === BinaryReader.SEEK_CUR ? this.offset + index :
			type === BinaryReader.SEEK_END ? this.length + index :
			index
		;
	}

	getPos(){
		var p, dir, x, y;

		this.bf_wba[2] = this.getUint8();
		this.bf_wba[1] = this.getUint8();
		this.bf_wba[0] = this.getUint8();
		this.bf_wba[3] = 0;

		p         = 0 + bf_wia[0];
		dir       = p & 0x0f;
		p       >>= 4;

		y         = p & 0x03FF;
		p       >>= 10;

		x         = p & 0x03FF;

		return [ x, y, dir ];
	}

	getPos2(){
		var a, b, c, d, e, f;

		a = this.getInt8();
		b = this.getInt8();
		c = this.getInt8();
		d = this.getInt8();
		e = this.getInt8();
		f = this.getInt8();

		return [
			( (a & 0xFF) << 2 ) | ( (b & 0xC0) >> 6 ), // x1
			( (b & 0x3F) << 4 ) | ( (c & 0xF0) >> 4 ), // y1
			( (d & 0xFC) >> 2 ) | ( (c & 0x0F) << 6 ), // x2
			( (d & 0x03) << 8 ) | ( (e & 0xFF)      ), // y2
			( (f & 0xF0) >> 4                       ), // xcellpos aka subx0
			( (f & 0xF)                             )  // ycellpos aka suby0
		];
	}
}

export default BinaryReader;
