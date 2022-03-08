import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { CommonEntity } from '@entities/CommonEntity'

@Entity({ name: 'tbl_common_api' })
export class CommonOrganizationUser extends CommonEntity {
  @PrimaryGeneratedColumn({ comment: '主键' })
  organizationUserId: number

  @Column({ comment: '外键 tbl_common_user' })
  organizationId: number

  @Column({ length: 36, comment: '外键 tbl_common_user' })
  userId: string

  @Column({
    default: '',
    length: 2,
    comment: '默认机构标示 1--默认机构 只有一个',
  })
  organizationUserDefaultFlag: string
}
