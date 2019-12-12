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
import {
  Loading
} from 'element-ui'
import axios from 'axios'


let bcx = null

let showBrowserConnectMessage = true


// 浏览器插件链接 当前请求秒数
let requestSeconds = 0

// 浏览器插件链接 请求最大秒数
let requestSecondsMax = 5

let promiseObjArr = []


// bcx对象初始化
export let initBcx = function () {
    
  axios
  .get("https://api-cocosbcx.cocosbcx.net/backend/getParams")
  .then(response => {
    // nodes = response.data.data;
    let nodes = response.data.data.filter(( item )=>{
      return item.name == 'Main'
    })
    console.log(nodes);
      var _configParams={ 
        ws_node_list:[
            {url:nodes[0].ws,name:nodes[0].name},   
        ],
        networks:[
            {
                core_asset:"COCOS",
                chain_id: nodes[0].chainId 
            }
        ], 
        faucet_url: nodes[0].faucetUrl,
        auto_reconnect:true,
        real_sub:true,
        check_cached_nodes_data:false
    };
  //   var _configParams={ 
  //     ws_node_list:[
  //         {url:"ws://192.168.90.46:8049",name:"personnaliser"},   
  //     ],
  //     networks:[
  //         {
  //             core_asset:"COCOS",
  //             chain_id: "bc741ab76f35c22fb3e3b51cd70dcdf38db63e283229534ee2e5cf1e7a6c994b" 
  //         }
  //     ], 
  //     faucet_url: nodes[0].faucetUrl,
  //     auto_reconnect:true,
  //     real_sub:true,
  //     check_cached_nodes_data:false
  // };
    bcx = new BCX(_configParams);
  })
  .catch(function (error) {
    console.log(error);
  });
}


// 浏览器插件链接
export let browserConnect = function () {
  let currentTimer = null
  let loadingInstance = Loading.service();
  return new Promise(async function (resolve, reject) {
    if (window.BcxWeb) {
      bcx = window.BcxWeb
      resolve(true)
      return false
    } else {
      currentTimer = setInterval(() => {
        requestSeconds++
        if (requestSeconds >= requestSecondsMax) {
          loadingInstance.close();
          clearInterval(currentTimer)

          let tipsMessage = {}
          if (cacheSession.get(cacheKey.lang) == 'zh') {
            tipsMessage = langZh.tipsMessage
          } else {
            tipsMessage = langEn.tipsMessage
          }
          if (showBrowserConnectMessage) {
            Message({
              duration: 1500,
              message: tipsMessage.common.linkFailure,
              type: 'error',
            })
            showBrowserConnectMessage = false
          }
          
          resolve(false)
          return false
        }
        if (window.BcxWeb) {
          loadingInstance.close();
          bcx = window.BcxWeb
          clearInterval(currentTimer)
          resolve(true)
          return false
        }
      }, 1000)
    }

  })
}





// 获取用户信息
export let getAccountInfo = function () {
  let loadingInstance = Loading.service();
  return new Promise(async function (resolve, reject) {
    let browserConnectResult = await browserConnect()
    if (!browserConnectResult) return false
    bcx.getAccountInfo().then(res => {
      loadingInstance.close();
      if (res.locked) {
        let tipsMessage = {}
        if (cacheSession.get(cacheKey.lang) == 'zh') {
          tipsMessage = langZh.tipsMessage
        } else {
          tipsMessage = langEn.tipsMessage
        }
        Message({
          duration: 1500,
          message: tipsMessage.common.accountLocked,
          type: 'error',
        })
        resolve(false)
        return false
      } else {
        cacheSession.set(cacheKey.accountName, res.account_name)
        cacheSession.remove(cacheKey.myWorldView)
        resolve(res)
        return false
      }
    }).catch(err => {
      loadingInstance.close();
      reject(err)
    })
  })
}



// 投票
export let publishVotes = function (params) {
  
  let loadingInstance = Loading.service();
  return new Promise(async function (resolve, reject) {
    // witnesses committee
    let browserConnectResult = await browserConnect()
    if (!browserConnectResult) return false
    console.log('-------------------------------------')
    console.log(params)
    bcx.publishVotes({
      // witnessesIds: params.witnessesIds || null,
      // committee_ids: params.committee_ids || null,
      type: params.type,
      vote_ids: params.vote_ids,
      votes: params.votes
    }).then(res => {
      loadingInstance.close();
      resolve(res)
      // console.info("bcx passwordLogin res", res);
    }).catch(err=>{
      loadingInstance.close();
      console.log(err)
      resolve(false)
      
    });
  })
}







// 查询账户信息
export let queryAccountInfo = function () {
  let loadingInstance = Loading.service();
  return new Promise(async function (resolve, reject) {
    
    let browserConnectResult = await browserConnect()
    if (!browserConnectResult) return false
    // account: 'syling'
    bcx.queryAccountInfo({
      account: cacheSession.get(cacheKey.accountName)
    }).then(res=>{
      loadingInstance.close();
      resolve(res)
    }).catch(err=>{
      loadingInstance.close();
      console.log('--------err-------')
      console.log(false)
    })
  })
}

// 查询数据通过id
export let queryDataByIds = function (ids) {
  let loadingInstance = Loading.service();
  return new Promise(async function (resolve, reject) {
    let browserConnectResult = await browserConnect()
    if (!browserConnectResult) return false
    bcx.queryDataByIds({
        ids: ids
    }).then(res=>{
      loadingInstance.close();
      resolve(res)
    }).catch(err=>{
      loadingInstance.close();
      console.log('--------err-------')
      console.log(err)
    })
  })

}



// 查询账户
export let queryVestingBalance = function (account) {
  let loadingInstance = Loading.service();
  return new Promise(async function (resolve, reject) {
    let browserConnectResult = await browserConnect()
    if (!browserConnectResult) return false
    bcx.queryVestingBalance({
      account: account
    }).then(res => {
      loadingInstance.close();
      resolve(res)
    }).catch(err=>{
      loadingInstance.close();
      console.log('--------err-------')
      console.log(err)
    })
  })
}




// 查询账户指定资产余额
export let queryAccountBalances = function () {
  let loadingInstance = Loading.service();
  return new Promise( function (resolve, reject) {
    getAccountInfo().then( (getAccountInfoResult) => {
      console.log('==========queryAccountBalances==============')
      console.log(getAccountInfoResult)
      if (!getAccountInfoResult) return false
      bcx.queryAccountBalances({
        account: getAccountInfoResult[cacheKey.accountName] || ''
      }).then(res => {
      loadingInstance.close();
        resolve(res)
      }).catch(err => {
        loadingInstance.close();
        resolve(false)
      })
    })
    
  })
}


// 投票列表
export let queryVotes = function (params) {
  let loadingInstance = Loading.service();
  return new Promise(async function (resolve, reject) {
    await queryAccountInfo()
    let param = {
      // type: witnesses 见证人    committee 理事会
      queryAccount: params.queryAccount,
      type: params.type || ''
    }
    bcx.queryVotes(param).then(res => {
      loadingInstance.close();
      resolve(res)
    }).then( err => {
      console.log('err')
      console.log(err)
    })
  })
}


// 退出登录
export let logout = function (params) {
  let loadingInstance = Loading.service();
  return new Promise(function (resolve, reject) {
    bcx.logout().then(res=>{
      loadingInstance.close();
      resolve(res)
    })
  })

}
