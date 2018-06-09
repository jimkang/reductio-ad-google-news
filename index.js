var splitToWords = require('split-to-words');
var callNextTick = require('call-next-tick');
var waterfall = require('async-waterfall');
var sb = require('standard-bail')();
var pluck = require('lodash.pluck');
var uniq = require('lodash.uniq');
var pick = require('lodash.pick');
var queue = require('d3-queue').queue;

function Reductio({
  request,
  w2vGoogleNewsURL,
  wordnikAPIKey,
  considerWordCommonness
}) {
  return reductio;

  function reductio(text, reductioDone) {
    var words = uniq(splitToWords(text));
    var ops = [done => callNextTick(done, null, words)];
    if (considerWordCommonness) {
      ops.push(getWordsCommonness);
      ops.push(getSalientWords);
    }
    ops.push(getNeighborsToWordsSum);
    ops.push(filterWordsByDistance);

    waterfall(ops, reductioDone);
  }

  function getWordsCommonness(words, done) {
    var q = queue();
    words.forEach(word => q.defer(getCommonness, word));
    q.awaitAll(sb(assembleResults, done));

    function assembleResults(frequencyPackages) {
      debugger;
      done(null, frequencyPackages.map(abbreviateFrequencyPackage));
    }
  }

  function getCommonness(word, done) {
    var reqOpts = {
      method: 'GET',
      url: `https://api.wordnik.com/v4/word.json/${
        word
      }/frequency?useCanonical=true&startYear=1950&endYear=2017&api_key=${
        wordnikAPIKey
      }`,
      json: true
    };
    // TODO: Check res.statusCode
    request(reqOpts, sb(passBody, done));

    function passBody(res, body) {
      done(null, body);
    }
  }

  function getSalientWords(wordFreqDicts, done) {
    console.log('wordFreqDicts', wordFreqDicts);
    // TODO
    callNextTick(done, null, pluck(wordFreqDicts, 'word'));
  }

  function getNeighborsToWordsSum(words, done) {
    var encodedWords = words.map(encodeURIComponent);
    var reqOpts = {
      method: 'GET',
      url: `${w2vGoogleNewsURL}/neighbors?words=${encodedWords.join(',')}`,
      json: true
    };
    request(reqOpts, sb((res, body) => done(null, body), done));
  }
}

function abbreviateFrequencyPackage(pack) {
  return pick(pack, 'word', 'totalCount');
}

function filterWordsByDistance(wordDistDicts, done) {
  // TODO
  callNextTick(done, null, pluck(wordDistDicts, 'word'));
}

module.exports = Reductio;
