import { UserEntity } from 'src/users/user.entity';
import { ForfaitEntity } from './../forfait/forfait.entity';
import { EtatEntity } from './../etat/etat.entity';
import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	BaseEntity,
	JoinColumn,
	ManyToOne,
	OneToMany, UpdateDateColumn
} from 'typeorm';

@Entity()
export class DemandeEntity extends BaseEntity {
	@PrimaryGeneratedColumn() id: number;

	@Column({ default: 2 })
	etatid: number;

	@Column({ length: 64 })
	ref: string;

	@Column({ type: 'double' })
	amount: number;

	@Column({ type: 'double', default: 0 })
	cumulPercentage: number;

	@Column({ type: 'double' })
	percentageTotal: number;

	@Column({ type: 'double' })
	commissionDay: number;

	@Column({ type: 'int' })
	forfaitid: number;

	@Column({ type: 'int', default: 0 })
	accord: number;

	@Column({ type: 'int' })
	userid: number;

	@ManyToOne(() => EtatEntity, (etat) => etat.demandes)
	@JoinColumn({ name: 'etatid' })
	etat: EtatEntity;

	@ManyToOne(() => ForfaitEntity, (forfait) => forfait.demandes)
	@JoinColumn({ name: 'forfaitid' })
	forfaits: ForfaitEntity;

	@ManyToOne(() => UserEntity, (users) => users.demandes)
	@JoinColumn({ name: 'userid' })
	users: UserEntity;

	@CreateDateColumn() create_at: Date;
	@Column({default: null}) expire_at: Date;
	@Column({default: null}) last_date_payement: Date;
	@UpdateDateColumn() updated_at: Date;
}
