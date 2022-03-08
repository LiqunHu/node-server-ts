import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { CommonEntity } from '@entities/CommonEntity'

@Entity({ name: 'tbl_common_user_wechat' })
export class CommonUserWechat extends CommonEntity {
  @PrimaryGeneratedColumn({ comment: '主键' })
  userWechatId: number

  @Column({ length: 36, comment: '外键 tbl_common_user' })
  userId: string

  @Column({ length: 100, comment: '微信appid' })
  userWechatAppid: string

  @Column({ default: '', length: 100, comment: '微信openid' })
  userWechatOpenid: string

  @Column({ default: '', length: 100, comment: '微信unionid' })
  userWechatUnionid: string

  @Column({ default: '', length: 100, comment: '微信nickname' })
  userWechatNickname: string

  @Column({ default: '', length: 2, comment: '微信性别' })
  userWechatSex: string

  @Column({ default: '', length: 20, comment: '微信province' })
  userWechatProvince: string

  @Column({ default: '', length: 20, comment: '微信city' })
  userWechatCity: string

  @Column({ default: '', length: 20, comment: '微信country' })
  userWechatCountry: string

  @Column({ default: '', length: 200, comment: '微信headimgurl' })
  userWechatHeadimgurl: string

  @Column({
    default: '0',
    length: 10,
    comment: '微信推送免打扰标示 0关闭免打扰 1打开免打扰',
  })
  user_wechat_disturbing_flag: string
}
