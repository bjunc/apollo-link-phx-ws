// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';

const plugins = {
  babel: babel({
    exclude: ['node_modules/**'],
    runtimeHelpers: true
  }),
  commonjs: commonjs({
    namedExports: {
      'node_modules/phoenix/priv/static/phoenix.js': ['Socket']
    }
  }),
  resolve: resolve()
};

export default {
  input: 'src/PhoenixWebSocketLink.js',
  output: {
    file: 'dist/PhoenixWebSocketLink.js',
    format: 'es'
  },
  plugins: [plugins.babel, plugins.resolve, plugins.commonjs]
};