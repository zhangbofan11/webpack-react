// 配置eslint
const EslintWebpackPlugin = require('eslint-webpack-plugin')
const path = require('path')

console.log(process.env.NODE_ENV);
//获取环境是生产模式还是开发模式
const isProduction = process.env.NODE_ENV === "production";
// 返回处理样式资源
function getstyleloader(pre) {
    return [
        isProduction ? MiniCssExtractPlugin.loader : "style-loader", //MiniCssExtractPlugin.loader提取css为单独文件
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
        pre && {
            loader: pre,
            options: pre === "less-loader" ? {
                lessOptions: {
                    modifyVars: { '@primary-color': '#1DA57A' },
                    javascriptEnabled: true,
                },
            } : {}
        }
    ].filter(Boolean)
}
// html模板
const HtmlPlugin = require('html-webpack-plugin')
// css打包成单独的文件
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
// css压缩
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin")
// 压缩js
const TerseWebpackrPlugin = require("terser-webpack-plugin")
//图片压缩
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin")
const CopyPlugin = require("copy-webpack-plugin");
// js热模块替换
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
module.exports = {
    entry: "./src/main.js",
    output: {
        path: isProduction ? path.resolve(__dirname, "../dist") : undefined,
        // 入口文件名
        filename: isProduction ? 'staic/js/[name].[contenthash:10].js' : 'staic/js/[name].js',
        clean: true,
         // 非入口文件名
        chunkFilename: isProduction ? 'staic/js/[name].[contenthash:10].chunk.js' : 'staic/js/[name].chunk.js',
    //    其他静态资源名
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
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                options: {
                    cacheDirectory: true, //开启缓存
                    cacheCompression: false,//缓存不要压缩
                    plugins: [
                        !isProduction && "react-refresh/babel"  //激活react的js的HML 热模块功能
                    ].filter(Boolean)
                }
            }
        ]
    }
    ,
    plugins: [
        // 配置eslint
        new EslintWebpackPlugin({
            context: path.resolve(__dirname, '../src'),
            //那些不缓存
            exclude: 'node_modules',
            //开启eslint缓存
            cache: true,
            //第二次打包较好eslint缓存
            cacheLocation: path.relative(__dirname, "../node_modules/.cache/.eslintcache")
        }),
        // html模板
        new HtmlPlugin({
            template: path.resolve(__dirname, "../public/index.html")
        }),
        // css打包成单独的文件
        isProduction && new MiniCssExtractPlugin({
            // 入口文件名
            filename: "staice/css/[name].[contenthash:10].css",
            // 非入口文件名
            chunkFilename: "staice/css/[name].[contenthash:10].chunk.css",
        }),
        // 拷贝文件
        isProduction && new CopyPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, "../public"), to: path.resolve(__dirname, "../dist"),
                    globOptions: {
                        ignore: ["**/index.html*"] //忽略那个文件
                    },
                },
            ],
        }),
        !isProduction && new ReactRefreshWebpackPlugin()
    ].filter(Boolean),
    // 模式选择
    mode: isProduction ? 'production' : "development",
    // 代码出错检查度
    devtool: isProduction ? "source-map" : "cheap-module-source-map",
    
    optimization: {
        // 代码分割
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                // node_nodules下面的rect相关的文件单独打包
                react: {
                    test: /[\\/]node_modules[\\/]rect(.*)?[\\/]/,
                    name: 'chunk-react',
                    priority: 40
                },
                // node_nodules下面的antd相关的文件单独打包
                antd: {
                    test: /[\\/]node_modules[\\/]antd(.*)?[\\/]/,
                    name: 'chunk-antd',
                    priority: 30
                },
                libs: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'chunk-libs',
                    priority: 20
                }
            }
            // 组，哪些模块要打包到一个组
            // defaultVendors: { // 组名
            //   test: /[\\/]node_modules[\\/]/, // 需要打包到一起的模块
            //   priority: -10, // 权重（越大越高）
            //   reuseExistingChunk: true, // 如果当前 chunk 包含已从主 bundle 中拆分出的模块，则它将被重用，而不是生成新的模块
            // },
            // default: {
            //     // 其他没有写的配置会使用上面的默认值
            //     minSize: 0, // 我们定义的文件体积太小了，所以要改打包的最小文件体积
            //     minChunks: 2,
            //     priority: -20,
            //     reuseExistingChunk: true,
            //   },
        },
        // 创建入口文件映射表
        runtimeChunk: {
            name: (entrypoint) => `runtime~${entrypoint.name}`
        },
        minimize: isProduction,//minimize控制文件(minimizer)是否需要压缩
        minimizer: [
            // css压缩
            new CssMinimizerPlugin(),
            // 压缩js
            new TerseWebpackrPlugin(),
            // 图片压缩
            new ImageMinimizerPlugin({
                minimizer: {
                    implementation: ImageMinimizerPlugin.imageminGenerate,
                    options: {
                        plugins: [
                            ["gifsicle", { interlaced: true }],
                            ["jpegtran", { progressive: true }],
                            ["optipng", { optimizationLevel: 5 }],
                            [
                                "svgo",
                                {
                                    plugins: [
                                        "preset-default",
                                        "prefixIds",
                                        {
                                            name: "sortAttrs",
                                            params: {
                                                xmlnsOrder: "alphabetical",
                                            },
                                        },
                                    ],
                                },
                            ],
                        ],
                    },
                },
            }),
        ]
    },
    //webpack解析模块加载选项
    resolve: {
        // 自动补全文件扩展名
        extensions: [".jsx", ".js", ".json"],
    },
    devServer: {
        host: 'localhost',
        port: 5000,
        open: true,
        hot: true,
        historyApiFallback: true,  //解决刷新页面404问题
    }
}