import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  BaseEntity,
  OneToMany,
} from 'typeorm';
import { UserEntity } from '../users/user.entity';

@Entity()
export class RoleEntity extends BaseEntity {
  @PrimaryGeneratedColumn() id: number;

  @Column({ length: 25 })
  name: string;

  @OneToMany(() => UserEntity, (users) => users.roleid)
  users: UserEntity[];

  @CreateDateColumn() create_at: Date;
}
