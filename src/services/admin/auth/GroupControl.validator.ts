import Joi from 'joi'

export default {
  name: 'GroupControl Services',
  apiList: {
    init: {
      name: '获取组数据字典',
      enname: 'GroupControlinit',
      tags: ['GroupControl'],
      path: '/api/node/admin/auth/GroupControl/init',
      type: 'post',
      JoiSchema: {},
    },
    search: {
      name: '组查询',
      enname: 'GroupControlsearch',
      tags: ['GroupControl'],
      path: '/api/node/admin/auth/GroupControl/search',
      type: 'post',
      JoiSchema: {},
    },
    getcheck: {
      name: '获取组下拥有的菜单',
      enname: 'GroupControlgetcheck',
      tags: ['GroupControl'],
      path: '/api/node/admin/auth/GroupControl/getcheck',
      type: 'post',
      JoiSchema: {
        body: {
          usergroup_id: Joi.number().integer(),
        },
      },
    },
    add: {
      name: '增加目录或者节点',
      enname: 'GroupControladd',
      tags: ['GroupControl'],
      path: '/api/node/admin/auth/GroupControl/add',
      type: 'post',
      JoiSchema: {
        body: {
          usergroup_name: Joi.string().empty('').max(50),
          node_type: Joi.string().max(2),
          parent_id: Joi.number().integer(),
          usergroup_code: Joi.string().max(20),
          menus: Joi.array().items(
            Joi.object().keys({
              menu_id: Joi.number().integer(),
            })
          ),
        },
      },
    },
    modify: {
      name: '修改节点',
      enname: 'GroupControlmodify',
      tags: ['GroupControl'],
      path: '/api/node/admin/auth/GroupControl/modify',
      type: 'post',
      JoiSchema: {
        body: {
          usergroup_id: Joi.number().integer().required(),
          usergroup_code: Joi.string().max(20),
          usergroup_name: Joi.string().empty('').max(50),
          menus: Joi.array().items(
            Joi.object().keys({
              menu_id: Joi.number().integer(),
            })
          ),
        },
      },
    },
    remove: {
      name: '删除组',
      enname: 'GroupControlremove',
      tags: ['GroupControl'],
      path: '/api/node/admin/auth/GroupControl/remove',
      type: 'post',
      JoiSchema: {
        body: {
          usergroup_id: Joi.number().integer(),
        },
      },
    },
  },
}
