
describe("Perimeter", function () {
  var fakeBoard = { 0: { length: 5 } };
  var perimeter;

  beforeEach(function () {
    perimeter = new Perimeter(fakeBoard);
  });

  it('allows adding new drops without repetitions', function () {
    var drop = new Drop([2, 2], 'r');
    perimeter.add(drop);
    perimeter.add(new Drop([3, 3], 'r'));
    expect(perimeter.length).toBe(2);
    perimeter.add(drop);
    expect(perimeter.length).toBe(2);
  });

  it('allows to remove a drop', function () {
    var drop = new Drop([2, 2], 'r');
    perimeter.add(drop);
    perimeter.remove(drop);
    expect(perimeter.drops.length).toBe(0);
  });

  it('tells about a drop belonging to the perimeter', function () {
    var containedDrop = new Drop([2, 2], 'r');
    var notContainedDrop = new Drop([3, 3], 'r');
    perimeter.add(containedDrop);
    expect(perimeter.contains(containedDrop)).toBe(true);
    expect(perimeter.contains(notContainedDrop)).toBe(false);
  });

  it('does nothing if removing a not contained drop', function () {
    function removeNotContained() { perimeter.remove(new Drop([3, 3], 'r')); }
    expect(removeNotContained).not.toThrow();
  });
});

describe("Stain", function () {
  'use strict';

  var testArray = [
    [' ', 'b', 'r', 'g', 'b', 'r'],
    ['o', 'b', 'r', 'p', ' ', ' '],
    ['o', 'o', 'r', 'r', ' ', ' ']
  ];
  var uniformArray = [
    ['g', 'g'],
    ['g', 'g']
  ];
  var uniformBoard, testBoard, stain;

  var bigStainData,
      singleDropStainData,
      redDrops,
      isolatedRedDrop, isolatedGreenDrop;

  function convertToBoard(array) {
    return array.map(function (row, r) {
      return row.map(function (type, c) {
        return new Drop([r, c], type);
      });
    });
  }

  beforeEach(function () {
    testBoard = convertToBoard(testArray);
    uniformBoard = convertToBoard(uniformArray);
    bigStainData = {
      initialDrops: [testBoard[0][1], testBoard[1][1]]
    };
    singleDropStainData = {
      initialDrops: [testBoard[0][4]]
    };
    redDrops = [
      testBoard[0][2],
      testBoard[1][2],
      testBoard[2][2],
      testBoard[2][3]
    ];
    isolatedRedDrop = testBoard[0][5];
    isolatedGreenDrop = testBoard[0][3];
  });

  it('is created from a collection of drops', function () {
    var stain = new Stain([testBoard[0][1], testBoard[1][1]], testBoard);
    expect(stain.area).toBe(2);
    expect(stain.contains(testBoard[0][1])).toBe(true);
    expect(stain.contains(testBoard[1][1])).toBe(true);
  });

  it('has a method to get all the stains from the board', function () {
    var stains = Stain.getAll('b', testBoard);
    var bigStain = stains[0], singleDropStain = stains[1];

    expect(bigStain.area).toBe(2);
    expect(bigStain.contains(testBoard[0][1])).toBe(true);
    expect(bigStain.contains(testBoard[1][1])).toBe(true);

    expect(singleDropStain.area).toBe(1);
    expect(singleDropStain.contains(testBoard[0][4])).toBe(true);
  });

  it('stablishes an inverse relationship between the drop and the stain itseld',
  function () {
    var stain = new Stain(bigStainData.initialDrops, testBoard);
    expect(testBoard[0][1].stain).toBe(stain);
    expect(testBoard[0][1].inStain()).toBe(true);
  });

  it('has a color', function () {
    var stain = new Stain([isolatedRedDrop, isolatedGreenDrop], testBoard);
    expect(stain.color).toBe(isolatedRedDrop.type);
  });

  it('turns into the same colors other drops', function () {
    var stain = new Stain([isolatedRedDrop, isolatedGreenDrop], testBoard);
    expect(isolatedGreenDrop.type).toBe(stain.color);
  });

  it('can maximize itself absorving all adjacent drops of its color',
  function () {
    var stain = new Stain(bigStainData.initialDrops, testBoard);
    stain.maximize();
    expect(stain.contains(testBoard[0][1])).toBe(true);
    expect(stain.contains(testBoard[1][1])).toBe(true);
  });

  it('when extended, it extends over all adjacent drops of the same color',
  function () {
    var initialDrops = bigStainData.initialDrops;
    var stain = new Stain(initialDrops, testBoard);
    var result = stain.extendTo(testBoard[0][2]);

    expect(result).toBeDefined();
    expect(stain.area).toBe(6);

    initialDrops.concat(redDrops).forEach(function (drop) {
      expect(stain.contains(drop)).toBe(true);
      expect(drop.type).toBe('b');
    });

    initialDrops.forEach(function (drop) {
      expect(result.converted).not.toContain(drop);
    });

    redDrops.forEach(function (drop) {
      expect(result.converted).toContain(drop);
    });
  });

  it('can not be extended to non adjacent drops', function () {
    var initialDrops = bigStainData.initialDrops;
    var stain = new Stain(initialDrops, testBoard);
    var result = stain.extendTo(testBoard[1][3]);

    expect(result).not.toBeDefined();
    expect(stain.area).toBe(2);

    initialDrops.forEach(function (drop) {
      expect(stain.contains(drop)).toBe(true);
    });
  });

  it('can show if its covering all the board', function () {
    var stain = new Stain([
      uniformBoard[0][0],
      uniformBoard[0][1],
      uniformBoard[1][0],
      uniformBoard[1][1]
    ], uniformBoard);
    expect(stain.isComplete()).toBe(true);
  });

  it('fuses several stains that are in contact', function () {
    var allDrops =
      bigStainData.initialDrops
      .concat(singleDropStainData.initialDrops)
      .concat(redDrops)
      .concat([isolatedRedDrop, isolatedGreenDrop]);

    var bigStain = new Stain(
      bigStainData.initialDrops.concat(redDrops).concat([isolatedGreenDrop]),
      testBoard
    );

    var smallStain = new Stain(
      singleDropStainData.initialDrops.concat(isolatedRedDrop),
      testBoard
    );

    var fused = Stain.fuse([bigStain, smallStain]);
    var fusedStain = fused[0];

    expect(fused.length).toBe(1);
    expect(fusedStain.area).toBe(allDrops.length);
    allDrops.forEach(function (drop) {
      expect(fusedStain.contains(drop)).toBe(true);
      expect(drop.stain).toBe(fusedStain);
    });
  });

  it('leaves non fused distantc stains', function () {
    var allDrops =
      bigStainData.initialDrops
      .concat(singleDropStainData.initialDrops);

    var bigStain = new Stain(
      bigStainData.initialDrops,
      testBoard
    );

    var smallStain = new Stain(
      singleDropStainData.initialDrops,
      testBoard
    );

    var fused = Stain.fuse([bigStain, smallStain]);

    expect(fused.length).toBe(2);
    expect(fused[0].area).toBe(bigStainData.initialDrops.length);
    expect(fused[1].area).toBe(singleDropStainData.initialDrops.length);
    bigStainData.initialDrops.forEach(function (drop) {
      expect(fused[0].contains(drop)).toBe(true);
      expect(drop.stain).toBe(fused[0]);
    });
    singleDropStainData.initialDrops.forEach(function (drop) {
      expect(fused[1].contains(drop)).toBe(true);
      expect(drop.stain).toBe(fused[1]);
    });
  });
});
