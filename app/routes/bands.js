import Ember from 'ember';

var Band = Ember.Object.extend({
  name: "",
});

var leadZepplin = Band.create({name: "Lead Zepplin"});
var pearlJam = Band.create({name: "Pearl Jam"});
var fooFighters = Band.create({name: "Foo Fighters"});

var bands = [leadZepplin, pearlJam, fooFighters];

export default Ember.Route.extend({
  model: function(){
    return bands;
  }
});
