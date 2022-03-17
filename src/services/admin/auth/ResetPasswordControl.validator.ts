import Joi from 'joi'

export default {
  name: 'ResetPassword Services',
  apiList: {
    search: {
      name: '查询客户信息',
      enname: 'ResetPasswordSearch',
      tags: ['ResetPassword'],
      path: '/api/node/admin/auth/ResetPassword/search',
      type: 'post',
      JoiSchema: {
        body: {
          search_text: Joi.string().empty('').max(50),
        },
      },
    },
    reset: {
      name: '重置密码',
      enname: 'ResetPasswordReset',
      tags: ['ResetPassword'],
      path: '/api/node/admin/auth/ResetPassword/reset',
      type: 'post',
      JoiSchema: {
        body: {
          user_id: Joi.string().max(50),
          version: Joi.number().integer(),
          updated_at: Joi.string().max(50),
        },
      },
    },
  },
}
