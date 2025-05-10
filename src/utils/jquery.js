import jQuery from 'jquery';

jQuery.fn.text = function( text ) {
	return jQuery.access( this, function( value ) {
		if (value === undefined) {
			return jQuery.text( this );
		}
		var reg, txt, result;
		value = String(value);
		txt   = jQuery.escape(value);
		reg = /\^([a-fA-F0-9]{6})/ ;
		while ((result = reg.exec(txt))) {
			txt = txt.replace( result[0], '<span style="color:#' + result[1] + '">') + '</span>';
		}
		reg = /\^nItemID\^(\d+)/g;
		while ((result = reg.exec(txt))) {
			txt = txt.replace( result[0], DB.getItemInfo(result[1]).identifiedDisplayName );
		}

		txt = txt.replace(/\n/g, '<br/>');
		return jQuery(this).html( txt );
	}, null, text, arguments.length );
};

jQuery.escape = (function escapeClosure(){
	const whitelist = [
		'font',
		'i',
		'b'
	]
	return function escape(text) {
		let filtered = jQuery('<div/>').html(text);
		filtered.find('*').each(function(){
			if (whitelist.indexOf(this.tagName.toLowerCase()) === -1) {
				jQuery(this).replaceWith( jQuery(this).html() );
			}
		});
		return filtered.html();
	};
})();

export default jQuery.noConflict( true );
