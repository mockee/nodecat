var mdParser = require('node-markdown').Markdown
  , utils = require('../lib/utils');

module.exports.define = function(mongoose, fn) {
  var Schema = mongoose.Schema;

  var Comment = new Schema({
    nid: { type: String, index: true },
    nurl: String,
    ntitle: String,
    author: String,
    body: String,
    email: String,
    website: String,
    created: Date
  });

  // get avatar via email from Gravatar
  Comment.virtual('gravatar').get(function() {
    return utils.gravatar(this.email, {
      s: 32, d: 'identicon'
    });
  });

  Comment.virtual('bodyParsed').get(function() {
    return mdParser(
      utils.convertMarkup(this.body), true,
      'a|br|pre|strong|blockquote', {
        'a': 'href|title|target',
        'blockquote': 'cite',
        'pre': 'class'
      }
    );
  });

  Comment.virtual('readableDate').get(function() {
    return utils.formatDate(this.created);
  });

  var TrackBack = new Schema({
    nid: { type: String, index: true },
    url: String,
    title: String,
    excerpt: String,
    blogname: String,
    create: Date
  });

  var Note = new Schema({
    uuid: String,
    title: String,
    slug: String,
    body: String,
    created: Date,
    modified: Date,
    comments: Number,
    trackbacks: Number,
    tags: [String]
  });

  // format: host/year/month/day/slug
  Note.virtual('url').get(function() {
    var created = this.created
      , year = created.getFullYear()
      , month = created.getMonth() + 1
      , day = created.getDate();

    return '/' + year + '/'
      + (month < 10 ? '0' + month : month) + '/'
      + (day < 10 ? '0' + day : day) + '/'
      + this.slug + '/';
  });

  Note.virtual('bodyParsed').get(function() {
    //return convertMarkup(this.body);
    return mdParser(
      utils.convertMarkup(this.body), true,
      'a|br|pre|span|img|strong|blockquote', {
        'a': 'href|title',
        'pre': 'class',
        'span': 'class',
        'img': 'width|height|src|alt|title|class',
        'blockquote': 'cite'
      }
    );
  });

  Note.virtual('readableDate').get(function() {
    return utils.formatDate(this.created);
  });

  mongoose.model('Note', Note);
  mongoose.model('Comment', Comment);
  mongoose.model('TrackBack', TrackBack);

  fn();
};
