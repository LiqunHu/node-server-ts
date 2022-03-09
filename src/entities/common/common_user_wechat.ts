import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { common_entity } from '@/entities/common_entity'

@Entity({ name: 'tbl_common_user_wechat' })
export class common_user_wechat extends common_entity {
  @PrimaryGeneratedColumn({ comment: '主键' })
  user_wechat_id: number

  @Column({ length: 36, comment: '外键 tbl_common_user' })
  user_id: string

  @Column({ length: 100, comment: '微信appid' })
  user_wechat_appid: string

  @Column({ default: '', length: 100, comment: '微信openid' })
  user_wechat_openid: string

  @Column({ default: '', length: 100, comment: '微信unionid' })
  user_wechat_unionid: string

  @Column({ default: '', length: 100, comment: '微信nickname' })
  user_wechat_nickname: string

  @Column({ default: '', length: 2, comment: '微信性别' })
  user_wechat_sex: string

  @Column({ default: '', length: 20, comment: '微信province' })
  user_wechat_province: string

  @Column({ default: '', length: 20, comment: '微信city' })
  user_wechat_city: string

  @Column({ default: '', length: 20, comment: '微信country' })
  user_wechat_country: string

  @Column({ default: '', length: 200, comment: '微信headimgurl' })
  user_wechat_headimgurl: string

  @Column({
    default: '0',
    length: 10,
    comment: '微信推送免打扰标示 0关闭免打扰 1打开免打扰',
  })
  user_wechat_disturbing_flag: string
}
