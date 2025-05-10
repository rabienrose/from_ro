import PACKET from './PacketStructure';
export default {
	0x69: PACKET.AC.ACCEPT_LOGIN,
	0x6a: PACKET.AC.REFUSE_LOGIN,
	0x81: PACKET.SC.NOTIFY_BAN,
};
