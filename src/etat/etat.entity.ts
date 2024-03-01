import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, OneToMany } from 'typeorm';
import { DemandeEntity } from 'src/demande/demande.entity';
import { WithdrawEntity } from '../withdraw/withdraw.entity';


@Entity()
export class EtatEntity extends BaseEntity {
	@PrimaryGeneratedColumn() id: number;

	@Column({ length: 25 })
	name: string;

	@OneToMany(() => DemandeEntity, (demandes) => demandes.etatid)
	demandes: DemandeEntity[];



	@OneToMany(() => WithdrawEntity, (withdraw) => withdraw.etatid)
	withdraws: WithdrawEntity[];
}
