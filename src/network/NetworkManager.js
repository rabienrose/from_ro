import BinaryReader from '../utils/BinaryReader';
import PacketRegister from './PacketRegister';
import WebSocket from './WebSocket';
import Globals from "../utils/Globals.js"

var Packets = function( name, Struct, size )
{
	this.name     = name;
	this.Struct   = Struct;
	this.size     = size;
	this.callback = null;
}
Packets.list = [];

var _sockets = [];
var _socket  = null;
var _save_buffer = null;
var packetDump = false;

var Network = {};

Network.connect = function( host, port, callback)
{
	var proxy = "ws://127.0.0.1:443/";
	_socket = new WebSocket(host, port, proxy, 
		(success)=>{
			var msg   = 'Fail';
			var color = 'red';

			if (success) {
				msg   = 'Success';
				color = 'green';

				// If current socket has ping, remove it
				if (_socket && _socket.ping) {
					clearInterval(_socket.ping);
				}
				
				_sockets.push(_socket);
			}

			callback.call( this, success);
		}, Network.onMessage, Network.onClose);
}



Network.sendPacket = function( Packet )
{
	
	var pkt = Packet.build();
	if(packetDump) {
		let fp = new BinaryReader( pkt.buffer );
		let id = fp.readUShort()
		console.log("%c[Network] Dump Send: \n%cPacket ID: 0x%s\nPacket Name: %s\nLength: %d\nContent:\n%s", 
			'color:#007070', 'color:#000000',
			id.toString(16), Packet.constructor.name, pkt.buffer.byteLength, Network.utilsBufferToHexString(pkt.buffer).toUpperCase());
	}
	Network.send( pkt.buffer );
}

Network.send = function( buffer ) {
	if (_socket) {
		_socket.send( buffer );
	}
}

Network.registerPacket = function( id, Struct ) {
	Struct.id = id;
	Packets.list[id] = new Packets(Struct.name,Struct,Struct.size);
}

Network.hookPacket = function( packet, callback )
{
	if (!packet) {
		throw new Error('NetworkManager::HookPacket() - Invalid packet structure "'+ JSON.stringify(packet) +'"');
	}

	if (!packet.id) {
		throw new Error('NetworkManager::HookPacket() - Packet not yet register "'+ packet.name +'"');
	}

	Packets.list[ packet.id ].callback = callback;
}

Network.read = function(callback)
{
	Network.read.callback = callback;
}

Network.read.callback = null;

Network.onMessage = function( buf )
{
	var id, packet, fp;
	var length = 0;
	var offset = 0;
	var buffer;
	if (_save_buffer) {
		var _data = new Uint8Array( _save_buffer.length + buf.byteLength );
		_data.set( _save_buffer, 0 );
		_data.set( new Uint8Array(buf), _save_buffer.length );
		buffer = _data.buffer;
	}
	else {
		buffer = buf;
	}
	fp = new BinaryReader( buffer );
	if (Network.read.callback) {
		Network.read.callback( fp );
		Network.read.callback = null;
	}
	while (fp.tell() < fp.length) {
		offset = fp.tell();
		if (offset + 2 >= fp.length) {
			_save_buffer = new Uint8Array( buffer, offset, fp.length - offset);
			return;
		}
		id = fp.readUShort();
		
		let packet_len = Packets.list[id]?Packets.list[id].size:fp.length - offset;
		if (packet_len < 0) {
			if (offset + 4 >= fp.length) {
				_save_buffer = new Uint8Array( buffer, offset, fp.length - offset );
				return;
			}
			length = fp.readUShort();
		}
		else {
			length = packet_len;
		}
		offset += length;
		if (offset > fp.length) {
			offset = fp.tell() - (packet_len < 0 ? 4 : 2);
			_save_buffer = new Uint8Array(buffer,offset,fp.length - offset);
			return;
		}

		if(Packets.list[id]) {
			packet  = Packets.list[id];
			if(packetDump) {
				let buffer_console = new Uint8Array( buffer, 0, length );
				console.log("%c[Network] Dump Recv:\n%cPacket ID: 0x%s\nPacket Name: %s\nLength: %d\nContent:\n%s", 
					'color:#900090', 'color:#000000', 
					id.toString(16), packet.name, length, Network.utilsBufferToHexString(buffer_console).toUpperCase());
			}
			
			packet.instance = new packet.Struct(fp, offset);
			// console.log( '%c[Network] Recv:', 'color:#900090', packet.instance, packet.callback ? '' : '(no callback)'  );
			if (packet.callback) {
				packet.callback(packet.instance);
			}
		} else {
			if(packetDump) {
				let unknown_buffer = new Uint8Array( buffer, 0, length );
				console.log("%c[Network] Dump Recv:\n%cPacket ID: 0x%s\nPacket Name: [UNKNOWN]\nLength: %d\nContent:\n%s",
					'color:#900090', 'color:#000000',
					id.toString(16), length, Network.utilsBufferToHexString(unknown_buffer).toUpperCase());
			}
			console.error(
				'[Network] Packet "%c0x%s%c" not registered, skipping %d bytes.',
				'font-weight:bold', id.toString(16), 'font-weight:normal', (length)
			);
		}

		if (length) {
			fp.seek( offset, BinaryReader.SEEK_SET );
		}
	}
	_save_buffer = null;
}

Network.onClose = function()
{
	var idx = _sockets.indexOf(this);

	console.warn('[Network] Disconnect from server:',this.ws.url);

	if (this.ping) {
		clearInterval(this.ping);
	}

	if (idx !== -1) {
		_sockets.splice(idx, 1);
	}
}

Network.close = function()
{
	var idx;
	if (_socket) {
		_socket.close();

		if (_socket.ping) {
			clearInterval(_socket.ping);
		}

		idx     = _sockets.indexOf(_socket);
		_socket = null;

		if (idx !== -1) {
			_sockets.splice(idx, 1);
		}
	}
}

Network.setPing = function( callback )
{
	if (_socket) {
		if (_socket.ping) {
			clearInterval(_socket.ping);
		}
		_socket.ping = setInterval( callback, 10000);
		while (_sockets.length > 1) {
			if (_socket !== _sockets[0]) {
				_sockets[0].close();
				_sockets.splice( 0, 1 );
			}
		}
	}
}


Network.utilsLongToIP = function( long )
{
	var buf    = new ArrayBuffer(4);
	var uint8  = new Uint8Array(buf);
	var uint32 = new Uint32Array(buf);
	uint32[0]  = long;

	return Array.prototype.join.call( uint8, '.' );
}

Network.utilsBufferToHexString = function(buffer)
{
	return [...new Uint8Array(buffer)]
		.map(x => x.toString(16).padStart(2, '0') + " ")
		.join('');
}

var keys;
var i, count;
keys  = Object.keys(PacketRegister);
count = keys.length;

for (i = 0; i < count; ++i) {
	Network.registerPacket( keys[i], PacketRegister[ keys[i] ] );
}

export default Network;
