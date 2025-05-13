import Renderer from '../Renderer.js';

function Animations(entity)
{
	this.entity = entity;
	this.list   = [];
}

Animations.prototype.add = function add(callback)
{
	this.list.push({
		tick:     Renderer.tick,
		callback: callback
	});
};

Animations.prototype.process = function process()
{
	var i, count;

	for (i = 0, count = this.list.length; i < count; ++i) {
		if (this.list[i].callback(Renderer.tick - this.list[i].tick)) {
			this.list.splice(i, 1);
			i--;
			count--;
		}
	}
};

Animations.prototype.free = function free()
{
	this.list.length = 0;
};


export default function init() {
	this.animations = new Animations(this);
};
