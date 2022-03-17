import Joi from 'joi'

export default {
  name: 'SystemAuthControl Services',
  apiList: {
    init: {
      name: '生成授权token',
      enname: 'SystemAuthControlgenSystemToken',
      tags: ['SystemAuthControl'],
      path: '/api/node/admin/auth/SystemAuthControl/genSystemToken',
      type: 'post',
      JoiSchema: {
        body: {
          user_id: Joi.string().max(50),
        },
      },
    },
  },
}
