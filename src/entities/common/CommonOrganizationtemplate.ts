import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { CommonEntity } from '@entities/CommonEntity'

@Entity({ name: 'tbl_common_organizationtemplate' })
export class CommonOrganizationtemplate extends CommonEntity {
  @PrimaryGeneratedColumn({ comment: '主键' })
  organizationtemplateId: number

  @Column({ length: 50, comment: '模板名称' })
  organizationtemplateName: string
}
