(function(doc, win) {
  var main = $('.main')
    , notebd = $('#notebody')
    , cmtBox = $('#cmt-box')
    , editor = $('.editor')
    , editbar = $('.editbar')
    , uploadForm = $('#upload-form')
    , photoPreview = $('.photo-preview')

    , CSS_EDITOR = '.editor'
    , CSS_CODEBOX = '.code-box'
    , CSS_CODEAREA = '.code-area'
    , CSS_UPLOAD_INPUT = '.upload-input'

    , TMPL_JS = '<pre class="sh_javascript">{{CODE}}</pre>\n\n'
    , TMPL_BOX = '<form class="code-box"><textarea class="col7 code-area" rows="4"'
      + 'placeholder="//javascript code here" required="required"></textarea>'
      + '<input class="btn btn-code" type="submit" value="insert" />'
      + '<b class="x">x</b></form>'

    , cursorMethod = {
        setCursorPosition: function(textarea, position) {
          this.selectTxt(textarea, position, position)
        },

        selectTxt: function(textarea, start, end) {
          if (doc.selection) {
            var range = textarea.createTextRange()

            range.moveEnd('character', -textarea.value.length)
            range.moveEnd('character', end)
            range.moveStart('character', start)
            range.select()

          } else {
            textarea.setSelectionRange(start, end)
            textarea.focus()
          }
        },

        insertAfterCursor: function (textarea, text) {
          var val = textarea.value

          if (doc.selection) {
            textarea.focus()
            doc.selection.createRange().text = text
          } else {
            var cp = textarea.selectionStart
              , ubbLength = textarea.value.length

            textarea.value = textarea.value.slice(0, cp) + text
              + textarea.value.slice(cp, ubbLength)

            this.setCursorPosition(textarea, cp + text.length)
          }
        }
      }

    , resizeTextarea = function() {
        var mainW = main.width()
          , labelW = parseInt($('.fields').css('margin-left'), 10)
        notebd.css('width', mainW - labelW)
      }

  cmtBox.focus(function(e) {
    if (!editbar.is(':visible')) {
      editbar.show()
    }
  })

  $('.add-comment').on('click', CSS_EDITOR, function(e) {
    e.preventDefault()
    var tar = e.target

    if (tar.id === 'add-js') {
      if (!editor.find(CSS_CODEBOX).length) {
        editor.append(TMPL_BOX)
        $(CSS_CODEAREA).focus()
      } else {
        $(CSS_CODEAREA).focus()
      }
    }

    switch (tar.className) {
      case 'x':
      $(CSS_CODEBOX).remove()
      cmtBox.focus()
      break

      case 'btn btn-code':
      var codeArea = $(CSS_CODEAREA),
      codeBox = $(CSS_CODEBOX)

      if ($.trim(codeArea.val())) {
        cursorMethod.insertAfterCursor(cmtBox[0],
        TMPL_JS.replace('{{CODE}}', codeArea.val()))
        codeBox.remove()
      } else {
        codeArea.focus()
      }
      break

      default:
      break
    }
  })

  uploadForm.iframePostForm({
    post: function(){},
    complete: function(o) {
      var imgData = JSON.parse($.browser.msie ? o : $(o).text())
      photoPreview.append('<img src="'
        + imgData.src.replace('public', '') + '">')
    }
  }).find(CSS_UPLOAD_INPUT).change(function() {
    $(this).parent().submit()
  })

  photoPreview.on('click', 'img', function(e) {
    var src = $(this).attr('src')
      , val = notebd.val()

    cursorMethod.insertAfterCursor(
      notebd[0], '<img src="' + src + '">')
  })

  resizeTextarea()
  $(win).resize(function() {
    resizeTextarea()
  })
})(document, window)
