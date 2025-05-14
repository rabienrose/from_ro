 import Targa from '../network/Targa';

	var Texture = {};
	Texture.load = function load( data, oncomplete )
	{
		var args = Array.prototype.slice.call(arguments, 2);
		if (!data){
			args.unshift(false);
			oncomplete.apply( null, args );
			return;
		}
		if (data instanceof ArrayBuffer) {
			try {
				var tga = new Targa();
				tga.load( new Uint8Array(data) );
				args.unshift(true);
				oncomplete.apply( tga.getCanvas(), args );
			}
			catch(e) {
				console.error( e.message );
				args.unshift(false);
				oncomplete.apply( null, args);
			}
			return;
		}
		var img = new Image();
		img.src = data;
		img.addEventListener('error', () => {
			console.error('Texture.js: src failed to load.');
		});
		img.onload = function OnLoadClosure(){
			if (data.match(/^blob\:/)){
				URL.revokeObjectURL(data);
			}
			var canvas = document.createElement('canvas');
			var ctx    = canvas.getContext('2d');
			canvas.width  = this.width;
			canvas.height = this.height;
			ctx.drawImage( this, 0, 0, this.width, this.height );
			Texture.removeMagenta( canvas );
			args.unshift( true );
			oncomplete.apply( canvas, args );
		};
	};

	Texture.removeMagenta = function removeMagenta( canvas )
	{
		var ctx, imageData, data;
		var count, i;
		ctx       = canvas.getContext('2d');
		imageData = ctx.getImageData( 0, 0, canvas.width, canvas.height );
		data      = imageData.data;
		count     = data.length;
		for (i = 0; i < count; i +=4) {
			if (data[i+0] > 230 && data[i+1] < 20 && data[i+2] > 230) {
				data[i+0] = data[i+1] = data[i+2] = data[i+3] = 0;
			}
		}
		ctx.putImageData( imageData, 0, 0 );
	};

export default Texture;
