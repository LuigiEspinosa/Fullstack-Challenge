module.exports = function (options, webpack) {
  const lazyImports = [
    '@nestjs/microservices',
    '@nestjs/microservices/microservices-module',
    '@nestjs/websockets/socket-module',
    'cache-manager',
    'class-transformer/storage',
  ];

  return {
    ...options,
    entry: './src/lambda.ts',
    externals: [],
    output: {
      ...options.output,
      filename: 'lambda.js',
      libraryTarget: 'commonjs2',
    },
    node: {
      __dirname: false,
    },
    module: {
      rules: [
        ...(options.module?.rules ?? []),
        {
          test: /\.wasm$/,
          type: 'asset/resource',
          generator: { filename: '[name][ext]' },
        },
      ],
    },
    plugins: [
      ...options.plugins,
      new webpack.IgnorePlugin({
        checkResource(resource) {
          if (!lazyImports.includes(resource)) return false;
          try {
            require.resolve(resource);
          } catch {
            return true;
          }
          return false;
        },
      }),
    ],
  };
};
