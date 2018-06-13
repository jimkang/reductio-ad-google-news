/* global process */

var Reductio = require('../index');
var request = require('request');
var config = require('../config');
var iscool = require('iscool')();

if (process.argv.length < 3) {
  console.log('Usage: node tools/try-reductio.js <phrase>');
  process.exit();
}

var text = process.argv[2];
var reductio = Reductio({
  request,
  w2vGoogleNewsURL: config.testW2vGoogleNewsURL,
  wordnikAPIKey: config.wordnikAPIKey,
  considerWordCommonness: true,
  iscool
});

reductio(text, checkResults);

function checkResults(error, results) {
  if (error) {
    console.log(error, error.stack);
  } else {
    console.log('results', results);
  }
}
