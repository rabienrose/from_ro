function Targa(){}

Targa.Type = {
	NO_DATA     : 0,
	INDEXED     : 1,
	RGB         : 2,
	GREY        : 3,
	RLE_INDEXED : 9,
	RLE_RGB     : 10,
	RLE_GREY    : 11,
};

Targa.Origin = {
	BOTTOM_LEFT:  0x00,
	BOTTOM_RIGHT: 0x01,
	TOP_LEFT:     0x02,
	TOP_RIGHT:    0x03,
	SHIFT:        0x04,
	MASK:         0x30,
};

function checkHeader( header )
{
	if (header.imageType === Targa.Type.NO_DATA) {
		throw new Error('Targa::checkHeader() - No data');
	}
	if (header.hasColorMap) {
		if (header.colorMapLength > 256 || header.colorMapSize !== 24 || header.colorMapType !== 1) {
			throw new Error('Targa::checkHeader() - Invalid colormap for indexed type');
		}
	}
	else {
		if (header.colorMapType) {
			throw new Error('Targa::checkHeader() - Why does the image contain a palette ?');
		}
	}
	if (header.width <= 0 || header.height <= 0) {
		throw new Error('Targa::checkHeader() - Invalid image size');
	}
	if (header.pixelDepth !== 8  &&
			header.pixelDepth !== 16 &&
			header.pixelDepth !== 24 &&
			header.pixelDepth !== 32) {
		throw new Error('Targa::checkHeader() - Invalid pixel size "' + header.pixelDepth + '"');
	}
}

function decodeRLE( data, offset, pixelSize, outputSize)
{
	var pos, c, count, i;
	var pixels, output;

	output = new Uint8Array(outputSize);
	pixels = new Uint8Array(pixelSize);
	pos    = 0;

	while (pos < outputSize) {
		c     = data[offset++];
		count = (c & 0x7f) + 1;
		if (c & 0x80) {
			for (i = 0; i < pixelSize; ++i) {
				pixels[i] = data[offset++];
			}
			for (i = 0; i < count; ++i) {
				output.set(pixels, pos);
				pos += pixelSize;
			}
		}
		else {
			count *= pixelSize;
			for (i = 0; i < count; ++i) {
				output[pos++] = data[offset++];
			}
		}
	}
	return output;
}

function getImageData8bits(imageData, indexes, colormap, width, y_start, y_step, y_end, x_start, x_step, x_end)
{
	var color, i, x, y;
	for (i = 0, y = y_start; y !== y_end; y += y_step) {
		for (x = x_start; x !== x_end; x += x_step, i++) {
			color = indexes[i];
			imageData[(x + width * y) * 4 + 3] = 255;
			imageData[(x + width * y) * 4 + 2] = colormap[(color * 3) + 0];
			imageData[(x + width * y) * 4 + 1] = colormap[(color * 3) + 1];
			imageData[(x + width * y) * 4 + 0] = colormap[(color * 3) + 2];
		}
	}
	return imageData;
}

function getImageData16bits(imageData, pixels, colormap, width, y_start, y_step, y_end, x_start, x_step, x_end)
{
	var color, i, x, y;
	for (i = 0, y = y_start; y !== y_end; y += y_step) {
		for (x = x_start; x !== x_end; x += x_step, i += 2) {
			color = pixels[i + 0] | (pixels[i + 1] << 8);
			imageData[(x + width * y) * 4 + 0] = (color & 0x7C00) >> 7;
			imageData[(x + width * y) * 4 + 1] = (color & 0x03E0) >> 2;
			imageData[(x + width * y) * 4 + 2] = (color & 0x001F) >> 3;
			imageData[(x + width * y) * 4 + 3] = (color & 0x8000) ? 0 : 255;
		}
	}
	return imageData;
}

function getImageData24bits(imageData, pixels, colormap, width, y_start, y_step, y_end, x_start, x_step, x_end)
{
	var i, x, y;
	for (i = 0, y = y_start; y !== y_end; y += y_step) {
		for (x = x_start; x !== x_end; x += x_step, i += 3) {
			imageData[(x + width * y) * 4 + 3] = 255;
			imageData[(x + width * y) * 4 + 2] = pixels[i + 0];
			imageData[(x + width * y) * 4 + 1] = pixels[i + 1];
			imageData[(x + width * y) * 4 + 0] = pixels[i + 2];
		}
	}
	return imageData;
}

function getImageData32bits(imageData, pixels, colormap, width, y_start, y_step, y_end, x_start, x_step, x_end)
{
	var i, x, y;
	for (i = 0, y = y_start; y !== y_end; y += y_step) {
		for (x = x_start; x !== x_end; x += x_step, i += 4) {
			imageData[(x + width * y) * 4 + 2] = pixels[i + 0];
			imageData[(x + width * y) * 4 + 1] = pixels[i + 1];
			imageData[(x + width * y) * 4 + 0] = pixels[i + 2];
			imageData[(x + width * y) * 4 + 3] = pixels[i + 3];
		}
	}
	return imageData;
}

function getImageDataGrey8bits(imageData, pixels, colormap, width, y_start, y_step, y_end, x_start, x_step, x_end)
{
	var color, i, x, y;
	for (i = 0, y = y_start; y !== y_end; y += y_step) {
		for (x = x_start; x !== x_end; x += x_step, i++) {
			color = pixels[i];
			imageData[(x + width * y) * 4 + 0] = color;
			imageData[(x + width * y) * 4 + 1] = color;
			imageData[(x + width * y) * 4 + 2] = color;
			imageData[(x + width * y) * 4 + 3] = 255;
		}
	}
	return imageData;
}

function getImageDataGrey16bits(imageData, pixels, colormap, width, y_start, y_step, y_end, x_start, x_step, x_end)
{
	var i, x, y;
	for (i = 0, y = y_start; y !== y_end; y += y_step) {
		for (x = x_start; x !== x_end; x += x_step, i += 2) {
			imageData[(x + width * y) * 4 + 0] = pixels[i + 0];
			imageData[(x + width * y) * 4 + 1] = pixels[i + 0];
			imageData[(x + width * y) * 4 + 2] = pixels[i + 0];
			imageData[(x + width * y) * 4 + 3] = pixels[i + 1];
		}
	}
	return imageData;
}

Targa.prototype.open = function targaOpen(path, callback)
{
	var req, tga = this;
	req = new XMLHttpRequest();
	req.responseType = 'arraybuffer';
	req.open('GET', path, true);
	req.onload = function() {
		if (this.status === 200) {
			tga.load(new Uint8Array(req.response));
			if (callback) {
				callback.call(tga);
			}
		}
	};
	req.send(null);
};

Targa.prototype.load = function targaLoad( data )
{
	var offset = 0;
	if (data.length < 0x12) {
		throw new Error('Targa::load() - Not enough data to contain header');
	}
	this.header = {
		/* 0x00  BYTE */  idLength:       data[offset++],
		/* 0x01  BYTE */  colorMapType:   data[offset++],
		/* 0x02  BYTE */  imageType:      data[offset++],
		/* 0x03  WORD */  colorMapIndex:  data[offset++] | data[offset++] << 8,
		/* 0x05  WORD */  colorMapLength: data[offset++] | data[offset++] << 8,
		/* 0x07  BYTE */  colorMapDepth:  data[offset++],
		/* 0x08  WORD */  offsetX:        data[offset++] | data[offset++] << 8,
		/* 0x0a  WORD */  offsetY:        data[offset++] | data[offset++] << 8,
		/* 0x0c  WORD */  width:          data[offset++] | data[offset++] << 8,
		/* 0x0e  WORD */  height:         data[offset++] | data[offset++] << 8,
		/* 0x10  BYTE */  pixelDepth:     data[offset++],
		/* 0x11  BYTE */  flags:          data[offset++]
	};
	this.header.hasEncoding = (this.header.imageType === Targa.Type.RLE_INDEXED || this.header.imageType === Targa.Type.RLE_RGB   || this.header.imageType === Targa.Type.RLE_GREY);
	this.header.hasColorMap = (this.header.imageType === Targa.Type.RLE_INDEXED || this.header.imageType === Targa.Type.INDEXED);
	this.header.isGreyColor = (this.header.imageType === Targa.Type.RLE_GREY    || this.header.imageType === Targa.Type.GREY);
	checkHeader(this.header);
	offset += this.header.idLength;
	if (offset >= data.length) {
		throw new Error('Targa::load() - No data');
	}
	if (this.header.hasColorMap) {
		var colorMapSize  = this.header.colorMapLength * (this.header.colorMapDepth >> 3);
		this.palette      = data.subarray( offset, offset + colorMapSize);
		offset           += colorMapSize;
	}
	var pixelSize  = this.header.pixelDepth >> 3;
	var imageSize  = this.header.width * this.header.height;
	var pixelTotal = imageSize * pixelSize;
	if (this.header.hasEncoding) {
		this.imageData = decodeRLE(data, offset, pixelSize, pixelTotal);
	}
	else {
		this.imageData = data.subarray( offset, offset + (this.header.hasColorMap ? imageSize : pixelTotal) );
	}
};

Targa.prototype.getImageData = function targaGetImageData( imageData )
{
	var width  = this.header.width;
	var height = this.header.height;
	var origin = (this.header.flags & Targa.Origin.MASK) >> Targa.Origin.SHIFT;
	var x_start, x_step, x_end, y_start, y_step, y_end;
	var getImageData;
	if (!imageData) {
		if (document) {
			imageData = document.createElement('canvas').getContext('2d').createImageData(width, height);
		}
		else {
			imageData = {
				width:  width,
				height: height,
				data: new Uint8ClampedArray(width * height * 4)
			};
		}
	}
	if (origin === Targa.Origin.TOP_LEFT || origin === Targa.Origin.TOP_RIGHT) {
		y_start = 0;
		y_step  = 1;
		y_end   = height;
	}
	else {
		y_start = height - 1;
		y_step  = -1;
		y_end   = -1;
	}
	if (origin === Targa.Origin.TOP_LEFT || origin === Targa.Origin.BOTTOM_LEFT) {
		x_start = 0;
		x_step  = 1;
		x_end   = width;
	}
	else {
		x_start = width - 1;
		x_step  = -1;
		x_end   = -1;
	}
	switch (this.header.pixelDepth) {
		case 8:
			getImageData = this.header.isGreyColor ? getImageDataGrey8bits : getImageData8bits;
			break;

		case 16:
			getImageData = this.header.isGreyColor ? getImageDataGrey16bits : getImageData16bits;
			break;

		case 24:
			getImageData = getImageData24bits;
			break;

		case 32:
			getImageData = getImageData32bits;
			break;
	}

	getImageData(imageData.data, this.imageData, this.palette, width, y_start, y_step, y_end, x_start, x_step, x_end);
	return imageData;
};

Targa.prototype.getCanvas = function targaGetCanvas()
{
	var canvas, ctx, imageData;
	canvas    = document.createElement('canvas');
	ctx       = canvas.getContext('2d');
	imageData = ctx.createImageData(this.header.width, this.header.height);
	canvas.width  = this.header.width;
	canvas.height = this.header.height;
	ctx.putImageData(this.getImageData(imageData), 0, 0);
	return canvas;
};

Targa.prototype.getDataURL = function targaGetDatURL( type )
{
	return this.getCanvas().toDataURL(type || 'image/png');
};

export default Targa;