
describe("Level", function () {
  'use strict';

  var testLevel = 'b        \n' +
                  '         \n' +
                  '  b r g b\n' +
                  'g b r p  \n' +
                  '\n'          +
                  'g          ';

  var mutantLevel = 'r       \n' +
                    '\n'         +
                    'M r g';

  var randomLevel = '?\n\nr';

  var ROWS = 4, COLS = 5;

  var RealDrop = Drop;
  var RealMutantDrop = MutantDrop;

  function installSpies() {
    spyOn(window, 'Drop').and.callFake(function (id, type) {
      return new RealDrop(id, type);
    });
    spyOn(window, 'MutantDrop').and.callFake(function (id, type) {
      return new RealMutantDrop(id, type);
    });
  }

  function restoreSpies() {
    window.Drop = RealDrop;
    window.MutantDrop = RealMutantDrop;
  }

  it('should parse a map string ignoring right spaces', function () {
    installSpies();
    var map = new Level(testLevel);
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        expect(Drop).toHaveBeenCalledWith([r, c], jasmine.any(String));
      }
    }
    expect(Drop.calls.count()).toBe(ROWS * COLS);
    expect(map.color).toBe('b');
    restoreSpies();
  });

  it('should parse a map taking into account empty lines', function () {
    var map = new Level(testLevel);
    var emptyRow = (function () {
      var row = [];
      for (var i = 0; i < COLS; i++) { row.push(map.at(2, i)); }
      return row;
    }());
    expect(emptyRow.every(function (d) { return d.isVoid(); })).toBe(true);
  });

  it('should set the proper initial stains', function () {
    var map = new Level(testLevel);
    expect(map.stains).toEqual(jasmine.any(Array));
    expect(map.stains.length).toBe(2);

    var bigStain = map.stains[0], singleDropStain = map.stains[1];

    expect(bigStain.area).toBe(2);
    expect(bigStain.contains(map.at(0, 1))).toBe(true);
    expect(bigStain.contains(map.at(1, 1))).toBe(true);

    expect(singleDropStain.area).toBe(1);
    expect(singleDropStain.contains(map.at(0, 4))).toBe(true);
  });

  it('allows to pass through each drop in the level', function () {
    var map = new Level(testLevel);
    var i = 0, expected = ' brgbgbrp      g    ';
    map.forEach(function (drop) {
      expect(drop.type).toBe(expected[i]);
      i++;
    });
  });

  it('parses a random map color', function () {
    var map = new Level(randomLevel);
    expect(Drop.colorList).toContain(map.color);
  });

  it('parses mutant drops properly', function () {
    installSpies();
    var map = new Level(mutantLevel);
    expect(MutantDrop).toHaveBeenCalledWith([0, 0]);
    restoreSpies();
  });

  it('update mutant drops after extending a stain', function () {
    // Ensure a map where the mutant drop is not green nor red
    spyOn(Drop, 'randomColor').and.returnValue('o');
    var map = new Level(mutantLevel);

    var mutantColor = map.at(0, 0).type;
    map.extendStainTo(0, 2);
    expect(map.at(0, 0).type).not.toBe(mutantColor);
    expect(map.at(0, 0).type).not.toBe(map.color);
  });
});
