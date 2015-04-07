
describe('MutantDrop', function () {

  it('has a method to change the color to a different ony than the present one',
  function () {
    var drop = new MutantDrop([0, 0], 'r');
    drop.changeColor();
    expect(drop.type).not.toBe('r');
  });

  it('does not change the color if the drop is already in a stain',
  function () {
    var drop = new MutantDrop([0, 0], 'r');
    drop.stain = {};
    drop.changeColor();
    expect(drop.type).toBe('r');
  });
});
