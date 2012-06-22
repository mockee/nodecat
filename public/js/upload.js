(function($) {
  $.fn.iframePostForm = function(options) {
    var contents, elements, element, iframe, n;

    elements = $(this);
    options = $.extend({},
      $.fn.iframePostForm.defaults, options);

    if (!$('#' + options.iframeID).length) {
      $('body').append(
        '<iframe name="' + options.iframeID
          + '" id="' + options.iframeID
          + '" style="display:none"></iframe>');
    }

    return elements.each(function() {
      element = $(this);
      element.attr('target', options.iframeID);

      element.submit(function () {
        options.post.apply(this);

        n = $('#' + options.iframeID);
        n[0].onload = function () {
          contents = n[0].contentDocument.body;
          options.complete.apply(this, [contents.innerHTML]);

          setTimeout(function () {
            //contents.html('');
          }, 1);
        };
      });
    });
  };

  $.fn.iframePostForm.defaults = {
    iframeID: 'iframe-post-form',
    post: function(){},
    complete: function(response){}
  };
})(window.Zepto);
