import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { common_entity } from '@/entities/common_entity'

@Entity({ name: 'tbl_common_systemmenu' })
export class common_systemmenu extends common_entity {
  @PrimaryGeneratedColumn({ comment: '主键' })
  systemmenu_id: number

  @Column({ length: 300, comment: '名称' })
  systemmenu_name: string

  @Column({ default: '', length: 100, comment: '图标' })
  systemmenu_icon: string

  @Column({ default: 0, comment: '排序' })
  systemmenu_index: number

  @Column({ nullable: true, comment: '外键 tbl_common_api' })
  api_id: number

  @Column({ nullable: true, length: 2, comment: '节点类型 NODETYPEINFO' })
  node_type: string

  @Column({ default: '', length: 30, comment: '父节点id 0为根节点' })
  parent_id: string
}
