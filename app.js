var path = require('path')
  , express = require('express')
  , mongoose = require('mongoose')
  , MongoStore = require('connect-mongo')(express)
  , istatic = require('express-istatic')
  , stylus = require('stylus')

  , utils = require('./lib/utils')
  , noteModels = require('./models/note')
  , userModels = require('./models/user')

  , config = JSON.parse(require('fs').readFileSync(
      __dirname + '/config.json', 'utf8'))

  , app = module.exports = express()
  , Note, Comment, TrackBack, User, LoginToken
  , pathPublic = path.join(__dirname, 'public');

app.configure(function() {
  function compile(str, path) {
    return stylus(str)
      .set('filename', path)
      // Data URI image inlining
      .define('url', stylus.url({
        paths: [pathPublic + '/img'] }))
      .set('compress', true);
  }
  app.set('port', process.env.PORT || 8126);
  app.set('view engine', 'jade');
  app.use(stylus.middleware({
    src: pathPublic,
    dest: pathPublic,
    compile: compile
  }));

  app.locals({
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

  app.use(express.static(pathPublic));
  app.set('views', __dirname + '/views');

  app.use(function(err, req, res, next) {
    if (err instanceof utils.NotFound) {
      res.render('error/404.jade', {
        error: err,
        title: err.name
      });
    } else if (err instanceof utils.InternalServerError) {
      res.render('error/500.jade', {
        error: err,
        title: err.name
      });
    } else {
      console.error(err);
    }
  });
});

// $ NODE_ENV=development node app.js
app.configure('development', function() {
  app.set('port', 7901);
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
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
  console.info('Express server listening on port %d', app.get('port'));
}
