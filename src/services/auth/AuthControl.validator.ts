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
        body: Joi.object().keys({
          login_type: Joi.string().allow('WEB', 'MOBILE'),
          username: Joi.string().max(100),
          identify_code: Joi.string().max(100),
          magic_no: Joi.string().max(100),
        }),
      },
    },
    signinBySms: {
      name: '验证码登陆授权',
      enname: 'AuthsigninBySms',
      tags: ['Auth'],
      path: '/api/auth/signinBySms',
      type: 'post',
      JoiSchema: {
        body: Joi.object().keys({
          login_type: Joi.string().allow('WEB', 'MOBILE'),
          user_phone: Joi.string().regex(/^1[3|4|5|7|8]\d{9}$/),
          code: Joi.string(),
        }),
      },
    },
    signinByWx: {
      name: '微信登陆授权',
      enname: 'AuthsigninByWx',
      tags: ['Auth'],
      path: '/api/auth/signinByWx',
      type: 'post',
      JoiSchema: {
        body: Joi.object().keys({
          app_id: Joi.string(),
          wx_code: Joi.string(),
        }),
      },
    },
    signout: {
      name: '登出',
      enname: 'Authsignout',
      tags: ['Auth'],
      path: '/api/auth/signout',
      type: 'post',
      JoiSchema: {},
    },
    loginSms: {
      name: '获取登陆短信验证码',
      enname: 'AuthLoginSms',
      tags: ['Auth'],
      path: '/api/auth/loginSms',
      type: 'post',
      JoiSchema: {
        body: Joi.object().keys({
          user_phone: Joi.string().regex(/^1[3|4|5|7|8]\d{9}$/),
        }),
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
    registerSms: {
      name: '获取注册短信验证码',
      enname: 'AuthRegisterSms',
      tags: ['Auth'],
      path: '/api/auth/registerSms',
      type: 'post',
      JoiSchema: {
        body: Joi.object().keys({
          user_phone: Joi.string().regex(/^1[3|4|5|7|8]\d{9}$/),
        }),
      },
    },
    registerByPhone: {
      name: '通过手机注册',
      enname: 'AuthregisterByPhone',
      tags: ['Auth'],
      path: '/api/auth/registerByPhone',
      type: 'post',
      JoiSchema: {
        body: Joi.object().keys({
          user_phone: Joi.string().regex(/^1[3|4|5|7|8]\d{9}$/),
          code: Joi.string(),
          user_email: Joi.string().empty('').email(),
          user_name: Joi.string().empty('').max(100),
          user_gender: Joi.string().empty('').max(1),
          user_province: Joi.string().empty('').max(20),
          user_city: Joi.string().empty('').max(20),
          user_district: Joi.string().empty('').max(20),
          user_address: Joi.string().empty('').max(100),
        }),
      },
    },
    registerByWx: {
      name: '通过微信注册',
      enname: 'AuthregisterByWx',
      tags: ['Auth'],
      path: '/api/auth/registerByWx',
      type: 'post',
      JoiSchema: {
        body: Joi.object().keys({
          app_id: Joi.string(),
          user_phone: Joi.string().regex(/^1[3|4|5|7|8]\d{9}$/),
          code: Joi.string(),
          wx_code: Joi.string(),
          user_email: Joi.string().empty('').email(),
          user_name: Joi.string().empty('').max(100),
          user_gender: Joi.string().empty('').max(1),
          user_province: Joi.string().empty('').max(20),
          user_city: Joi.string().empty('').max(20),
          user_district: Joi.string().empty('').max(20),
          user_address: Joi.string().empty('').max(100),
        }),
      },
    },
    registerDevice: {
      name: '注册设备',
      enname: 'AuthRegisterDevice',
      tags: ['Auth'],
      path: '/api/auth/registerDevice',
      type: 'post',
      JoiSchema: {
        body: Joi.object().keys({
          serial_number: Joi.string().length(32),
          device_mac: Joi.string().max(50),
        }),
      },
    },
    signinDevice: {
      name: '设备登陆',
      enname: 'AuthSigninDevice',
      tags: ['Auth'],
      path: '/api/auth/signinDevice',
      type: 'post',
      JoiSchema: {
        body: Joi.object().keys({
          device_id: Joi.string().max(50),
          auth_password: Joi.string().max(500),
        }),
      },
    },
  },
}
