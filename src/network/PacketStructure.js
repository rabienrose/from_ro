import BinaryWriter from '../utils/BinaryWriter.js';

function parseCharInfo(fp, end) {
	if (!end) {
		end = fp.length;
	}

	var i, count, out = [];
	var blockSize = 144;
	var length = end - fp.tell();
	if (length <= 0) {
		return out;
	}

	for (i = 0, count = length / blockSize; i < count; ++i) {
		out[i] = {};
		out[i].GID = fp.readULong();
		out[i].exp = fp.readLong();
		out[i].money = fp.readLong();
		out[i].jobexp = fp.readLong();
		out[i].joblevel = fp.readLong();
		out[i].bodyState = fp.readLong();
		out[i].healthState = fp.readLong();
		out[i].effectState = fp.readLong();
		out[i].virtue = fp.readLong();
		out[i].honor = fp.readLong();
		out[i].jobpoint = fp.readShort();
		out[i].hp = fp.readLong();
		out[i].maxhp = fp.readLong();
		out[i].sp = fp.readShort();
		out[i].maxsp = fp.readShort();
		out[i].speed = fp.readShort();
		out[i].job = fp.readShort();
		out[i].head = fp.readShort();
		out[i].weapon = fp.readShort();
		out[i].level = fp.readShort();
		out[i].sppoint = fp.readShort();
		out[i].accessory = fp.readShort();
		out[i].shield = fp.readShort();
		out[i].accessory2 = fp.readShort();
		out[i].accessory3 = fp.readShort();
		out[i].headpalette = fp.readShort();
		out[i].bodypalette = fp.readShort();
		out[i].name = fp.readString(24);
		out[i].Str = fp.readUChar();
		out[i].Agi = fp.readUChar();
		out[i].Vit = fp.readUChar();
		out[i].Int = fp.readUChar();
		out[i].Dex = fp.readUChar();
		out[i].Luk = fp.readUChar();
		out[i].CharNum = fp.readUChar();
		out[i].haircolor = fp.readUChar();
		out[i].bIsChangedCharName = fp.readShort();
		out[i].lastMap = fp.readBinaryString(16);
		out[i].DeleteDate = fp.readLong();
		out[i].Robe = fp.readLong();
		out[i].SlotAddon = fp.readLong();
		out[i].RenameAddon = fp.readLong();
	}

	return out;
}


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

// 0x65
PACKET.CH.ENTER = function PACKET_CH_ENTER() {
	this.AID = 0;
	this.AuthCode = 0;
	this.userLevel = 0;
	this.clientType = 0;
	this.Sex = 0;
};
PACKET.CH.ENTER.prototype.build = function() {
	var pkt_len = 2 + 4 + 4 + 4 + 2 + 1;
	var pkt_buf = new BinaryWriter(pkt_len);

	pkt_buf.writeShort(0x65);
	pkt_buf.writeULong(this.AID);
	pkt_buf.writeULong(this.AuthCode);
	pkt_buf.writeULong(this.userLevel);
	pkt_buf.writeUShort(this.clientType);
	pkt_buf.writeUChar(this.Sex);
	return pkt_buf;
};

// 0x6b
PACKET.HC.ACCEPT_ENTER_NEO_UNION = function PACKET_HC_ACCEPT_ENTER_NEO_UNION(fp, end) {
	this.TotalSlotNum = fp.readUChar();
	this.PremiumStartSlot = fp.readUChar();
	this.PremiumEndSlot = fp.readUChar();
	this.dummy1_beginbilling = fp.readChar();
	this.code = fp.readULong();
	this.time1 = fp.readULong();
	this.time2 = fp.readULong();
	this.dummy2_endbilling = fp.readBinaryString(7);
	this.charInfo = parseCharInfo(fp, end);
};
PACKET.HC.ACCEPT_ENTER_NEO_UNION.size = -1;

// 0x6c
PACKET.HC.REFUSE_ENTER = function PACKET_HC_REFUSE_ENTER(fp, end) {
	this.ErrorCode = fp.readUChar();
};
PACKET.HC.REFUSE_ENTER.size = 3;

// 0xb6f
PACKET.HC.ACCEPT_MAKECHAR = function PACKET_HC_ACCEPT_MAKECHAR(fp, end) {
	this.charinfo = parseCharInfo(fp, end)[0];
};
PACKET.HC.ACCEPT_MAKECHAR.size = 0;

		// 0x6e
PACKET.HC.REFUSE_MAKECHAR = function PACKET_HC_REFUSE_MAKECHAR(fp, end) {
	this.ErrorCode = fp.readUChar();
};
PACKET.HC.REFUSE_MAKECHAR.size = 3;


// 0x82d
PACKET.HC.ACCEPT_ENTER_NEO_UNION_HEADER = function PACKET_HC_ACCEPT_ENTER_NEO_UNION_HEADER(fp, end) {
	this.TotalSlotNum = fp.readUChar();
	this.PremiumStartSlot = fp.readUChar();
	this.PremiumEndSlot = fp.readUChar();
	this.dummy1_beginbilling = fp.readChar();
	this.code = fp.readChar();
	fp.seek(20, BinaryWriter.SEEK_CUR);
};
PACKET.HC.ACCEPT_ENTER_NEO_UNION_HEADER.size = -1;

// 0x187
PACKET.CZ.PING = function PACKET_CZ_PING() {
	this.AID = 0;
};
PACKET.CZ.PING.prototype.build = function() {
	var pkt_len = 2 + 4;
	var pkt_buf = new BinaryWriter(pkt_len);

	pkt_buf.writeShort(0x187);
	pkt_buf.writeULong(this.AID);
	return pkt_buf;
};

// 0x9a0
PACKET.HC.CHARLIST_NOTIFY = function PACKET_HC_CHARLIST_NOTIFY(fp, end) {
	this.TotalCnt = fp.readLong();
};
PACKET.HC.CHARLIST_NOTIFY.size = 6;

// 0x20d
PACKET.HC.BLOCK_CHARACTER = function PACKET_HC_BLOCK_CHARACTER(fp, end) {
	this.characterList = (function() {
		var i, count=(end-fp.tell())/24|0, out=new Array(count);
		for (i = 0; i < count; ++i) {
			out[i] = {};
			out[i].GID = fp.readULong();
			out[i].szExpireDate = fp.readBinaryString(20);
		}
		return out;
	})();
};
PACKET.HC.BLOCK_CHARACTER.size = -1;

PACKET.HC.SECOND_PASSWD_LOGIN = function PACKET_HC_SECOND_PASSWD_LOGIN(fp, end) {
this.Seed = fp.readLong();
this.Aid = fp.readLong();
this.State = fp.readShort();
};
PACKET.HC.SECOND_PASSWD_LOGIN.size = 12;

// 0x970
PACKET.CH.MAKE_CHAR2 = function PACKET_CH_MAKE_CHAR2() {
	this.name = '';
	this.CharNum = 0;
	this.headPal = 0;
	this.head = 0;
};
PACKET.CH.MAKE_CHAR2.prototype.build = function() {
	var pkt_len = 2 + 24 + 1 + 2 + 2;
	var pkt_buf = new BinaryWriter(pkt_len);

	pkt_buf.writeShort(0x970);
	pkt_buf.writeString(this.name, 24);
	pkt_buf.writeUChar(this.CharNum);
	pkt_buf.writeShort(this.headPal);
	pkt_buf.writeShort(this.head);
	return pkt_buf;
};

// 0x66
PACKET.CH.SELECT_CHAR = function PACKET_CH_SELECT_CHAR() {
	this.CharNum = 0;
};
PACKET.CH.SELECT_CHAR.prototype.build = function() {
	var pkt_len = 2 + 1;
	var pkt_buf = new BinaryWriter(pkt_len);

	pkt_buf.writeShort(0x66);
	pkt_buf.writeUChar(this.CharNum);
	return pkt_buf;
};

// 0x71
PACKET.HC.NOTIFY_ZONESVR = function PACKET_HC_NOTIFY_ZONESVR(fp, end) {
	this.GID = fp.readULong();
	this.mapName = fp.readBinaryString(16);
	this.addr = {};
	this.addr.ip = fp.readULong();
	this.addr.port = fp.readUShort();
};
PACKET.HC.NOTIFY_ZONESVR.size = 28;

// 0x72
PACKET.CZ.ENTER = function PACKET_CZ_ENTER() {
	this.AID = 0;
	this.GID = 0;
	this.AuthCode = 0;
	this.clientTime = 0;
	this.Sex = 0;
};
PACKET.CZ.ENTER.prototype.build = function() {
	var ver = this.getPacketVersion();
	var pkt = new BinaryWriter(ver[2]);

	pkt.writeShort(ver[1]);
	pkt.view.setUint32(ver[3], this.AID, true);
	pkt.view.setUint32(ver[4], this.GID, true);
	pkt.view.setUint32(ver[5], this.AuthCode, true);
	pkt.view.setUint32(ver[6], this.ClientTime, true);
	pkt.view.setUint8(ver[7], this.Sex, true);

	return pkt;
};

export default PACKET;
