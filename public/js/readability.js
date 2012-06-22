(function() {
  var doc = document
    , s = doc.getElementsByTagName('script')[0]
    , rdb = doc.createElement('script');

  rdb.async = true;
  rdb.src = doc.location.protocol
    + '//www.readability.com/embed.js';
  s.parentNode.insertBefore(rdb, s);
})();
