var express = require('express')
  , mongoose = require('mongoose')
  , MongoStore = require('connect-mongo')(express)
  , istatic = require('istatic')
  , stylus = require('stylus')

  , utils = require('./lib/utils')
  , noteModels = require('./models/note')
  , userModels = require('./models/user')

  , config = JSON.parse(require('fs').readFileSync(
      __dirname + '/config.json', 'utf8'))

  , app = module.exports = express.createServer()
  , Note, Comment, TrackBack, User, LoginToken;

app.configure(function() {
  function compile(str, path) {
    return stylus(str)
      .set('filename', path)
      .set('compress', true);
  }

  app.set('view engine', 'jade');
  app.use(stylus.middleware({
    src: __dirname + '/public',
    dest: __dirname + '/public',
    compile: compile
  }));

  app.helpers({
    istatic: istatic.serve()
  });

  // set mongodb connection
  app.set('connection', config.db.conn);

  // Middleware
  app.use(express.logger(
    //:remote-addr:status:referrer
    '\x1b[0m:date \x1b[32m:method\x1b[0m \x1b[33m:url\x1b[31m :response-time ms \x1b[36m:user-agent'));

  app.use(express.bodyParser({
    keepExtensions: true,
    uploadDir: utils.getUploadPath()
  }));

  app.use(express.methodOverride());

  app.use(express.cookieParser());
  app.use(express.session({
    cookie: { maxAge: 43200000 },
    store: new MongoStore({ url: app.set('connection') }),
    secret: 'nodecat'
  }));

  //app.dynamicHelpers({ messages: require('express-messages') });

  // tjholowaychuk.com/post/9682643240/connect-1-7-0-fast-static-file-memory-cache-and-more
  app.use(express.staticCache());
  app.use(express['static'](__dirname + '/public'));
  app.set('views', __dirname + '/views');
});

// $ NODE_ENV=development node app.js
app.configure('development', function() {
  app.set('port', 7901);
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});

app.configure('production', function() {
  app.set('port', 8126);
});

app.error(function (err, req, res, next) {
  if (err instanceof utils.NotFound) {
    res.render('error/404.jade', {
      error: err,
      title: err.name,
      layout: 'light'
    });
  } else if (err instanceof utils.InternalServerError) {
    res.render('error/500.jade', {
      error: err,
      title: err.name,
      layout: 'light'
    });
  } else {
    console.error(err);
  }
});

// Models
noteModels.define(mongoose, function() {
  Note = mongoose.model('Note');
  Comment = mongoose.model('Comment');
  TrackBack = mongoose.model('TrackBack');
});

userModels.define(mongoose, function() {
  User = mongoose.model('User');
  LoginToken = mongoose.model('LoginToken');
});

// Connection
mongoose.connect(app.set('connection'));

// Routes
require('./router')(app, Note, Comment, TrackBack, User, LoginToken, config);

if (!module.parent) {
  app.listen(app.set('port'));
  console.info('Express server listening on port %d', app.address().port);
}
