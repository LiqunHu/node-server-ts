import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeUpdate,
  BaseEntity,
} from 'typeorm'

export class common_entity extends BaseEntity {
  @Column({ length: 5, default: '1', comment: '软删除表示 1--生效 0--失效' })
  state: string

  @Column({ comment: '更新版本 更新一次+1' })
  version: number

  @UpdateDateColumn()
  updated_at: Date

  @CreateDateColumn()
  created_at: Date

  @BeforeUpdate()
  updateVersion() {
    this.version += 1
  }
}
