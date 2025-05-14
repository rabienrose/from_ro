
	var Mouse = {};
	Mouse.screen = {
		x: -1,
		y: -1,
		width:  0,
		height: 0
	};
	Mouse.world = {
		x: -1,
		y: -1,
		z: -1
	};
	Mouse.intersect = false;
	Mouse.MOUSE_STATE = {
		NORMAL: 0,
		DRAGGING: 1,
		USESKILL: 2,
	}
	Mouse.state = 0;

	window.addEventListener('mousemove', function(event)
	{
		Mouse.screen.x = event.pageX;
		Mouse.screen.y = event.pageY;
	});
	
	export default Mouse;
