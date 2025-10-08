+++
title = '{{ replace .File.ContentBaseName "-" " " | title }}'
date = {{ .Date }}
draft = true
description = ""
tags = [""]
servings = ""
prep_time = ""
cook_time = ""
difficulty = ""
+++

<!--
Tips:
- Use a page bundle (recommended for per-recipe images): create a folder for the recipe and place an `index.md` inside it. Put images next to `index.md` and reference them with relative paths or Hugo Page Resources.
  Example:

    mkdir -p content/recipes/my-recipe
    mv content/recipes/my-recipe.md content/recipes/my-recipe/index.md
    cp path/to/photo.jpg content/recipes/my-recipe/

  In `index.md` reference the image with: `![Alt text](photo.jpg)` or use `{{< figure src="photo.jpg" caption="..." >}}` to get captions and use Hugo image processing.

- File naming: use lowercase, hyphens, no spaces. Example: `hero.jpg`, `step-1.jpg`, `hero@2x.jpg`.
- This archetype uses TOML front matter (+++). Add or remove fields as needed.
-->
