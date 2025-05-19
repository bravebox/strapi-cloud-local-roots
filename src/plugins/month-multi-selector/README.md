# Cobase 2025 Hubspot theme

This repository contains the hubspot theme folder "cobase-2025". 

## Install

```pnpm install```

## Preview theme

Install the Hubspot/cli tools from here
https://developers.hubspot.com/docs/guides/cms/tools/hubspot-cli/cli-v7

```pnpm theme:preview```

```
/** from package.json */
scripts: {
    "theme:preview": "hs theme preview cobase-2025 dist",
    "theme:upload": "hs upload cobase-2025 cobase-2025",
    "theme:upload:fields": "hs upload cobase-2025/fields.json cobase-2025/fields.json",
}
```

### Be mindfull when using the ```upload```  or ```fetch``` commands! 

If you are using the Hubspot interface to create fields you can easily overwrite them locally. So be mindfull when uising the `upload` and `fetch` commands from Hubspot/cli.

The preferred method flow:
- Before creating changes make sure the file you are editing (online or locally) is the latest one
- Create your updates (online or locally) 
- Upload or fetch them 
- Create a commit and push to repo

## Tailwind

Tailwind is used as utility classes, documentation can be found here.

```pnpm tailwind:watch```

```
/** from package.json */
scripts: {
    "tailwind:build": "postcss src/styles/tailwind.css -o cobase-2025/css/_tailwind.css",
    "tailwind:watch": "postcss src/styles/tailwind.css -o cobase-2025/css/_tailwind.css --watch",
}
```
