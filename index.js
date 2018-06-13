var splitToWords = require('split-to-words');
var callNextTick = require('call-next-tick');
var waterfall = require('async-waterfall');
var sb = require('standard-bail')();
var pluck = require('lodash.pluck');
var uniq = require('lodash.uniq');
var pick = require('lodash.pick');
var curry = require('lodash.curry');
var compact = require('lodash.compact');
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
    uniq(words).forEach(word => q.defer(getCommonness, word));
    q.awaitAll(sb(assembleResults, done));

    function assembleResults(frequencyPackages) {
      done(null, frequencyPackages.map(abbreviateFrequencyPackage));
    }
  }

  function getCommonness(word, done) {
    var reqOpts = {
      method: 'GET',
      url: `https://api.wordnik.com/v4/word.json/${
        word
      }/frequency?useCanonical=false&startYear=2000&endYear=2017&api_key=${
        wordnikAPIKey
      }`,
      json: true
    };
    request(reqOpts, sb(passBody, done));

    function passBody(res, body) {
      done(null, body);
    }
  }

  function getSalientWords(wordFreqDicts, done) {
    //console.log('wordFreqDicts', wordFreqDicts);

    if (wordFreqDicts.length > 2) {
      var { filteredDicts, gapStdDev } = filterByBigGap({
        dicts: wordFreqDicts,
        valueProp: 'totalCount',
        sortComparator: lowToHigh,
        minDicts: 2,
        portionToUseInAvg: 0.4
      });
    } else {
      filteredDicts = wordFreqDicts;
    }

    callNextTick(done, null, {
      filteredFreqDicts: filteredDicts,
      wordFreqDicts,
      freqGapStdDev: gapStdDev
    });
  }

  function getNeighborsToWordsSum(
    { filteredFreqDicts, wordFreqDicts, freqGapStdDev },
    done
  ) {
    var words = pluck(filteredFreqDicts, 'word');
    var encodedWords = words.map(encodeURIComponent);
    var reqOpts = {
      method: 'GET',
      url: `${w2vGoogleNewsURL}/neighbors?words=${encodedWords.join(',')}`,
      json: true
    };
    request(reqOpts, sb(packageResults, done));

    function packageResults(res, body) {
      if (res.statusCode < 200 || res.statusCode > 299) {
        done(
          new Error(
            `Error from neighbors call: ${res.statusCode}. ${body.message}`
          )
        );
      } else {
        done(null, {
          filteredFreqDicts,
          wordFreqDicts,
          freqGapStdDev,
          wordDistDicts: body
        });
      }
    }
  }
}

function abbreviateFrequencyPackage(pack) {
  return pick(pack, 'word', 'totalCount');
}

function filterWordsByDistance(
  { filteredFreqDicts, wordFreqDicts, freqGapStdDev, wordDistDicts },
  done
) {
  var { filteredDicts, gapStdDev } = filterByBigGap({
    dicts: wordDistDicts,
    valueProp: 'distance',
    sortComparator: lowToHigh,
    portionToUseInAvg: 1.0,
    stdDevMultiplier: 2
  });

  callNextTick(done, null, {
    wordFreqDicts,
    freqGapStdDev,
    filteredFreqDicts,
    wordDistDicts,
    distGapStdDev: gapStdDev,
    filteredDistDicts: filteredDicts,
    words: pluck(filteredDicts, 'word')
  });
}

function sum(count, total) {
  return total + count;
}

function bMinusA(a, b) {
  return b - a;
}

function square(x) {
  return x * x;
}

function mean(values) {
  return values.reduce(sum, 0) / values.length;
}

function lowToHigh(a, b) {
  return a < b ? -1 : 1;
}

function dictValueIsUnderMax(max, valueProp, dict) {
  return dict[valueProp] <= max;
}

// This: 1) Looks up the values in the dicts 2) sorts them
// 3) looks at the gaps between the values in the first
// portion of the sorted values 4) gets the std dev of
// those gaps 5) uses the std dev to find the gap that is
// "too big" (bigger than the std dev) 6) filters the
// dicts down to entries whose values are "before" the gap.
function filterByBigGap({
  dicts,
  valueProp,
  sortComparator,
  portionToUseInAvg = 0.5,
  minDicts = 1,
  stdDevMultiplier = 1
}) {
  if (dicts.length < 2) {
    return {
      filteredDicts: dicts
    };
  }
  var values = compact(pluck(dicts, valueProp));
  var sortedValues = uniq(values).sort(sortComparator);
  var valueGaps = [];
  for (
    var i = 1;
    i < Math.round(sortedValues.length * portionToUseInAvg);
    ++i
  ) {
    valueGaps.push(sortedValues[i] - sortedValues[i - 1]);
  }
  var avgGap = mean(valueGaps);
  var deviations = valueGaps.map(curry(bMinusA)(avgGap));
  var squaredDevs = deviations.map(square);
  var variance = mean(squaredDevs);
  var gapStdDev = Math.sqrt(variance);

  var maxValueAllowed = sortedValues[0];
  for (var j = 0; j < valueGaps.length; ++j) {
    let gap = valueGaps[j];
    if (gap > gapStdDev * stdDevMultiplier) {
      break;
    }
    maxValueAllowed += gap;
  }

  var filteredDicts = dicts.filter(
    curry(dictValueIsUnderMax)(maxValueAllowed, valueProp)
  );

  if (filteredDicts.length < minDicts) {
    filteredDicts = dicts.filter(
      curry(dictValueIsUnderMax)(sortedValues[minDicts], valueProp)
    );
    gapStdDev = undefined; // Indicate this wasn't used to filter, ultimately.
  }

  return {
    filteredDicts,
    gapStdDev
  };
}

module.exports = Reductio;
