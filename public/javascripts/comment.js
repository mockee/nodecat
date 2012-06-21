(function() {
  $('body').on('click', '.comments', function(e) {
    e.preventDefault();
    var tar = e.target;

    if (tar.className !== 'del-comment') {
      return;
    }

    var cmtOuter = $(tar).parents('li')
      , noteId = $('article').data('id') || cmtOuter.data('nid')
      , url = ['', 'note', noteId, 'comment', 'delete'].join('/')
      , cfm = confirm('确定要删除此条评论?')
      , cmtId = cmtOuter.data('cid');

    if (cfm) {
      $.ajax({
        url: url,
        data: { commentId: cmtId },
        success: function(data) {
          if (!data.err) {
            $('[data-cid="' + cmtId + '"]').remove();
          }
        },
        fail: function() {
          alert('删除失败!');
        },
        type: 'post'
      });
    }
  });
})();
