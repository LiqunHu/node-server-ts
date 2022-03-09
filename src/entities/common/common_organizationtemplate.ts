import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { common_entity } from '@/entities/common_entity'

@Entity({ name: 'tbl_common_organizationtemplate' })
export class common_organizationtemplate extends common_entity {
  @PrimaryGeneratedColumn({ comment: '主键' })
  organizationtemplate_id: number

  @Column({ length: 50, comment: '模板名称' })
  organizationtemplate_name: string
}
