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
- Use a page bundle if you want to include images/resources next to the recipe:
    hugo new recipes/my-recipe/_index.md
  then put `image.jpg` beside the index file and reference via .Resources.
- This archetype uses TOML front matter (+++). Add or remove fields as needed.
-->
