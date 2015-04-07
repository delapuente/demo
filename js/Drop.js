
(function () {
  'use strict';

  function Drop(id, type) {
    this._id = id;
    this._type = type;
  }

  Drop.colors = {
    r: 0xff0000,
    g: 0x00ff00,
    b: 0x0000ff,
    c: 0x66ccff,
    p: 0xf781f3,
    v: 0xcc00cc,
    o: 0xff9900,
    y: 0xf4fA58
  };

  Drop.colorList = Object.keys(Drop.colors);

  Drop.randomColor = function () {
    var colors = Drop.colorList;
    return colors[Math.floor(Math.random() * colors.length)];
  };

  Drop.prototype = {
    get id() {
      return this._id;
    },

    get row() {
      return this._id[0];
    },

    get column() {
      return this._id[1];
    },

    inStain: function () {
      return !!this.stain;
    },

    get type() {
      return this._type;
    },

    set type(value) {
      this._type = value;
    },

    isVoid: function () {
      return this._type === ' ';
    },

    _stain: null,

    onBecomeStain: function () {},

    set stain(value) { this._stain = value; this.onBecomeStain(); },

    get stain() { return this._stain; }
  };

  function MutantDrop(id, type) {
    type = type || Drop.randomColor();
    Drop.call(this, id, type);
  }
  MutantDrop.prototype = Object.create(Drop.prototype);
  MutantDrop.prototype.constructor = MutantDrop;

  MutantDrop.prototype.changeColor = function () {
    var newColor = this._type;
    if (!this.inStain()) {
      newColor = Drop.randomColor();
      while (this._type === newColor) { newColor = Drop.randomColor(); }
      this._type = newColor;
      this.onColorChange(this._type);
    }
    return newColor;
  };

  MutantDrop.prototype.onColorChange = function () {};

  window.Drop = Drop;
  window.MutantDrop = MutantDrop;
}());
