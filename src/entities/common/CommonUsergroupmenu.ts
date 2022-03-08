import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { CommonEntity } from '@entities/CommonEntity'

@Entity({ name: 'tbl_common_usergroupmenu' })
export class CommonUsergroupmenu extends CommonEntity {
  @PrimaryGeneratedColumn({ comment: '主键' })
  usergroupmenuId: number

  @Column({ comment: '外键 tbl_common_usergroup' })
  usergroupId: number

  @Column({
    comment:
      '外键 tbl_common_systemmenu organization_id = 0, tbl_common_organizationmenu',
  })
  menuId: number
}
