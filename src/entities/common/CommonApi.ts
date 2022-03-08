import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { CommonEntity } from '@entities/CommonEntity'

@Entity({ name: 'tbl_common_api' })
export class CommonApi extends CommonEntity {
  @PrimaryGeneratedColumn({ comment: '主键' })
  apiId: number

  @Column({ default: '', length: 10, comment: 'api 类型' })
  apiType: string

  @Column({ default: '', length: 300, comment: 'api 名称' })
  apiName: string

  @Column({ default: '', length: 300, comment: 'api 路径' })
  apiPath: string

  @Column({ default: '', length: 100, comment: 'api 唯一名称' })
  apiFunction: string

  @Column({ default: '1', length: 2, comment: '是否需要授权 1需要 0不需要' })
  authFlag: string

  @Column({ default: '', length: 30, comment: 'api 备注' })
  parentId: string
}
