'use strict';

var express = require('express');

module.exports = function(dependencies) {
  var router = express.Router();

  require('./twitter')(router, dependencies);
  require('./google')(router, dependencies);

  return router;
};
