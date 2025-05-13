import Network from './NetworkManager.js';
import Session from '../utils/SessionStorage.js';
import PACKET from './PacketStructure.js';
import Sound from '../audio/SoundManager.js';
import Entity from '../render/Entity/Entity.js';


var Char={}

Char._creationSlot = 0;
Char.b_inited = false;
Char.char_list=null;

Char.init = function()
{
  // BGM.play('01.mp3');
  var ip = Network.utilsLongToIP( Session.ServerLogin.ip );
  Network.connect( ip, Session.ServerLogin.port, function( success ){
    if (!success) {
      return;
    }
    Char.b_inited=true;
    var pkt        = new PACKET.CH.ENTER();
    pkt.AID        = Session.AID;
    pkt.AuthCode   = Session.AuthCode;
    pkt.userLevel  = Session.UserLevel;
    pkt.Sex        = Session.Sex;
    pkt.clientType = Session.LangType;
    Network.sendPacket(pkt);

    Network.read(function(fp){
      Session.AID = fp.readLong();
    });
  });
  
  Network.hookPacket( PACKET.HC.ACCEPT_ENTER_NEO_UNION,        Char.onConnectionAccepted );
  Network.hookPacket( PACKET.HC.REFUSE_ENTER,                  Char.onConnectionRefused );
  Network.hookPacket( PACKET.HC.ACCEPT_MAKECHAR,    			     Char.onCreationSuccess );
  Network.hookPacket( PACKET.HC.REFUSE_MAKECHAR,               Char.onCreationFail );
  Network.hookPacket( PACKET.HC.NOTIFY_ZONESVR,                Char.onReceiveMapInfo);
}

Char.reload = function()
{
  Network.close();
}

Char.onExitRequest = function()
{
}

Char.onConnectionAccepted = function( pkt )
{
  pkt.sex = Session.Sex;
  Char.onConnect(pkt);
  // Char.char_list=pkt.charInfo;
  


  var ping = new PACKET.CZ.PING();
  ping.AID = Session.AID;
  Network.setPing(function(){
    console.log("char ping")
    Network.sendPacket(ping);
  });

  Session.Playing = false;
  Session.hasCart = false;
}

Char.onConnectionRefused = function( pkt )
{
  var msg_id;

  switch (pkt.ErrorCode) {
    default:
    case 0: msg_id = 3; break;
    // other types ?
  }
}

Char.onMapUnavailable = function( pkt )
{
}
  
Char.onRequestCharDel = function(pkt) {
  if (!pkt)
    return;
}

Char.onDeleteRequest = function( charID )
{
  var pkt = new PACKET.CH.DELETE_CHAR3();
  pkt.GID = charID;
  pkt.Birth = 22;	// Server only needs the 6 digits
  Network.sendPacket(pkt);
}

Char.onDeleteAnswer = function(pkt)
{
  var result = typeof( pkt.Result ) === 'undefined' ? -1 : pkt.Result;
}

function find_free_slot(char_list){
  return 0;
}

Char.charCreationRequest = function( name, hair, color, job, sex )
{
  var pkt = new PACKET.CH.MAKE_CHAR2();
  pkt.name    = name;
  pkt.head    = hair;
  pkt.headPal = color;
  pkt.CharNum = find_free_slot(Char.char_list);
  pkt.Job = job;
  pkt.Sex = sex;
  Network.sendPacket(pkt);
}

Char.onCreationSuccess = function( pkt )
{
}

Char.onCreationFail = function( pkt )
{
  var msg_id;

  switch (pkt.ErrorCode) {
    case 0x00: msg_id =   10;  break; // 'Charname already exists'
    case 0x01: msg_id =  298;  break; // 'You are underaged'
    case 0x02: msg_id = 1272;  break; // 'Symbols in Character Names are forbidden'
    case 0x03: msg_id = 1355;  break; // 'You are not elegible to open the Character Slot.'
    default:
    case 0xFF: msg_id =   11;  break; // 'Char creation denied'
  }
}

Char.onConnectRequest = function( slot_id )
{
  Sound.play('click_sound.wav');
  var pkt = new PACKET.CH.SELECT_CHAR();
  pkt.CharNum = slot_id;
  Network.sendPacket(pkt);
}

Char.onReceiveMapInfo = function( pkt )
{
  Session.GID = pkt.GID;
  Session.ServerChar={ip:pkt.addr.ip,port:pkt.addr.port,mapName:pkt.mapName}; 
  Char.onInMap();
}

export default Char;

