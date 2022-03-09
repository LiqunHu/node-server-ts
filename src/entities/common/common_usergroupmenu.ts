import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { common_entity } from '@/entities/common_entity'

@Entity({ name: 'tbl_common_usergroupmenu' })
export class common_usergroupmenu extends common_entity {
  @PrimaryGeneratedColumn({ comment: '主键' })
  usergroupmenu_id: number

  @Column({ comment: '外键 tbl_common_usergroup' })
  usergroup_id: number

  @Column({
    comment:
      '外键 tbl_common_systemmenu organization_id = 0, tbl_common_organizationmenu',
  })
  menu_id: number
}
