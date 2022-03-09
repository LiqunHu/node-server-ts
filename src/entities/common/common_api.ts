import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
import { common_entity } from '@/entities/common_entity'

@Entity({ name: 'tbl_common_api' })
export class common_api extends common_entity {
  @PrimaryGeneratedColumn({ comment: '主键' })
  api_id: number

  @Column({ default: '', length: 10, comment: 'api 类型' })
  api_type: string

  @Column({ default: '', length: 300, comment: 'api 名称' })
  api_name: string

  @Column({ default: '', length: 300, comment: 'api 路径' })
  api_path: string

  @Column({ default: '', length: 100, comment: 'api 唯一名称' })
  api_function: string

  @Column({ default: '1', length: 2, comment: '是否需要授权 1需要 0不需要' })
  auth_flag: string

  @Column({ default: '', length: 30, comment: 'api 备注' })
  parent_id: string
}
