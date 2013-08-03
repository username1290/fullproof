
/**
 * @constructor
 */
var PubMedApp = function() {
  App.call(this);
  var db_schema = {
    fullTextCatalogs: [{
      name: 'name',
      lang: 'en',
      indexes: [
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
        name: 'pubmed',
        keyPath: 'binomial',
        autoIncrement: true
      }]
  };
  //this.db = new ydn.db.Storage('pubmed', db_schema);
  var btn_search = document.getElementById('search');
  btn_search.onclick = this.handleSearch.bind(this);
  var input = document.getElementById('search_input');
  input.onkeyup = this.handleInputChanged.bind(this);
};
App.inherits(PubMedApp, App);



PubMedApp.prototype.handleInputChanged = function(e) {
  var key = event.keyCode || event.which;
  if (key == 13) {
    this.handleSearch(e);
  }
};


/**
 * @param {Array.<ydn.db.text.RankEntry>} arr
 */
PubMedApp.prototype.renderResult = function(arr) {
  var toggle = function(e) {
    var pe = e.target.nextElementSibling.nextElementSibling;
    if (e.target.textContent == 'hide') {
      pe.style.display = 'none';
      e.target.textContent = 'show';
    } else {
      pe.style.display = '';
      e.target.textContent = 'hide';
    }
  };
  this.ele_results_.innerHTML = '';
  var ul = document.createElement('ul');
  for (var i = 0; i < arr.length; i++) {
    var entry = arr[i];
    var li = document.createElement('li');
    var span = document.createElement('span');
    var a = document.createElement('a');
    var swt = document.createElement('a');
    var div = document.createElement('div');
    div.style.display = 'none';
    swt.onclick = toggle;
    swt.textContent = 'show';
    swt.className = 'toggle';
    swt.href = '#';
    // console.log(entry);
    span.textContent = entry.score.toFixed(2) + ' | ' + entry.value + ' ';
    li.appendChild(span);
    li.appendChild(swt);
    li.appendChild(a);
    li.appendChild(div);
    this.db.get(entry.storeName, entry.primaryKey).done(function(x) {
      var span = this.children[0];
      var swt = this.children[1];
      var a = this.children[2];
      var div = this.children[3];
      a.textContent = x.title.$t;
      a.href = x.alternate;
      div.innerHTML = x.content.$t;
      // console.log(x);
    }, li);
    ul.appendChild(li);
  }
  this.ele_results_.appendChild(ul);
};


/**
 * @param {Event} e
 */
PubMedApp.prototype.handleSearch = function(e) {
  var ele = document.getElementById('search_input');
  var rq = this.db.search('pubmed-index', ele.value);
  rq.progress(function(pe) {
    // console.log(pe.length + ' results found');
  }, this);
  rq.done(function(pe) {
    // console.log(pe);
    this.renderResult(pe);
  }, this);
};


PubMedApp.prototype.fetch = function(ids, cb, scope) {
  // extracting by XML is slow.
  var url = 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&retmode=abstract&rettype=text&id=' + ids.join(',');
  App.get(url, function(json) {
    // console.log(json);
    // window.ans = json;
    var re = /([\s\S]+?)PMID: (\d+)(.+\n)/g;
    var ids = [];
    var abstracts = [];
    var m;
    while (m = re.exec(json)) {
      ids.push(m[2]);
      abstracts.push(m[1].trim());
    }
    cb.call(scope, ids, abstracts);
  }, this);
};


PubMedApp.prototype.pubmedSearch = function(term, cb, scope) {
  var url = 'http://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=xml&term=' + term;
  App.get(url, function(json) {
    console.log(json);
    var ids =  json.eSearchResult[1].IdList.Id.map(function(x) {
      return x.$t;
    });
    cb.call(scope, ids);
  }, this);
};



/**
 * Run the app.
 */
PubMedApp.prototype.run = function() {
  this.pubmedSearch('actin', function(ids) {
    this.fetch(ids, function(ids, texts) {
      console.log(texts);
      console.log(ids);
      window.texts = texts;
    }, this);
  }, this);
  // this.fetch("23908673");
};


