/* Site-wide behaviour: mobile menu + reading progress bar */
(function () {
    'use strict';

    var btn = document.getElementById('hamburger-btn');
    var nav = document.getElementById('mainNav');
    if (btn && nav) {
        var setOpen = function (open) {
            nav.classList.toggle('open', open);
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
            btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        };
        btn.addEventListener('click', function () { setOpen(!nav.classList.contains('open')); });
        nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
        document.addEventListener('click', function (e) {
            if (nav.classList.contains('open') && !nav.contains(e.target) && !btn.contains(e.target)) setOpen(false);
        });
    }

    var bar = document.getElementById('myBar');
    if (bar) {
        var ticking = false;
        var update = function () {
            var h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            var pct = h > 0 ? (window.pageYOffset / h) * 100 : 0;
            bar.style.width = Math.min(100, Math.max(0, pct)) + '%';
            ticking = false;
        };
        window.addEventListener('scroll', function () {
            if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
        }, { passive: true });
        update();
    }
})();
