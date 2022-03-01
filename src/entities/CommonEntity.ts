import { Column, CreateDateColumn, UpdateDateColumn, BeforeUpdate, BaseEntity } from 'typeorm'

export class CommonEntity extends BaseEntity {
  @Column({ length: 5, default: '1', comment: '软删除表示 1--生效 0--失效' })
  state: string

  @Column({ comment: '更新版本 更新一次+1' })
  version: number

  @UpdateDateColumn()
  updatedAt: Date

  @CreateDateColumn()
  createdAt: Date

  @BeforeUpdate()
  updateVersion () {
    this.version += 1
  }
}
