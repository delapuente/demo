
(function () {
  'use strict';

  function DropView(drop, game) {
    this._model = drop;
    this._model.onBecomeStain = this._setupGraphic.bind(this);
    this._model.onColorChange = this._setupGraphic.bind(this);
    this.gfx = game.add.graphics();
    this._setupGraphic();
    this._setupInput();
  }

  DropView.prototype = {
    _stainSide: 30,

    _setupGraphic: function () {
      var size = this._model.inStain() ? 1 : 0.5;
      var actualSide = this._stainSide;
      var side = actualSide * size;
      var canvas = this.gfx;
      canvas.clear();
      canvas.x = actualSide * (this._model.column + 0.5);
      canvas.y = actualSide * (this._model.row + 0.5);
      canvas.beginFill(Drop.colors[this._model.type], 1.0);
      canvas.drawRect(-side/2, -side/2, side, side);
      canvas.endFill();
      if (this._model instanceof MutantDrop && !this._model.inStain()) {
        canvas.lineStyle(2, Drop.colors[this._model.type]);
        canvas.beginFill(0, 0);
        canvas.arc(0, 0, actualSide/2, 0, Math.PI * 2);
        canvas.endFill();
      }
      canvas.hitArea = new Phaser.Rectangle(
        -actualSide/2, -actualSide/2,
        actualSide, actualSide
      );
    },

    _setupInput: function () {
      this.gfx.enabled = true;
      this.gfx.inputEnabled = true;
      this.gfx.events.onInputDown.add(this._onClick, this);
    },

    _onClick: function () {
      return this.onClick({ drop: this._model });
    }
  };

  function LikwitLevel(mapUrl) {
    this._mapUrl = mapUrl;
  }

  LikwitLevel.prototype = {

    preload: function () {
      this.load.text('mapDefinition', this._mapUrl);
    },

    create: function () {
      var mapDefinition = this.cache.getText('mapDefinition');
      this._level = new Level(mapDefinition);
      this._board = this._makeBoard();
    },

    update: function () {
    },

    _makeBoard: function () {
      var board = this.add.group();

      // Add drops
      this._level.forEach(function (drop) {
        if (!drop.isVoid()) {
          drop.$view = new DropView(drop, this);
          drop.$view.onClick = this._onDropClick.bind(this);
          board.add(drop.$view.gfx);
        }
      }.bind(this));

      // Center
      board.x = (this.camera.x + this.camera.width - board.width)/2;
      board.y = (this.camera.y + this.camera.height - board.height)/2;

      return board;
    },

    _onDropClick: function (evt) {
      this._level.extendStainTo(evt.drop.row, evt.drop.column);
    }
  };

  window.LikwitLevel = LikwitLevel;
}());
