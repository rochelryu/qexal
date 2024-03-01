
import { ControleCode } from 'src/common/enum/EnumControl';
import { UserEntity } from 'src/users/user.entity';
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

//Every Transaction Save in table
@Entity()
export class ControlCodeEntity extends BaseEntity {
    @PrimaryGeneratedColumn() id: number;

    @Column({ default: '' })
    txHash: string;

    @Column({ default: '' })
    type: ControleCode;

    @Column({ type: 'int' })
	userid: number;

	@Column({ type: 'double' })
	amount: number;

    @ManyToOne(() => UserEntity, (users) => users.controlCodes)
	@JoinColumn({ name: 'userid' })
	users: UserEntity;

    @CreateDateColumn() create_at: Date;

	@UpdateDateColumn() updated_at: Date;

}