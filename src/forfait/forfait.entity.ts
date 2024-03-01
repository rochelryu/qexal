import { DemandeEntity } from './../demande/demande.entity';
import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	BaseEntity,
	OneToMany,
	UpdateDateColumn
} from 'typeorm';
import { UserEntity } from 'src/users/user.entity';

@Entity()
export class ForfaitEntity extends BaseEntity {
	@PrimaryGeneratedColumn() id: number;

	@Column({length: '255', default:''})
	name: string;

	@Column({ default: 30, type: 'int' })
	limit: number;

	@Column()
	cover: string;

	@Column({length: '255'})
	addressCrypto: string;

	@Column({ type: 'double', default: 1.3 })
	commissionTotal: number;

	@Column({ type: 'double', default: 0.0 })
	percentageWithdraw: number;

	@Column({ type: 'double', default: 1 })
	min: number;

	@Column({ type: 'double', default: 1 })
	max: number;

	@Column({ type: 'int', default: 1 })
	numberDayTotalVersement: number;

	@Column({ type: 'boolean', default: true })
	isActive: number;

	@OneToMany(() => DemandeEntity, (demandes) => demandes.forfaitid)
	demandes: DemandeEntity[];

	@CreateDateColumn() create_at: Date;

	@UpdateDateColumn() updated_at: Date;
}
