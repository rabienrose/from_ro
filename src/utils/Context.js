
Context.isFullScreen = function IsFullScreen()
{
	return !!(
		document.fullscreenElement ||
		document.mozFullScreenElement ||
		document.webkitFullscreenElement
	);
};

Context.requestFullScreen = function RequestFullScreen()
{
	if (!Context.isFullScreen()) {
		var element = document.documentElement;

		if (element.requestFullscreen) {
			element.requestFullscreen();
		}
		else if (element.mozRequestFullScreen) {
			element.mozRequestFullScreen();
		}
		else if (element.webkitRequestFullscreen) {
			element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
		}
	}
};

Context.cancelFullScreen = function CancelFullScreen()
{
	if (document.cancelFullScreen) {
		document.cancelFullScreen();
	}
	else if (document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	}
	else if (document.webkitCancelFullScreen) {
		document.webkitCancelFullScreen();
	}
};

export default Context;
