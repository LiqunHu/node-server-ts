import Joi from 'joi'

export default {
  name: 'SystemApiControl Services',
  apiList: {
    init: {
      name: '获取数据字典',
      enname: 'SystemApiControlinit',
      tags: ['SystemApiControl'],
      path: '/api/node/admin/auth/SystemApiControl/init',
      type: 'post',
      JoiSchema: {},
    },
    search: {
      name: 'API树查询',
      enname: 'SystemApiControlsearch',
      tags: ['SystemApiControl'],
      path: '/api/node/admin/auth/SystemApiControl/search',
      type: 'post',
      JoiSchema: {},
    },
    addFolder: {
      name: '增加目录',
      enname: 'SystemApiControladdFolder',
      tags: ['SystemApiControl'],
      path: '/api/node/admin/auth/SystemApiControl/addFolder',
      type: 'post',
      JoiSchema: {
        body: {
          parent_id: Joi.number().integer(),
          systemmenu_icon: Joi.string().max(50),
          systemmenu_name: Joi.string().max(50),
        },
      },
    },
    modifyFolder: {
      name: '修改目录',
      enname: 'SystemApiControlmodifyFolder',
      tags: ['SystemApiControl'],
      path: '/api/node/admin/auth/SystemApiControl/modifyFolder',
      type: 'post',
      JoiSchema: {
        body: {
          systemmenu_id: Joi.number().integer(),
          systemmenu_icon: Joi.string().max(50),
          systemmenu_name: Joi.string().max(50),
        },
      },
    },
    addMenu: {
      name: '增加API',
      enname: 'SystemApiControladdMenu',
      tags: ['SystemApiControl'],
      path: '/api/node/admin/auth/SystemApiControl/addMenu',
      type: 'post',
      JoiSchema: {
        body: {
          parent_id: Joi.number().integer(),
          api_type: Joi.string().max(10),
          api_path: Joi.string().empty('').max(300),
          api_function: Joi.string().empty('').max(100),
          auth_flag: Joi.string().empty('').max(10),
          api_remark: Joi.string().empty('').max(500),
          systemmenu_name: Joi.string().max(300),
        },
      },
    },
    modifyMenu: {
      name: '修改API',
      enname: 'SystemApiControlmodifyMenu',
      tags: ['SystemApiControl'],
      path: '/api/node/admin/auth/SystemApiControl/modifyMenu',
      type: 'post',
      JoiSchema: {
        body: {
          systemmenu_id: Joi.number().integer(),
          api_type: Joi.string().max(10),
          api_path: Joi.string().empty('').max(300),
          api_function: Joi.string().empty('').max(100),
          auth_flag: Joi.string().empty('').max(10),
          api_remark: Joi.string().empty('').max(500),
          systemmenu_name: Joi.string().max(300),
        },
      },
    },
    remove: {
      name: '删除节点',
      enname: 'SystemApiControlremove',
      tags: ['SystemApiControl'],
      path: '/api/node/admin/auth/SystemApiControl/remove',
      type: 'post',
      JoiSchema: {
        body: {
          systemmenu_id: Joi.number().integer(),
        },
      },
    },
  },
}
