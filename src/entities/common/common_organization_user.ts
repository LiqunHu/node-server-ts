import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { common_entity } from '@/entities/common_entity'

@Entity({ name: 'tbl_common_organization_user' })
export class common_organization_user extends common_entity {
  @PrimaryGeneratedColumn({ comment: '主键' })
  organization_user_id: number

  @Column({ comment: '外键 tbl_common_user' })
  organization_id: number

  @Column({ length: 36, comment: '外键 tbl_common_user' })
  user_id: string

  @Column({
    default: '',
    length: 2,
    comment: '默认机构标示 1--默认机构 只有一个',
  })
  organization_user_default_flag: string
}
