# Streaming API for Google Spreadsheets

[![NPM version](https://badge.fury.io/js/google-spreadsheet-stream.png)](http://badge.fury.io/js/google-spreadsheet-stream)

A very basic streaming API for Google Spreadsheets.

Currently only read-only, supports only public spreadsheets.

## Installation

```
npm install google-spreadsheet-stream
```


## Basic Usage

``` javascript
const GoogleSpreadsheet = require('google-spreadsheet-stream');

const testKey = '0AmBuTbmfT_ZudHBIY1FfbWUzU2pQSjgwX1VON09Gd3c';
const testSheetId = 'od6';

var spreadsheet = new GoogleSpreadsheet(testKey);

spreadsheet.getColumnHeaders(testSheetId)
  .on('data', function(data) {
    console.log('Column Headers: ' + data);
  })
  .on('end', function() {
    var currentRow = 1;
    spreadsheet.getRows(testSheetId)
      .on('data', function(data) {
        console.log('Row ' + currentRow + ': ' + data);
        currentRow++;
      });
  });
```


## TODO

- Allow authentication for private sheets
- Add query functionality to getRows()
- Add write functionality

