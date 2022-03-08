import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { CommonEntity } from '@entities/CommonEntity'

@Entity({ name: 'tbl_common_usergroup' })
export class CommonUsergroup extends CommonEntity {
  @PrimaryGeneratedColumn({ comment: '主键' })
  usergroupId: number

  @Column({ comment: '组所属机构 0--系统组' })
  organizationId: number

  @Column({ default: '', length: 3, comment: '组类型' })
  usergroupType: string

  @Column({ default: '', length: 20, comment: '组唯一标识' })
  usergroupCode: string

  @Column({ default: '', length: 50, comment: '组名称' })
  usergroupName: string

  @Column({ default: '', length: 2, comment: '节点类型 NODETYPEINFO' })
  nodeType: string

  @Column({ default: '', length: 30, comment: '父节点id 0为根节点' })
  parentId: string
}
