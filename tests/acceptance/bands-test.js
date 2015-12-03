import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from 'rarwe/tests/helpers/start-app';
import Pretender from 'pretender';
import httpStubs from '../helpers/http-stubs';

module('Acceptance | bands', {
  beforeEach: function() {
    this.application = startApp();
  },

  afterEach: function() {
    Ember.run(this.application, 'destroy');
  }
});

test('List bands', function(assert) {
  var server = new Pretender(function(){
    httpStubs.stubBands(this, [ {
          id: 1,
          type: "bands",
          attributes: {
            name: "Radiohead"
          }
        }, {
          id: 2,
          type: "bands",
          attributes: {
            name: "Long Distance Calling"
          }
        }, ]
    );
  });
  visit('/bands');
  andThen(function() {
    assertLength(assert, '.band-link', 2, "All band links are rendered");
    assertLength(assert, '.band-link:contains("Radiohead")', 1, "First band link contains the band name");
    assertLength(assert, '.band-link:contains("Long Distance Calling")', 1, "The other band link contains the band name");
  });
});

test('Creating a new band', function(assert) {
  var server = new Pretender(function(){
    httpStubs.stubBands(this, [ {
          id: 1,
          type: "bands",
          attributes: {
            name: "Radiohead"
          }
        },
      ]
    );
    httpStubs.stubCreateBand(this, 2);
  });
  visit('/bands');
  fillIn('.new-band', 'Long Distance Calling');
  click('.new-band-button');
  andThen(function() {
    assertLength(assert, '.band-link', 2, "All band links are rendered");
    assertTrimmedText(assert, '.band-link:last', 'Long Distance Calling', "Created band appears at the end of the list");
    assertElement(assert, '.nav a.active:contains("Songs")', "The Songs tab is active");
  });
});

test('Creating a new song in two steps', function(assert) {
  var server = new Pretender(function(){
    this.get('/bands', function(){
      var response = {
        data: [ {
          id: 1,
          type: "bands",
          attributes: {
            name: "Radiohead"
          }
        }, ]
      };
      return [200, { "Content-Type": "application/vnd.api+json" }, JSON.stringify(response)];
    });
    this.post('/songs', function() {
      var response = {
        data: [ {
          id: 1,
          type: "songs",
          attributes: {
            name: "Killer Cars"
          }
        } ]
      };
      return [200, { "Content-Type": "application/vnd.api+json" }, JSON.stringify(response)];
    });
  });
  selectBand('Radiohead');
  click('a:contains("create one")');
  fillIn('.new-song', 'Killer Cars');
  submit('.new-song-form');
  andThen(function() {
    assertElement(assert, '.songs .song:contains("Killer Cars")', "Creates the song and displays it in the list");
  });
});

test('Sort new songs in various ways', function(assert){
  var server = new Pretender(function(){
    httpStubs.stubBands(this, [ {
          id: 1,
          type: "bands",
          attributes: {
            name: "Them Crooked Vultures"
          }
        } ]
    );
    httpStubs.stubSongs(this, 1, [
        {
          id: 1,
          attributes: {
            title: "Elephants",
            rating: 5
          }
        },
        {
          id: 2,
          attributes: {
            title: "New Fang",
            rating: 4
          }
        },
        {
          id: 3,
          attributes: {
            title: "Mind Eraser, No Chaser",
            rating: 4
          }
        },
        {
          id: 4,
          attributes: {
            title: "Spinning in Daffodils",
            rating: 5
          }
        },
      ]
    );
  });
  selectBand('Them Crooked Vultures');
  andThen(function(){
    assert.equal(currentURL(), '/bands/1/songs'); assertTrimmedText(assert, '.song:first', 'Elephants', "The first song is the highest ranked, first in the alphabet");
    assertTrimmedText(assert, '.song:last', 'New Fang', "The last song is the lowest ranked, last in the alphabet");
  });
  click('button.sort-rating-asc');
  andThen(function(){
    assert.equal(currentURL(), '/bands/1/songs?sort=ratingAsc'); assertTrimmedText(assert, '.song:first', 'Mind Eraser, No Chaser', "The first song is the lowest ranked, first in the alphabet");
    assertTrimmedText(assert, '.song:last', 'Spinning In Daffodils',
"The last song is the highest ranked, last in the alphabet");
  });
})

test('Search songs', function(assert){
  var server = new Pretender(function(){
    httpStubs.stubBands(this, [ {
          id: 1,
          type: "bands",
          attributes: {
            name: "Them Crooked Vultures"
          }
        } ]
    );
    httpStubs.stubSongs(this, 1, [
        {
          id: 1,
          attributes: {
            title: "Elephants",
            rating: 5
          }
        },
        {
          id: 2,
          attributes: {
            title: "New Fang",
            rating: 4
          }
        },
        {
          id: 3,
          attributes: {
            title: "Mind Eraser, No Chaser",
            rating: 4
          }
        },
        {
          id: 4,
          attributes: {
            title: "Spinning in Daffodils",
            rating: 5
          }
        },
        {
          id: 5,
          attributes: {
            title: "No One Loves Me & Neither Do I",
            rating: 5
          }
        },
      ]
    );
  });
  visit('/bands/1');
  fillIn('.search-field', 'no');
  andThen(function(){
    assertLength(assert, '.song', 2, "The songs matching the search term are displayed");
  });
  click('button.sort-title-desc');
  andThen(function(){
    assertTrimmedText(assert, '.song:first', 'No One Loves Me & Neither Do I', "A matching song that comes later in the alphahet appears on top");
    assertTrimmedText(assert, '.song:last', 'Mind Eraser, No Chaser', "A matching song that comes sooner in the alphahet appears at the bottom ");
  });
})
