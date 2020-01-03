/**
 * Author: Riley Raschke <rileyATrrappsdevDOTcom>
 * © 2020 rrappsdev.com
 * OSL-3.0
 */

//$('#gSettingsModal').modal({show: true});
var app = angular.module('BlackjackAI', []);

var GameSettingsDialogModel = function() {
  this.visible = false;
};
GameSettingsDialogModel.prototype.open = function(opts) {
  this.opts = opts;
  this.visible = true;
};
GameSettingsDialogModel.prototype.close = function() {
  this.visible = false;
};

var PlayerSettingsDialogModel = function() {
  this.visible = false;
};
PlayerSettingsDialogModel.prototype.open = function(opts) {
  this.opts = opts;
  this.visible = true;
};
PlayerSettingsDialogModel.prototype.close = function() {
  this.visible = false;
};

app.controller( 'BlackjackGameController', ['$scope', 'BlackjackGameService', function( $scope, BlackjackGameService ) {
  $scope.gameSettingsDialog   = new GameSettingsDialogModel();
  $scope.playerSettingsDialog = new PlayerSettingsDialogModel();
  this.game = {
    opts: {
      deckCount: 6,
      dealRate: 0.8,
      showDeckStats: true,
      payout: 1.5
    },
    players: null,
    gameState: null,
    shoe: null
  };
}]);

app.directive('gameSettingsDialog', [function() {
  return {
    restrict: 'E',
    scope: {
      model: '=',
    },
    link: function(scope, element, attributes) {
      scope.$watch('model.visible', function(newValue) {
        var modalElement = element.find('#gSettingsModal');
        $(modalElement).modal(newValue ? 'show' : 'hide');
      });
      element.on('shown.bs.modal', function() {
        scope.$apply(function() {
          scope.model.visible = true;
        });
      });
      element.on('hidden.bs.modal', function() {
        scope.$apply(function() {
          scope.model.visible = false;
        });
      });
    },
    templateUrl: 'game-settings-dialog.html',
  };
}]);

app.directive('playerSettingsDialog', [function() {
  return {
    restrict: 'E',
    scope: {
      model: '=',
    },
    link: function(scope, element, attributes) {
      scope.$watch('model.visible', function(newValue) {
        var modalElement = element.find('#pSettingsModal');
        $(modalElement).modal(newValue ? 'show' : 'hide');
      });
      element.on('shown.bs.modal', function() {
        scope.$apply(function() {
          scope.model.visible = true;
        });
      });
      element.on('hidden.bs.modal', function() {
        scope.$apply(function() {
          scope.model.visible = false;
        });
      });
    },
    templateUrl: 'player-settings-dialog.html',
  };
}]);

app.factory('BlackjackGameService', [ '$q', function( $q ){
  var factory = { };
  return factory;
}]);

