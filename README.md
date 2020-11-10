# ReplaceWithChunk Webpack Plugin

## Install

```
npm i -D replace-with-chunk-webpack-plugin
```

## Usage

Webpack config:

```ts
import { ReplaceWithChunkPlugin } from 'replace-with-chunk-webpack-plugin';

// ...

export default {
  plugins: [
    new ReplaceWithChunkPlugin({
      chunks: ['content'],
      // optional
      replaces: [[/document\.head/g, 'document.documentElement']],
    }),
  ],
};
```

JavaScript:

```js
__webpackReplaceWithChunk__('<chunkname>');
```

Browser extension example:

```ts
// content script

declare let __webpackReplaceWithChunk__: (chunk: string) => string;

const script = document.createElement('script');
script.textContent = __webpackReplaceWithChunk__('page');
document.documentElement.append(script);
```
