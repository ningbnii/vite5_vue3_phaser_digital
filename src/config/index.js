const ENV = process.env.NODE_ENV
const ENV_CONFIG = {
  // 开发环境
  development: {
    baseUrl: 'https://demo.api.wxbuluo.com',
  },
  //  生产环境
  production: {
    baseUrl: 'https://demo.api.wxbuluo.com',
  },
}

export default {
  ...ENV_CONFIG[ENV],
}
