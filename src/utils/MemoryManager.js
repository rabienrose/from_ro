var _memory = {};
var _rememberTime = 2 * 60 * 1000; // 2 min
var _lastCheckTick = 0;
var _cleanUpInterval = 30 * 1000;

function get( filename )
{
	if (!_memory[filename]) {
		return null;
	}else{
		_memory[filename].lastTimeUsed = Date.now();
		return _memory[filename].data;
	}
}

function exist( filename )
{
	return !!_memory[filename];
}

function set( filename, data, error )
{
	_memory[filename] = {
		lastTimeUsed: Date.now(),
		data: data
	}
}

function clean( gl, now )
{
	if (_lastCheckTick + _cleanUpInterval > now) {
		return;
	}

	var keys, item;
	var i, count, tick;
	var list = [];

	keys  = Object.keys(_memory);
	count = keys.length;
	tick  = now - _rememberTime;

	for (i = 0; i < count; ++i) {
		item = _memory[ keys[i] ];
		if (item.lastTimeUsed < tick) {
			remove( gl, keys[i] );
			list.push( keys[i] );
		}
	}

	if (list.length) {
		console.log( '%c[MemoryManager] - Removing ' +  list.length + ' unused elements from memory.', 'color:#d35111', list);
	}

	_lastCheckTick = now;
}

function remove( gl, filename )
{
	// Not found or filename is undefined?
	if (!filename || !_memory[filename]) {
		return;
	}

	var file = get( filename );
	var ext  = '';
	var i, count;

	var matches = filename.match(/\.[^\.]+$/);

	if (matches) {
		ext = matches.toString().toLowerCase();
	}

	// Free file
	if (file) {
		switch (ext) {

			// Delete GPU textures from sprites
			case '.spr':
				if (file.frames) {
					for (i = 0, count = file.frames.length; i < count; ++i) {
						if (file.frames[i].texture && gl != null && gl.isTexture(file.frames[i].texture)) {
							gl.deleteTexture( file.frames[i].texture );
						}
					}
				}
				if (file.texture && gl != null && gl.isTexture(file.texture)) {
					gl.deleteTexture( file.texture );
				}
				break;

			// Delete palette
			case '.pal':
				if (file.texture && gl != null && gl.isTexture(file.texture)) {
					gl.deleteTexture( file.texture );
				}
				break;

			// If file is a blob, remove it (wav, mp3, lua, lub, txt, ...)
			default:
				if (file.match && file.match(/^blob\:/)) {
					URL.revokeObjectURL(file);
				}
				break;
		}
	}

	// Delete from memory
	delete _memory[filename];
}

function search(regex)
{
	var keys;
	var i, count, out = [];

	keys  = Object.keys(_memory);
	count = keys.length;

	for (i = 0; i < count; ++i) {
		if (keys[i].match(regex)) {
			out.push( keys[i] );
		}
	}

	return out;
}

export default {
	get,
	set,
	clean,
	remove,
	exist,
	search
};
