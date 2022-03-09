import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { common_entity } from '@/entities/common_entity'

@Entity({ name: 'tbl_common_usergroup' })
export class common_usergroup extends common_entity {
  @PrimaryGeneratedColumn({ comment: '主键' })
  usergroup_id: number

  @Column({ comment: '组所属机构 0--系统组' })
  organization_id: number

  @Column({ default: '', length: 3, comment: '组类型' })
  usergroup_type: string

  @Column({ default: '', length: 20, comment: '组唯一标识' })
  usergroup_code: string

  @Column({ default: '', length: 50, comment: '组名称' })
  usergroup_name: string

  @Column({ default: '', length: 2, comment: '节点类型 NODETYPEINFO' })
  node_type: string

  @Column({ default: '', length: 30, comment: '父节点id 0为根节点' })
  parent_id: string
}
