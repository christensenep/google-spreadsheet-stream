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
    var error = new Error('Error connecting to url ' + google_url);
    error.inner = err;
    this.emit('error', error);
  };

  function handleParseError(err) {
    var error = new Error('Error parsing JSON');
    error.inner = err;
    this.emit('error', error);
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

    var resultStream = through(function write(data) {
      this.emit('data', data)
    });

    var internalStream = request( { url: url } )
      .on('error', handleRequestError.bind(resultStream))
      .pipe(JSONStream.parse(['feed','entry',true,'content','$t']))
      .on('error', handleParseError.bind(resultStream))
      .pipe(collectHeaders)
      .pipe(resultStream);

    return resultStream;
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

    var resultStream = through(function write(data) {
      this.emit('data', data)
    });

    var internalStream = request( {url: url } )
      .on('error', handleRequestError.bind(resultStream))
      .pipe(JSONStream.parse(['feed','entry',true]))
      .on('error', handleParseError.bind(resultStream))
      .pipe(parseRowData)
      .pipe(resultStream);

    return resultStream;
  };
}

