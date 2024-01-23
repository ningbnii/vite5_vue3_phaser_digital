import request from './../utils/request'
import store from './../store/index'
/**
 * 获取用户信息
 * @nickname {*} nickname
 * @password {*} password
 * @returns
 */
export const getUserInfo = (nickname, password) => {
  return request.post('/user/login', {
    nickname: nickname,
    password: password,
  })
}

/**
 * 记录挑战记录
 * @type {*} type
 * @time {*} time
 * @returns
 */
export const addRecord = (type, time) => {
  return request.post('/user/addRecord', {
    userId: store.state.userId,
    type: type,
    time: time,
  })
}

/**
 * 记录挑战记录
 * @type {*} type
 * @time {*} time
 * @returns
 */
export const getRankList = () => {
  return request.get('/user/getRankList')
}

/**
 * 记录挑战记录维度
 * @type {*} type
 * @time {*} time
 * @returns
 */
export const getRankDimension = () => {
  return request.get('/user/getRankDimension')
}
