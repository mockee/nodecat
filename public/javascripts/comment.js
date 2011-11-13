!function() {
    $('body').on('click', '.comments', function (e) {
        var tar = e.target;
        if (tar.className === 'del-comment') {
            e.preventDefault();
            var cmtOuter = $(tar).parents('li'),
                noteId = $('article').data('id') || cmtOuter.data('nid'),
                cmtId = cmtOuter.data('cid'),
                cfm = confirm('确定要删除此条评论?');

            if (cfm) {
                $.post(
                    '/note/' + noteId + '/comment/delete',
                    { commentId: cmtId },
                    function (data) {
                        if (!data.err) {
                            $('[data-cid=' + cmtId + ']').fadeOut(function () {
                                $(this).remove();
                            });
                        }
                    }
                );
            }
        }
    });
}();
