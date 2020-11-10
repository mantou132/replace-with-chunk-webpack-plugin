import { Compiler, sources } from 'webpack';

interface Options {
  chunks: string[];
  replaces?: [from: string | RegExp, to: string][];
}

export class ReplaceWithChunkPlugin {
  options: Options;
  token: string;

  constructor(options: Options) {
    this.options = options;
    this.token = '__webpackReplaceWithChunk__';
  }

  regexp(s: string) {
    return new RegExp(`${this.token}\\s*\\(\\s*(['"\`])(${s})\\1\\s*\\)`, 'g');
  }

  findTargetChunks(str: string) {
    // only work on ts/js
    return [...str.matchAll(this.regexp('\\w+'))].map(([_match, _q, name]) => name);
  }

  apply(compiler: Compiler) {
    compiler.hooks.afterCompile.tapAsync(ReplaceWithChunkPlugin.name, (compilation, callback) => {
      const { chunks, replaces = [] } = this.options;

      const findAssetNames = (chunkName: string) => {
        const chunk = [...compilation.chunks].find(({ id }) => id === chunkName);
        if (!chunk?.files) return [];
        return [...chunk.files].filter((fileName) => !fileName.endsWith('.map'));
      };

      chunks.forEach((chunkName) => {
        const assetNames = findAssetNames(chunkName);
        assetNames?.forEach((assetName) => {
          const asset = compilation.assets[assetName];
          if (!asset) return;
          const originContent = asset.source().toString();
          const targetChunks = this.findTargetChunks(originContent);
          targetChunks.forEach((targetChunkName) => {
            // only work on single file chunk
            const targetChunkAsset = compilation.assets[findAssetNames(targetChunkName)[0]];
            const targetChunkContent = targetChunkAsset.source();
            const newContent = originContent.replace(
              this.regexp(targetChunkName),
              replaces.reduce(
                (p, [from, to]) => p.replace(from, to),
                JSON.stringify(targetChunkContent)
                  .replace(/\$/g, '$$$$')
                  .replace(/\u2028/g, '\\u2028')
                  .replace(/\u2029/g, '\\u2029'),
              ),
            );
            compilation.assets[assetName] = new sources.RawSource(newContent, true);
          });
        });
      });
      callback();
    });
  }
}
