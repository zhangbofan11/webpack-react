
const EslintWebpackPlugin = require('eslint-webpack-plugin')
const path =require('path')
// 返回处理样式资源
function getstyleloader(pre) {
    return [
        "style-loader",
        "css-loader",
        {
            //处理css兼容性配合package.json的browserslist来决定兼容性做到什么程度
            loader: "postcss-loader",
            options: {
                postcssOptions: {
                        plugins: ["postcss-preset-env"]
                }
            }
        },
        pre
    ].filter(Boolean)
}
const HtmlPlugin=require('html-webpack-plugin')
// js热模块替换
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
module.exports = {
    entry: "./src/main.js",
    output: {
        path: undefined,
        filename: 'staic/js/[name].js',
        clean: true,
        chunkFilename: 'staic/js/[name].chunk.js',
        assetModuleFilename: 'staic/media/[hash:10][ext][query].js',
    },
    module: {
        rules: [
            // 处理css 
            {
                test: /\.css$/,
                use: getstyleloader()
            },
            {
                test: /\.less$/,
                use: getstyleloader("less-loader")
            }, {
                test: /\.s[ac]ss$/,
                use: getstyleloader("sass-loader")
            }, {
                test: /\.styl$/,
                use: getstyleloader("stylus-loader")
            },
            // 处理图片
            {
                test: /\.(jpg|jpeg|png|webp|gif|svg)$/,
                type: "asset",
                parser: {
                    dataUrlCondition: {
                        maxSize: 10 * 1024
                    }
                }
            },
            // 处理其他资源
            {
                test: /\.(woff2?|ttf)$/,
                //resource原封不动的输出
                type: "asset/resource",
            },
            // 处理js
            {
                test:/\.jsx?$/,
                exclude:/node_modules/,
                loader:"babel-loader",
                options:{
                    cacheDirectory:true, //开启缓存
                    cacheCompression:false,//缓存不要压缩
                    plugins:[
                        "react-refresh/babel"  //激活react的js的HML 热模块功能
                    ]
                }
            }
        ]
    }
    ,
    plugins: [
        // 配置eslint
        new EslintWebpackPlugin({
            context:path.resolve(__dirname,'../src'),
            //那些不缓存
            exclude:'node_modules',
            //开启eslint缓存
            cache:true,
            //第二次打包较好eslint缓存
            cacheLocation:path.relative(__dirname,"../node_modules/.cache/.eslintcache")
        }),
        // html模板
        new HtmlPlugin({
            template:path.resolve(__dirname,"../public/index.html")
        }),
        // 使react的js支持热模块替换
        new ReactRefreshWebpackPlugin()
    ],
    mode:'development',
    devtool:"cheap-module-source-map",
    optimization:{
        splitChunks:{
            chunks:'all'
        },
        runtimeChunk:{
            name:(entrypoint)=>`runtime~${entrypoint.name}`
        }
    },
    //webpack解析模块加载选项
    resolve: {
        // 自动补全文件扩展名
        extensions: [".jsx", ".js", ".json"],
      },
    devServer:{
        host:'localhost',
        port:5000,
        open:true,
        hot:true,
        historyApiFallback: true,  //解决刷新页面404问题
    }
}