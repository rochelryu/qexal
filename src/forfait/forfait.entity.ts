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

	@Column({ default: 30 })
	limit: number;

	@Column()
	cover: string;

	@Column({length: '64'})
	addressCrypto: string;

	@Column({ type: 'double', default: 1.3 })
	percentage: number;

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
