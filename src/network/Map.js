var MapEngine = {};

MapEngine.init = function init( ip, port, mapName )
	{
		Network.connect( ip, port, function onconnect( success ) {
			MapRenderer.currentMap = '';
			if (!success) {
				return;
			}
      pkt        = new PACKET.CZ.ENTER();
			pkt.AID        = Session.AID;
			pkt.GID        = Session.GID;
			pkt.AuthCode   = Session.AuthCode;
			pkt.clientTime = Date.now();
			pkt.Sex        = Session.Sex;
			Network.sendPacket(pkt);

			Network.read(function(fp){
				if (fp.length === 4) {
					Session.Character.GID = fp.readLong();
				}
			});

			var hbt = new PACKET.CZ.HBT();
			var is_sec_hbt = Configs.get('sec_HBT', null);

			// Ping
			var ping, SP;
			SP = Session.ping;

      ping = new PACKET.CZ.REQUEST_TIME();
			var startTick = Date.now();
			Network.setPing(function(){
				if(is_sec_hbt) { Network.sendPacket(hbt); }

				ping.clientTime = Date.now() - startTick;
				
				if(!SP.returned && SP.pingTime)	{ console.warn('[Network] The server did not answer the previous PING!'); }
				SP.pingTime = ping.clientTime;
				SP.returned = false;

				Network.sendPacket(ping);
			});

			Session.Playing = true;
		}, true);

		if (!_isInitialised) {
			_isInitialised = true;

			MapControl.init();
			MapControl.onRequestWalk     = onRequestWalk;
			MapControl.onRequestStopWalk = onRequestStopWalk;
			MapControl.onRequestDropItem = onDropItem;

			// Hook packets
			Network.hookPacket( PACKET.ZC.AID,                 onReceiveAccountID );
			Network.hookPacket( PACKET.ZC.ACCEPT_ENTER,        onConnectionAccepted );
			Network.hookPacket( PACKET.ZC.ACCEPT_ENTER2,       onConnectionAccepted );
			Network.hookPacket( PACKET.ZC.ACCEPT_ENTER3,       onConnectionAccepted );
			Network.hookPacket( PACKET.ZC.NPCACK_MAPMOVE,      onMapChange );
			Network.hookPacket( PACKET.ZC.NPCACK_SERVERMOVE,   onServerChange );
			Network.hookPacket( PACKET.ZC.ACCEPT_QUIT,         onExitSuccess );
			Network.hookPacket( PACKET.ZC.REFUSE_QUIT,         onExitFail );
			Network.hookPacket( PACKET.ZC.RESTART_ACK,         onRestartAnswer );
			Network.hookPacket( PACKET.ZC.ACK_REQ_DISCONNECT,  onDisconnectAnswer );
			Network.hookPacket( PACKET.ZC.NOTIFY_TIME,         onPong );
			Network.hookPacket( PACKET.ZC.PING_LIVE,           onPingLive );
			Network.hookPacket( PACKET.ZC.CONFIG_NOTIFY,       onConfigNotify );
			Network.hookPacket( PACKET.ZC.CONFIG_NOTIFY2,      onConfigNotify );
			Network.hookPacket( PACKET.ZC.CONFIG_NOTIFY3,      onConfigNotify );
			Network.hookPacket( PACKET.ZC.CONFIG_NOTIFY4,      onConfigNotify );
			Network.hookPacket( PACKET.ZC.CONFIG,              onConfig );

			// Extend controller
			require('./MapEngine/Main').call();
			require('./MapEngine/MapState').call();
			require('./MapEngine/NPC').call();
			require('./MapEngine/Entity').call();
			require('./MapEngine/Item').call();
			require('./MapEngine/Skill').call();
		}
	};