
app.directive('playingCard', [function() {
  return {
    restrict: 'E',
    scope: {
      card: '=cardvalue',
      displayDepth: '=displaydepth',
      doubleDown: '=doubledown',
      faceDown: '=facedown'
    },
    link: function( scope, element, attr ) {
      if( scope.doubleDown ){ element.addClass('doubledDownCard'); }
      if( scope.faceDown ){ element.addClass('Card-FaceDown'); }
      if( scope.card.suit == '♥' ) { element.addClass('Card-Red'); }
      if( scope.card.suit == '♦' ) { element.addClass('Card-Red'); }
      //if( scope.card.suit == '♠' ) { element.addClass('Card-Spade'); }
      //if( scope.card.suit == '♣' ) { element.addClass('Card-Club'); }
    },
    templateUrl: 'views/playing-card.html',
  };
}]);

app.directive('gameSettingsDialog', [function() {
  return {
    restrict: 'E',
    scope: {
      model: '=',
    },
    link: function(scope, element, attr) {
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
    templateUrl: 'views/game-settings-dialog.html',
  };
}]);
app.directive('playerSettingsDialog', [function() {
  return {
    restrict: 'E',
    scope: {
      model: '=',
    },
    link: function(scope, element, attr) {
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
    templateUrl: 'views/player-settings-dialog.html',
  };
}]);
app.directive('aboutDialog', [function() {
  return {
    templateUrl: 'views/about-dialog.html',
  };
}]);
app.directive('helpDialog', [function() {
  return {
    templateUrl: 'views/help-dialog.html',
  };
}]);
app.directive('gameNavbar', [function() {
  return {
    templateUrl: 'views/game-navbar.html',
  };
}]);
