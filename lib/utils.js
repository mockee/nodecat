var mkdirp = require('mkdirp')
  , crypto = require('crypto')
  , querystring = require('querystring');

module.exports = {
  subExcerpt: function(excerpt) {
    return excerpt
      .replace(/<[^>]+?>/g, '')
      .slice(0, 254);
  },

  convertMarkup: function(input) {
    return input
      .replace(/\r\n/gm, '\n')
      .replace(/\r/gm, '\n')
      .replace(/\n/gm, '<br>');
  },

  zeroFill: function(num, len) {
    return (num / Math.pow(10, len))
      .toFixed(len).substr(2);
  },

  formatDate: function(d, type) {
    var date = new Date(d)
      , year = date.getFullYear()
      , month = this.zeroFill((date.getMonth() + 1), 2)
      , day = this.zeroFill(date.getDate(), 2)
      , hours = this.zeroFill(date.getHours(), 2)
      , minutes = this.zeroFill(date.getMinutes(), 2)
      , seconds = this.zeroFill(date.getSeconds(), 2)
      , offset = date.getTimezoneOffset()
      , offsetSign = offset > 0 ? '-' : '+'
      , offsetHours = this.zeroFill(Math.floor(Math.abs(offset) / 60), 2)
      , offsetMinutes = this.zeroFill(Math.abs(offset) % 60, 2);

    if (type === 'rfc3339') {
      return year + '-' + month + '-' + day + 'T'
        + hours + ':' + minutes + ':' + seconds
        + offsetSign + offsetHours + ':' + offsetMinutes;
    } else {
      return year + '-' + month + '-' + day + ' '
        + hours + ':' + minutes + ':' + seconds;
    }
  },

  parseIntDate: function(params) {
    var y = params.year
      , m = ~~params.month
      , d = ~~params.day
      , isNaN = function(obj) {
        return obj !== obj;
      };

    if (isNaN(y) || isNaN(m) || isNaN(d)) { return null; }
    return { y: y, m: m, d: d };
  },

  createCondition: function(date, slug) {
    // set the date range
    var start = new Date(date.y, date.m - 1, date.d),
    end = new Date(date.y, date.m - 1, date.d, 23, 59, 59);

    return {
      slug: slug,
      created: { $gte: start, $lte: end }
    };
  },

  getUploadPath: function() {
    var d = new Date()
      , base = 'public/uploads/'
      , path = [
        d.getFullYear(),
        this.zeroFill((d.getMonth() + 1), 2)
      ].join('/');

    mkdirp(base + path, 0755, function(err) {
      if (err) { console.error(err); }
    });

    return base + path;
  },

  gravatar: function(email, options) {
    var host = 'http://www.gravatar.com/avatar/'
      , queryData = querystring.stringify(options)
      , query = (queryData && '?' + queryData) || '';

    email = email.toLowerCase().trim();
    return host + crypto.createHash('md5')
      .update(email).digest('hex') + query;
  },

  mkNoteUrl: function(p) {
    return ['', p.year, p.month, p.day, p.slug, ''].join('/');
  },

  distinct: function(obj, attrName) {
    var self = obj
      , name = attrName
      , resultArr = []
      , origLen = self.length
      , resultLen;

    function include(arr, value) {
      for (var i = 0, n = arr.length; i < n; ++i) {
        if (arr[i][name] === value) {
          return true;
        }
      }
      return false;
    }

    resultArr.push(self[0]);

    for (var i = 1; i < origLen; ++i) {
      if (!include(resultArr, self[i][name])) {
        resultArr.push(self[i]);
      }
    }

    return resultArr;
  },

  NotFound: NotFound,
  InternalServerError: InternalServerError
};

// Error Handling
function NotFound(msg) {
  this.name = '404 NotFound';
  Error.call(this, msg);
  Error.captureStackTrace(this, arguments.callee);
}

NotFound.prototype.__proto__ = Error.prototype;

function InternalServerError(msg) {
  this.name = '500 InternalServerError';
  Error.call(this, msg);
  Error.captureStackTrace(this, arguments.callee);
}

InternalServerError.prototype.__proto__ = Error.prototype;
