
var PlayerModel = function(name, agent, bankRoll) {
  this.name  = name;
  this.hands = [];
  this.agent = agent;
  this.bankRoll = bankRoll;
  this.roundsPlayed = 0;
  this.handsPlayed = 0;
  this.stats = {
     'bjs': 0,
     'wins': 0,
     'splits': 0,
     'doubles': 0,
     'pushes': 0,
     'loses': 0,
     'busts': 0,
  };
}

var GameSettingsDialogModel = function() {
  this.opts = {};
  this.visible = false;
  this.incDeckCount = function() { this.opts.deckCount++; };
  this.decDeckCount = function() { this.opts.deckCount--; };
  this.incDealRate  = function() { this.opts.dealRate += 0.1; };
  this.decDealRate  = function() { if( this.opts.dealRate > 0.01) {this.opts.dealRate -= 0.1; }};
  this.open = function(opts) {
    this.opts = opts;
    this.visible = true;
  };
  this.close = function() {
    this.visible = false;
  };
};

var PlayerSettingsDialogModel = function() {
  this.players = [];
  this.visible = false;
  this.open = function(players) {
    this.players = players;
    this.visible = true;
  };
  this.close = function() {
    this.visible = false;
  };
};

