/**
 * @constructor
 */
var Animals = function() {
  var db_schema = {
    fullTextIndexes: [{
      name: 'name',
      lang: 'en',
      sources: [
        {
          storeName: 'animal',
          keyPath: 'binomial',
          weight: 1.0
        }, {
          storeName: 'animal',
          keyPath: 'name',
          weight: 0.5
        }]
    }],
    stores: [
      {
        name: 'animal',
        keyPath: 'binomial',
        autoIncrement: true
      }]
  };
  this.db = new ydn.db.Storage('animals', db_schema);
};


/**
 * @param {string} url
 */
Animals.prototype.load = function(url) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  var me = this;
  xhr.onload = function(e) {
    var lines = xhr.responseText.split('\n');
    var animals = [];
    for (var i = 0; i < lines.length; i++) {
      var data = lines[i].split(';');
      if (data.length == 2) {
        animals.push({
          name: data[0].trim(),
          binomial: data[1].trim()
        });
      }
    }
    // console.log(animals);
    me.setStatus(animals.length + ' animals loaded.');
    me.db.put('animal', animals).then(function(keys) {
      this.setStatus(keys.length + ' animals saved.');
    }, function(e) {
      throw e;
    }, me);
  };
  xhr.send();
  this.setStatus('loading ' + url);
};


Animals.prototype.run = function() {
  this.db.addEventListener('ready', function(e) {
    this.db.count('animal').then(function(cnt) {
      // console.log(cnt);
      if (cnt < 2345) {
        this.load('data.csv');
      } else {
        this.setStatus(cnt + ' animals in this database.');
      }
    }, function(e) {
      throw e;
    }, this);
  }, false, this);
};

Animals.prototype.ele_status_ = document.getElementById('status');


Animals.prototype.setStatus = function(msg) {
  this.ele_status_.textContent = msg;
};

