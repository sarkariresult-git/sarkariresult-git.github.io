# sarkariresult-git.github.io

Jekyll site (GitHub Pages). Homepage = live board (Latest Jobs | Results | Admit Cards).

| Kya badalna hai | Kahan |
|---|---|
| Site name, description, email, Telegram, YouTube | `_config.yml` (khali = link hide) |
| Menu links | `_data/nav.yml` |
| Homepage ke columns / categories | `_data/categories.yml` |
| Header / Footer | `_includes/header.html`, `_includes/footer.html` |
| Saari CSS | `style.css` |

## Naya post
`_posts/YYYY-MM-DD-slug.md`:

```
---
title: "Post title"
date: 2026-10-28
category: latest-jobs      # latest-jobs | results | admit-cards
description: "1-2 line summary (SEO)"
image: "/assets/img/banner.jpg"   # optional
---
(content)
```
Post ke andar title `<h1>` mat rakho, layout khud title dikhata hai.

## Nayi category (e.g. Answer Key)
1. `_data/categories.yml` mein entry add karo.
2. `latest-jobs.html` copy karke naya page banao (category + heading badlo).
3. Post mein `category: answer-key` likho. Homepage par column apne aap aa jayega.
