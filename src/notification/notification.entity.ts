import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  BaseEntity,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from 'src/users/user.entity';

@Entity()
export class NotificationEntity extends BaseEntity {
  @PrimaryGeneratedColumn() id: number;

  @Column({ length: 250 })
  content: string;

  @Column({ type: 'int' })
  userid: number;

  @Column({ type: 'int' })
  type: number;
  /*
	type =number etoile
	*/

  @Column({ default: true })
  isOpen: boolean;

  @ManyToOne(() => UserEntity, (users) => users.notifications)
  @JoinColumn({ name: 'userid' })
  users: UserEntity;

  @CreateDateColumn() create_at: Date;

  @UpdateDateColumn() updated_at: Date;
}
