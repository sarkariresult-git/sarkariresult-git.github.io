/* Client-side pagination for <ul data-per-page="N"> lists */
(function () {
    'use strict';
    document.querySelectorAll('ul[data-per-page]').forEach(function (list) {
        var per = parseInt(list.getAttribute('data-per-page'), 10) || 10;
        var items = Array.prototype.slice.call(list.children);
        var pages = Math.ceil(items.length / per);
        if (pages <= 1) return;

        var page = 1;
        var nav = document.createElement('div');
        nav.className = 'pagination';
        nav.innerHTML =
            '<button type="button" class="page-btn" data-dir="-1">❮ Previous</button>' +
            '<span class="page-info" aria-live="polite"></span>' +
            '<button type="button" class="page-btn" data-dir="1">Next ❯</button>';
        list.parentNode.insertBefore(nav, list.nextSibling);

        var prev = nav.querySelector('[data-dir="-1"]');
        var next = nav.querySelector('[data-dir="1"]');
        var info = nav.querySelector('.page-info');

        function show() {
            items.forEach(function (li, i) { li.hidden = !(i >= (page - 1) * per && i < page * per); });
            info.textContent = 'Page ' + page + ' of ' + pages;
            prev.disabled = page === 1;
            next.disabled = page === pages;
        }
        nav.addEventListener('click', function (e) {
            var b = e.target.closest('button');
            if (!b || b.disabled) return;
            page += parseInt(b.getAttribute('data-dir'), 10);
            show();
            list.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        show();
    });
})();
