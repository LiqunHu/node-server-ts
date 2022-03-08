import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { CommonEntity } from '@entities/CommonEntity'

@Entity({ name: 'tbl_common_organizationmenu' })
export class CommonOrganizationmenu extends CommonEntity {
  @PrimaryGeneratedColumn({ comment: '主键' })
  organizationmenuId: number

  @Column({ comment: '组所属机构' })
  organizationId: number

  @Column({ default: '', length: 300, comment: '机构菜单名称' })
  organizationmenuName: string

  @Column({ default: '', length: 100, comment: '机构菜单图标' })
  organizationmenuIcon: string

  @Column({ default: 0, comment: '菜单排序' })
  organizationmenuIndex: number

  @Column({ nullable: true, comment: 'api id' })
  apiId: number

  @Column({ nullable: true, length: 2, comment: '节点类型' })
  nodeType: string

  @Column({ default: '', length: 30, comment: '父ID' })
  parentId: string
}
