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
    reductio('It was a graveyard smash!', logResult);

    function logResult(error, results) {
      if (error) {
        console.log(error);
      } else {
        console.log(results);
      }
    }

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
