import {
  Message
} from 'element-ui';

// import BCX from 'bcx-api'
import './bcx.min'
import {
  cacheSession,
  cacheKey
} from './Utils'
import {
  langEn
} from '../src/common/lang/en.js'
import {
  langZh
} from '../src/common/lang/zh.js'
// import {
//   Loading
// } from 'element-ui'
import { Indicator } from 'mint-ui';

let bcx = null



// 浏览器插件链接 当前请求秒数
let requestSeconds = 0

// 浏览器插件链接 请求最大秒数
let requestSecondsMax = 5

let promiseObjArr = []


// bcx对象初始化
export let initBcx = function () {

  cacheSession.remove(cacheKey.accountName)
  //   var _configParams = {
  //         default_ws_node: "ws://39.106.126.54:8049",
  //         ws_node_list: [{
  //                 url: "ws://39.106.126.54:8049",
  //                 name: "COCOS节点1"
  //             },
  //             {
  //                 url: "ws://47.93.62.96:8049",
  //                 name: "COCOS节点2"
  //             }
  //         ],
  //         networks: [{
  //             core_asset: "COCOS",
  //             chain_id: "7d89b84f22af0b150780a2b121aa6c715b19261c8b7fe0fda3a564574ed7d3e9"
  //         }],
  //         faucet_url: "http://47.93.62.96:8041",
  //         auto_reconnect: true,
  //         worker: false
  //         //app_keys:["5HxzZncKDjx7NEaEv989Huh7yYY7RukcJLKBDQztXAmZYCHWPgd"]
  //     };

  var _configParams = {
    // default_ws_node:"",
    default_ws_node: "ws://182.92.164.121:8021",
    ws_node_list: [{
      url: "ws://182.92.164.121:8021",
      name: "Cocos - China - Beijing"
    }, ],
    networks: [{
      core_asset: "COCOS",
      chain_id: "9aab2f1b44ffd6649985629a18154e713f7036f668e458d7568bbf7c01eed26d"
    }],
    faucet_url: "http://xx.xx.xx.xx:xxxxx",
    auto_reconnect: true,
    real_sub: true,
    check_cached_nodes_data: false
  };
  bcx = new BCX(_configParams);
}


// 浏览器插件链接
export let browserConnect = function () {
  let currentTimer = null
  return new Promise(async function (resolve, reject) {
    if (window.BcxWeb) {
      bcx = window.BcxWeb
      resolve(true)
      return false
    } else {
      currentTimer = setInterval(() => {
        requestSeconds++
        if (requestSeconds >= requestSecondsMax) {
          clearInterval(currentTimer)

          let tipsMessage = {}
          if (cacheSession.get(cacheKey.lang) == 'zh') {
            tipsMessage = langZh.tipsMessage
          } else {
            tipsMessage = langEn.tipsMessage
          }
          Message({
            duration: 2000,
            message: tipsMessage.common.linkFailure,
            type: 'error',
          })
          return false
        }
        if (window.BcxWeb) {
          bcx = window.BcxWeb
          clearInterval(currentTimer)
          resolve(true)
          return false
        }
      }, 1000)
    }

  })
}


// 登录
export let passwordLogin = function (params) {
  // let loadingInstance = Loading.service();
  Indicator.open({
    // text: '加载中...',
    spinnerType: 'fading-circle'
  });
  return new Promise(async function (resolve, reject) {
    
    // account: params.account, //query.loginUserName,
    // password: params.password
    // account: params.account || "syling", //query.loginUserName,
    // password: params.password || "12345678"
    bcx.passwordLogin({
      account: params.account || "syling", //query.loginUserName,
      password: params.password || "12345678"
    }).then(res => {
      // loadingInstance.close();
      Indicator.close();
      resolve(res)
      // console.info("bcx passwordLogin res", res);
    });
  })

}

// 投票
export let publishVotes = function (params) {
  
  // let loadingInstance = Loading.service();
  Indicator.open({
    // text: '加载中...',
    spinnerType: 'fading-circle'
  });
  return new Promise(async function (resolve, reject) {
    bcx.publishVotes({
      witnessesIds: params.witnessesIds || null,
      committee_ids: params.committee_ids || null,
      votes: 1
    }).then(res => {
      // loadingInstance.close();
      Indicator.close();
      resolve(res)
      // console.info("bcx passwordLogin res", res);
    });
  })
}



// 获取用户信息
export let getAccountInfo = function () {
  // let loadingInstance = Loading.service();
  Indicator.open({
    // text: '加载中...',
    spinnerType: 'fading-circle'
  });
  return new Promise(async function (resolve, reject) {

    bcx.getAccountInfo().then(res => {
      // loadingInstance.close();
      Indicator.close();
      if (res.locked) {
        let tipsMessage = {}
        if (cacheSession.get(cacheKey.lang) == 'zh') {
          tipsMessage = langZh.tipsMessage
        } else {
          tipsMessage = langEn.tipsMessage
        }
        Message({
          duration: 2000,
          message: tipsMessage.common.accountLocked,
          type: 'error',
        })
        resolve(false)
        return false
      } else {
        cacheSession.set(cacheKey.accountName, res.account_name)
        cacheSession.remove(cacheKey.myWorldView)
        resolve(true)
        return false
      }
    }).catch(err => {
      console.log('----------browserConnectResult------err--------')
      console.log(err)
      reject(err)
    })
  })
}


// 桌面钱包链接
export let desktopConnect = function () {
  Cocosjs.plugins(new CocosBCX())
  Cocosjs.cocos.connect('My-App').then(connected => {
    let tipsMessage = {}
    if (cacheSession.get(cacheKey.lang) == 'zh') {
      tipsMessage = langZh.tipsMessage
    } else {
      tipsMessage = langEn.tipsMessage
    }
    if (!connected) {
      Message({
        duration: 2000,
        message: tipsMessage.interFaceMessage.common[0],
        type: 'error',
      })
      return
    } else {
      const cocos = Cocosjs.cocos
      bcx = cocos.cocosBcx(bcx)
      bcx.getAccountInfo().then(res => {
        cacheSession.set(cacheKey.accountName, res[cacheKey.accountName])
        cacheSession.remove(cacheKey.myWorldView)
      }).catch(function (err) {})
    }

  }).catch(function (err) {})
}



// 查询账户信息
export let queryAccountInfo = function () {
  // let loadingInstance = Loading.service();
  Indicator.open({
    // text: '加载中...',
    spinnerType: 'fading-circle'
  });
  return new Promise(function (resolve, reject) {
    // account: 'syling'
    bcx.queryAccountInfo({
      // account: cacheSession.get(cacheKey.accountName)
      account: 'syling'
    }).then(res=>{
      // loadingInstance.close();
      Indicator.close();
      resolve(res)
    }).catch(err=>{
      // loadingInstance.close();
      Indicator.close();
      console.log('--------err-------')
      console.log(err)
    })
  })
}

// 查询数据通过id
export let queryDataByIds = function (ids) {
  // let loadingInstance = Loading.service();
  Indicator.open({
    // text: '加载中...',
    spinnerType: 'fading-circle'
  });
  return new Promise(function (resolve, reject) {
    bcx.queryDataByIds({
        ids: ids
    }).then(res=>{
      // loadingInstance.close();
      Indicator.close();
      resolve(res)
    }).catch(err=>{
      // loadingInstance.close();
      Indicator.close();
      console.log('--------err-------')
      console.log(err)
    })
  })

}



export let lookupBlockRewardsById = async function (account_id) {
  // let loadingInstance = Loading.service();
  Indicator.open({
    // text: '加载中...',
    spinnerType: 'fading-circle'
  });
  await passwordLogin({
    account: 'syling',
    password: '12345678'
  })
  return new Promise(function (resolve, reject) {
    bcx.lookupBlockRewardsById({
      account_id: account_id
    }).then(res => {
      // loadingInstance.close();
      Indicator.close();
      resolve(res)
    }).catch(err=>{
      // loadingInstance.close();
      Indicator.close();
      console.log('--------err-------')
      console.log(err)
    })
  })
}



// 投票列表
export let queryVotes = function (params) {
  // let loadingInstance = Loading.service();
  Indicator.open({
    // text: '加载中...',
    spinnerType: 'fading-circle'
  });
  return new Promise(function (resolve, reject) {
    let param = {
      // type: witnesses 见证人    committee 理事会
      queryAccount: params.queryAccount,
      type: params.type || ''
    }
    bcx.queryVotes(param).then(res => {
      // loadingInstance.close();
      Indicator.close();
      resolve(res)
    })
  })
}

