import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { CommonEntity } from '@entities/CommonEntity'

@Entity({ name: 'tbl_common_user_groups' })
export class CommonUserGroups extends CommonEntity {
  @PrimaryGeneratedColumn({ comment: '主键' })
  userGroupsId: number

  @Column({ length: 36, comment: '外键 tbl_common_user' })
  userId: string

  @Column({ comment: '外键 tbl_common_usergroup' })
  usergroupId: number
}
