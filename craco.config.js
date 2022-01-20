const CracoAlias = require('craco-alias')

module.exports = {
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: 'tsconfig',
        baseUrl: './src',
        tsConfigPath: './tsconfig.extend.json',
        unsafeAllowModulesOutsideOfSrc: true,
        aliases: {
          '+': './public',
          '@': './src',
        },
      },
    },
  ],
}
