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
  },
}
