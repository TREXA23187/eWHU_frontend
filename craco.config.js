// const path = require('path');
const CracoAntDesignPlugin = require('craco-antd')
const CracoAlias = require('craco-alias')

module.exports = {
    plugins: [
        {
            plugin: CracoAntDesignPlugin,
            options: {
                /* customizeTheme 和 customizeThemeLessPath 任选其一 */
                customizeTheme: {
                    '@primary-color': '#7546c9',
                    '@link-color': '#7546c9'
                }
                // customizeThemeLessPath: path.join(__dirname, "src/style/theme.less"),
            }
        },
        {
            plugin: CracoAlias,
            options: {
                source: 'options',
                baseUrl: './',
                aliases: {
                    '@': './src'
                },
                extensions: ['js', 'jsx']
            }
        }
    ],
    devServer: {
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true
            }
        }
    }
}
