import Joi from 'joi'

export default {
  name: 'OrganizationControl Services',
  apiList: {
    init: {
      name: '获取组相关信息',
      enname: 'OrganizationControlinit',
      tags: ['OrganizationControl'],
      path: '/api/node/admin/auth/OrganizationControl/init',
      type: 'post',
      JoiSchema: {},
    },
    search: {
      name: '机构查询',
      enname: 'OrganizationControlsearch',
      tags: ['OrganizationControl'],
      path: '/api/node/admin/auth/OrganizationControl/search',
      type: 'post',
      JoiSchema: {
        body: {
          search_text: Joi.string().empty('').max(50),
          limit: Joi.number().integer(),
          offset: Joi.number().integer(),
        },
      },
    },
    add: {
      name: '增加机构',
      enname: 'OrganizationControladd',
      tags: ['OrganizationControl'],
      path: '/api/node/admin/auth/OrganizationControl/add',
      type: 'post',
      JoiSchema: {
        body: {
          organization_code: Joi.string().max(50),
          organization_name: Joi.string().max(50),
          organizationtemplate_id: Joi.number().integer(),
        },
      },
    },
    getOrganizationMenu: {
      name: '查询机构菜单',
      enname: 'OrganizationControlgetOrganizationMenu',
      tags: ['OrganizationControl'],
      path: '/api/node/admin/auth/OrganizationControl/getOrganizationMenu',
      type: 'post',
      JoiSchema: {
        body: {
          organization_id: Joi.number().integer(),
        },
      },
    },
    addFolder: {
      name: '增加目录',
      enname: 'OrganizationControladdFolder',
      tags: ['OrganizationControl'],
      path: '/api/node/admin/auth/OrganizationControl/addFolder',
      type: 'post',
      JoiSchema: {
        body: {
          organization_id: Joi.number().integer(),
          parent_id: Joi.number().integer(),
          organizationmenu_name: Joi.string().max(50),
          organizationmenu_icon: Joi.string().max(50),
        },
      },
    },
    addMenus: {
      name: '增加菜单',
      enname: 'OrganizationControladdMenus',
      tags: ['OrganizationControl'],
      path: '/api/node/admin/auth/OrganizationControl/addMenus',
      type: 'post',
      JoiSchema: {
        body: {
          organization_id: Joi.number().integer(),
          parent_id: Joi.number().integer(),
          items: Joi.array().items(
            Joi.object().keys({
              api_id: Joi.number().integer(),
              organizationmenu_name: Joi.string().max(50),
            })
          ),
        },
      },
    },
    removeItem: {
      name: '删除对象',
      enname: 'OrganizationControlremoveItem',
      tags: ['OrganizationControl'],
      path: '/api/node/admin/auth/OrganizationControl/removeItem',
      type: 'post',
      JoiSchema: {
        body: {
          organizationmenu_id: Joi.number().integer(),
        },
      },
    },
  },
}
