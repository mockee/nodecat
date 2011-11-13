/* Global functions */
var mkdirp = require('mkdirp'),
    crypto = require('crypto'),
    querystring = require('querystring');
    
exports.subExcerpt = subExcerpt; 
exports.escapeHTML = escapeHTML;
exports.convertMarkup = convertMarkup;
exports.formatDate = formatDate;
exports.parseIntDate = parseIntDate;
exports.createCondition = createCondition;
exports.getUploadPath = getUploadPath;
exports.gravatar = gravatar;
exports.mkNoteUrl = mkNoteUrl;
exports.distinct = distinct;
exports.NotFound = NotFound;

function subExcerpt(excerpt) { 
    // remove tag
    excerpt = excerpt.replace(/<[^>]+?>/g, '');
    return excerpt.slice(0, 254);
}

function escapeHTML (s) {                                    
    s = s.replace(/&/g, '&amp;');                             
    s = s.replace(/</g, '&lt;');                              
    s = s.replace(/>/g, '&gt;');                              
    s = s.replace(/"/g, '&quot;');                            
    s = s.replace(/'/g, '&#39;');                             
    return s;                                                 
}

function convertMarkup (input) {
    return input.
        replace(/\r\n/gm, '\n').
        replace(/\r/gm, '\n').
        replace(/\n/gm, '<br>');
}

function zeroFill (s, n) {
    var zero = '';
    for (var i = 0; i < n; i++) {
        zero += '0';
    } 
    return (zero + s).slice(-n);
}

function getUploadPath () {
    var d = new Date(),
        base = 'public/uploads/',
        path = d.getFullYear() + '/' + zeroFill((d.getMonth() + 1), 2); 

    mkdirp(base + path, 0755, function (err) {
        if (err) {
            console.error(err);
        }
    });

    return base + path;
}

// rfc3339
function formatDate (d, type) {
    var date = new Date(d),

        year = date.getFullYear(),
        month = zeroFill((date.getMonth() + 1), 2),
        day = zeroFill(date.getDate(), 2),
        hours = zeroFill(date.getHours(), 2),
        minutes = zeroFill(date.getMinutes(), 2),
        seconds = zeroFill(date.getSeconds(), 2),

        offset = date.getTimezoneOffset(),
        offsetSign = offset > 0 ? '-' : '+',
        offsetHours = zeroFill(Math.floor(Math.abs(offset) / 60), 2),
        offsetMinutes = zeroFill(Math.abs(offset) % 60, 2);

    if (type === 'rfc3339') {
        return year + '-' + month + '-' + day + 'T' + hours + ':' +
            minutes + ':' + seconds + offsetSign + offsetHours + ':' + offsetMinutes;
    } else {
        return year + '-' + month + '-' + day + ' ' + hours + ':' +
            minutes + ':' + seconds;
    }
}

function parseIntDate (params) {
    var y = params.year,
        m = ~~params.month,
        d = ~~params.day;

    if (y === NaN || m === NaN || d === NaN) {
        return null;
    }

    return { y: y, m: m, d: d };
}

function createCondition (date, slug) {
    // set the date range
    var start = new Date(date.y, date.m - 1, date.d),
        end = new Date(date.y, date.m - 1, date.d, 23, 59, 59);

    return {
        slug: slug,
        created: { $gte: start, $lte: end }
    };
}

function gravatar (email, options) {
    var host = 'http://www.gravatar.com/avatar/',
        queryData = querystring.stringify(options),
        query = (queryData && '?' + queryData) || '';

    email = email.toLowerCase().trim();
    return host + crypto.createHash('md5').update(email).digest('hex') + query;
}

function mkNoteUrl (params) {
    return '/' + params.year +
        '/' + params.month +
        '/' + params.day +
        '/' + params.slug + '/'; 
}

function distinct (obj, attrName) {
    var self = obj,
        name = attrName,
        resultArr = [],
        origLen = self.length,
        resultLen;

    function include (arr, value) {
        for (var i = 0, n = arr.length; i < n; ++i) {
            if (arr[i][name]=== value){
                return true;
            }  
        }  
        return false;
    }  
    resultArr.push(self[0]);
    for (var i=1; i<origLen; ++i) {
        if (!include(resultArr, self[i][name])){
            resultArr.push(self[i]);
        }  
    }  
    return resultArr;
}

// Error Handling
function NotFound (msg) {
    this.name = '404 NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}
NotFound.prototype.__proto__ = Error.prototype;

function InternalServerError (msg) {
    this.name = '500 InternalServerError';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}
InternalServerError.prototype.__proto__ = Error.prototype;
