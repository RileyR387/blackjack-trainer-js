
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
  this.visible = false;
};
PlayerSettingsDialogModel.prototype.open = function(opts) {
  this.opts = opts;
  this.visible = true;
};
PlayerSettingsDialogModel.prototype.close = function() {
  this.visible = false;
};

