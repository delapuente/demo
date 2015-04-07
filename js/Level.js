
(function () {
  'use strict';

  function Level(representation) {
    var levelData = this._parse(representation);
    this._board = levelData.board;
    this._stains = levelData.stains;
    this.color = levelData.color;
    this._mutantDrops = this.drops.filter(function (drop) {
      return drop instanceof MutantDrop;
    });
  }

  Level.prototype = {
    _parse: function (representation) {
      var maxCols = 0;
      var lines = representation.split('\n');
      var stainColor = lines.shift().trim();
      if (stainColor === '?') { stainColor = Drop.randomColor(); }
      while (lines.length && lines[0].trim() === '') { lines.shift(); }
      var board = lines.map(parseLine);
      var stains = Stain.getAll(stainColor, board);
      return { color: stainColor, board: board, stains: stains };

      function parseLine(line, lineNo) {
        line = line.trimRight();
        var isStain, drop, id, row = [];
        for (var col = 0, c; (c = line[col]); col += 2) {
          id = [lineNo, col/2];
          if (c === 'M') {
            drop = new MutantDrop(id);
          }
          else {
            if (c === '?') { c = Drops.randomColor(); }
            drop = new Drop(id, c.toLowerCase());
          }
          row.push(drop);
        }
        maxCols = Math.max(row.length, maxCols);
        for (col = row.length; col < maxCols; col++) {
          row.push(new Drop([lineNo, col], ' '));
        }
        return row;
      }
    },

    at: function (r, c) {
      return this._board[r][c];
    },

    get stains() {
      return this._stains;
    },

    extendStainTo: function (r, c) {
      var result;
      for (var i = 0, stain; (stain = this._stains[i]); i++) {
        result = stain.extendTo(this.at(r, c));
        if (result) { break; }
      }
      if (result) {
        this._stains = Stain.fuse(this._stains);
        this._mutantDrops.forEach(function (mutant) {
          if (!mutant.inStain()) {
            mutant.changeColor();
            while (mutant.type === this.color) { mutant.changeColor(); }
          }
        }.bind(this));
      }
      return result;
    },

    get drops() {
      var list = [];
      this.forEach(function (d) { list.push(d); });
      return list;
    },

    forEach: function (task) {
      for (var r = 0, row; (row = this._board[r]); r++) {
        for (var c = 0, drop; (drop = row[c]); c++) {
          task(drop);
        }
      }
    }
  };


  window.Level = Level;
}());
