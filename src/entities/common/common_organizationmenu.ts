import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { common_entity } from '@/entities/common_entity'

@Entity({ name: 'tbl_common_organizationmenu' })
export class common_organizationmenu extends common_entity {
  @PrimaryGeneratedColumn({ comment: '主键' })
  organizationmenu_id: number

  @Column({ comment: '组所属机构' })
  organization_id: number

  @Column({ default: '', length: 300, comment: '机构菜单名称' })
  organizationmenu_name: string

  @Column({ default: '', length: 100, comment: '机构菜单图标' })
  organizationmenu_icon: string

  @Column({ default: 0, comment: '菜单排序' })
  organizationmenu_index: number

  @Column({ nullable: true, comment: 'api id' })
  api_id: number

  @Column({ nullable: true, length: 2, comment: '节点类型' })
  node_type: string

  @Column({ default: '', length: 30, comment: '父ID' })
  parent_id: string
}
