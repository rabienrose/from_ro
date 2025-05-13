import WebGL from '../../utils/WebGL.js';
import FileManager from '../../network/FileManager.js';
import SpriteRenderer from '../SpriteRenderer.js';

function Aura(position, size, distance, textureName, tick) {
  this.position = position;
  this.textureName = textureName;
  this.tick = tick;
  this.distance = distance;
  this.size = size;
  this.minSize = size + distance;
  this.maxSize = size + distance * 2;
  this.aura = [{}, {}];
  this.aura[0].life = 1;
  this.aura[1].life = 1;

  this.aura[0].distance = 15.0;
  this.aura[1].distance = 15.0;

  this.aura[0].riseAngle = 0;
  this.aura[1].riseAngle = 0;

  this.aura[0].height = -1.0;
  this.aura[1].height = -1.0;

  this.aura[0].size = [this.minSize, this.minSize];
  this.aura[0].initialSize = [this.minSize, this.minSize];
  this.aura[1].size = [this.maxSize, this.maxSize];
  this.aura[1].initialSize = [this.maxSize, this.maxSize];

  this.aura[0].direction = 1;
  this.aura[1].direction = -1;

  this.cosCache = {};
  this.sinCache = {};
}

Aura.prototype.init = function init(gl) {
  var self = this;

  FileManager.load('data/texture/effect/' + this.textureName, function (buffer) {
    WebGL.texture(gl, buffer, function (texture) {
      self.texture = texture;
      self.ready = true;
    });
  });
};

Aura.prototype.free = function free(gl) {
  this.ready = false;
};

Aura.prototype.render = function render(gl, tick) {
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  for (var i = 0; i < this.aura.length; i++) {
    this.aura[i].riseAngle += 3;
    if (this.aura[i].riseAngle && !(this.aura[i].riseAngle % 180)) {
      this.aura[i].direction *= -1;
      // Avoid aura getting bigger and bigger or smaller and smaller over time, due to floating number
      if (
        (this.aura[i].direction < 0 && this.aura[i].size[0] < this.aura[i].initialSize[0])
        || (this.aura[i].direction > 0 && this.aura[i].size[0] > this.aura[i].initialSize[0])
      ) {
        this.aura[i].size[0] = this.aura[i].initialSize[0];
        this.aura[i].size[1] = this.aura[i].initialSize[1];
      }
    }
    if (this.aura[i].riseAngle >= 360) {
      this.aura[i].riseAngle -= 360;
    }
  }
  for (var i = 0; i < this.aura.length; i++) {
    var renderer;
    if (!this.aura[i].life) continue;
    if (i === 0) renderer = SpriteRenderer;
    else renderer = Object.assign({}, SpriteRenderer);

    var auraAngle = i * 23;

    var sizeModifier = calculateSize(this, this.aura, auraAngle, i);

    this.aura[i].size[0] += (sizeModifier[0] * this.aura[i].direction) / (this.size / 2);
    this.aura[i].size[1] += (sizeModifier[1] * this.aura[i].direction) / (this.size / 2);

    renderer.size[0] = this.aura[i].size[0];
    renderer.size[1] = this.aura[i].size[1];
    renderer.color[3] = 0.8;
    renderer.color[0] = 1;
    renderer.color[1] = 1;
    renderer.color[2] = 1;
    renderer.zIndex = 1;
    renderer.position[0] = this.position[0];
    renderer.position[1] = this.position[1];
    renderer.position[2] = this.position[2];
    renderer.angle = auraAngle;

    renderer.image.texture = this.texture;
    renderer.render();
  }
};

function calculateSize(self, aura, auraAngle, i) {

  var sinRiseAngle = self.sinCache[aura[i].riseAngle] ? self.sinCache[aura[i].riseAngle] : self.sinCache[aura[i].riseAngle] = Math.sin(aura[i].riseAngle);

  var riseFactor = aura[i].distance * 0.1 * (sinRiseAngle + 1);

  var cos = self.cosCache[auraAngle] ? self.cosCache[auraAngle] : self.cosCache[auraAngle] = Math.cos(auraAngle);
  var startX = cos * (aura[i].distance * 0.8 + riseFactor);

  auraAngle += 90;
  if (auraAngle >= 360) auraAngle -= 360;
  cos = self.cosCache[auraAngle] ? self.cosCache[auraAngle] : self.cosCache[auraAngle] = Math.cos(auraAngle);
  var endX =  cos * (aura[i].distance * 0.8 + riseFactor);

  auraAngle += 90;
  if (auraAngle >= 360) auraAngle -= 360;
  var sin = self.sinCache[auraAngle] ? self.sinCache[auraAngle] : self.sinCache[auraAngle] = Math.sin(auraAngle);
  var startY = sin * (aura[i].distance * 0.8 + riseFactor);

  auraAngle += 90;
  if (auraAngle >= 360) auraAngle -= 360;
  sin = self.sinCache[auraAngle] ? self.sinCache[auraAngle] : self.sinCache[auraAngle] = Math.sin(auraAngle);
  var endY = sin * (aura[i].distance * 0.8 + riseFactor);

  var width = Math.abs(endX - startX);
  var height = Math.abs(endY - startY);

  return [width, height];
}

Aura.init = function init(gl) {
  this.ready = true;
  this.renderBeforeEntities = false;

};

Aura.free = function free(gl) {
  this.ready = false;
};

Aura.beforeRender = function beforeRender(gl, modelView, projection, fog, tick) {
  gl.depthMask(false);
  SpriteRenderer.bind3DContext(gl, modelView, projection, fog);
  SpriteRenderer.shadow = 1;
  SpriteRenderer.angle = 0;
  SpriteRenderer.size[0] = 100;
  SpriteRenderer.size[1] = 100;
  SpriteRenderer.offset[0] = 0;
  SpriteRenderer.offset[1] = 0;
  SpriteRenderer.image.palette = null;
  SpriteRenderer.color[0] = 1;
  SpriteRenderer.color[1] = 1;
  SpriteRenderer.color[2] = 1;
  SpriteRenderer.color[3] = 1;
  SpriteRenderer.depth = 0;
  SpriteRenderer.zIndex = 0;

};
 
Aura.afterRender = function afterRender(gl) {
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.depthMask(true);
  SpriteRenderer.unbind(gl);
};

export default Aura;