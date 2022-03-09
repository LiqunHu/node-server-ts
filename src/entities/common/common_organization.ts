import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { common_entity } from '@/entities/common_entity'

@Entity({ name: 'tbl_common_organization' })
export class common_organization extends common_entity {
  @PrimaryGeneratedColumn({ comment: '主键' })
  organization_id: number

  @Column({ unique: true, length: 100, comment: '机构编码' })
  organization_code: string

  @Column({ default: '', length: 3, comment: '机构类型' })
  organization_type: string

  @Column({ nullable: true, comment: '机构模板ID' })
  organization_template_id: number

  @Column({ default: '', length: 50, comment: '机构名称' })
  organization_name: string

  @Column({ default: '', length: 20, comment: '机构省' })
  organization_province: string

  @Column({ default: '', length: 20, comment: '机构市/县' })
  organization_city: string

  @Column({ default: '', length: 20, comment: '机构区' })
  organization_district: string

  @Column({ default: '', length: 500, comment: '地址' })
  organization_address: string

  @Column({ default: '', length: 100, comment: '机构代表' })
  organization_deputy: string

  @Column({ default: '', length: 20, comment: '机构电话' })
  organization_call: string

  @Column({ default: '', length: 100, comment: '机构联系方式' })
  organization_contact: string

  @Column({ default: '', length: 20, comment: '机构传真' })
  organization_fax: string

  @Column({ default: '', length: 200, comment: '机构邮箱' })
  organization_email: string

  @Column({ default: '', length: 200, comment: '机构描述' })
  organization_description: string

  @Column({ type: 'json', nullable: true, comment: '机构配置' })
  organization_config: Object

  @Column({ default: 0, comment: '机构排序' })
  organization_index: number
}
