import Joi from 'joi'

export default {
  name: 'OrganizationUserControl Services',
  apiList: {
    init: {
      name: '获取组相关信息',
      enname: 'OrganizationUserControlinit',
      tags: ['OrganizationUserControl'],
      path: '/api/node/admin/auth/OrganizationUserControl/init',
      type: 'post',
      JoiSchema: {},
    },
    search: {
      name: '用户查询',
      enname: 'OrganizationUserControlsearch',
      tags: ['OrganizationUserControl'],
      path: '/api/node/admin/auth/OrganizationUserControl/search',
      type: 'post',
      JoiSchema: {
        body: {
          search_text: Joi.string().empty('').max(50),
          order: Joi.string().empty('').max(50),
          limit: Joi.number().integer(),
          offset: Joi.number().integer(),
        },
      },
    },
    add: {
      name: '增加操作员',
      enname: 'OrganizationUserControladd',
      tags: ['OrganizationUserControl'],
      path: '/api/node/admin/auth/OrganizationUserControl/add',
      type: 'post',
      JoiSchema: {
        body: {
          user_id: Joi.string().empty('').max(50),
        },
      },
    },
    modify: {
      name: '修改用户',
      enname: 'OrganizationUserControlmodify',
      tags: ['OrganizationUserControl'],
      path: '/api/node/admin/auth/OrganizationUserControl/modify',
      type: 'post',
      JoiSchema: {
        body: {
          user_id: Joi.string().max(50),
          user_name: Joi.string().max(100),
          user_phone: Joi.string().max(20),
          user_email: Joi.string().empty('').max(100),
          user_groups: Joi.array().items(Joi.number().integer()),
        },
      },
    },
    delete: {
      name: '删除用户',
      enname: 'OperatorControldelete',
      tags: ['OrganizationUserControl'],
      path: '/api/node/admin/auth/OrganizationUserControl/delete',
      type: 'post',
      JoiSchema: {
        body: {
          user_id: Joi.string().max(50),
        },
      },
    },
  },
}
