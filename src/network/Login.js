import Network from '../network/NetworkManager.js';
import PACKET from '../network/PacketStructure.js';
import Session from '../utils/SessionStorage.js';
import Sound from '../audio/SoundManager.js';
import Globals from "../utils/Globals.js"

var login_cb = null;
function onConnectionAccepted( pkt )
{
  Session.AuthCode  = pkt.AuthCode;
  Session.AID       = pkt.AID;
  Session.UserLevel = pkt.userLevel;
  Session.Sex       = pkt.Sex;
  Session.ServerLogin = pkt.ServerList[0];

  login_cb(true);
}

function onConnectionRefused( pkt )
{
  var error = 9;
  switch (pkt.ErrorCode) {
    case   0: error =    6; break; // Unregistered ID
    case   1: error =    7; break; // Incorrect Password
    case   2: error =    8; break; // This ID is expired
    case   3: error =    3; break; // Rejected from Server
    case   4: error =  266; break; // Checked: 'Login is currently unavailable. Please try again shortly.'- 2br
    case   5: error =  310; break; // Your Game's EXE file is not the latest version
    case   6: error =  449; break; // Your are Prohibited to log in until %s
    case   7: error =  264; break; // Server is jammed due to over populated
    case   8: error =  681; break; // Checked: 'This account can't connect the Sakray server.'
    case   9: error =  703; break; // 9 = MSI_REFUSE_BAN_BY_DBA
    case  10: error =  704; break; // 10 = MSI_REFUSE_EMAIL_NOT_CONFIRMED
    case  11: error =  705; break; // 11 = MSI_REFUSE_BAN_BY_GM
    case  12: error =  706; break; // 12 = MSI_REFUSE_TEMP_BAN_FOR_DBWORK
    case  13: error =  707; break; // 13 = MSI_REFUSE_SELF_LOCK
    case  14: error =  708; break; // 14 = MSI_REFUSE_NOT_PERMITTED_GROUP
    case  15: error =  709; break; // 15 = MSI_REFUSE_NOT_PERMITTED_GROUP
    case  99: error =  368; break; // 99 = This ID has been totally erased
    case 100: error =  809; break; // 100 = Login information remains at %s
    case 101: error =  810; break; // 101 = Account has been locked for a hacking investigation. Please contact the GM Team for more information
    case 102: error =  811; break; // 102 = This account has been temporarily prohibited from login due to a bug-related investigation
    case 103: error =  859; break; // 103 = This character is being deleted. Login is temporarily unavailable for the time being
    case 104: error =  860; break; // 104 = This character is being deleted. Login is temporarily unavailable for the time being
  }
  login_cb(false, pkt.ErrorCode);
  Network.close();
}

function onServerClosed( pkt )
{
  var msg_id;

  switch (pkt.ErrorCode) {
    default:
    case 0:   msg_id =    3; break; // Server closed
    case 1:   msg_id =    4; break; // Server closed
    case 2:   msg_id =    5; break; // Someone has already logged in with this id
    case 3:   msg_id =    9; break; // Sync error ?
    case 4:   msg_id =  439; break; // Server is jammed due to overpopulation.
    case 5:   msg_id =  305; break; // You are underaged and cannot join this server.
    case 6:   msg_id =  764; break; // Trial players can't connect Pay to Play Server. (761)
    case 8:   msg_id =  440; break; // Server still recognizes your last login
    case 9:   msg_id =  529; break; // IP capacity of this Internet Cafe is full. Would you like to pay the personal base?
    case 10:  msg_id =  530; break; // You are out of available paid playing time. Game will be shut down automatically. (528)
    case 15:  msg_id =  579; break; // You have been forced to disconnect by the Game Master Team
    case 101: msg_id =  810; break; // Account has been locked for a hacking investigation.
    case 102: msg_id = 1179; break; // More than 10 connections sharing the same IP have logged into the game for an hour. (1176)
  }
  login_cb(false, pkt.ErrorCode);
  Network.close();
}

function onConnectionRequest( username, password, _login_cb )
{
  login_cb = _login_cb;
  Network.hookPacket( PACKET.AC.ACCEPT_LOGIN,    onConnectionAccepted );
  Network.hookPacket( PACKET.AC.REFUSE_LOGIN,    onConnectionRefused );
  Network.hookPacket( PACKET.SC.NOTIFY_BAN,      onServerClosed );
  Sound.play('click_sound.wav');
  const address = "127.0.0.1"
  const port = 6900
  Network.connect( address, port, function( success ) {
    if ( !success ) {
      _login_cb(false,1);
      return;
    }
    var pkt        = new PACKET.CA.LOGIN();
    pkt.ID         = username;
    pkt.Passwd     = password;
    pkt.Version    = 55;
    pkt.clienttype = 4;
    Network.sendPacket(pkt);
  });
}

export default {
  onConnectionRequest
}