import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { CommonEntity } from '@entities/CommonEntity'

@Entity({ name: 'tbl_common_templatemenu' })
export class CommonTemplatemenu extends CommonEntity {
  @PrimaryGeneratedColumn({ comment: '主键' })
  templatemenuId: number

  @Column({ nullable: true, comment: '机构模板ID' })
  organizationtemplateId: number

  @Column({ length: 300, comment: '模板菜单名称' })
  templatemenuName: string

  @Column({ default: '', length: 100, comment: '模板菜单图标' })
  templatemenuIcon: string

  @Column({ default: 0, comment: '模板菜单排序' })
  templatemenuIndex: number

  @Column({ nullable: true, comment: '外键 tbl_common_api' })
  apiId: number

  @Column({ nullable: true, length: 2, comment: '节点类型 NODETYPEINFO' })
  nodeType: string

  @Column({ default: '', length: 30, comment: '父节点id 0为根节点' })
  parentId: string
}
