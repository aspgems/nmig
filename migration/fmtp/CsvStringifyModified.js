/*
 * This is a copy of "csv-stringify" module, that was slightly modified.
 */
 var Stringifier, stream, util;

 stream = require('stream');

 util = require('util');

 module.exports = function() {
   var callback, chunks, data, options, stringifier;
   if (arguments.length === 3) {
     data = arguments[0];
     options = arguments[1];
     callback = arguments[2];
   } else if (arguments.length === 2) {
     if (Array.isArray(arguments[0])) {
       data = arguments[0];
     } else {
       options = arguments[0];
     }
     if (typeof arguments[1] === 'function') {
       callback = arguments[1];
     } else {
       options = arguments[1];
     }
   } else if (arguments.length === 1) {
     if (typeof arguments[0] === 'function') {
       callback = arguments[0];
     } else if (Array.isArray(arguments[0])) {
       data = arguments[0];
     } else {
       options = arguments[0];
     }
   }
   if (options == null) {
     options = {};
   }
   stringifier = new Stringifier(options);
   if (data) {
     process.nextTick(function() {
       var d, j, len;
       for (j = 0, len = data.length; j < len; j++) {
         d = data[j];
         stringifier.write(d);
       }
       return stringifier.end();
     });
   }
   if (callback) {
     chunks = [];
     stringifier.on('readable', function() {
       var chunk, results;
       results = [];
       while (chunk = stringifier.read()) {
         results.push(chunks.push(chunk));
       }
       return results;
     });
     stringifier.on('error', function(err) {
       return callback(err);
     });
     stringifier.on('end', function() {
       return callback(null, chunks.join(''));
     });
   }
   return stringifier;
 };

 Stringifier = function(options) {
   var base, base1, base2, base3, base4, base5, base6, base7, base8;
   if (options == null) {
     options = {};
   }
   stream.Transform.call(this, options);
   this.options = options;
   if ((base = this.options).delimiter == null) {
     base.delimiter = ',';
   }
   if ((base1 = this.options).quote == null) {
     base1.quote = '"';
   }
   if ((base2 = this.options).quoted == null) {
     base2.quoted = false;
   }
   if ((base3 = this.options).quotedString == null) {
     base3.quotedString = false;
   }
   if ((base4 = this.options).eof == null) {
     base4.eof = true;
   }
   if ((base5 = this.options).escape == null) {
     base5.escape = '"';
   }
   if ((base6 = this.options).columns == null) {
     base6.columns = null;
   }
   if ((base7 = this.options).header == null) {
     base7.header = false;
   }
   if ((base8 = this.options).rowDelimiter == null) {
     base8.rowDelimiter = '\n';
   }
   if (this.countWriten == null) {
     this.countWriten = 0;
   }
   switch (this.options.rowDelimiter) {
     case 'auto':
       this.options.rowDelimiter = null;
       break;
     case 'unix':
       this.options.rowDelimiter = "\n";
       break;
     case 'mac':
       this.options.rowDelimiter = "\r";
       break;
     case 'windows':
       this.options.rowDelimiter = "\r\n";
       break;
     case 'unicode':
       this.options.rowDelimiter = "\u2028";
   }
   return this;
 };

 util.inherits(Stringifier, stream.Transform);

 module.exports.Stringifier = Stringifier;

 Stringifier.prototype.headers = function() {
   var k, label, labels;
   if (!this.options.header) {
     return;
   }
   if (!this.options.columns) {
     return;
   }
   labels = this.options.columns;
   if (typeof labels === 'object') {
     labels = (function() {
       var results;
       results = [];
       for (k in labels) {
         label = labels[k];
         results.push(label);
       }
       return results;
     })();
   }
   if (this.options.eof) {
     labels = this.stringify(labels) + this.options.rowDelimiter;
   } else {
     labels = this.stringify(labels);
   }
   return stream.Transform.prototype.write.call(this, labels);
 };

 Stringifier.prototype.end = function(chunk, encoding, callback) {
   if (this.countWriten === 0) {
     this.headers();
   }
   return stream.Transform.prototype.end.apply(this, arguments);
 };

 Stringifier.prototype.write = function(chunk, encoding, callback) {
   var base, e, preserve;
   if (chunk == null) {
     return;
   }
   preserve = typeof chunk !== 'object';
   if (!preserve) {
     if (this.countWriten === 0 && !Array.isArray(chunk)) {
       if ((base = this.options).columns == null) {
         base.columns = Object.keys(chunk);
       }
     }
     try {
       this.emit('record', chunk, this.countWriten);
     } catch (_error) {
       e = _error;
       return this.emit('error', e);
     }
     if (this.options.eof) {
       chunk = this.stringify(chunk) + this.options.rowDelimiter;
     } else {
       chunk = this.stringify(chunk);
       if (this.options.header || this.countWriten) {
         chunk = this.options.rowDelimiter + chunk;
       }
     }
   }
   if (typeof chunk === 'number') {
     chunk = "" + chunk;
   }
   if (this.countWriten === 0) {
     this.headers();
   }
   if (!preserve) {
     this.countWriten++;
   }
   return stream.Transform.prototype.write.call(this, chunk, encoding, callback);
 };

 Stringifier.prototype._transform = function(chunk, encoding, callback) {
   this.push(chunk);
   return callback();
 };

 Stringifier.prototype.stringify = function(line) {
   var _line, column, columns, containsLinebreak, containsQuote, containsdelimiter, delimiter, escape, field, i, j, l, newLine, quote, ref, ref1, regexp;
   if (typeof line !== 'object') {
     return line;
   }
   columns = this.options.columns;
   if (typeof columns === 'object' && columns !== null && !Array.isArray(columns)) {
     columns = Object.keys(columns);
   }
   delimiter = this.options.delimiter;
   quote = this.options.quote;
   escape = this.options.escape;
   if (!Array.isArray(line)) {
     _line = [];
     if (columns) {
       for (i = j = 0, ref = columns.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
         column = columns[i];
         _line[i] = typeof line[column] === 'undefined' ? null : line[column];
       }
     } else {
       for (column in line) {
         _line.push(line[column]);
       }
     }
     line = _line;
     _line = null;
   } else if (columns) {
     line.splice(columns.length);
   }
   if (Array.isArray(line)) {
     newLine = '';
     for (i = l = 0, ref1 = line.length; 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
       field = line[i];
       if (typeof field === 'string') {
          // No code here in original version.
       } else if (typeof field === 'number') {
         field = '' + field;
       } else if (typeof field === 'boolean') {
         field = field ? '1' : '';
       } else if (field instanceof Date) {
         //field = '' + field.getTime(); // In original version.
         field = field.getFullYear() + '-' + (field.getMonth() + 1) + '-' + field.getDate()
               + ' ' + field.getHours() + ':' + field.getMinutes() + ':' + field.getSeconds();

       } else if (typeof field === 'object' && field !== null) {
         field = JSON.stringify(field);
       }
       if (field) {
         containsdelimiter = field.indexOf(delimiter) >= 0;
         containsQuote = field.indexOf(quote) >= 0;
         containsLinebreak = field.indexOf('\r') >= 0 || field.indexOf('\n') >= 0;
         if (containsQuote) {
           regexp = new RegExp(quote, 'g');
           field = field.replace(regexp, escape + quote);
         }
         if (containsQuote || containsdelimiter || containsLinebreak || this.options.quoted || (this.options.quotedString && typeof line[i] === 'string')) {
           field = quote + field + quote;
         }
         newLine += field;
       } else if (this.options.quotedEmpty || ((this.options.quotedEmpty == null) && line[i] === '' && columns[i].indexOf('0000-00-00 00:00:00') === -1 && this.options.quotedString)) {
         newLine += quote + quote;
       }
       
       if (i !== line.length - 1) {
         newLine += delimiter;
       }
     }
     line = newLine;
   }
   return line;
 };
 
