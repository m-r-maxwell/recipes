# hugo-recipes theme

This is a minimal README with a short note for site authors about customizing content.

## Overriding theme-provided content

The theme ships example content (for example an `about` page) to make it easy to preview. If you want to provide your own About page (so editors don't have to edit the theme), create or edit the file in your site repository at:

```
content/about/_index.md
```

Hugo will prefer content from the site itself over theme-provided content. That means you can safely customize `content/about/_index.md` in your site and updates will be served instead of the theme's bundled About page.

## Menu & navigation

If you need to adjust the top navigation labels or order, update your site's `config.toml` (or config file in YAML/TOML) and the `menu` section. The theme reads the site menu first and falls back to its own defaults.

Example (TOML):

```
[menu.main]
  [[menu.main]]
  name = "About"
  url = "/about/"
  weight = 10
```

That's it — editing the About page doesn't require touching the theme. If you'd like, the theme can include short instructions or a starter `content/about/_index.md` in the demo site (already provided).

## Example About front matter

Here's a minimal example of front matter you can add to `content/about/_index.md` to store a summary, author, profile image, and social links. Use whichever format you prefer (TOML, YAML, or JSON). Below is a YAML-style example you can paste into the top of the About page:

```yaml
title: "About"
summary: "A short one-line summary"
author: "Your Name"
profile_image: "profile.jpg"
social:
  - name: "Twitter"
    url: "https://twitter.com/yourhandle"
  - name: "GitHub"
    url: "https://github.com/yourhandle"
draft: false
```

Image notes:
- Page bundle: place `profile.jpg` in the same directory as `_index.md` (Hugo will serve it relative to the page). Example: `content/about/profile.jpg`.
- Static folder: place images under your site's `static/` directory and reference them by `/images/profile.jpg`.

Template hint:

If you want templates to render the profile image from page resources you can use:

```go-html-template
{{ with .Resources.GetMatch .Params.profile_image }}
  <img src="{{ .RelPermalink }}" alt="Profile of {{ $.Params.author }}">
{{ end }}

## Overriding the homepage

To make the homepage text editable without changing the theme, add a site-level `content/_index.md` file. Hugo will use that file's `.Content` (and `.Params`) for the homepage instead of the theme's bundled content.

Example `content/_index.md` front matter:

```yaml
title: "Home"
home_intro: "Write a short intro paragraph for the homepage here."
summary: "Optional summary"
draft: false
```

In templates you can prefer `Params.home_intro` and fall back to `.Content` so editors can either use the front matter or the page body:

```go-html-template
{{ with .Params.home_intro }}
  <p class="home-intro">{{ . }}</p>
{{ else }}
  {{ .Content }}
{{ end }}
```

```

