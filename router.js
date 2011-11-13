var utils = require('./lib/utils'),
    atom = require('./lib/atom'),
    uuid = require('node-uuid'),
    fs = require('fs');

module.exports = function (app, Note, Comment, TrackBack, User, LoginToken) {  

    function authLoginToken (req, res, next) {
        var cookie = JSON.parse(req.cookies.logintoken);

        LoginToken.findOne({
            email: cookie.email,
            token: cookie.token,
            series: cookie.series
        }, function (err, token) {
            if (!token) {
                res.redirect('/admin/login');
                return;
            }

            User.findOne({
                email: token.email
            }, function (err, user) {
                if (user) {
                    req.session.user_id = user.id;
                    req.currUser = user;

                    token.token = token.randomToken();
                    token.save(function (err) {
                        res.cookie('logintoken', token.cookieValue, {
                            expires: new Date(Date.now() + 2 * 604800000),
                            path: '/'
                        });
                        next();
                    });
                } else {
                    res.redirect('/admin/login');
                }
            });
        });
    }

    function authUser (req, res, next) {
        var userId = req.session.user_id;
        if (userId) {
            User.findById(userId, function (err, user) {
                if (user) {
                    req.currUser = user;
                    next();
                } else {
                    res.redirect('/admin/login');
                }
            });
        } else if (req.cookies.logintoken) {
            authLoginToken(req, res, next);
        } else {
            res.redirect('/admin/login');
        }
    }

    function loadUser (req, res, next) {
        if (req.cookies.logintoken) {
            authLoginToken(req, res, next);
        } else {
            next();
        }
    } 

    // generate atom.xml
    function generateAtom () {
        var dataObj = {},
            recentNotes = [];

        // basic info
        dataObj.title = 'Mockee Nodes';
        dataObj.url = 'http://mockee.com';
        dataObj.author = { name: 'mockee' };

        // recent notes
        Note.find().limit(50).sort('created', -1).execFind(function (err, notes) {
            notes.forEach(function (n, i) {
                recentNotes[i] = {
                    url: n.url,
                    uuid: n.uuid,
                    title: n.title,
                    content: n.bodyParsed,
                    updated: utils.formatDate(n.created, 'rfc3339')
                };
            });
            dataObj.notes = recentNotes;

            fs.writeFile(
                __dirname + '/public/atom.xml',
                atom.generate(dataObj), 'UTF-8', function(err) {
            });
        });
    }

    // render index 
    app.get('/', loadUser, function (req, res) {
        // advice to upgrade the browser
        if (/msie (6|7|8|9)\.0/i.test(req.headers['user-agent'])) {
            res.render('admin/noie', {
                title: 'NO IE',
                layout: 'light'
            });
        } else { 
            Note.find().limit(5).sort('created', -1).execFind(function (err, notes) {
                if (err) {
                    next(new utils.InternalServerError(err));
                } else {
                    // query recent comments
                    Comment.find().limit(10).sort('created', -1).execFind(function (err, comments) {
                        res.render('index', {
                            title: 'Mockee Nodes',
                            user: req.currUser,
                            notes: notes,
                            comments: utils.distinct(comments, 'email').slice(0, 5)
                        });
                    });
                }
            });
        } 
    });

    // render user create page
    app.get('/user/create', authUser, function (req, res) {
        res.render('user/create', {
            title: 'Create User',
            user: new User()
        });
    });

    // create user
    app.post('/user/create', function (req, res) {
        var user = new User(req.body.user);

        user.save(function (err) {
            res.redirect('/');
        });
    });

    // render login page
    app.get('/admin/login', function (req, res) {
        // advice to upgrade the browser
        if (/msie/i.test(req.headers['user-agent'])) {
            res.render('admin/noie', {
                title: 'NO IE',
                layout: 'light'
            });
        } else {
            res.render('admin/login', {
                title: 'Login',
                layout: 'light'
            });
        }
    });

    // login
    app.post('/admin/login', function (req, res) {
        var userInfo = req.body.user;
        User.findOne({ email: userInfo.email }, function (err, user) {
            if (user && user.authenticate(userInfo.password)) {
                req.session.user_id = user.id;

                if (userInfo.remember) { // default
                    var loginToken = new LoginToken({ email: user.email });
                    loginToken.save(function (err) {
                        // header modification is also now stricter
                        res.cookie('logintoken', loginToken.cookieValue, {
                            expires: new Date(Date.now() + 2 * 604800000),
                            path: '/'
                        });
                        // delete guest info
                        res.clearCookie('ncguest.info', { path: '/' });
                        // an asynchronous Mongoose call could happen after a redirect was sent
                        // throw new Error("Can't use mutable header APIs after sent.")
                        res.redirect('/');
                    });
                } else {
                    res.redirect('/');
                }
            } else {
                res.redirect('/admin/login');
            }
        });
    });

    // logout user
    app.get('/admin/logout', authUser, function (req, res) {
        if (req.session) {
            LoginToken.remove({ email: req.currUser.email });
            // this path option is important
            res.clearCookie('logintoken', { path: '/' });
            req.session.destroy(function(){});
        }
        res.redirect('/');
    }); 

    // render post page
    app.get('/note/create', authUser, function (req, res) {
        res.render('note/create', {
            locals: {
                title: 'Create Note',
                note: new Note()
            }
        });
    });

    // render update page
    app.get('/note/edit/:id', function (req, res) {
        Note.findById(req.params.id, function (err, note) {
            res.render('note/edit', {
                locals: {
                    title: 'Edit Note',
                    note: note
                }
            });
        });
    });

    // render detail page
    app.get('/:year/:month/:day/:slug', loadUser, function (req, res, next) {
        // advice to upgrade the browser
        if (/msie (6|7|8|9)\.0/i.test(req.headers['user-agent'])) {
            res.render('admin/noie', {
                title: 'NO IE',
                layout: 'light'
            });
        } else {
            var params = req.params, 
                condition = utils.createCondition(
                    utils.parseIntDate(params),
                    params.slug),
                guestStr = req.cookies['ncguest.info'],
                currGuest = guestStr ? JSON.parse(guestStr) : '',
                currUser = req.currUser || currGuest;

            Note.findOne(condition, function (err, note) {
                if (err) {
                    next(new utils.InternalServerError(err));
                } else if (!note) {
                    next(new utils.NotFound());
                } else {
                    // get comments
                    Comment.find({ nid: note.id }).sort('created', 1).execFind(function (err, comments) {
                        res.render('note/view', {
                            title: note.title,
                            user: currUser,
                            note: note,
                            comments: comments,
                            trackback: utils.mkNoteUrl(params) + 'trackback'
                        });
                    });
                }
            });
        }
    });

    app.get('/:year/:month/:day/:slug/trackback', function (req, res) {
        res.redirect(utils.mkNoteUrl(req.params));
    });

    app.get('/note/list', authUser, function (req, res) {
        Note.find().sort('created', -1).execFind(function (err, notes) {
            res.render('admin/notes', {
                title: 'Notes / admin',
                notes: notes
            });
        });
    });

    app.get('/comment/list', authUser, function (req, res) {
        Comment.find().sort('created', -1).execFind(function (err, comments) {
            res.render('admin/comments', {
                title: 'Comments / admin',
                comments: comments 
            });
        });
    });

    app.get('/tags/:tag', function (req, res) {
        var tagName = req.params.tag;
        Note.find({ tags: tagName }).sort('created', -1).execFind(function (err, notes) {
            if (err) {
                next(new utils.InternalServerError(err));
            } else if (!notes) {
                next(new utils.NotFound());
            } else {
                res.render('note/tag', {
                    title: tagName,
                    notes: notes
                });
            }
        });
    });

    // post new note
    app.post('/note/create', function (req, res) {
        var note = new Note(),
            data = req.body.note;

        note.uuid = uuid();
        note.title = data.title;
        note.slug = data.slug;
        note.body = data.body;
        note.modified = note.created = new Date();
        note.tags = data.tags.split(' ');
        note.trackbacks = 0;
        note.comments = 0;

        note.save(function (err) {
            generateAtom();
            res.redirect('/');
        });
    });

    app.post('/note/upload_pic', function (req, res) {
        req.form.complete(function (err, fields, files) {
            console.log('\nuploaded %s to %s', files.image.filename, files.image.path);
            res.header('Content-Type', '');
            res.end('{"src":"' + files.image.path + '"}');
        });
    });

    // post comment
    app.post('/:year/:month/:day/:slug/comment', function (req, res) {  
        
        var params = req.params, 
            condition = utils.createCondition(
                utils.parseIntDate(params),
                params.slug),
            data = req.body.comment,
            comment = new Comment(),
            noteUrl = utils.mkNoteUrl(params);

        // save guest info
        if (!req.session.user_id) {
            ncguestInfo = JSON.stringify({
                name: data.author,
                email: data.email,
                website: data.website || ''
            });
            res.cookie('ncguest.info', ncguestInfo, {
                expires: new Date(Date.now() + 2 * 604800000),
                path: '/'
            });
        }
        
        Note.findOne(condition, function (err, note) {
            if (!err) {
                // save comment
                comment.nid = note.id;
                comment.nurl = noteUrl;
                comment.ntitle = note.title;
                comment.author = data.author;
                comment.body = data.body.trim() || 'passing...';
                comment.email = data.email;
                comment.website = data.website;
                comment.created = new Date();
                comment.save(function (err) {
                    if (!err) {
                        note.comments += 1;

                        // save note
                        note.save(function (err) {
                            res.redirect(noteUrl);
                        });
                    }
                });
            }
        });
    }); 

    // delete comment
    app.post('/note/:id/comment/delete', function (req, res) {
        Comment.findById(req.body.commentId, function (err, comment) {
            comment.remove(function (err) {
                res.contentType('json');
                res.send('{"err" : 0}');
            });
        });

        Note.findById(req.params.id, function (err, note) {
            if (!err) {
                note.comments -= 1;
                note.save(function (err) {});
            }
        });
    });

    // delete note 
    app.del('/note/:id', function (req, res) {
        Note.findById(req.params.id, function (err, note) {
            note.remove(function (err) {
                generateAtom();
                res.redirect('/');
            });
        });
    });

    // update note 
    app.put('/note/edit/:id', function (req, res) {
        Note.findById(req.params.id, function (err, note) {
            var reqBody = req.body.note;

            note.title = reqBody.title;
            note.body = reqBody.body;
            note.tags = reqBody.tags.split(' ');
            note.modified = new Date();

            note.save(function (err) {
                generateAtom();
                res.redirect('/');
            });
        });
    });

    // receive trackback
    app.post('/:year/:month/:day/:slug/trackback', function (req, res, next) {
        var tb = req.body,
            params = req.params,
            tbRec = {
                url: tb.url,
                title: tb.title,
                excerpt: tb.excerpt,
                blog_name: tb.blog_name,
                date: new Date().toString()
            },
            condition = utils.createCondition(
                utils.parseIntDate(params),
                params.slug),

            TMPL_TB_XML = '<?xml version="1.0" encoding="UTF-8"?>' +
                '<response><error>{NUM}</error><message>{MSG}</message></response>';

        res.contentType('application/xml');
        Note.findOne(condition, function (err, note) {
            if (err) {
                next(new utils.InternalServerError(err));
            } else {
                if (!note || !tbRec.url) {
                    // return error status
                    res.send(TMPL_TB_XML.
                        replace('{NUM}, 1').
                        replace('{MSG}', 'TrackBack Error'));
                } else {
                    // return success status
                    res.send(TMPL_TB_XML.
                        replace('{NUM}', 0).
                        replace('{MSG}', ''));

                    var trackback = new TrackBack();
                    
                    trackback.nid = note.id;
                    trackback.url = tb.url;
                    trackback.title = tb.title ? tb.title : tb.url;
                    trackback.excerpt = tb.excerpt ? utils.subExcerpt(tb.excerpt) : '';
                    trackback.blogname = tb.blog_name || '';
                    trackback.create = tb.date;

                    trackback.save(function (err) {
                        if (err) {
                            next(new utils.InternalServerError(err));
                        } else {
                            note.trackbacks += 1;     
                        }
                    });
                }
            }
        });
    });

    // 404
    app.get('*', function (req, res, next) {
        next(new utils.NotFound());
    });
};
