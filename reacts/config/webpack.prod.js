
const EslintWebpackPlugin = require('eslint-webpack-plugin')
const path =require('path')
// 返回处理样式资源
function getstyleloader(pre) {
    return [
        MiniCssExtractPlugin.loader,
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
// css打包成单独的文件
const MiniCssExtractPlugin=require("mini-css-extract-plugin")
// css压缩
const CssMinimizerPlugin=require("css-minimizer-webpack-plugin")
// 压缩js
const TerseWebpackrPlugin=require("terser-webpack-plugin")
//图片压缩
const ImageMinimizerPlugin=require("image-minimizer-webpack-plugin")
const CopyPlugin = require("copy-webpack-plugin");
module.exports = {
    entry: "./src/main.js",
    output: {
        path: path.resolve(__dirname,"../dist"),
        filename: 'staic/js/[name].[contenthash:10].js',
        clean: true,
        chunkFilename: 'staic/js/[name].[contenthash:10].chunk.js',
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
        new MiniCssExtractPlugin({
            filename:"staice/css/[name].[contenthash:10].css",
            chunkFilename:"staice/css/[name].[contenthash:10].chunk.css",
        }),
        new CopyPlugin({
            patterns: [
              {
                   from: path.resolve(__dirname,"../public"), to:path.resolve(__dirname,"../dist"),
                   globOptions: {
                    ignore: ["**/index.html*"] //忽略那个文件
                  },
                 },
            ],
          }),
    ],
    mode:'production',
    devtool:"source-map",
    optimization:{
        splitChunks:{
            chunks:'all'
        },
        runtimeChunk:{
            name:(entrypoint)=>`runtime~${entrypoint.name}`
        },
        minimizer:[
            new CssMinimizerPlugin(),
            new TerseWebpackrPlugin(),
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
  
}