Do.add('sh-css', {
  path: '/css/sh_kwrite.min.css'
, type: 'css'
})

Do.add('sh', {
  path: '/js/sh_main.min.js'
, requires: ['sh-css']
, type: 'js'
})

Do.add('upload', {
  path: '/js/dist/upload.min.js'
, type: 'js'
})

Do.add('editor', {
  path: '/js/dist/editor.min.js'
, requires: ['upload']
, type: 'js'
})

Do.add('comment', {
  path: '/js/dict/comment.min.js'
, type: 'js'
})

Do.ready('sh', function() {
  window.sh_highlightDocument('/js/lang/', '.min.js')
})
