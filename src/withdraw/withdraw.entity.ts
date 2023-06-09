import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	BaseEntity,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn
} from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { EtatEntity } from 'src/etat/etat.entity';

@Entity()
export class WithdrawEntity extends BaseEntity {
	@PrimaryGeneratedColumn() id: number;

	@Column({ default: '' })
	ref: string;

	@Column({ type: 'double' })
	amount: number;

	@Column({ type: 'int' })
  userid: number;

  @Column({ type: 'int' })
	etatid: number;

	@Column({ default: '' })
  addressDestinate: string;

	@ManyToOne(() => EtatEntity, (etat) => etat.withdraws)
	@JoinColumn({ name: 'etatid' })
	etat: EtatEntity;

	@ManyToOne(() => UserEntity, (user) => user.withdraws)
	@JoinColumn({ name: 'userid' })
	user: UserEntity;

	@CreateDateColumn() create_at: Date;

	@UpdateDateColumn() updated_at: Date;
}
