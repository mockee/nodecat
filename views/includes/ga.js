var _gaq = _gaq || [];

_gaq.push(['_setAccount', 'UA-568469-8']);
_gaq.push(['_setDomainName', 'mockee.com']);
_gaq.push(['_trackPageview']);

(function() {
    var doc = document,
        ga = doc.createElement('script');

    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = ('https:' == doc.location.protocol ? 'https://ssl' : 'http://www')
        + '.google-analytics.com/ga.js';

    var s = doc.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(ga, s);
})();
