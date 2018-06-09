var test = require('tape');
var Reductio = require('../index');
var request = require('request');
var config = require('../config');
var iscool = require('iscool')();
var assertNoError = require('assert-no-error');

var testCases = [
  {
    text: 'It was a graveyard smash!',
    considerWordCommonness: true,
    shouldNotError: true,
    expected: ['monster']
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
    reductio('It was a graveyard smash!', checkResults);

    function checkResults(error, results) {
      if (testCase.shouldNotError) {
        assertNoError(t.ok, error, 'No error from reductio.');
      }
      t.deepEqual(results, testCase.expected, 'Results are correct.');
      console.log('results', results);
      t.end();
    }
  }
}
