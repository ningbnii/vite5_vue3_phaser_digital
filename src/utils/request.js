import axios from 'axios'
import config from './../config/index'
import storage from './../utils/storage'
import axiosRetry from 'axios-retry'
import qs from 'qs'
import { useToast } from '@/components/ui/toast/use-toast'

const { toast } = useToast()
// 最大请求次数
const RETRIES_NUM = 3
const NETWORK_ERROR = '网络请求异常，请稍后重试'

// 创建axios实例，添加全局配置
const service = axios.create({
  baseURL: config.baseUrl,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded;charset=utf8',
  },
})

// 请求拦截
service.interceptors.request.use((req) => {
  // 支持JWT认证
  let token = storage.get('token') || ''
  if (token) {
    req.headers.Authorization = 'Bearer ' + token
  }

  // 当重新请求次数超过了RETRIES_NUM的逻辑，比如可能需要清除登录状态
  if (req['axios-retry'].retryCount >= RETRIES_NUM) {
    // 清除登录状态
  }
  return req
})

// 响应拦截
service.interceptors.response.use(
  (res) => {
    const { status, data, message } = res.data
    // JWT
    if (res.headers.Authorization) {
      storage.set('token', res.headers.Authorization.split(' ')[1])
    }
    if (status == 200) {
      return data
    } else {
      // console.error(message || NETWORK_ERROR)
      // 移动端，可以引入vant的Toast组件，用来提示错误信息
      // showFailToast(message || NETWORK_ERROR)
      toast({ description: message || NETWORK_ERROR, variant: 'destructive' })
      return Promise.reject(message || NETWORK_ERROR)
    }
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 报错尝试重新请求
axiosRetry(service, {
  retries: RETRIES_NUM, // 尝试次数
  shouldResetTimeout: true, // 重置超时时间
  retryCondition: (error) => {
    // true为打开自动发送请求，false为关闭自动发送请求
    return true
  },
})

/**
 * post请求
 * @param {*} url 请求地址
 * @param {*} data 参数
 * @returns
 */
function post(url, data) {
  return service({
    url,
    method: 'post',
    data: qs.stringify(data),
  })
}

/**
 * get请求
 * @param {*} url 请求地址
 * @param {*} params 参数
 * @returns
 */
function get(url, params) {
  return service({
    url,
    method: 'get',
    params,
  })
}

export default {
  post,
  get,
}
