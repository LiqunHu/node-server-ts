import Joi from 'joi'

export default {
  name: 'OrganizationTemplateControl Services',
  apiList: {
    init: {
      name: '获取组数据字典',
      enname: 'OrganizationTemplateControlinit',
      tags: ['OrganizationTemplateControl'],
      path: '/api/node/admin/auth/OrganizationTemplateControl/init',
      type: 'post',
      JoiSchema: {},
    },
    getTemplate: {
      name: '查询模板',
      enname: 'OrganizationTemplateControlgetTemplate',
      tags: ['OrganizationTemplateControl'],
      path: '/api/node/admin/auth/OrganizationTemplateControl/getTemplate',
      type: 'post',
      JoiSchema: {
        body: {
          search_text: Joi.string().empty('').max(100),
        },
      },
    },
    addTemplate: {
      name: '增加模板',
      enname: 'OrganizationTemplateControladdTemplate',
      tags: ['OrganizationTemplateControl'],
      path: '/api/node/admin/auth/OrganizationTemplateControl/addTemplate',
      type: 'post',
      JoiSchema: {
        body: {
          organizationtemplate_name: Joi.string().max(50),
        },
      },
    },
    removeTemplate: {
      name: '删除模板',
      enname: 'OrganizationTemplateControlremoveTemplate',
      tags: ['OrganizationTemplateControl'],
      path: '/api/node/admin/auth/OrganizationTemplateControl/removeTemplate',
      type: 'post',
      JoiSchema: {
        body: {
          organizationtemplate_id: Joi.number().integer(),
        },
      },
    },
    getTemplateMenu: {
      name: '查询模板菜单',
      enname: 'OrganizationTemplateControlgetTemplateMenu',
      tags: ['OrganizationTemplateControl'],
      path: '/api/node/admin/auth/OrganizationTemplateControl/getTemplateMenu',
      type: 'post',
      JoiSchema: {
        body: {
          organizationtemplate_id: Joi.number().integer(),
        },
      },
    },
    addFolder: {
      name: '增加目录',
      enname: 'OrganizationTemplateControladdFolder',
      tags: ['OrganizationTemplateControl'],
      path: '/api/node/admin/auth/OrganizationTemplateControl/addFolder',
      type: 'post',
      JoiSchema: {
        body: {
          organizationtemplate_id: Joi.number().integer(),
          parent_id: Joi.number().integer(),
          templatemenu_name: Joi.string().max(50),
          templatemenu_icon: Joi.string().max(50),
        },
      },
    },
    addMenus: {
      name: '增加菜单',
      enname: 'OrganizationTemplateControladdMenus',
      tags: ['OrganizationTemplateControl'],
      path: '/api/node/admin/auth/OrganizationTemplateControl/addMenus',
      type: 'post',
      JoiSchema: {
        body: {
          organizationtemplate_id: Joi.number().integer(),
          parent_id: Joi.number().integer(),
          items: Joi.array().items(
            Joi.object().keys({
              api_id: Joi.number().integer(),
              templatemenu_name: Joi.string().max(50),
            })
          ),
        },
      },
    },
    removeItem: {
      name: '删除对象',
      enname: 'OrganizationTemplateControlremoveItem',
      tags: ['OrganizationTemplateControl'],
      path: '/api/node/admin/auth/OrganizationTemplateControl/removeItem',
      type: 'post',
      JoiSchema: {
        body: {
          templatemenu_id: Joi.number().integer(),
        },
      },
    },
  },
}
