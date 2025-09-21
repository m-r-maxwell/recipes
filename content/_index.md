---
title: "Home"
summary: "Welcome to the recipe collection"
home_intro: "Hi there and welcome to my collection of recipes!"
date: 2025-09-21T00:00:00-04:00
draft: false
---

Laborum voluptate pariatur ex culpa magna nostrud est incididunt fugiat pariatur do dolor ipsum enim. Consequat tempor do dolor eu. Non id id anim anim excepteur excepteur pariatur nostrud qui irure ullamco.

Replace the paragraph above with whatever intro you'd like on your homepage. You can also change `home_intro` in the front matter for templates that read it explicitly.

Example front matter usage in templates:

```
{{ with .Params.home_intro }}
  <p class="home-intro">{{ . }}</p>
{{ else }}
  {{ .Content }}
{{ end }}
```

If you remove this file, the theme's bundled homepage content will be used instead.
