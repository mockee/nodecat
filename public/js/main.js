Do.add('sh-css', {
  path: '/css/sh_kwrite.min.css',
  type: 'css'
});

Do.add('sh', {
  path: '/js/sh_main.min.js',
  requires: ['sh-css'],
  type: 'js'
});

Do.add('upload', {
  path: '/js/upload.min.js',
  type: 'js'
});

Do.add('editor', {
  path: '/js/editor.js',
  requires: ['upload'],
  type: 'js'
});

Do.add('comment', {
  path: '/js/comment.js',
  type: 'js'
});

Do.ready('sh', function() {
  window.sh_highlightDocument('/js/lang/', '.min.js');
});
