import Camera from "../render/Camera";
import Mouse from "./MouseEventHandler";
import Events from "../utils/Events";


var Mobile = {};
var _processGesture = false;
var _scale, _angle, _touches, _intersect;
var _timer = -1;

Mobile.init = function init()
{
};

var remoteAutoFocus = (function removeAutoFocusClosure()
{
	var _done = false;

	return function removeAutoFocus() {
		if (_done) {
			return;
		}
		HTMLElement.prototype.focus = function() {};
		HTMLElement.prototype.select = function() {};
		_done            = true;
	};
})();

function touchDistance(touches)
{
	var x = touches[0].pageX - touches[1].pageX;
	var y = touches[0].pageY - touches[1].pageY;
	return Math.sqrt(x*x + y*y);
}

function touchAngle(touches)
{
	var x = touches[0].pageX - touches[1].pageX;
	var y = touches[0].pageY - touches[1].pageY;
	return Math.atan2(y, x) * 180 / Math.PI;
}

function touchTranslationX(oldTouches, touches)
{
	var x1 = touches[0].pageX - oldTouches[0].pageX;
	var x2 = touches[1].pageX - oldTouches[1].pageX;

	if ((x1 && x2) &&                // need a direction
			((x1 < 0) === (x2 < 0)) &&    // same direction
			(Math.abs(1-(x1/x2)) < 0.25)  // need a coordinate movement
	) {
		return (x1 + x2) >> 1;
	}
	return 0;
}

function touchTranslationY(oldTouches, touches)
{
	var y1 = touches[0].pageY - oldTouches[0].pageY;
	var y2 = touches[1].pageY - oldTouches[1].pageY;

	if ((y1 && y2) &&                // need a direction
			((y1 < 0) === (y2 < 0)) &&    // same direction
			(Math.abs(1-(y1/y2)) < 0.25)  // need a coordinate movement
	) {
		return (y1 + y2) >> 1;
	}

	return 0;
}

var onTouchStart = function onTouchStartClosure()
{
	function delayedClick() {
		// Only process mousedown if not doing a gesture
		if (!_processGesture) {
			_timer = -1;

			if (Mobile.onTouchStart) {
				Mobile.onTouchStart();
			}

			if (!_intersect) {
				if (Mobile.onTouchEnd) {
					Mobile.onTouchEnd();
				}
			}

			Mouse.intersect = _intersect;
		}
	}

	return function onTouchStart(event)
	{
		remoteAutoFocus();
		_touches = event.originalEvent.touches;
		event.stopImmediatePropagation();

		// Delayed click (to detect gesture)
		if (_timer > -1) {
			Events.clearTimeout(_timer);
			_timer = -1;
		}

		// Gesture
		if (_touches.length > 1) {
			_scale          = touchDistance(_touches);
			_angle          = touchAngle(_touches);
			_processGesture = true;
			return false;
		}

		Mouse.screen.x  = _touches[0].pageX;
		Mouse.screen.y  = _touches[0].pageY;
		
		if(!Session.FreezeUI){
			Mouse.intersect = true;
			_intersect      = true;
		}

		_timer = Events.setTimeout( delayedClick, 200);
		return false;
	};
}();

function onTouchEnd(event)
{
	if (_processGesture) {
		_processGesture = false;
		KEYS.SHIFT      = false;
		Camera.rotate(false);
		return;
	}

	if (_timer > -1) {
		_intersect = false;
		return;
	}

	if (Mobile.onTouchEnd) {
		Mobile.onTouchEnd();
	}

	Mouse.intersect = false;
}

function onTouchMove(event)
{
	event.stopImmediatePropagation();
	var touches = event.originalEvent.touches;
	Mouse.screen.x = touches[0].pageX;
	Mouse.screen.y = touches[0].pageY;
	if (!_processGesture) {
		return;
	}
	var scale = touchDistance(touches) - _scale;
	//var angle = touchAngle(touches) / _angle;
	var x     = Math.abs(touchTranslationX(_touches, touches));
	var y     = Math.abs(touchTranslationY(_touches, touches));

	if (!Camera.action.active && (x > 10 || y > 10)) {
		KEYS.SHIFT = (y > x);
		Camera.rotate(true);
		return;
	}

	// Process zoom
	if (Math.abs(scale) > 10) {
		Camera.zoomFinal -= scale * 0.1;
		Camera.zoomFinal = Math.min( Camera.zoomFinal, Math.abs(Camera.altitudeTo-Camera.altitudeFrom) * Camera.MAX_ZOOM );
		Camera.zoomFinal = Math.max( Camera.zoomFinal,  2.0 );
	}
}

// if (Math.max(screen.availHeight,screen.availWidth) <= 800) {
// 	window.addEventListener('touchstart', function() {
// 		if (!Context.isFullScreen()) {
// 			Context.requestFullScreen();
// 		}
// 	});
// }


window.addEventListener('touchstart', onTouchStart);
window.addEventListener('touchend', onTouchEnd); 
window.addEventListener('touchmove', onTouchMove);

export default Mobile;
