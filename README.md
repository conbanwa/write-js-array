# Generate JS Array Action

Generate a JavaScript file that declares an array — including **Multidimensional Array** —
from GitHub Actions inputs.

## Features

- ✅ Multidimensional arrays
- ✅ Safe JSON parsing by default
- ✅ Optional JS literal parsing
- ✅ Auto-derived array name
- ✅ Pretty formatting
- ✅ Export styles
- ✅ Overwrite & dry-run support
- ✅ Marketplace-safe (Node 20)

---

## Basic Usage

```yaml
- uses: your-username/generate-js-array@v1
  with:
    js-name: data.js
    values: '[1,2,3]'
