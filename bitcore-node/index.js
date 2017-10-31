'use strict';

var BaseService = require('./service');
var inherits = require('util').inherits;
var fs = require('fs');
var metadataRoutes = require('./../server/controllers/metadata')

var InsightUI = function(options) {
  BaseService.call(this, options);
  if (typeof options.apiPrefix !== 'undefined') {
    this.apiPrefix = options.apiPrefix;
  } else {
    this.apiPrefix = 'insight-api';
  }
  if (typeof options.routePrefix !== 'undefined') {
    this.routePrefix = options.routePrefix;
  } else {
    this.routePrefix = '';
  }
};

InsightUI.dependencies = ['insight-api'];

inherits(InsightUI, BaseService);

InsightUI.prototype.start = function(callback) {
  this.indexFile = this.filterIndexHTML(fs.readFileSync(__dirname + '/../public/index.html', {encoding: 'utf8'}));
  setImmediate(callback);
};

InsightUI.prototype.getRoutePrefix = function() {
  return this.routePrefix;
};

InsightUI.prototype.setupRoutes = function(app, express) {
  var self = this;

  app.use('/metadata', metadataRoutes(express));

  app.use(express.static(__dirname + '/../public'));

  // if not in found, fall back to indexFile (404 is handled client-side)
  app.use(function(req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.send(self.indexFile);
  });

};

InsightUI.prototype.filterIndexHTML = function(data) {
  var transformed = data
    .replace(/apiPrefix = '\/api'/, "apiPrefix = '/" + this.apiPrefix + "'");

  if (this.routePrefix) {
    transformed = transformed.replace(/<base href=\"\/\"/, '<base href="/' + this.routePrefix + '/"');
  }

  return transformed;
};

module.exports = InsightUI;
