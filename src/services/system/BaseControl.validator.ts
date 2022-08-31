import Joi from 'joi'

export default {
  name: 'BaseControl Services',
  apiList: {
    searchUser: {
      name: '模糊查询用户',
      enname: 'BaseControlsearchUser',
      tags: ['BaseControl'],
      path: '/api/node/system/BaseControl/searchUser',
      type: 'post',
      JoiSchema: {
        body: {
          search_text: Joi.string().empty('').max(50),
        },
      },
    },
  },
}
