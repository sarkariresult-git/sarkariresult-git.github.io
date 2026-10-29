/* Govt exam photo & signature resizer - runs fully in the browser */
(function () {
    'use strict';
    var $ = function (id) { return document.getElementById(id); };
    var fileEl = $('rz-file');
    if (!fileEl) return;

    var presetEl = $('rz-preset'), wEl = $('rz-w'), hEl = $('rz-h'), minEl = $('rz-min'), maxEl = $('rz-max');
    var goEl = $('rz-go'), statusEl = $('rz-status'), outEl = $('rz-out'), imgEl = $('rz-img'), infoEl = $('rz-info'), dlEl = $('rz-dl');
    var PRESETS = {
        photo: { w: 413, h: 531, min: 20, max: 50 },   /* 3.5 x 4.5 cm @ 300 dpi */
        sign:  { w: 472, h: 236, min: 10, max: 20 }    /* 4 x 2 cm @ 300 dpi */
    };
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var source = null, baseName = 'image', outUrl = null;

    function say(msg, isError) {
        statusEl.textContent = msg;
        statusEl.classList.toggle('is-error', !!isError);
    }
    function kb(bytes) { return (bytes / 1024).toFixed(1); }
    function num(el) { var n = parseInt(el.value, 10); return n > 0 ? n : 0; }

    presetEl.addEventListener('change', function () {
        var p = PRESETS[presetEl.value];
        if (!p) return;
        wEl.value = p.w; hEl.value = p.h; minEl.value = p.min; maxEl.value = p.max;
    });

    fileEl.addEventListener('change', function () {
        var f = fileEl.files && fileEl.files[0];
        outEl.hidden = true;
        if (!f) return;
        if (f.type.indexOf('image/') !== 0) { say('Please choose an image file (JPG, PNG, WEBP).', true); goEl.disabled = true; return; }
        baseName = f.name.replace(/\.[^.]+$/, '') || 'image';
        var url = URL.createObjectURL(f);
        var img = new Image();
        img.onload = function () {
            source = img;
            URL.revokeObjectURL(url);
            goEl.disabled = false;
            say('Loaded ' + img.naturalWidth + ' × ' + img.naturalHeight + ' px, ' + kb(f.size) + ' KB. Set the size limits and press Resize.');
        };
        img.onerror = function () { URL.revokeObjectURL(url); goEl.disabled = true; say('Could not read this image. Try a different file.', true); };
        img.src = url;
    });

    function render(scale) {
        var tw = num(wEl), th = num(hEl);
        var sw = source.naturalWidth, sh = source.naturalHeight;
        var sx = 0, sy = 0, sW = sw, sH = sh, cw, ch;
        if (tw && th) {
            cw = tw; ch = th;
            var want = tw / th, have = sw / sh;
            if (have > want) { sW = Math.round(sh * want); sx = Math.round((sw - sW) / 2); }
            else { sH = Math.round(sw / want); sy = Math.round((sh - sH) / 2); }
        } else if (tw) { cw = tw; ch = Math.round(sh * tw / sw); }
        else if (th) { ch = th; cw = Math.round(sw * th / sh); }
        else { cw = sw; ch = sh; }
        cw = Math.max(16, Math.round(cw * scale));
        ch = Math.max(16, Math.round(ch * scale));
        canvas.width = cw; canvas.height = ch;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, cw, ch);
        ctx.drawImage(source, sx, sy, sW, sH, 0, 0, cw, ch);
    }
    function toBlob(q) { return new Promise(function (res) { canvas.toBlob(res, 'image/jpeg', q); }); }

    async function compress(maxBytes, exact) {
        var scale = 1;
        for (var attempt = 0; attempt < (exact ? 1 : 8); attempt++) {
            render(scale);
            var top = await toBlob(0.95);
            if (top.size <= maxBytes) return { blob: top, q: 0.95 };
            var bottom = await toBlob(0.05);
            if (bottom.size <= maxBytes) {
                var best = bottom, lo = 0.05, hi = 0.95, bq = 0.05;
                for (var i = 0; i < 7; i++) {
                    var mid = (lo + hi) / 2, b = await toBlob(mid);
                    if (b.size <= maxBytes) { best = b; bq = mid; lo = mid; } else { hi = mid; }
                }
                return { blob: best, q: bq };
            }
            scale *= 0.85;
        }
        return null;
    }

    goEl.addEventListener('click', async function () {
        if (!source) return;
        var maxKb = num(maxEl), minKb = num(minEl);
        if (!maxKb) { say('Enter a maximum size in KB.', true); return; }
        if (minKb && minKb > maxKb) { say('Minimum size cannot be bigger than the maximum.', true); return; }
        goEl.disabled = true; outEl.hidden = true; say('Working…');
        try {
            var exact = !!(num(wEl) && num(hEl));
            var r = await compress(maxKb * 1024, exact);
            if (!r) { say('Could not reach ' + maxKb + ' KB' + (exact ? ' at this exact size. Increase the maximum or reduce the width/height.' : '. Try a higher limit.'), true); return; }
            if (outUrl) URL.revokeObjectURL(outUrl);
            outUrl = URL.createObjectURL(r.blob);
            imgEl.src = outUrl;
            dlEl.href = outUrl;
            dlEl.download = baseName + '-resized.jpg';
            infoEl.textContent = canvas.width + ' × ' + canvas.height + ' px · ' + kb(r.blob.size) + ' KB · JPG quality ' + Math.round(r.q * 100) + '%';
            outEl.hidden = false;
            if (minKb && r.blob.size < minKb * 1024) {
                say('Done, but the file (' + kb(r.blob.size) + ' KB) is below your ' + minKb + ' KB minimum. Use larger width/height or a larger source image.', true);
            } else {
                say('Done! Check the preview, then download.');
            }
        } catch (e) {
            say('Something went wrong while processing the image.', true);
        } finally {
            goEl.disabled = false;
        }
    });
})();
