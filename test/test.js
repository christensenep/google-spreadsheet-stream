const GoogleSpreadsheet = require('../index.js');

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