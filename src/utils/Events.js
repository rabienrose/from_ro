
function Events(){}
var _events = [];
var _tick = 0;
var _uid = 0;

Events.setTimeout = function setTimeout( callback, delay )
{
	var i, count, tick;
	var event;
	tick  = _tick + delay;
	event = { callback: callback, tick: tick, uid:_uid++ };
	for (i = 0, count = _events.length; i < count; ++i) {
		if (tick < _events[i].tick) {
			_events.splice( i, 0, event);
			return event.uid;
		}
	}
	_events.push(event);
	return event.uid;
};

Events.clearTimeout = function clearTimeout( uid )
{
	var i, count = _events.length;
	for (i = 0; i < count; ++i) {
		if (_events[i].uid === uid) {
			_events.splice(i, 1);
			return;
		}
	}
};

Events.process = function process( tick )
{
	var count = _events.length;
	while (count > 0) {
		if (_events[0].tick > tick) {
			break;
		}
		_events.shift().callback();
		count--;
	}
	_tick = tick;
};

Events.free = function free()
{
	_events.length = 0;
};

export default Events;