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
- uses: conbanwa/write-js-array@v1
  with:
    js-name: data.js
    values: '[1,2,3]'
```
## Parsing Modes
JSON (default, safest)

```yaml
parse-mode: json
values: '[1, [2, 3]]'
```

JS literals (explicit opt-in)

```yaml
parse-mode: js
values: '[[1,2], [3,4]]'
```

## Export Styles

```yaml
export-style: named # export { data }
export-style: default # export default data
export-style: commonjs
```

## Pretty Formatting

```yaml
pretty: true
```

## Safety Options

```yaml
overwrite: false
dry-run: true
```

## Compatibility

v1.x: no breaking changes

Node.js 20

No dependencies

## License

MIT