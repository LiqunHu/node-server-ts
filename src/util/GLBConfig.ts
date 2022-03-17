export default {
  INITPASSWORD: '123456',
  REDIS_KEYS: {
    AUTH: 'AUTH',
    SMS: 'SMS',
    CAPTCHA: 'CAPTCHA',
    AUTHAPI: 'AUTHAPI'
  },
  NODE_TYPE: {
    NODE_ROOT: '00',
    NODE_LEAF: '01',
  },
  MTYPEINFO: [
    {
      id: '00',
      text: '目录',
    },
    {
      id: '01',
      text: '菜单',
    },
  ],
  NODETYPEINFO: [
    {
      id: '00',
      text: '根',
    },
    {
      id: '01',
      text: '叶子',
    },
  ],
  ORG_TYPE: {
    TYPE_SYSTEM: '00',
    TYPE_DEFAULT: '01',
  },
  USER_TYPE: {
    TYPE_DEFAULT: '00',
    TYPE_ADMINISTRATOR: '01',
    TYPE_SYSTEM: '02',
  },
  AUTH: '1',
  NOAUTH: '0',
  AUTHINFO: [
    {
      id: '1',
      text: '需要授权',
    },
    {
      id: '0',
      text: '无需授权',
    },
  ],
  ENABLE: '1',
  DISABLE: '0',
  STATUSINFO: [
    {
      id: '1',
      text: '有效',
    },
    {
      id: '0',
      text: '无效',
    },
  ],
  TRUE: '1',
  FALSE: '0',
  TFINFO: [
    {
      id: '1',
      text: '是',
    },
    {
      id: '0',
      text: '否',
    },
  ],
  DEVICE_TYPE_INFO: [
    {
      id: 'BOX',
      text: '盒子',
    },
  ],
  DEVICE_STATE_INFO: [
    {
      id: '0',
      text: '未激活',
    },
    {
      id: '1',
      text: '正常',
    },
    {
      id: '2',
      text: '损坏',
    },
    {
      id: '3',
      text: '封停',
    },
  ],
}
