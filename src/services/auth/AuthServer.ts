import { Request } from 'express'
import _ from 'lodash'
import { authority } from 'server-utils'
import common from '@util/Common'
import GLBConfig from '@util/GLBConfig'
import { CommonUser } from '@entities/common/CommonUser'

async function signinAct(req: Request) {
  let doc = await common.docValidate(req)
  let user

  if (doc.login_type === 'WEB' || doc.login_type === 'MOBILE') {
    user = await CommonUser.findOne({
      userUsername: doc.username,
      state: GLBConfig.ENABLE,
    })

    if (!user) {
      return common.error('auth_03')
    }

    let decrypted = authority.aesDecryptModeCFB(
      doc.identify_code,
      user.userPassword,
      doc.magic_no
    )

    if (!(decrypted == user.userUsername)) {
      return common.error('auth_03')
    } else {
      let session_token = authority.user2token(
        doc.login_type,
        user.userId
      )
      delete user.user_password
      let loginData = await loginInit(user, session_token, doc.login_type)

      if (loginData) {
        loginData.Authorization = session_token
        return common.success(loginData)
      } else {
        return common.error('auth_03')
      }
    }
  } else {
    return common.error('auth_19')
  }
}

exports.signinBySmsAct = async (req) => {
  let doc = common.docValidate(req)
  let user

  if (doc.login_type === 'WEB' || doc.login_type === 'MOBILE') {
    user = await tb_user.findOne({
      where: {
        user_phone: doc.user_phone,
        state: GLBConfig.ENABLE,
      },
    })

    if (_.isEmpty(user)) {
      return common.error('auth_03')
    }

    let key = [config.redis.redisKey.SMS, user.user_phone].join('_')
    let rdsData = await redisClient.get(key)

    if (_.isNull(rdsData)) {
      return common.error('auth_04')
    } else if (doc.code !== rdsData.code) {
      return common.error('auth_04')
    } else {
      let session_token = authority.user2token(doc.login_type, user, doc.code)
      delete user.user_password
      let loginData = await loginInit(user, session_token, doc.login_type)

      if (loginData) {
        loginData.Authorization = session_token
        redisClient.del(key)
        return common.success(loginData)
      } else {
        return common.error('auth_03')
      }
    }
  } else {
    return common.error('auth_19')
  }
}

exports.signinByWxAct = async (req) => {
  let doc = common.docValidate(req)

  if (!config.weixin[doc.app_id]) {
    return common.error('auth_11')
  }

  let url =
    'https://api.weixin.qq.com/sns/jscode2session?appid=' +
    doc.app_id +
    '&secret=' +
    config.weixin[doc.app_id] +
    '&js_code=' +
    doc.wx_code +
    '&grant_type=authorization_code'
  let wxAuth = await rp(url)
  let wxAuthjs = JSON.parse(wxAuth)

  if (wxAuthjs.openid) {
    let wechatuser = await tb_user_wechat.findOne({
      where: {
        user_wechat_appid: doc.app_id,
        user_wechat_openid: wxAuthjs.openid,
      },
    })
    if (!wechatuser) {
      return common.error('auth_01')
    }
    let user = await tb_user.findOne({
      where: {
        user_id: wechatuser.user_id,
        state: GLBConfig.ENABLE,
      },
    })
    if (!user) {
      return common.error('auth_01')
    }
    let session_token = authority.user2token(
      'WEIXIN',
      user,
      common.generateRandomAlphaNum(6)
    )
    user.session_key = wxAuthjs.session_key
    let loginData = await loginInit(user, session_token, 'WEIXIN')
    if (loginData) {
      loginData.Authorization = session_token
      return common.success(loginData)
    } else {
      return common.error('auth_03')
    }
  } else {
    return common.error('auth_05')
  }
}

exports.signoutAct = async (req) => {
  let token_str = req.get('Authorization')
  if (token_str) {
    let tokensplit = token_str.split('_')

    let type = tokensplit[0],
      uid = tokensplit[1]
    let error = await redisClient.del(config.redis.redisKey.AUTH + type + uid)
    if (error) {
      logger.error(error)
    }
  }
  return common.success()
}

exports.loginSmsAct = async (req) => {
  let doc = common.docValidate(req)

  let user = await tb_user.findOne({
    where: {
      user_phone: doc.user_phone,
      state: GLBConfig.ENABLE,
    },
  })

  if (!user) {
    return common.error('auth_01')
  } else {
    let code = common.generateRandomAlphaNum(6)
    if (process.env.NODE_ENV === 'test') {
      code = '111111'
    }
    let smsExpiredTime = parseInt(config.SMS_TOKEN_AGE / 1000)
    let key = [config.redis.redisKey.SMS, user.user_phone].join('_')

    let liveTime = await redisClient.ttl(key)
    logger.debug(liveTime)
    logger.debug(code)
    if (liveTime > 0) {
      if (smsExpiredTime - liveTime < 70) {
        return common.error('auth_06')
      }
    }

    smsClient.sendMessageByTemplate(user.user_phone, '2HnuU1', {
      code: code,
    })

    await redisClient.set(
      key,
      {
        code: code,
      },
      smsExpiredTime
    )

    return common.success()
  }
}

exports.captchaAct = async () => {
  let captcha = svgCaptcha.create({
    size: 6,
    ignoreChars: '0o1i',
    noise: 2,
    color: true,
  })

  let key = config.redis.redisKey.CAPTCHA + uuid.v1().replace(/-/g, '')
  await redisClient.set(
    key,
    {
      code: captcha.text,
    },
    parseInt(config.CAPTCHA_TOKEN_AGE / 1000)
  )

  return common.success({ key: key, captcha: captcha.data })
}

exports.registerSmsAct = async (req) => {
  let doc = common.docValidate(req)

  let user = await tb_user.findOne({
    where: {
      user_phone: doc.user_phone,
    },
  })

  if (user) {
    return common.error('auth_02')
  } else {
    let code = common.generateRandomAlphaNum(6)
    let smsExpiredTime = parseInt(config.SMS_TOKEN_AGE / 1000)
    let key = [config.redis.redisKey.SMS, user.user_phone].join('_')

    let liveTime = await redisClient.ttl(key)
    logger.debug(liveTime)
    logger.debug(code)
    if (liveTime > 0) {
      if (smsExpiredTime - liveTime < 70) {
        return common.error('auth_06')
      }
    }

    smsClient.sendMessageByTemplate(user.user_phone, '2HnuU1', {
      code: code,
    })

    await redisClient.set(
      key,
      {
        code: code,
      },
      smsExpiredTime
    )

    return common.success()
  }
}

exports.registerByPhoneAct = async (req) => {
  let doc = common.docValidate(req)
  let user = await tb_user.findOne({
    where: {
      user_phone: doc.user_phone,
    },
  })
  if (user) {
    return common.error('auth_02')
  } else {
    let key = [config.redis.redisKey.SMS, doc.user_phone].join('_')
    let rdsData = await redisClient.get(key)
    redisClient.del(key)

    if (_.isNull(rdsData)) {
      return common.error('auth_04')
    } else if (doc.code !== rdsData.code) {
      return common.error('auth_04')
    } else {
      await tb_user.create({
        user_type: GLBConfig.USER_TYPE.TYPE_DEFAULT,
        user_username: doc.user_phone,
        user_email: doc.user_email,
        user_phone: doc.user_phone,
        user_password: common.generateNonceString(8),
        user_name: doc.user_name,
        user_gender: doc.user_gender,
        user_province: doc.user_province,
        user_city: doc.user_city,
        user_district: doc.user_district,
        user_address: doc.user_address,
      })
      return common.success()
    }
  }
}

exports.registerByWxAct = async (req) => {
  let doc = common.docValidate(req)

  if (!config.weixin[doc.app_id]) {
    return common.error('auth_11')
  }

  let key = [config.redis.redisKey.SMS, doc.user_phone].join('_')
  let rdsData = await redisClient.get(key)
  redisClient.del(key)

  if (_.isNull(rdsData)) {
    return common.error('auth_04')
  } else if (doc.code !== rdsData.code) {
    return common.error('auth_04')
  }

  let url =
    'https://api.weixin.qq.com/sns/jscode2session?appid=' +
    doc.app_id +
    '&secret=' +
    config.weixin[doc.app_id] +
    '&js_code=' +
    doc.wx_code +
    '&grant_type=authorization_code'
  let wxAuth = await rp(url)
  let wxAuthjs = JSON.parse(wxAuth)

  if (wxAuthjs.openid || wxAuthjs.unionid) {
    let user = await tb_user.findOne({
      where: {
        user_phone: doc.user_phone,
      },
    })

    let wechatid = await tb_user_wechat.findOne({
      where: {
        user_wechat_appid: doc.app_id,
        user_wechat_openid: wxAuthjs.openid,
      },
    })

    if (wechatid) {
      return common.error('auth_12')
    }

    if (user) {
      await tb_user_wechat.create({
        user_id: user.user_id,
        user_wechat_appid: doc.app_id,
        user_wechat_openid: wxAuthjs.openid || '',
        user_wechat_unionid: wxAuthjs.unionid || '',
      })
    } else {
      let group = await tb_usergroup.findOne({
        where: {
          usergroup_code: 'DEFAULT',
        },
      })

      if (!group) {
        return common.error('auth_10')
      }

      user = await tb_user.create({
        user_type: GLBConfig.USER_TYPE.TYPE_DEFAULT,
        user_username: doc.user_phone,
        user_email: doc.user_email || '',
        user_phone: doc.user_phone,
        user_password: common.generateRandomAlphaNum(6),
        user_name: doc.user_name || '',
        user_gender: doc.user_gender || '',
        user_province: doc.user_province || '',
        user_city: doc.user_city || '',
        user_district: doc.user_district || '',
        user_address: doc.user_address || '',
      })

      await tb_user_groups.create({
        user_id: user.user_id,
        usergroup_id: group.usergroup_id,
      })

      await tb_user_wechat.create({
        user_id: user.user_id,
        user_wechat_appid: doc.app_id,
        user_wechat_openid: wxAuthjs.openid || '',
        user_wechat_unionid: wxAuthjs.unionid || '',
      })
    }

    // login
    let session_token = authority.user2token(
      'WEIXIN',
      user,
      common.generateRandomAlphaNum(6)
    )
    user.session_key = wxAuthjs.session_key
    let loginData = await loginInit(user, session_token, 'WEIXIN')
    if (loginData) {
      loginData.Authorization = session_token
      return common.success(loginData)
    } else {
      return common.error('auth_03')
    }
  } else {
    return common.error('auth_05')
  }
}

exports.registerDeviceAct = async (req) => {
  let doc = common.docValidate(req)
  let device = await tb_device.findOne({
    where: {
      device_id: doc.serial_number,
      [Op.or]: [
        { device_mac: doc.device_mac },
        { device_mac2: doc.device_mac },
      ],
      state: GLBConfig.ENABLE,
    },
  })

  if (device) {
    device.device_state = '1'
    await device.save()
    return common.success({
      device_id: device.device_id,
      device_public_key: device.device_public_key,
    })
  } else {
    return common.error('auth_07')
  }
}

exports.signinDeviceAct = async (req) => {
  let doc = common.docValidate(req)
  let device = await tb_device.findOne({
    where: {
      device_id: doc.device_id,
      state: GLBConfig.ENABLE,
    },
  })

  if (device) {
    let priKey = new NodeRSA(device.device_private_key, 'pkcs8-private')
    let decrypted = ''
    try {
      decrypted = priKey.decrypt(doc.auth_password, 'utf8')
    } catch (error) {
      logger.debug(error)
      return common.error('auth_08')
    }

    let authJs = JSON.parse(decrypted)
    if (moment().diff(moment(authJs.login_time)) < 10 * 60 * 1000) {
      // 登陆时间与系统时间差10分钟以内
      device.device_access_time = new Date()
      device.device_last_ip =
        req.headers['x-forwarded-for'] || req.connection.remoteAddress
      await device.save()
      let device_token = authority.device2token(device, authJs.login_time)
      let expired = parseInt(config.DEVICE_TOKEN_AGE / 1000)
      let error = await redisClient.set(
        [config.redis.redisKey.AUTH, 'DEVICE', device.device_id].join('_'),
        {
          device_token: device_token,
          device: JSON.parse(JSON.stringify(device)),
          login_time: authJs.login_time,
        },
        expired
      )
      if (error) {
        return common.error('auth_08')
      }
      return common.success({ device_token: device_token })
    } else {
      return common.error('auth_08')
    }
  } else {
    return common.error('auth_08')
  }
}

const loginInit = async (user, session_token, type) => {
  try {
    let returnData = {}
    returnData.avatar = user.user_avatar
    returnData.user_id = user.user_id
    returnData.username = user.user_username
    returnData.name = user.user_name
    returnData.phone = user.user_phone
    returnData.created_at = moment(user.created_at).format('MM[, ]YYYY')
    returnData.city = user.user_city

    let groups = await tb_user_groups.findAll({
      where: {
        user_id: user.user_id,
      },
    })

    if (groups.length > 0) {
      let gids = []
      returnData.groups = []
      for (let g of groups) {
        gids.push(g.usergroup_id)
        let usergroup = await tb_usergroup.findOne({
          where: {
            usergroup_id: g.usergroup_id,
          },
        })
        if (usergroup && usergroup.usergroup_code) {
          returnData.groups.push(usergroup.usergroup_code)
        }
      }
      if (type === 'MOBILE' || type === 'WEIXIN') {
        returnData.menulist = await genDashboard(gids)
      } else {
        returnData.menulist = await iterationMenu(user, gids, '0')
      }

      // prepare redis Cache
      let authApis = []
      authApis.push({
        api_name: '用户设置',
        api_path: '/common/user/UserSetting',
        api_function: 'USERSETTING',
        auth_flag: '1',
        show_flag: '1',
      })
      if (user.user_type === GLBConfig.USER_TYPE.TYPE_ADMINISTRATOR) {
        authApis.push({
          api_name: '系统菜单维护',
          api_path: '/admin/auth/SystemApiControl',
          api_function: 'SYSTEMAPICONTROL',
          auth_flag: '1',
          show_flag: '1',
        })

        authApis.push({
          api_name: '角色组维护',
          api_path: '/admin/auth/GroupControl',
          api_function: 'GROUPCONTROL',
          auth_flag: '1',
          show_flag: '1',
        })

        authApis.push({
          api_name: '用户维护',
          api_path: '/admin/auth/OperatorControl',
          api_function: 'OPERATORCONTROL',
          auth_flag: '1',
          show_flag: '1',
        })

        authApis.push({
          api_name: '重置密码',
          api_path: '/admin/auth/ResetPassword',
          api_function: 'RESETPASSWORD',
          auth_flag: '1',
          show_flag: '1',
        })
      } else {
        let groupapis = await queryGroupApi(gids)
        for (let item of groupapis) {
          authApis.push({
            api_name: item.api_name,
            api_path: item.api_path,
            api_function: item.api_function,
            auth_flag: item.auth_flag,
            show_flag: item.show_flag,
          })
        }
      }
      let expired = null
      if (type === 'MOBILE' || type === 'WEIXIN') {
        expired = parseInt(config.MOBILE_TOKEN_AGE / 1000)
      } else {
        expired = parseInt(config.TOKEN_AGE / 1000)
      }
      let error = await redisClient.set(
        [config.redis.redisKey.AUTH, type, user.user_id].join('_'),
        {
          session_token: session_token,
          user: user,
          authApis: authApis,
        },
        expired
      )
      if (error) {
        return null
      }

      return returnData
    } else {
      return null
    }
  } catch (error) {
    logger.error(error)
    return null
  }
}

const queryGroupApi = async (groups) => {
  try {
    // prepare redis Cache
    let queryStr = `select DISTINCT c.api_name, c.api_path, c.api_function, c.auth_flag, c.show_flag 
          from tbl_common_usergroupmenu a, tbl_common_systemmenu b, tbl_common_api c
          where a.systemmenu_id = b.systemmenu_id
          and b.api_id = c.api_id
          and a.usergroup_id in (?)
          and b.state = '1'`

    let replacements = [groups]
    let groupmenus = await sequelize.query(queryStr, {
      replacements: replacements,
      type: sequelize.QueryTypes.SELECT,
    })
    return groupmenus
  } catch (error) {
    logger.error(error)
    return []
  }
}

const iterationMenu = async (user, groups, parent_id) => {
  if (user.user_type === GLBConfig.USER_TYPE.TYPE_ADMINISTRATOR) {
    let return_list = []
    return_list.push({
      menu_type: GLBConfig.NODE_TYPE.NODE_ROOT,
      menu_name: '权限管理',
      menu_icon: 'fa-cogs',
      show_flag: '1',
      sub_menu: [],
    })

    return_list[0].sub_menu.push({
      menu_type: GLBConfig.NODE_TYPE.NODE_LEAF,
      menu_name: '系统菜单维护',
      show_flag: '1',
      menu_path: '/admin/auth/SystemApiControl',
    })

    return_list[0].sub_menu.push({
      menu_type: GLBConfig.NODE_TYPE.NODE_LEAF,
      menu_name: '角色组维护',
      show_flag: '1',
      menu_path: '/admin/auth/GroupControl',
    })

    return_list[0].sub_menu.push({
      menu_type: GLBConfig.NODE_TYPE.NODE_LEAF,
      menu_name: '用户维护',
      show_flag: '1',
      menu_path: '/admin/auth/OperatorControl',
    })

    return_list[0].sub_menu.push({
      menu_type: GLBConfig.NODE_TYPE.NODE_LEAF,
      menu_name: '重置密码',
      show_flag: '1',
      menu_path: '/admin/auth/ResetPassword',
    })

    return return_list
  } else {
    let return_list = []
    let queryStr = `select distinct b.systemmenu_id, b.node_type,b.systemmenu_name,b.systemmenu_icon, b.systemmenu_index, c.show_flag, c.api_path
        from tbl_common_usergroupmenu a, tbl_common_systemmenu b
          left join tbl_common_api c on b.api_id = c.api_id
          where a.systemmenu_id = b.systemmenu_id
          and a.usergroup_id in (?)
          and b.parent_id = ?
          order by b.systemmenu_index`

    let replacements = [groups, parent_id]
    let menus = await sequelize.query(queryStr, {
      replacements: replacements,
      type: sequelize.QueryTypes.SELECT,
    })

    for (let m of menus) {
      let sub_menu = []

      if (m.node_type === GLBConfig.NODE_TYPE.NODE_ROOT) {
        sub_menu = await iterationMenu(user, groups, m.systemmenu_id)
      }

      if (m.node_type === GLBConfig.NODE_TYPE.NODE_LEAF) {
        return_list.push({
          menu_id: m.systemmenu_id,
          menu_type: m.node_type,
          menu_name: m.systemmenu_name,
          menu_path: m.api_path,
          menu_icon: m.systemmenu_icon,
          show_flag: m.show_flag,
        })
      } else if (
        m.node_type === GLBConfig.NODE_TYPE.NODE_ROOT &&
        sub_menu.length > 0
      ) {
        return_list.push({
          menu_id: m.systemmenu_id,
          menu_type: m.node_type,
          menu_name: m.systemmenu_name,
          menu_path: m.api_path,
          menu_icon: m.systemmenu_icon,
          show_flag: '1',
          sub_menu: sub_menu,
        })
      }
    }
    return return_list
  }
}

const genDashboard = async (groups) => {
  let return_list = []
  let queryStr = `select distinct b.systemmenu_id, b.systemmenu_name, b.systemmenu_mobile_icon, b.systemmenu_mobile_backcolor, c.api_path, c.api_function
        from tbl_common_usergroupmenu a, tbl_common_systemmenu b
          left join tbl_common_api c on b.api_id = c.api_id
          where a.systemmenu_id = b.systemmenu_id
          and b.node_type = '01'
          and b.systemmenu_mobile_icon != ''
          and a.usergroup_id in (?)`
  let replacements = [groups]
  let menus = await sequelize.query(queryStr, {
    replacements: replacements,
    type: sequelize.QueryTypes.SELECT,
  })

  for (let m of menus) {
    return_list.push({
      menu_id: m.systemmenu_id,
      menu_name: m.systemmenu_name,
      menu_path: m.api_path,
      menu_function: m.api_function,
      menu_icon: m.systemmenu_mobile_icon,
      menu_backcolor: m.systemmenu_mobile_backcolor,
    })
  }
  return return_list
}
