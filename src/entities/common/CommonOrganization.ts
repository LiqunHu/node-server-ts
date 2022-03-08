import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { CommonEntity } from '@entities/CommonEntity'

@Entity({ name: 'tbl_common_organization' })
export class CommonApi extends CommonEntity {
  @PrimaryGeneratedColumn({ comment: '主键' })
  organizationId: number

  @Column({ unique: true, length: 100, comment: '机构编码' })
  organizationCode: string

  @Column({ default: '', length: 3, comment: '机构类型' })
  organizationType: string

  @Column({ nullable: true, comment: '机构模板ID' })
  organizationTemplateId: number

  @Column({ default: '', length: 50, comment: '机构名称' })
  organizationName: string

  @Column({ default: '', length: 20, comment: '机构省' })
  organizationProvince: string

  @Column({ default: '', length: 20, comment: '机构市/县' })
  organizationCity: string

  @Column({ default: '', length: 20, comment: '机构区' })
  organizationDistrict: string

  @Column({ default: '', length: 500, comment: '地址' })
  organizationAddress: string

  @Column({ default: '', length: 100, comment: '机构代表' })
  organizationDeputy: string

  @Column({ default: '', length: 20, comment: '机构电话' })
  organizationCall: string

  @Column({ default: '', length: 100, comment: '机构联系方式' })
  organizationContact: string

  @Column({ default: '', length: 20, comment: '机构传真' })
  organizationFax: string

  @Column({ default: '', length: 200, comment: '机构邮箱' })
  organizationEmail: string

  @Column({ default: '', length: 200, comment: '机构描述' })
  organizationDescription: string

  @Column({ type: 'json', nullable: true, comment: '机构配置' })
  organizationConfig: Object

  @Column({ default: 0, comment: '机构排序' })
  organizationIndex: number
}
