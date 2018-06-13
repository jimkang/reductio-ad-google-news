var test = require('tape');
var Reductio = require('../index');
var request = require('request');
var config = require('../config');
var iscool = require('iscool')();
var assertNoError = require('assert-no-error');

var testCases = [
  {
    text:
      'Verily I say unto you: the wicked will spit out the riches they swallowed. Their iniquity will turn sour in their stomach.',
    considerWordCommonness: true,
    shouldNotError: true
  }
];

testCases.forEach(runTest);

function runTest(testCase) {
  test(testCase.text, testReductio);

  function testReductio(t) {
    var reductio = Reductio({
      request,
      w2vGoogleNewsURL: config.testW2vGoogleNewsURL,
      wordnikAPIKey: config.wordnikAPIKey,
      considerWordCommonness: testCase.considerWordCommonness,
      iscool
    });
    reductio(testCase.text, checkResults);

    function checkResults(error, results) {
      if (testCase.shouldNotError) {
        assertNoError(t.ok, error, 'No error from reductio.');
      }
      t.ok(results.wordFreqDicts);
      t.ok(results.filteredFreqDicts);
      t.ok(results.wordDistDicts);
      t.ok(results.filteredDistDicts);
      t.ok(results.words);
      console.log('results', results);
      t.end();
    }
  }
}
