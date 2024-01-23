import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import viteCompression from 'vite-plugin-compression'
import path from 'path'
import { Plugin as importToCDN } from 'vite-plugin-cdn-import'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/digital/', // 设置打包路径
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // 设置别名
    },
  },
  plugins: [
    vue(),
    importToCDN({
      modules: [
        {
          name: 'vue',
          var: 'Vue',
          path: 'https://cdn.staticfile.org/vue/3.3.11/vue.global.prod.js',
        },
        {
          name: 'vue-router',
          var: 'VueRouter',
          path: 'https://cdn.staticfile.org/vue-router/4.2.5/vue-router.global.prod.js',
        },
        {
          name: 'axios',
          var: 'axios',
          path: 'https://cdn.staticfile.org/axios/1.6.5/axios.min.js',
        },
        // {
        //   name: 'qs',
        //   var: 'qs',
        //   path: 'https://cdn.staticfile.org/qs/6.11.2/qs.min.js',
        // },
        // {
        //   name: 'js-cookie',
        //   var: 'Cookies',
        //   path: 'https://cdn.staticfile.org/js-cookie/3.0.5/js.cookie.min.js',
        // },
        {
          name: 'vuex',
          var: 'Vuex',
          path: 'https://cdn.staticfile.org/vuex/4.1.0/vuex.global.min.js',
        },
      ],
    }),
  ],
  server: {
    open: true,
  },
  build: {
    minify: true, // 压缩代码
    chunkSizeWarningLimit: 1500, // 解决项目文件过大打包时的警告，可选
    rollupOptions: {
      // 告诉打包工具，在external配置的包，都是外部引入的，不要打包到代码中
      // external: ['vue', 'vant', 'vue-router', 'vue-meta', 'axios', 'qs'],
      plugins: [
        viteCompression({
          verbose: true,
          disable: false,
          threshold: 10240,
          algorithm: 'gzip',
          ext: '.gz',
          deleteOriginFile: false, // whether delete origin file
        }),
      ],
      output: {
        // esbuild 去掉 console.log
        manualChunks(id) {
          if (id.includes('/node_modules/')) {
            // 让第三方模块单独打包
            return id.toString().split('node_modules/')[1].split('/')[0].toString()
            // 打包成一个
            // return 'vendor'
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js', // 代码分割后的文件名
        entryFileNames: 'assets/js/[name]-[hash].js', // 入口文件的文件名
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]', // 静态资源的文件名,字体，图片等
      },
    },
  },
})
