import Joi from 'joi'

export default {
  name: 'Auth Services',
  apiList: {
    signin: {
      name: '登陆授权',
      enname: 'Authsignin',
      tags: ['Auth'],
      path: '/api/auth/signin',
      type: 'post',
      JoiSchema: {
        body: {
          login_type: Joi.string().allow('WEB', 'MOBILE'),
          username: Joi.string().max(100),
          identify_code: Joi.string().max(100),
          magic_no: Joi.string().max(100),
        },
      },
    },
    captcha: {
      name: '获取图片验证码',
      enname: 'Authcaptcha',
      tags: ['Auth'],
      path: '/api/auth/captcha',
      type: 'post',
      JoiSchema: {},
    },
    loginSms: {
      name: '获取登陆短信验证码',
      enname: 'AuthLoginSms',
      tags: ['Auth'],
      path: '/api/node/auth/loginSms',
      type: 'post',
      JoiSchema: {
        body: {
          user_phone: Joi.string().regex(/^1[3|4|5|6|7|8|9]\d{9}$/),
          key: Joi.string(),
          code: Joi.string(),
        },
      },
    },
    signinBySms: {
      name: '验证码登陆授权',
      enname: 'AuthsigninBySms',
      tags: ['Auth'],
      path: '/api/node/auth/signinBySms',
      type: 'post',
      JoiSchema: {
        body: {
          login_type: Joi.string().allow('WEB', 'MOBILE'),
          user_phone: Joi.string().regex(/^1[3|4|5|6|7|8|9]\d{9}$/),
          code: Joi.string(),
        },
      },
    },
    signout: {
      name: '登出',
      enname: 'Authsignout',
      tags: ['Auth'],
      path: '/api/node/auth/signout',
      type: 'post',
      JoiSchema: {}
    },
  },
}
