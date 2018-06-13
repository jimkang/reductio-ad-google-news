reductio-ad-google-news
==================

Takes text, then reduces it a small phrase using the Google News word2vec model and Wordnik.

Installation
------------

    npm install reductio-ad-google-news

Usage
-----

    var Reductio = require('reductio-ad-google-news');
    var request = require('request');
    // In the browser, you can substitute basic-browser-request.
    var reductio = Reductio({
      request,
      w2vGoogleNewsURL: 'http://something.com', // Your instance of https://github.com/jimkang/word2vec-google-news-api
      wordnikAPIKey: '<Your Wordnik API key>',
      considerWordCommonness: true, // Default to true
      iscool: <Instance of iscool module or null>
    });
    reductio('Verily I say unto you: the wicked will spit out the riches they swallowed. Their iniquity will turn sour in their stomach.', logResult);

    function logResult(error, results) {
      if (error) {
        console.log(error);
      } else {
        console.log(results);
      }
    }

Results look like:

    { wordFreqDicts:
     [ { word: 'Verily', totalCount: 2 },
       { word: 'I', totalCount: 78543 },
       { word: 'say', totalCount: 7503 },
       { word: 'unto', totalCount: 128 },
       {},
       { word: 'the', totalCount: 313899 },
       { word: 'wicked', totalCount: 72 },
       { word: 'will', totalCount: 22793 },
       { word: 'spit', totalCount: 47 },
       { word: 'out', totalCount: 20458 },
       { word: 'riches', totalCount: 30 },
       { word: 'they', totalCount: 23302 },
       { word: 'swallowed', totalCount: 71 },
       { word: 'Their', totalCount: 732 },
       { word: 'iniquity', totalCount: 2 },
       { word: 'turn', totalCount: 1558 },
       { word: 'sour', totalCount: 64 },
       { word: 'in', totalCount: 131861 },
       { word: 'their', totalCount: 18216 },
       { word: 'stomach', totalCount: 197 } ],
    freqGapStdDev: 17.804493814764857,
    filteredFreqDicts:
     [ { word: 'Verily', totalCount: 2 },
       { word: 'iniquity', totalCount: 2 } ],
    wordDistDicts:
     [ { word: 'wickedness', distance: 0.8983930945396423 },
       { word: 'sins', distance: 0.988501787185669 },
       { word: 'satans', distance: 0.9934936761856079 },
       { word: 'deceivers', distance: 1.0083870887756348 },
       { word: 'idolators', distance: 1.0113334655761719 },
       { word: 'benevolent_deity', distance: 1.0231198072433472 },
       { word: 'souls', distance: 1.032723307609558 },
       { word: 'wrathful', distance: 1.033031940460205 },
       { word: 'evil', distance: 1.0360162258148193 },
       { word: 'damnation', distance: 1.0423715114593506 },
       { word: 'evil_doer', distance: 1.0476680994033813 },
       { word: 'avenging_angels', distance: 1.0504376888275146 } ],
    distGapStdDev: 0.024475691999558378,
    filteredDistDicts: [ { word: 'wickedness', distance: 0.8983930945396423 } ],
    words: [ 'wickedness' ] }

- The `words` property is the final result.
- `wordFreqDicts` has the frequencies of the words in the given tests.
- `freqGapStdDev` is the standard deviation of the gaps between a subset of the frequencies.
- `filteredFreqDicts` is wordFreqDicts minus the words whose frequencies are beyond a "gap" determined by `freqGapStdDev`.
- `wordDistDicts` has the distances of the closest words to the sum of the words in `filteredFreqDicts`.
- `distGapStdDev` is the standard deviation of the gap between a subset of the distances.
- `filteredDistDicts` is `wordDistDicts` without those entries that is beyond a gap determined by `distGapStdDev`.

Tests
----

- Create a config.js file that looks like this:

    module.exports = {
      wordnikAPIKey: '<Your Wordnik API key>',
      testW2vGoogleNewsURL: 'http://your-api-server.com/'
    };

- Run `make test`.

License
-------

The MIT License (MIT)

Copyright (c) 2018 Jim Kang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
