
(function () {
  'use strict';

  function getId(r, c, totalCols) {
    return r * totalCols + c;
  }

  function Perimeter(board) {
    this._cols = board[0].length;
    this._drops = {};
  }

  Perimeter.prototype = {
    get drops() {
      return Object.keys(this._drops).map(function (id) {
        return this._drops[id];
      }.bind(this));
    },

    get length() {
      return Object.keys(this._drops).length;
    },

    getOfColor: function (color) {
      return this.drops.filter(function (drop) { return drop.type === color; });
    },

    contains: function (drop) {
      return !!this._drops[this._getId(drop)];
    },

    add: function (drop) {
      this._drops[this._getId(drop)] = drop;
    },

    _getId: function (drop) {
      return getId(drop.row, drop.column, this._cols);
    },

    remove: function (drop) {
      delete this._drops[this._getId(drop)];
    }
  };

  function Stain(drops, board) {
    if (!Array.isArray(drops) || drops.length < 1) {
      throw new Error('A stain is originated from a non empty list of drops.');
    }

    this._color = drops[0].type;
    this._board = board;
    this._drops = {};
    this._perimeter = new Perimeter(board);

    var addDrop = this._addDrop.bind(this);
    drops.forEach(addDrop);
  }

  Stain.getAll = function (color, board) {
    var stain, stains = [];
    board.forEach(function (row) {
      row.forEach(function (drop) {
        if (drop.type === color && !drop.inStain()) {
          stain = new Stain([drop], board);
          stain.maximize();
          stains.push(stain);
        }
      });
    });
    return stains;
  };

  Stain.fuse = function (stains) {
    stains = stains.slice(0);
    var fusedStains = [];
    var isolatedStains = 0;
    while (stains.length > 0) {
      var target = stains.shift();
      if (!target._fused) {
        var isNextToTarget = target.isNextTo.bind(target);
        var nextToTarget = stains.filter(isNextToTarget);
        if (nextToTarget.length === 0) { isolatedStains++; }
        fusedStains.push(fuseAll(target, nextToTarget));
      }
    }

    if (isolatedStains === fusedStains.length) {
      return fusedStains;
    }
    else {
      return Stain.fuse(fusedStains);
    }

    function fuseAll(stain, targets) {
      var allDrops = targets.reduce(function (drops, anotherStain) {
        anotherStain._fused = true;
        return drops.concat(anotherStain._dropList);
      }, stain._dropList);
      return new Stain(allDrops, stain._board);
    }
  };

  Stain.prototype = {
    get area() {
      return Object.keys(this._drops).length;
    },

    _addDrop: function (drop) {
      drop.type = this.color;
      drop.stain = this;
      this._color = this._color || drop.type;
      this._drops[this._getId(drop)] = drop;
      this._updatePerimeter(drop);
    },

    _getId: function (drop) {
      var cols = this._board[0].length;
      return getId(drop.row, drop.column, cols);
    },

    _updatePerimeter: function (drop) {
      this._perimeter.remove(drop);
      this._getNeighbourhood(drop).forEach(function (neighbour) {
        if (!this.contains(neighbour)) {
          this._perimeter.add(neighbour);
        }
      }.bind(this));
    },

    _getNeighbourhood: function (drop) {
      var r, c, neighbour, neighbourhood = [];
      var deltas = [ [-1, 0], [0, 1], [1, 0], [0, -1] ];
      deltas.forEach(function (delta) {
        r = drop.row + delta[0];
        c = drop.column + delta[1];
        neighbour = this._board[r] && this._board[r][c];
        if (neighbour && !neighbour.isVoid()) {
          neighbourhood.push(neighbour);
        }
      }.bind(this));
      return neighbourhood;
    },

    contains: function (drop) {
      return !!this._drops[this._getId(drop)];
    },

    get color() {
      return this._color;
    },

    maximize: function () {
      var expansionSet = this._perimeter.getOfColor(this.color);
      while (expansionSet.length > 0) {
        expansionSet.forEach(this._addDrop.bind(this));
        expansionSet = this._perimeter.getOfColor(this.color);
      }
    },

    isNextTo: function (stain) {
      var perimeter = this._perimeter;
      return stain._dropList.some(function (drop) {
        return perimeter.contains(drop);
      });
    },

    get _dropList() {
      var drops = this._drops;
      return Object.keys(drops).map(function (key) { return drops[key]; });
    },

    extendTo: function (drop) {
      var that = this;
      var result, isOk = this._perimeter.contains(drop);
      if (isOk) {
        result = {
          get converted() {
            return this._converted.reduce(function (all, partial) {
              return all.concat(partial);
            }, []);
          },

          _converted: []
        };
        var addDrop = this._addDrop.bind(this);
        var color = drop.type;
        var sameColorDrops = this._perimeter.getOfColor(color);
        while (sameColorDrops.length > 0) {
          sameColorDrops.forEach(addDrop);
          result._converted.push(sameColorDrops);
          sameColorDrops = this._perimeter.getOfColor(color);
        }
      }
      return result;
    },

    isComplete: function () {
      return this._perimeter.length === 0;
    }
  };

  window.Perimeter = Perimeter;
  window.Stain = Stain;
}());
