import BinaryWriter from '../utils/BinaryWriter.js';

var UNUSED_PACKET;
var NAME_LENGTH = 24; // Must be equal to same name var in mmo.h
var MAP_NAME_LENGTH = (11 + 1);
var MAP_NAME_LENGTH_EXT = (MAP_NAME_LENGTH + 4);
var PACKET = {};
var RENEWAL = false;
var CLASSIC = true; // For ease of reading checks
UNUSED_PACKET = PACKET;


PACKET.CA  = {};  PACKET.AC = {}; // Login
PACKET.CH  = {};  PACKET.HC = {}; // Char
PACKET.CZ  = {};  PACKET.ZC = {}; // Map
PACKET.CS  = {};  PACKET.SC = {}; // All servers
PACKET.ZH  = {};                  // ??? typo error ?
PACKET.AHC = {}; PACKET.CAH = {}; // Security

// 0x64
PACKET.CA.LOGIN = function PACKET_CA_LOGIN() {
	this.Version = 0;
	this.ID = '';
	this.Passwd = '';
	this.clienttype = 0;
};
PACKET.CA.LOGIN.prototype.build = function() {
	var pkt_len = 2 + 4 + 24 + 24 + 1;
	var pkt_buf = new BinaryWriter(pkt_len);

	pkt_buf.writeShort(0x64);
	pkt_buf.writeULong(this.Version);
	pkt_buf.writeString(this.ID, 24);
	pkt_buf.writeString(this.Passwd, 24);
	pkt_buf.writeUChar(this.clienttype);
	return pkt_buf;
};

// 0x200
PACKET.CA.CONNECT_INFO_CHANGED = function PACKET_CA_CONNECT_INFO_CHANGED() {
	this.ID = '';
};
PACKET.CA.CONNECT_INFO_CHANGED.prototype.build = function() {
	var pkt_len = 2 + 24;
	var pkt_buf = new BinaryWriter(pkt_len);

	pkt_buf.writeShort(0x200);
	pkt_buf.writeString(this.ID, 24);
	return pkt_buf;
};

// 0x6a
PACKET.AC.REFUSE_LOGIN = function PACKET_AC_REFUSE_LOGIN(fp, end) {
	this.ErrorCode = fp.readUChar();
	this.blockDate = fp.readBinaryString(20);
};
PACKET.AC.REFUSE_LOGIN.size = 23;


// 0x81
PACKET.SC.NOTIFY_BAN = function PACKET_SC_NOTIFY_BAN(fp, end) {
	this.ErrorCode = fp.readUChar();
};
PACKET.SC.NOTIFY_BAN.size = 3;

// 0x69
PACKET.AC.ACCEPT_LOGIN = function PACKET_AC_ACCEPT_LOGIN(fp, end) {
	this.AuthCode = fp.readLong();
	this.AID = fp.readULong();
	this.userLevel = fp.readULong();
	this.lastLoginIP = fp.readULong();
	this.lastLoginTime = fp.readBinaryString(26);
	this.Sex = fp.readUChar();
	this.ServerList = (function() {
		var i, count=(end-fp.tell())/32|0, out=new Array(count);
		for (i = 0; i < count; ++i) {
			out[i] = {};
			out[i].ip = fp.readULong();
			out[i].port = fp.readUShort();
			out[i].name = fp.readString(20);
			out[i].usercount = fp.readUShort();
			out[i].state = fp.readUShort();
			out[i].property = fp.readUShort();
		}
		return out;
	})();
};
PACKET.AC.ACCEPT_LOGIN.size = -1;

export default PACKET;
