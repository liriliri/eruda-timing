# eruda-timing

[![NPM version][npm-image]][npm-url]
[![Build status][ci-image]][ci-url]
[![License][license-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/eruda-timing.svg
[npm-url]: https://npmjs.org/package/eruda-timing
[ci-image]: https://img.shields.io/github/workflow/status/liriliri/eruda-timing/CI?style=flat-square
[ci-url]: https://github.com/liriliri/eruda-timing/actions/workflows/main.yml
[license-image]: https://img.shields.io/npm/l/eruda-timing.svg

Eruda plugin for performance and resource timing.

## Demo

Browse it on your phone: 
[http://eruda.liriliri.io/?plugin=timing](http://eruda.liriliri.io/?plugin=timing)

## Install

```bash
npm install eruda-timing --save
```

```javascript
eruda.add(erudaTiming);
```

Make sure Eruda is loaded before this plugin, otherwise won't work.