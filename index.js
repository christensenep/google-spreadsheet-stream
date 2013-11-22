const request = require('request');
const Stream = require('stream');
const JSONStream = require('JSONStream');
const through = require('through');

module.exports = function(key) {
  const google_url = 'https://spreadsheets.google.com/feeds/';

  if (!key) {
    throw new Error("You must provide a valid google spreadsheet key");
  }

  function handleRequestError(err) {
    if (!this.hasError) {
      console.error('Error connecting to url ' + url + ' (' + err.message + ')');
      this.hasError = true;
    }
  };

  function handleParseError(err) {
    if (!this.hasError) {
      console.error('Error parsing JSON (' + err.message + ')');
      this.hasError = true;
    }
  };

  this.getColumnHeaders = function getColumnHeaders(sheetId) {
    const url = google_url + 'cells/' + key +'/' + sheetId + '/public/basic?alt=json&max-row=1';
    var columnHeaders = [];

    var collectHeaders = through(function write(data) {
      columnHeaders.push(data);
    },
    function end() {
      this.queue(columnHeaders);
      this.queue(null);
    });

    var stream = request( { url: url } )
      .on('error', handleRequestError)
      .pipe(JSONStream.parse(['feed','entry',true,'content','$t']))
      .on('error', handleParseError)
      .pipe(collectHeaders)

    return stream;
  };

  this.getRows = function getRows(sheetId) {
    const url = google_url + 'list/' + key +'/' + sheetId + '/public/values?alt=json';

    var parseRowData = through(function write(data) {
      var rowData = [];
      Object.keys(data).forEach(function(key) {
        if (key.substring(0,4) === 'gsx$') {
          rowData.push(data[key]['$t']);
        }
      });
      this.queue(rowData);
    });

    return request( {url: url } )
      .on('error', handleRequestError)
      .pipe(JSONStream.parse(['feed','entry',true]))
      .on('error', handleParseError)
      .pipe(parseRowData)
  };
}

