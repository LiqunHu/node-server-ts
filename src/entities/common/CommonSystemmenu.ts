import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { CommonEntity } from '@entities/CommonEntity'

@Entity({ name: 'tbl_common_systemmenu' })
export class CommonSystemmenu extends CommonEntity {
  @PrimaryGeneratedColumn({ comment: '主键' })
  systemmenuId: number

  @Column({ length: 300, comment: '名称' })
  systemmenuName: string

  @Column({ default: '', length: 100, comment: '图标' })
  systemmenuIcon: string

  @Column({ default: 0, comment: '排序' })
  systemmenuIndex: number

  @Column({ nullable: true, comment: '外键 tbl_common_api' })
  apiId: number

  @Column({ nullable: true, length: 2, comment: '节点类型 NODETYPEINFO' })
  nodeType: string

  @Column({ default: '', length: 30, comment: '父节点id 0为根节点' })
  parentId: string
}
