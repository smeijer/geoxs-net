(function(window,undefined){
    History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
        var state = History.getState(); // Note: We are using History.getState() instead of event.state
        if(state.hash === '/')
            window.location = '/';
        else
            goto(state.url);
    });
})(window);

(function() {
    // internal
   // var siteURL = "http://" + top.location.host.toString();
   // var internal = $("a[href^='"+siteURL+"'], a[href^='/'], a[href^='./'], a[href^='../'], a[href^='#']");

    // bigger click area
    $('.column.two .article')
        .on('mouseenter', function() {
            $(this).css('cursor', 'pointer');
        })
        .on('mouseleave', function() {
            $(this).css('cursor', 'default');
        })
        .on('click', function(e) {
            e.preventDefault();

            var self = this;

            var anchor = $(this).find('.title a')[0];
            var url = anchor.href;
            var title = $(anchor).text();

            // browser supports pushstate
            History.pushState(null, title, url);
            goto(url);

            return false;
        });
})();

function goto(url) {
    // empty current article container
    var article = $('.document.container .article');
    var promise = article.addClass('loading replacing').delay(500).promise();

    // start loading remote data asap
    var jsonUrl = url.replace('.html', '.json');
    $.getJSON(jsonUrl, function(doc) {
        var html = Templates.article(doc);

        promise.done(function() {
            article.html(html).removeClass('loading replacing');
        });

        $('.column.two .article[data-doc-id="'+doc.id+'"]')
            .removeClass('inactive').addClass('active');
        article.attr('data-doc-id', doc.id);
    });

    // change active markers
    $('.column.two .article.active').removeClass('active').addClass('inactive');
}

// page styling
(function() {
    $(document).ready(function() {
        $('.navigation.container .column.two').perfectScrollbar();
    });
}());


/// templates
_.templateSettings.escape = /{{\-([\s\S]+?)}}/g;
_.templateSettings.evaluate = /{{\=([\s\S]+?)}}/g;
_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

Templates = {
    article: _.template(
          '<h2 class="title">{{meta.title}}</h2>' +
          '<div class="content">{{content}}</div>' +
          '<div class="meta"><ul class="pull-left">' +
            '<li><i class="fa fa-clock-o"></i> {{formatDate(meta.date)}}</li>' +
          '</ul><span class="pull-right">' +
             '<a href="/pages/contact.html">Wish to know more? Please feel free to contact us.</a>' +
             '</span></div>')
};

function formatDate(d) {
    if(typeof d !== 'string')
        d = d.toISOString();

    return d.substr(0, 10);
}

function preloadImages(collection) {
    var preload = function(src) {
        var el = new Image();
        el.src = src;
    };

    $.getJSON('/'+collection+'/index.json', function(index) {
       var images = _.flatten(index.documents, 'images');
       _.each(images, preload);
    });
}