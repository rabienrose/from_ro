import Network from './NetworkManager';
import PACKET from './PacketStructure';

function onItemExistInGround( pkt )
{
	var x = pkt.xPos - 0.5 + pkt.subX / 12;
	var y = pkt.yPos - 0.5 + pkt.subY / 12;
	var z = Altitude.getCellHeight( x, y );

	ItemObject.add( pkt.ITAID, pkt.ITID, pkt.IsIdentified, pkt.count, x, y, z );
}

function onItemSpamInGround( pkt )
{
	return;
	var x = pkt.xPos - 0.5 + pkt.subX / 12;
	var y = pkt.yPos - 0.5 + pkt.subY / 12;
	var z = Altitude.getCellHeight( x, y ) + 5.0;

	ItemObject.add(
		pkt.ITAID,
		pkt.ITID,
		pkt.IsIdentified,
		pkt.count,
		x,
		y,
		z,
		pkt.dropeffectmode,
		pkt.showdropeffect
	);
}

function onItemInGroundVanish( pkt )
{
	// ItemObject.remove( pkt.ITAID );
}

function onItemPickAnswer( pkt )
{
	// Fail
	if (pkt.result !== 0) {
		ChatBox.addText( DB.getMessage(53), ChatBox.TYPE.ERROR, ChatBox.FILTER.ITEM );
		return;
	}

	ItemObtain.append();
	ItemObtain.set(pkt);

	var getTextItem = DB.getItemName(pkt, {showItemOptions: false});

	ChatBox.addText(
		DB.getMessage(153).replace('%s', getTextItem ).replace('%d', pkt.count ),
		ChatBox.TYPE.BLUE,
		ChatBox.FILTER.ITEM
	);

	Inventory.getUI().addItem(pkt);
}

function onInventorySetList( pkt )
{
	Inventory.getUI().setItems( pkt.itemInfo || pkt.ItemInfo );
}

function onIventoryRemoveItem( pkt )
{
	Inventory.getUI().removeItem( pkt.Index, pkt.count || pkt.Count || 0);
}

function onEquipementTakeOff( pkt )
{
	if (pkt.result) {
		var item = Equipment.getUI().unEquip( pkt.index, pkt.wearLocation);

		if (item) {
			item.WearState = 0;

			var it = DB.getItemInfo( item.ITID );
			ChatBox.addText(
				it.identifiedDisplayName + ' ' + DB.getMessage(171),
				ChatBox.TYPE.ERROR,
				ChatBox.FILTER.ITEM
			);

			if (!(pkt.wearLocation & EquipLocation.AMMO)) {
				Inventory.getUI().addItem(item);
			}
		}

		if (pkt.wearLocation & EquipLocation.HEAD_TOP)    Session.Entity.accessory2 = Equipment.getUI().checkEquipLoc(EquipLocation.COSTUME_HEAD_TOP);
		if (pkt.wearLocation & EquipLocation.HEAD_MID)    Session.Entity.accessory3 = Equipment.getUI().checkEquipLoc(EquipLocation.COSTUME_HEAD_MID);
		if (pkt.wearLocation & EquipLocation.HEAD_BOTTOM) Session.Entity.accessory  = Equipment.getUI().checkEquipLoc(EquipLocation.COSTUME_HEAD_BOTTOM);
		if (pkt.wearLocation & EquipLocation.GARMENT)     Session.Entity.robe       = Equipment.getUI().checkEquipLoc(EquipLocation.COSTUME_ROBE);
		if (pkt.wearLocation & EquipLocation.WEAPON)      Session.Entity.weapon     = 0;
		if (pkt.wearLocation & EquipLocation.SHIELD)      Session.Entity.shield     = 0;
		if (pkt.wearLocation & EquipLocation.COSTUME_HEAD_TOP)    Session.Entity.accessory2 = Equipment.getUI().checkEquipLoc(EquipLocation.HEAD_TOP);
		if (pkt.wearLocation & EquipLocation.COSTUME_HEAD_MID)    Session.Entity.accessory3 = Equipment.getUI().checkEquipLoc(EquipLocation.HEAD_MID);
		if (pkt.wearLocation & EquipLocation.COSTUME_HEAD_BOTTOM) Session.Entity.accessory  = Equipment.getUI().checkEquipLoc(EquipLocation.HEAD_BOTTOM);
		if (pkt.wearLocation & EquipLocation.COSTUME_ROBE)     Session.Entity.robe       = Equipment.getUI().checkEquipLoc(EquipLocation.GARMENT);
	
		if(PACKETVER.value >= 20170208) { // Remove from Switch Window as well
			if (!Inventory.getUI().isInEquipSwitchList(pkt.wearLocation)) {
				SwitchEquip.unEquip( pkt.index, pkt.wearLocation );
			}
		}
	}
}

function onItemEquip( pkt )
{
	if (pkt.result == 1) {
		var item = Inventory.getUI().removeItem( pkt.index, 1 );
		Equipment.getUI().equip( item, pkt.wearLocation );
		ChatBox.addText(
			DB.getItemName(item) + ' ' + DB.getMessage(170),
			ChatBox.TYPE.BLUE,
			ChatBox.FILTER.ITEM
		);

		// Variables for Headgear Checks
		var CostumeCheckTop = Equipment.getUI().checkEquipLoc(EquipLocation.COSTUME_HEAD_TOP);
		var CostumeCheckMid = Equipment.getUI().checkEquipLoc(EquipLocation.COSTUME_HEAD_MID);
		var CostumeCheckBot = Equipment.getUI().checkEquipLoc(EquipLocation.COSTUME_HEAD_BOTTOM);
		var CostumeCheckRobe = Equipment.getUI().checkEquipLoc(EquipLocation.COSTUME_ROBE);

		// Display
		if (pkt.wearLocation & EquipLocation.HEAD_TOP)    Session.Entity.accessory2 = (CostumeCheckTop)  ? CostumeCheckTop  : pkt.viewid;
		if (pkt.wearLocation & EquipLocation.HEAD_MID)    Session.Entity.accessory3 = (CostumeCheckMid)  ? CostumeCheckMid  : pkt.viewid;
		if (pkt.wearLocation & EquipLocation.HEAD_BOTTOM) Session.Entity.accessory  = (CostumeCheckBot)  ? CostumeCheckBot  : pkt.viewid;
		if (pkt.wearLocation & EquipLocation.GARMENT)     Session.Entity.robe       = (CostumeCheckRobe) ? CostumeCheckRobe : pkt.viewid;

		if (pkt.wearLocation & EquipLocation.WEAPON)      Session.Entity.weapon     = pkt.viewid;
		if (pkt.wearLocation & EquipLocation.SHIELD)      Session.Entity.shield     = pkt.viewid;

		// costume override regular equips
		if (pkt.wearLocation & EquipLocation.COSTUME_HEAD_TOP)    Session.Entity.accessory2  = pkt.viewid;
		if (pkt.wearLocation & EquipLocation.COSTUME_HEAD_MID)    Session.Entity.accessory3  = pkt.viewid;
		if (pkt.wearLocation & EquipLocation.COSTUME_HEAD_BOTTOM) Session.Entity.accessory   = pkt.viewid;
		if (pkt.wearLocation & EquipLocation.COSTUME_ROBE)        Session.Entity.robe        = pkt.viewid;
	}

	// Fail to equip
	else {
		ChatBox.addText(
			DB.getMessage(372),
			ChatBox.TYPE.ERROR,
			ChatBox.FILTER.ITEM
		);
	}
}

function onItemUseAnswer( pkt )
{
	if (!pkt.hasOwnProperty('AID') || Session.Entity.GID === pkt.AID) {
		if (pkt.result) {
			Inventory.getUI().updateItem( pkt.index, pkt.count );
		}
		else {
			// should we show a msg in chatbox ?
		}
	}
	if(pkt.result){
		EffectManager.spamItem( pkt.id, pkt.AID, null, null, null);
	}
}

Equipment.onCheckPlayerEquipment = function onCheckPlayerEquipment( AID )
{
	var pkt = new PACKET.CZ.EQUIPWIN_MICROSCOPE();
	pkt.AID = AID;
	Network.sendPacket(pkt);
}

function onShowPlayerEquip( pkt ){
	PlayerViewEquip.getUI().append();
	PlayerViewEquip.getUI().setTitleBar(pkt.characterName);
	PlayerViewEquip.getUI().setEquipmentData(pkt.ItemInfo);
	PlayerViewEquip.getUI().setChar2Render(pkt);
}

function onArrowEquipped( pkt )
{
	var item = Inventory.getUI().getItemByIndex( pkt.index );
	Equipment.getUI().equip( item, EquipLocation.AMMO);
}

var _cardComposition;

function onUseCard(index)
{
	_cardComposition = index;
	var pkt          = new PACKET.CZ.REQ_ITEMCOMPOSITION_LIST();
	pkt.cardIndex    = index;
	Network.sendPacket(pkt);
};

function onItemCompositionList( pkt )
{
	if (!pkt.ITIDList.length) {
		return;
	}

	var card = Inventory.getUI().getItemByIndex(_cardComposition);

	ItemSelection.append();
	ItemSelection.setList(pkt.ITIDList);
	ItemSelection.setTitle(DB.getMessage(522) + '(' + DB.getItemInfo(card.ITID).identifiedDisplayName + ')');
	ItemSelection.onIndexSelected = function(index) {
		if (index >= 0) {
			var pkt        = new PACKET.CZ.REQ_ITEMCOMPOSITION();
			pkt.cardIndex  = _cardComposition;
			pkt.equipIndex = index;
			Network.sendPacket(pkt);
		}

		_cardComposition = null;
	};
}

function onItemCompositionResult( pkt )
{
	switch (pkt.result) {
		case 0: // success
			var item = Inventory.getUI().removeItem(pkt.equipIndex, 1);
			var card = Inventory.getUI().removeItem(pkt.cardIndex,  1);

			if (item) {
				for (var i = 0; i < 4; ++i) {
					if (!item.slot['card'+(i+1)]) {
						item.slot['card'+(i+1)] = card.ITID;
						break;
					}
				}
				Inventory.getUI().addItem(item);
			}
			break;

		case 1: // Fail
			break;
	}
}

function onRefineResult( pkt )
{
	// Check if refine UI is enabled and packet version is >= 20161012
	if (Configs.get('enableRefineUI') && PACKETVER.value >= 20161012) {
		Refine.onRefineResult(pkt);
	} else {
		var item = Inventory.getUI().removeItem( pkt.itemIndex, 1);
		if (item) {
			item.RefiningLevel = pkt.RefiningLevel;
			Inventory.getUI().addItem(item);
		}

		switch (pkt.result) {
			case 0: // success
				ChatBox.addText(DB.getMessage(498),	// Upgrade success!!
					ChatBox.TYPE.BLUE,
					ChatBox.FILTER.PUBLIC_LOG
				);
				break;
			case 1: // failure
				ChatBox.addText(DB.getMessage(499),	// Upgrade failed!!
					ChatBox.TYPE.BLUE,
					ChatBox.FILTER.PUBLIC_LOG
				);
				break;
			case 2: // downgrade
				ChatBox.addText(DB.getMessage(1537), // Is now refining the value lowered
					ChatBox.TYPE.BLUE,
					ChatBox.FILTER.PUBLIC_LOG
				);
				break;
		}
	}
}

function onCartSetList( pkt )
{
	CartItems.setItems( pkt.itemInfo || pkt.ItemInfo );
}

function onCartSetInfo( pkt )
{
	CartItems.setCartInfo( pkt.curCount, pkt.maxCount, pkt.curWeight, pkt.maxWeight  );
}

function onCartRemoveItem( pkt )
{
	CartItems.removeItem( pkt.index, pkt.count);
}

CartItems.reqRemoveItem = function ReqRemoveItem( index, count )
{
	if (count <= 0) {
		return;
	}

	var pkt   = new PACKET.CZ.MOVE_ITEM_FROM_CART_TO_BODY();
	pkt.index = index;
	pkt.count = count;
	Network.sendPacket( pkt );
};

function reqMoveItemToCart( index, count )
{
	if (count <= 0) {
		return;
	}

	var pkt   = new PACKET.CZ.MOVE_ITEM_FROM_BODY_TO_CART();
	pkt.index = index;
	pkt.count = count;
	Network.sendPacket( pkt );
};

Inventory.reqMoveItemToWriteRodex = function reqMoveItemToWriteRodex( index, count )
{
	if (count <= 0) {
		return;
	}

	var pkt   = new PACKET.CZ.REQ_ADD_ITEM_RODEX();
	pkt.index = index;
	pkt.count = count;
	Network.sendPacket( pkt );
};

function onCartItemAdded( pkt )
{
	CartItems.addItem(pkt);
}

function onAckAddItemToCart( pkt ){
	switch (pkt.result) {
		case 0:
			ChatBox.addText( DB.getMessage(220), ChatBox.TYPE.ERROR, ChatBox.FILTER.ITEM );
			break;

		case 1:
			ChatBox.addText( DB.getMessage(221), ChatBox.TYPE.ERROR, ChatBox.FILTER.ITEM );
			break;
	}
}

function onMakeitemList( pkt )
{
	if (!pkt.itemList.length) {
		return;
	}

	MakeItemSelection.append();
	MakeItemSelection.setList(pkt.itemList);
	MakeItemSelection.setTitle(DB.getMessage(425));
	MakeItemSelection.onIndexSelected = function(index, material) {
		if (index >= -1) {
			var pkt   = new PACKET.CZ.REQMAKINGITEM();
			pkt.itemList.ITID = index;
			pkt.itemList.material_ID = {};
			pkt.itemList.material_ID[0] = (material[0] && material[0].ITID) ? material[0].ITID : 0;
			pkt.itemList.material_ID[1] = (material[1] && material[1].ITID) ? material[1].ITID : 0;
			pkt.itemList.material_ID[2] = (material[2] && material[2].ITID) ? material[2].ITID : 0;
			Network.sendPacket(pkt);
		}
	};
}

function onListWinItem( ptk )
{
	if(! ptk.Type){
		ItemListWindowSelection.append();
	}
}

ItemListWindowSelection.onItemListWindowSelected = function onItemListWindowSelected( inforMaterialList )
{
	var pkt;
	if(PACKETVER.value >= 20180307) {
		pkt   = new PACKET.CZ.ITEMLISTWIN_RES2();
	} else {
		pkt   = new PACKET.CZ.ITEMLISTWIN_RES();
	}

	pkt.Type = inforMaterialList.Type;
	pkt.Action = inforMaterialList.Action;
	pkt.MaterialList = inforMaterialList.MaterialList;

	Network.sendPacket( pkt );
}

function onMakeitem_List( pkt )
{
	let itemList;
	let makeType;
	if (PACKETVER.value >= 20211103) {
		if (!pkt.items.length) {
			return;
		}
		itemList = pkt.items.map(item => item.itemId);
		makeType = pkt.makeItem;
	} else {
		if (!pkt.idList.length) {
			return;
		}
		itemList = pkt.idList;
		makeType = itemList[0]; // First item is mktype for older versions
		itemList = itemList.slice(1); // Remove mktype from item list
	}

	MakeItemSelection.append();
	MakeItemSelection.setCookingList(itemList, makeType);
	MakeItemSelection.setTitle(DB.getMessage(425));
	MakeItemSelection.onIndexSelected = function(index, material, mkType) {
		if (index >= -1) {
			var pkt = new PACKET.CZ.REQ_MAKINGITEM();
			pkt.mkType = mkType;
			pkt.id = index;
			Network.sendPacket(pkt);
		}
	};
}

function onBodyItemSize(pkt) {
	if (pkt) {
		var baselimit = 100;	// Base Limit
		var newlimit = baselimit + pkt.type;
		Inventory.getUI().ui.find('.mcnt').text(newlimit);
	}
}

function onRecoverPenaltyOverweight(pkt) {
	// TODO add it as status check
	// show percent to status, still a wip
	if (Session.Entity) {
		Session.Entity.overWeightPercent = pkt.percentage;
	}
}

function onItemListNormal(pkt) {
	switch (pkt.invType) {
		case 0:
			Inventory.getUI().setItems( pkt.itemInfo || pkt.ItemInfo );
			break;
		case 1:
			CartItems.setItems( pkt.itemInfo || pkt.ItemInfo );
			break;
		case 2:
			Storage.append();
			Storage.setItems(  pkt.itemInfo || pkt.ItemInfo );
			break;
		default:
			throw new Error("[PACKET.ZC.SPLIT_SEND_ITEMLIST_NORMAL] - Unknown invType '" + pkt.invType + "'.");
	}
}

function onItemListEquip(pkt) {
	switch (pkt.invType) {
		case 0:
			Inventory.getUI().setItems( pkt.itemInfo || pkt.ItemInfo );
			break;
		case 1:
			CartItems.setItems( pkt.itemInfo || pkt.ItemInfo );
			break;
		case 2:
			Storage.setItems(  pkt.itemInfo || pkt.ItemInfo );
			break;
		default:
			throw new Error("[PACKET.ZC.SPLIT_SEND_ITEMLIST_NORMAL] - Unknown invType '" + pkt.invType + "'.");
	}
}

function onFavItemList(pkt) {
	if(pkt) {
		// So if favorite is 0, we send 1 to change item.PlaceETCTab to 1
		var isfavitem = pkt.favorite ? 0 : 1;
		Inventory.getUI().updatePlaceETCTab(pkt.index, isfavitem);
	}
}

function onSwitchEquipList(pkt) {
	if (pkt && pkt.ItemInfo) {
		pkt.ItemInfo.forEach(function(item) {
			if (Inventory.getUI().getItemByIndex(item.index)) {
				Inventory.getUI().addItemtoSwitch(item.index);
			}
		});
	}
}

function onSwitchEquipAdd(pkt) {
	if (pkt) {
		switch (pkt.flag) {
			case 0:
				Inventory.getUI().addItemtoSwitch(pkt.index);
				break;
			case 1:
			case 2:
				break;
			default:
				throw new Error("[PACKET.ZC.REQ_WEAR_SWITCHEQUIP_ADD_RESULT] - Error!");
		}
	}
}

function onSwitchEquipRemove(pkt) {
	if (pkt) {
		switch (pkt.flag) {
			case 0:
				Inventory.getUI().removeItemFromSwitch(pkt.index);
				break;
			case 1:
				break;
			case 2:
				break;
			default:
				throw new Error("[PACKET.ZC.REQ_WEAR_SWITCHEQUIP_ADD_RESULT] - Error!");
		}
	}
}

export default function ItemNet()
{
	Network.hookPacket( PACKET.ZC.ITEM_FALL_ENTRY2,       onItemSpamInGround );
	Network.hookPacket( PACKET.ZC.ITEM_DISAPPEAR,         onItemInGroundVanish);
};
