var STATIC_URL = 'http://static.mockee.com';

Do.add('sh-css', {
  path: STATIC_URL + '/stylesheets/sh_kwrite.min.css',
  type: 'css'
});

Do.add('sh', {
  path: STATIC_URL + '/javascripts/sh_main.min.js',
  requires: ['sh-css'],
  type: 'js'
});

Do.add('upload', {
  path: STATIC_URL + '/javascripts/upload.min.js',
  type: 'js'
});

Do.add('editor', {
  path: STATIC_URL + '/javascripts/editor.js',
  requires: ['upload'],
  type: 'js'
});

Do.add('comment', {
  path: STATIC_URL + '/javascripts/comment.js',
  type: 'js'
});

Do.ready('sh', function() {
  window.sh_highlightDocument('/javascripts/lang/', '.min.js');
});
