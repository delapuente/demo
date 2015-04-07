
(function () {
  'use strict';

  var likwit = new Phaser.Game(640, 960, Phaser.AUTO);

  [1, 2, 3, 4, 5].forEach(function (levelNo) {
    var levelName = getLevelName(levelNo);
    likwit.state.add(
      levelName,
      new LikwitLevel('./maps/' + levelName  + '.map')
    );
  });

  var currentLevel = getLevelName(window.location.hash.substr(1) || 1);
  likwit.state.start(currentLevel);

  window.onhashchange = function () {
    var newLevel = getLevelName(window.location.hash.substr(1) || 1);
    likwit.state.start(newLevel);
    currentLevel = newLevel;
  };

  function getLevelName(n) {
    n = '' + n;
    while (n.length < 4) { n = '0' + n; }
    return n;
  }

}());
