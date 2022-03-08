import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ValueTransformer,
} from 'typeorm'
import CryptoJS from 'crypto-js'
import { CommonEntity } from '@entities/CommonEntity'

const toMD5Hash: ValueTransformer = {
  from: (value: string) => value,
  to: (value: string) => CryptoJS.MD5(value).toString(),
}

@Entity({ name: 'tbl_common_user' })
export class CommonUser extends CommonEntity {
  @PrimaryGeneratedColumn('uuid', { comment: '主键' })
  userId: string

  @Column({ length: 100, comment: '用户名' })
  userUsername: string

  @Column({ length: 10, comment: '用户类型' })
  userType: string

  @Column({ length: 100, comment: 'Email' })
  userEmail: string

  @Column({ length: 5, default: '86', comment: '国家代码' })
  userCountryCode: string

  @Column({ length: 20, comment: '手机' })
  userPhone: string

  @Column({ length: 100, transformer: toMD5Hash, comment: '密码' })
  userPassword: string

  @Column({ default: 0, comment: '密码错误次数 -1未设置密码 0正常' })
  userPasswordError: number

  @Column({ comment: '末次登陆时间' })
  userLoginTime: Date

  @Column({ length: 100, default: '', comment: '姓名' })
  userName: string

  @Column({ length: 1, default: '', comment: '性别' })
  userGender: string

  @Column({ length: 200, default: '', comment: '头像' })
  userAvatar: string

  @Column({ length: 20, default: '', comment: '省' })
  userProvince: string

  @Column({ length: 20, default: '', comment: '市/县' })
  userCity: string

  @Column({ length: 100, default: '', comment: '区' })
  userDistrict: string

  @Column({ length: 32, default: '', comment: '地址' })
  userAddress: string

  @Column({ length: 200, default: '', comment: '邮编' })
  userZipcode: string

  @Column({ length: 200, default: '', comment: '公司' })
  userCompany: string

  @Column({ length: 200, default: '', comment: '备注' })
  userRemark: string

  // @Column(() => CommonEntity, { prefix: '' })
  // commonEntity: CommonEntity
}
