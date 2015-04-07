
(function () {
  'use strict';

  var likwit = new Phaser.Game(640, 960, Phaser.AUTO);
  likwit.state.add('level', new LikwitLevel('/maps/0005.map'));

  likwit.state.start('level');
}());
