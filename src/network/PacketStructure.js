import BinaryReader from '../utils/BinaryReader.js';
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
	var pkt = new BinaryWriter(19);
	pkt.writeShort(0x22d);
	pkt.view.setUint32(2, this.AID, true);
	pkt.view.setUint32(6, this.GID, true);
	pkt.view.setUint32(10, this.AuthCode, true);
	pkt.view.setUint32(14, this.ClientTime, true);
	pkt.view.setUint8(18, this.Sex, true);

	return pkt;
};

// 0x35f
PACKET.CZ.REQUEST_TIME = function PACKET_CZ_REQUEST_TIME() {
	this.clientTime = 0;
};
PACKET.CZ.REQUEST_TIME.prototype.build = function() {
	var pkt = new BinaryWriter(6);
	pkt.writeShort(0x35f);
	pkt.view.setUint32(2, this.clientTime, true);
	return pkt;
};

// 0x7f
PACKET.ZC.NOTIFY_TIME = function PACKET_ZC_NOTIFY_TIME(fp, end) {
	this.time = fp.readULong();
};
PACKET.ZC.NOTIFY_TIME.size = 6;

// 0x283
PACKET.ZC.AID = function PACKET_ZC_AID(fp, end) {
	this.AID = fp.readULong();
};
PACKET.ZC.AID.size = 6;

// 0x2eb
PACKET.ZC.ACCEPT_ENTER2 = function PACKET_ZC_ACCEPT_ENTER2(fp, end) {
	this.startTime = fp.readULong();
	this.PosDir = fp.readPos();
	this.xSize = fp.readUChar();
	this.ySize = fp.readUChar();
	this.font = fp.readShort();
};
PACKET.ZC.ACCEPT_ENTER2.size = 13;

// 0x437
PACKET.CZ.REQUEST_MOVE = function PACKET_CZ_REQUEST_MOVE() {
	this.dest = [0, 0];
};
PACKET.CZ.REQUEST_MOVE.prototype.build = function() {
	var pkt = new BinaryWriter(5);
	pkt.writeShort(0x437);
	pkt.view.setPos(2, this.dest, true);
	return pkt;
};

// 0x87
PACKET.ZC.NOTIFY_PLAYERMOVE = function PACKET_ZC_NOTIFY_PLAYERMOVE(fp, end) {
	this.moveStartTime = fp.readULong();
	this.MoveData = fp.readPos2();
};
PACKET.ZC.NOTIFY_PLAYERMOVE.size = 12;

// 0xb0
PACKET.ZC.PAR_CHANGE = function PACKET_ZC_PAR_CHANGE(fp, end) {
	this.varID = fp.readUShort();
	this.count = fp.readLong();
};
PACKET.ZC.PAR_CHANGE.size = 8;

// 0x7d
PACKET.CZ.NOTIFY_ACTORINIT = function PACKET_CZ_NOTIFY_ACTORINIT() {};
PACKET.CZ.NOTIFY_ACTORINIT.prototype.build = function() {
	var pkt_len = 2;
	var pkt_buf = new BinaryWriter(pkt_len);

	pkt_buf.writeShort(0x7d);
	return pkt_buf;
};

// 0x201
PACKET.ZC.FRIENDS_LIST = function PACKET_ZC_FRIENDS_LIST(fp, end) {
	this.friendList = (function() {
		var i, count=(end-fp.tell())/32|0, out=new Array(count);
		for (i = 0; i < count; ++i) {
			out[i] = {};
			out[i].AID = fp.readULong();
			out[i].GID = fp.readULong();
			out[i].Name = fp.readString(NAME_LENGTH);
		}
		return out;
	})();
};
PACKET.ZC.FRIENDS_LIST.size = -1;

// 0x141
PACKET.ZC.COUPLESTATUS = function PACKET_ZC_COUPLESTATUS(fp, end) {
	this.statusType = fp.readULong();
	this.defaultStatus = fp.readLong();
	this.plusStatus = fp.readLong();
};
PACKET.ZC.COUPLESTATUS.size = 14;

// 0x1d7
// value2 seems to be used only when LOOK_WEAPON as a Shield
PACKET.ZC.SPRITE_CHANGE2 = function PACKET_ZC_SPRITE_CHANGE2(fp, end) {
	this.GID = fp.readULong();
	this.type = fp.readUChar();
	this.value = fp.readShort();
	this.value2 = fp.readShort();
};
PACKET.ZC.SPRITE_CHANGE2.size = 11;

// 0x8e
PACKET.ZC.NOTIFY_PLAYERCHAT = function PACKET_ZC_NOTIFY_PLAYERCHAT(fp, end) {
	this.msg = fp.readString(end - fp.tell());
};
PACKET.ZC.NOTIFY_PLAYERCHAT.size = -1;

// 0x13a
PACKET.ZC.ATTACK_RANGE = function PACKET_ZC_ATTACK_RANGE(fp, end) {
	this.currentAttRange = fp.readShort();
};
PACKET.ZC.ATTACK_RANGE.size = 4;

// 0x91
PACKET.ZC.NPCACK_MAPMOVE = function PACKET_ZC_NPCACK_MAPMOVE(fp, end) {
	this.mapName = fp.readBinaryString(16);
	this.xPos = fp.readShort();
	this.yPos = fp.readShort();
};
PACKET.ZC.NPCACK_MAPMOVE.size = 22;

// 0x992
PACKET.ZC.EQUIPMENT_ITEMLIST4 = function PACKET_ZC_EQUIPMENT_ITEMLIST4(fp, end) {
	this.ItemInfo = (function() {
		var i, count = (end - fp.tell()) / 31 | 0,
			out = new Array(count);
		var flag;
		for (i = 0; i < count; ++i) {
			out[i] = {};
			out[i].index = fp.readShort();
			out[i].ITID = fp.readUShort();
			out[i].type = fp.readUChar();
			out[i].location = fp.readULong();
			out[i].WearState = fp.readULong();
			out[i].RefiningLevel = fp.readUChar();
			out[i].slot = {};
			out[i].slot.card1 = fp.readUShort();
			out[i].slot.card2 = fp.readUShort();
			out[i].slot.card3 = fp.readUShort();
			out[i].slot.card4 = fp.readUShort();
			out[i].HireExpireDate = fp.readLong();
			out[i].bindOnEquipType = fp.readUShort();
			out[i].wItemSpriteNumber = fp.readUShort();
			flag = fp.readUChar();
			out[i].IsIdentified = flag & 1;
			out[i].IsDamaged = flag & 2;
			out[i].PlaceETCTab = flag & 4;
		}
		return out;
	})();
};
PACKET.ZC.EQUIPMENT_ITEMLIST4.size = -1;

// 0x99b
PACKET.ZC.MAPPROPERTY_R2 = function PACKET_ZC_MAPPROPERTY_R2(fp, end) {
	this.type = fp.readShort();
	this.flag = fp.readLong();
};
PACKET.ZC.MAPPROPERTY_R2.size = 8;

// 0x9dd
PACKET.ZC.NOTIFY_NEWENTRY8 = function PACKET_ZC_NOTIFY_NEWENTRY8(fp, end) {
	this.objecttype = fp.readUChar();
	this.GID = fp.readULong();
	this.AID = fp.readULong();
	this.speed = fp.readShort();
	this.bodyState = fp.readShort();
	this.healthState = fp.readShort();
	this.effectState = fp.readLong();
	this.job = fp.readShort();
	this.head = fp.readShort();
	this.weapon = fp.readLong();
	this.accessory = fp.readShort();
	this.accessory2 = fp.readShort();
	this.accessory3 = fp.readShort();
	this.headpalette = fp.readShort();
	this.bodypalette = fp.readShort();
	this.headDir = fp.readShort();
	this.Robe = fp.readShort();
	this.GUID = fp.readULong();
	this.GEmblemVer = fp.readShort();
	this.honor = fp.readShort();
	this.virtue = fp.readLong();
	this.isPKModeON = fp.readUChar();
	this.sex = fp.readUChar();
	this.PosDir = fp.readPos();
	this.xSize = fp.readUChar();
	this.ySize = fp.readUChar();
	this.state = fp.readUChar();
	this.clevel = fp.readShort();
	this.font = fp.readShort();
	this.hp = fp.readLong();
	this.maxhp = fp.readLong();
	this.isBoss = fp.readUChar();
	this.name = fp.readString(end - fp.tell());
};
PACKET.ZC.NOTIFY_NEWENTRY8.size = -1;

// 0x10f
PACKET.ZC.SKILLINFO_LIST = function PACKET_ZC_SKILLINFO_LIST(fp, end) {
	this.skillList = (function() {
		var i, count=(end-fp.tell())/37|0, out=new Array(count);
		for (i = 0; i < count; ++i) {
			out[i] = {};
			out[i].SKID = fp.readShort();
			out[i].type = fp.readLong();
			out[i].level = fp.readShort();
			out[i].spcost = fp.readShort();
			out[i].attackRange = fp.readShort();
			out[i].skillName = fp.readBinaryString(NAME_LENGTH);
			out[i].upgradable = fp.readChar();
		}
		return out;
	})();
};
PACKET.ZC.SKILLINFO_LIST.size = -1;

// 0x7d9
PACKET.ZC.SHORTCUT_KEY_LIST_V2 = function PACKET_ZC_SHORTCUT_KEY_LIST_V2(fp, end) {
	this.ShortCutKey = (function() {
		var i, count = 38,
			out = new Array(count);
		for (i = 0; i < count; ++i) {
			out[i] = {};
			out[i].isSkill = fp.readChar();
			out[i].ID = fp.readULong();
			out[i].count = fp.readShort();
		}
		return out;
	})();
};
PACKET.ZC.SHORTCUT_KEY_LIST_V2.size = 268;

// 0xb1
PACKET.ZC.LONGPAR_CHANGE = function PACKET_ZC_LONGPAR_CHANGE(fp, end) {
	this.varID = fp.readUShort();
	this.amount = fp.readLong();
};
PACKET.ZC.LONGPAR_CHANGE.size = 8;

// 0xbd
PACKET.ZC.STATUS = function PACKET_ZC_STATUS(fp, end) {
	this.point = fp.readShort();
	this.str = fp.readUChar();
	this.standardStr = fp.readUChar();
	this.agi = fp.readUChar();
	this.standardAgi = fp.readUChar();
	this.vit = fp.readUChar();
	this.standardVit = fp.readUChar();
	this.Int = fp.readUChar();
	this.standardInt = fp.readUChar();
	this.dex = fp.readUChar();
	this.standardDex = fp.readUChar();
	this.luk = fp.readUChar();
	this.standardLuk = fp.readUChar();
	this.attPower = fp.readShort();
	this.refiningPower = fp.readShort();
	this.max_mattPower = fp.readShort();
	this.min_mattPower = fp.readShort();
	this.itemdefPower = fp.readShort();
	this.plusdefPower = fp.readShort();
	this.mdefPower = fp.readShort();
	this.plusmdefPower = fp.readShort();
	this.hitSuccessValue = fp.readShort();
	this.avoidSuccessValue = fp.readShort();
	this.plusAvoidSuccessValue = fp.readShort();
	this.criticalSuccessValue = fp.readShort();
	this.ASPD = fp.readShort();
	this.plusASPD = fp.readShort();
};
PACKET.ZC.STATUS.size = 44;

// 0x2c9
PACKET.ZC.PARTY_CONFIG = function PACKET_ZC_PARTY_CONFIG(fp, end) {
	this.bRefuseJoinMsg = fp.readUChar();
};
PACKET.ZC.PARTY_CONFIG.size = 3;

// 0x2da
PACKET.ZC.CONFIG_NOTIFY = function PACKET_ZC_CONFIG_NOTIFY(fp, end) {
	this.show_eq_flag = fp.readUChar();
};
PACKET.ZC.CONFIG_NOTIFY.size = 3;

// 0x2d9
PACKET.ZC.CONFIG = function PACKET_ZC_CONFIG(fp, end) {
	this.Config = fp.readLong();
	this.Value = fp.readLong();
};
PACKET.ZC.CONFIG.size = 10;

PACKET.ZC.NOTIFY_VANISH = function PACKET_ZC_NOTIFY_VANISH(fp, end) {
	this.GID = fp.readULong();
	this.type = fp.readUChar();
};
PACKET.ZC.NOTIFY_VANISH.size = 7;

// 0x6d
PACKET.HC.ACCEPT_MAKECHAR_NEO_UNION = function PACKET_HC_ACCEPT_MAKECHAR_NEO_UNION(fp, end) {
	this.charinfo = parseCharInfo(fp, end)[0];
};
PACKET.HC.ACCEPT_MAKECHAR_NEO_UNION.size = 0;

// 0x840
PACKET.HC.NOTIFY_ACCESSIBLE_MAPNAME = function PACKET_HC_NOTIFY_ACCESSIBLE_MAPNAME(fp, end) {
	// fp.readString(end-fp.tell());
};
PACKET.HC.NOTIFY_ACCESSIBLE_MAPNAME.size = -1;

// 0x8c8
PACKET.ZC.NOTIFY_ACT3 = function PACKET_ZC_NOTIFY_ACT3(fp, end) {
	this.GID = fp.readULong();
	this.targetGID = fp.readULong();
	this.startTime = fp.readULong();
	this.attackMT = fp.readLong();
	this.attackedMT = fp.readLong();
	this.damage = fp.readLong();
	fp.seek(1, BinaryReader.SEEK_CUR);
	this.count = fp.readShort();
	this.action = fp.readUChar();
	this.leftDamage = fp.readLong();
};
PACKET.ZC.NOTIFY_ACT3.size = 34;

// 0x88
PACKET.ZC.STOPMOVE = function PACKET_ZC_STOPMOVE(fp, end) {
	this.AID = fp.readULong();
	this.xPos = fp.readShort();
	this.yPos = fp.readShort();
};
PACKET.ZC.STOPMOVE.size = 10;


PACKET.CZ.REQUEST_ACT = function PACKET_CZ_REQUEST_ACT() {
	this.targetGID = 0;
	this.action = 0;
};
PACKET.CZ.REQUEST_ACT.prototype.build = function() {
	var pkt = new BinaryWriter(7);

	pkt.writeShort(0x369);
	pkt.view.setUint32(2, this.targetGID, true);
	pkt.view.setUint8(6, this.action, true);
	return pkt;
};

// 0x118
PACKET.CZ.CANCEL_LOCKON = function PACKET_CZ_CANCEL_LOCKON() {};
PACKET.CZ.CANCEL_LOCKON.prototype.build = function() {
	var pkt_len = 2;
	var pkt_buf = new BinaryWriter(pkt_len);

	pkt_buf.writeShort(0x118);
	return pkt_buf;
};

// 0x977
PACKET.ZC.NOTIFY_MONSTER_HP = function PACKET_ZC_NOTIFY_MONSTER_HP(fp, end) {
	this.AID = fp.readULong();
	this.hp = fp.readULong();
	this.maxhp = fp.readULong();
};
PACKET.ZC.NOTIFY_MONSTER_HP.size = 14;

// 0x94
PACKET.CZ.REQNAME = function PACKET_CZ_REQNAME() {
	this.AID = 0;
};
PACKET.CZ.REQNAME.prototype.build = function() {
	var pkt = new BinaryWriter(6);

	pkt.writeShort(0x96a);
	pkt.view.setUint32(2, this.AID, true);
	return pkt;
};

// 0x95
PACKET.ZC.ACK_REQNAME = function PACKET_ZC_ACK_REQNAME(fp, end) {
	this.AID = fp.readULong();
	this.CName = fp.readString(NAME_LENGTH);
};
PACKET.ZC.ACK_REQNAME.size = 30;


PACKET.ZC.USESKILL_ACK2 = function PACKET_ZC_USESKILL_ACK2(fp, end) {
	this.AID = fp.readULong();
	this.targetID = fp.readULong();
	this.xPos = fp.readShort();
	this.yPos = fp.readShort();
	this.SKID = fp.readUShort();
	this.property = fp.readULong();
	this.delayTime = fp.readULong();
	this.isDisposable = fp.readUChar();
};
PACKET.ZC.USESKILL_ACK2.size = 25;

// 0xc0
PACKET.ZC.EMOTION = function PACKET_ZC_EMOTION(fp, end) {
	this.GID = fp.readULong();
	this.type = fp.readUChar();
};
PACKET.ZC.EMOTION.size = 7;

// 0x9db
PACKET.ZC.NOTIFY_MOVEENTRY8 = function PACKET_ZC_NOTIFY_MOVEENTRY8(fp, end) {
	this.objecttype = fp.readUChar();
	this.GID = fp.readULong();
	this.AID = fp.readULong();
	this.speed = fp.readShort();
	this.bodyState = fp.readShort();
	this.healthState = fp.readShort();
	this.effectState = fp.readLong();
	this.job = fp.readShort();
	this.head = fp.readUShort();
	this.weapon = fp.readULong();
	this.accessory = fp.readUShort();
	this.moveStartTime = fp.readULong();
	this.accessory2 = fp.readUShort();
	this.accessory3 = fp.readUShort();
	this.headpalette = fp.readShort();
	this.bodypalette = fp.readShort();
	this.headDir = fp.readShort();
	this.Robe = fp.readUShort();
	this.GUID = fp.readULong();
	this.GEmblemVer = fp.readShort();
	this.honor = fp.readShort();
	this.virtue = fp.readLong();
	this.isPKModeON = fp.readUChar();
	this.sex = fp.readUChar();
	this.MoveData = fp.readPos2();
	this.xSize = fp.readUChar();
	this.ySize = fp.readUChar();
	this.clevel = fp.readShort();
	this.font = fp.readShort();
	this.maxhp = fp.readLong();
	this.hp = fp.readLong();
	this.isBoss = fp.readUChar();
	this.name = fp.readString(end-fp.tell());
};
PACKET.ZC.NOTIFY_MOVEENTRY8.size = -1;

// 0x9dc
PACKET.ZC.NOTIFY_STANDENTRY8 = function PACKET_ZC_NOTIFY_STANDENTRY8(fp, end) {
	this.objecttype = fp.readUChar();
	this.GID = fp.readULong();
	this.AID = fp.readULong();
	this.speed = fp.readShort();
	this.bodyState = fp.readShort();
	this.healthState = fp.readShort();
	this.effectState = fp.readLong();
	this.job = fp.readShort();
	this.head = fp.readShort();
	this.weapon = fp.readLong();
	this.accessory = fp.readShort();
	this.accessory2 = fp.readShort();
	this.accessory3 = fp.readShort();
	this.headpalette = fp.readShort();
	this.bodypalette = fp.readShort();
	this.headDir = fp.readShort();
	this.Robe = fp.readShort();
	this.GUID = fp.readULong();
	this.GEmblemVer = fp.readShort();
	this.honor = fp.readShort();
	this.virtue = fp.readLong();
	this.isPKModeON = fp.readUChar();
	this.sex = fp.readUChar();
	this.PosDir = fp.readPos();
	this.xSize = fp.readUChar();
	this.ySize = fp.readUChar();
	this.clevel = fp.readShort();
	this.font = fp.readShort();
	this.hp = fp.readLong();
	this.maxhp = fp.readLong();
	this.isBoss = fp.readUChar();
	this.name = fp.readString(end - fp.tell());
};
PACKET.ZC.NOTIFY_STANDENTRY8.size = -1;

export default PACKET;
