import { SerialUserEntity } from './../message/serial-user.entity';
import { NotificationEntity } from './../notification/notification.entity';
import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	BaseEntity,
	JoinColumn,
	ManyToOne,
	OneToMany
} from 'typeorm';
import { RoleEntity } from '../role/role.entity';
import { DemandeEntity } from 'src/demande/demande.entity';
import { ControlCodeEntity } from 'src/control-code/control-code.entity';
import { WithdrawEntity } from 'src/withdraw/withdraw.entity';
import { UserMovieEntity } from 'src/entities/user_movie.entity';
@Entity()
export class UserEntity extends BaseEntity {
	@PrimaryGeneratedColumn() id: number;

	@Column({ length: 100 , default: ''})
	name: string;

  @Column({ default: '' })
  address: string;

  @Column({ default: '' })
  addressCrypto: string;

  @Column({ default: '' })
  newPasswordGenerated: string;

  @Column({ default: '' })
  addressSelfCrypto: string;

	@Column({ length: 50 })
  numberClient: string;

  @Column({ length: 50 })
  prefix: string;

  @Column({ length: 255 })
  country: string;

  @Column({ length: 50 })
  alpha2code: string;

  @Column({ length: 50 })
  region: string;

  @Column({ length: 50 })
  subregion: string;

  @Column({ length: 50, default: '' })
  flag: string;

  @Column({ length: 50 })
  language: string;

	@Column({ default: '' })
  iso639_1: string;

  @Column({ length: 50, default: '' })
	currencies: string;

	@Column({ length: 255 })
  password: string;

  @Column({ length: 255, default: '' })
	email: string;

	@Column({ length: 255, default: '' })
  motif: string;

	@Column({ length: 25 })
	recovery: string;

	@Column({ default: 1 })
  roleid: number;

  @Column({ default: 0, type: 'double' })
  soldeGain: number; //solde a retirié

  @Column({ default: 0, type: 'double' })
  soldeInvestissement: number; //montant investi

	@Column({ type: 'int', default: 0 })
	parrainid: number;

	@ManyToOne(() => RoleEntity, (role) => role.users)
	@JoinColumn({ name: 'roleid' })
  role: RoleEntity;

	@OneToMany(() => DemandeEntity, (demandes) => demandes.userid)
  demandes: DemandeEntity[];

  @OneToMany(() => UserMovieEntity, (userMovie) => userMovie.userid)
	userMovies: UserMovieEntity[];

  @OneToMany(() => WithdrawEntity, (withdraw) => withdraw.userid)
  withdraws: WithdrawEntity[];

  @OneToMany(() => ControlCodeEntity, (controlCode) => controlCode.userid)
  controlCodes: ControlCodeEntity[];

	@OneToMany(() => NotificationEntity, (notifications) => notifications.userid)
	notifications: NotificationEntity[];

	@OneToMany(() => SerialUserEntity, (fraude) => fraude.usersFraude)
	userFraude: SerialUserEntity[];

  @OneToMany(() => SerialUserEntity, (victime) => victime.usersVictime)
	userVictime: SerialUserEntity[];

	@Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  isWelcome: boolean;


  /* colone inscription :
     0 pour quelqu'un qui vient de s'inscrire alors redirect sur choiceforfait
     1 pour activer completement l'utilisateur
     2 pour quelqu'un qui a choice forfait
     3 pour quelqu'un qui est bloqué et qui attend que ses filleul pour le debloquer.
     4 pour ceux qui on été bloqué par les admins


  */
	@Column({default: 0})
  inscription: number;

  @Column({default: 0})
	retraitInWait: number;

	@CreateDateColumn() create_at: Date;

	@UpdateDateColumn() updated_at: Date;

	@Column({default: null}) validEntryInSysteme: Date; //date de versement adhesion
	@Column({default: null}) dateRetry: Date; //date de versement adhesion
}
