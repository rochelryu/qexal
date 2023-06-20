import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	BaseEntity,
	UpdateDateColumn
} from 'typeorm';

@Entity()
export class SchoolarshipEntity extends BaseEntity {
	@PrimaryGeneratedColumn() id: number;

	@Column({ type: 'varchar' })
	address: string;

	@Column()
	subtitle: string;

    @Column({ type: 'varchar', length: 255, default: '' })
	cover: string;

	@Column({type: 'double'})
	amount: number;

    @Column({type: 'boolean', default: true})
	isActive: boolean;

	@CreateDateColumn() create_at: Date;

	@UpdateDateColumn() updated_at: Date;

    @Column({default: null}) expire_at: Date;
}
