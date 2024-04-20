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
import { TypeSectionEntrie } from 'src/common/enum/EnumDate';

//For to catch usurpation txHash
@Entity()
export class SerialUserEntity extends BaseEntity {
  @PrimaryGeneratedColumn() id: number;

  @Column({ type: 'int' })
  userid_fraude: number;

  @Column({ type: 'int' })
  userid_victime: number;

  @Column({ default: '' })
  ref: string;

  @Column({ default: false })
  isDone: boolean;

  @ManyToOne(() => UserEntity, (users) => users.userFraude)
  @JoinColumn({ name: 'userid_fraude' })
  usersFraude: UserEntity;

  @ManyToOne(() => UserEntity, (users) => users.userVictime)
  @JoinColumn({ name: 'userid_victime' })
  usersVictime: UserEntity;

  @CreateDateColumn() create_at: Date;

  @UpdateDateColumn() updated_at: Date;
}
