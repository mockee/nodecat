// Module dependencies.
var express = require('express'),
    cluster = require('cluster'),
    //live = require('cluster-live'),
    mongoose = require('mongoose'),
    mongoStore = require('connect-mongo'),
    form = require('connect-form'),
    stylus = require('stylus'),

    utils = require('./lib/utils'),
    noteModels = require('./models/note'),
    userModels = require('./models/user'),

    app = module.exports = express.createServer(),
    Note, Comment, TrackBack, User;

// Configuration
app.configure(function() {
    // stylus complie configure
    function compile (str, path) {
        return stylus(str).
            set('filename', path).
            set('compress', true);
    }

    // mustache.js for express apps.
    // https://github.com/fat/stache
    //app.set('view engine', 'mustache');

    app.set('view engine', 'jade');
    app.use(stylus.middleware({
        src: __dirname + '/views',
        dest: __dirname + '/public',
        compile: compile
    }));

    // set mongodb connection
    app.set('connection', 'mongodb://localhost/nodecat-blog');

    // Middleware
    app.use(express.logger(
        //:remote-addr:status:referrer
        '\x1b[0m:date \x1b[32m:method\x1b[0m \x1b[33m:url\x1b[31m :response-time ms \x1b[36m:user-agent'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    app.use(express.cookieParser());
    app.use(express.session({
        cookie: { maxAge: 43200000 },
        // mongoStore
        store: new mongoStore({ url: app.set('connection') }),
        secret: 'nodecat'
    }));

    // upload
    app.use(form({
        keepExtensions: true,
        uploadDir: utils.getUploadPath()
    }));

    //app.dynamicHelpers({ messages: require('express-messages') });
    
    // tjholowaychuk.com/post/9682643240/connect-1-7-0-fast-static-file-memory-cache-and-more
    app.use(express.staticCache());
    app.use(express['static'](__dirname + '/public')); 
    app.set('views', __dirname + '/views');
});

// $ NODE_ENV=development node app.js
app.configure('development', function(){
    app.set('port', 7901); 
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    })); 
});

app.configure('production', function () {
    app.set('port', 8124);
});

// Error Handling
app.error(function (err, req, res, next) {
    if (err instanceof utils.NotFound) {
        res.render('error/404.jade', {
            locals: { title: '404 Not Found' }
        });
    }
});

app.error(function (err, req, res) {
    if (err instanceof utils.InternalServerError) {
        res.render('error/500.jade', {
            locals: { error: err }
        });
    }
});

// Models
noteModels.define(mongoose, function () {
    Note = mongoose.model('Note');
    Comment = mongoose.model('Comment');
    TrackBack = mongoose.model('TrackBack');
});

userModels.define(mongoose, function () {
    User = mongoose.model('User');
    LoginToken = mongoose.model('LoginToken');
});

// Connection
mongoose.connect(app.set('connection'));

// Routes
require('./router')(app, Note, Comment, TrackBack, User, LoginToken);

if (!module.parent) {
    // Cluster
    // Extensible multi-core server manager for node.js
    // https://github.com/LearnBoost/cluster
    cluster(app).
        set('workers', 4).
        // verbose debugging information
        use(cluster.debug()).
        use(cluster.logger('logs')).
        // reloads workers when files change
        use(cluster.reload(['lib', 'models', 'app.js', 'router.js'])).
        // writes master / worker pidfiles
        use(cluster.pidfiles('pids')).
        // provides a command-line interface for your cluster
        use(cluster.cli()).
        // perform real-time administration
        use(cluster.repl(8899)).
        // adds real-time statistics to the repl plugin 
        use(cluster.stats({
            connections: true,
            lightRequests: true
        })).
        use(live(9999, { user: '', pass: '' })).
        listen(app.set('port'));

    //app.listen(app.set('port'));
    //console.log("Express server listening on port %d", app.address().port);
}
