import { NotificationEntity } from './../notification/notification.entity';
import { SerialUserEntity } from './../message/serial-user.entity';

import { ForfaitEntity } from './../forfait/forfait.entity';
import { DemandeEntity } from 'src/demande/demande.entity';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Not, Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { coreEncode } from 'crypto-core';
import { User } from './user.dto';
import { ResponseProvider } from 'src/common/interfaces/response.interface';
import { formatedEndpointcrypto, generateRecoveryForHelp } from 'src/common/functions/helper';
import { MoreThanDate, MoreThanOrEqualDate, BetweenDate } from 'src/common/functions/date';
import { EDateType, MotifLocked } from 'src/common/enum/EnumDate';
import { compare, hash } from 'bcrypt';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { addDays, getDay } from 'date-fns';
import { ControlCodeEntity } from 'src/control-code/control-code.entity';
import { ControleCode } from 'src/common/enum/EnumControl';
import { ADDRESS_BILLIONARY_INVESTMENT_FOR_SUBSRIPTION, ADDRESS_TROVA_EXCHANGE, ADDRESS_TROVA_INVESTMENT } from 'src/common/constant/constant';
import { MovieEntity } from 'src/entities/movie.entity';
import { UserMovieEntity } from 'src/entities/user_movie.entity';
import { SchoolarshipEntity } from 'src/entities/schoolarship.entity';

@Injectable()
export class UsersService {
	private date: string[] = [
		'Janvier',
		'Fevrier',
		'Mars',
		'Avril',
		'Mai',
		'Juin',
		'Juillet',
		'Août',
		'Septembre',
		'Octobre',
		'Novembre',
		'Decembre'
	];
	private indexDay = new Date().getDate();
	private logger: Logger = new Logger('UsersServices');
	private myDateRange: Date[] = [];
	private myDateMonth: string[] = [];
	constructor(
		@InjectRepository(UserEntity) private usersRepository: Repository<UserEntity>,
		@InjectRepository(DemandeEntity) private demandesRepository: Repository<DemandeEntity>,
		@InjectRepository(ForfaitEntity) private forfaitRepository: Repository<ForfaitEntity>,
		@InjectRepository(NotificationEntity) private notificationRepository: Repository<NotificationEntity>,
		@InjectRepository(MovieEntity) private movieRepository: Repository<MovieEntity>,
		@InjectRepository(UserMovieEntity) private userMovieRepository: Repository<UserMovieEntity>,
		@InjectRepository(SchoolarshipEntity) private schoolarshipRepository: Repository<SchoolarshipEntity>,

		@InjectRepository(SerialUserEntity) private serialUserRepository: Repository<SerialUserEntity>,

    @InjectRepository(ControlCodeEntity) private controlCodeRepository: Repository<ControlCodeEntity>,
	) {
		for (let i = 0; i < 3; i++) {
			this.myDateRange.push(new Date(new Date().setDate(this.indexDay - i)));
		}
	}

	_myDateRange() {
		return this.myDateRange;
	}

	async getUsers(): Promise<UserEntity[]> {
		return await this.usersRepository.find({where: {}});
	}


	async getUsersNoFilter(): Promise<UserEntity[]> {
		return await this.usersRepository.find();
	}

	async getUsersAccountSupZero(): Promise<UserEntity[]> {
		return await this.usersRepository.find({where: {soldeGain: MoreThan(2)}, order: { id: 'ASC' }});
	}
	

	async getUsersWhichRef(): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.demandesRepository
				.find({ order: { updated_at: 'ASC' } })
				.then((res) => {
					next({ etat: true, result: res });
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("Server side error has occurred, please try again later")
					})
				);
		});
	}


	async getUsersLocked(): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.usersRepository.find({where: {isActive: false}})
				.then((result) => {next({ etat: true, result })})
				.catch((error) => {next({ etat: false, error })});
		});
  }


  async getUsersInWaitPayement(): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.usersRepository.find({where: {retraitInWait: 1}, order: {dateRetry: 'ASC'}})
				.then((result) => {next({ etat: true, result })})
				.catch((error) => {next({ etat: false, error })});
		});
	}

	async getCountUsers(): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.usersRepository
				.count()
				.then((result) => next({ etat: true, result }))
				.catch((error) => next({ etat: false, error }));
		});
  }

  async getCountUserFollowInRange(dateMatrixCount: Date, parrainid: number): Promise<ResponseProvider> {
		return new Promise(async (next) => {

      const current = await this.usersRepository
        .query('SELECT COUNT(id) as nombre FROM user_entity WHERE parrainid = ? AND validEntryInSysteme > ? AND accord = 1 AND filleulForMatrix = 1', [
          parrainid, dateMatrixCount
        ]);
			next({ etat: true, result: current[0].nombre });
		});
  }

  async getAllAccountInWaitingRetraitForAnnulation(): Promise<ResponseProvider> {
	return new Promise(async (next) => {

			const current = await this.usersRepository.query('select userreceptionid from traitement_entity where etatid = 1 or etatid = 2 group by userreceptionid');
				next({ etat: true, result: current });
				});
			}

	

  async getUserFollowInRange(dateMatrixCount: Date, parrainid: number): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.usersRepository
      .query('SELECT * FROM user_entity WHERE parrainid = ? AND validEntryInSysteme > ? AND accord = 1 AND filleulForMatrix = 1', [
        parrainid, dateMatrixCount
      ]).then((result) => {
					next({ etat: true, result });
				})
				.catch((error) =>
					next({
						etat: false,
						error
					})
				);
		});
	}


	async getCountUsersLockedNotResfresh(): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.usersRepository
				.count({where: {isActive: false}})
				.then((result) => next({ etat: true, result }))
				.catch((error) => next({ etat: false, error }));
		});
  }


	async getCountUsersNotPay(): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.usersRepository
				.count({where: {isActive: false, motif: MotifLocked.NotPay}})
				.then((result) => next({ etat: true, result }))
				.catch((error) => next({ etat: false, error }));
		});
	}

  async updateUser(id: number, result: any): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.usersRepository
				.update(id, result)
				.then((result) => {
					next({ etat: true, result });
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("l'enregistrement de l'utilisateur a échoué, veuillez ressayer plutard")
					})
				);
		});
	}

	async lockedUserByAdmin(id: number, isActive: boolean, motif: string): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.usersRepository
				.findOne({ where: { id }})
				.then(async (result) => {
						result.isActive = isActive;
						result.motif = motif;
            result.inscription = 0;
						await result.save();
						next({ etat: true, result });
				})
				.catch((error) =>
					next({
						etat: false,
						error
					})
				);
		});
	}

	async getCountUsersConnectedToDay(toDay: Date = new Date()): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			// eslint-disable-next-line @typescript-eslint/camelcase
			const current = await this.usersRepository.count({
				// eslint-disable-next-line @typescript-eslint/camelcase
        //updated_at: MoreThanOrEqualDate(toDay, EDateType.Date),
        where: {inscription: 1}
			});

			next({ etat: true, result: current });
		});
  }

  async getCountUsersAdhesionToDay(): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			// eslint-disable-next-line @typescript-eslint/camelcase
			const current = await this.usersRepository.count({
				// eslint-disable-next-line @typescript-eslint/camelcase
        //validEntryInSysteme: MoreThanOrEqualDate(new Date(), EDateType.Date),
        where: {inscription: 1}
			});

			next({ etat: true, result: current });
		});
	}

	async getUserByItem(item): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.usersRepository
				.findOne({where: item})
				.then((result) => {
					if (result) {
						next({ etat: true, result });
					} else {
						next({ etat: false, error: new Error('Verifié vos coordonnés') });
					}
				})
				.catch((error) => next({ etat: false, error }));
		});
	}

	async getUserByQueryForRecupTrueRef(): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			const info = await this.usersRepository.query("select ref, id from user_entity where ref != '' and ref != 'old-'");
			next({ etat: true, result: info });
		});
	}

	async getUsersByItem(item): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.usersRepository
				.find({where: item})
				.then((result) => {
					if (result) {
						next({ etat: true, result });
					} else {
						next({ etat: false, error: new Error('Verifié vos coordonnés') });
					}
				})
				.catch((error) => next({ etat: false, error }));
		});
	}

	async getUserByAndChangeInfo(
		id: number,
		name: string,
		numberClient: string,
	address: string,
    addressCrypto: string,
    
		password: string,
	): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.usersRepository
				.findOne({ where: { id }})
				.then(async (result) => {
					if (result && await compare(password.trim(), result.password)) {
						result.name = name.trim();
						result.numberClient = numberClient.trim();
						result.address = address.trim();
						result.addressCrypto = addressCrypto.toLowerCase().trim();
						await result.save();
						next({ etat: true, result });
					} else {
						next({ etat: false, error: new Error('Verifié vos coordonnés') });
					}
				})
				.catch((error) => next({ etat: false, error }));
		});
	}

	async getUserForChangePass(id: number, newPass: string, password: string): Promise<ResponseProvider> {
		const newPassWord = await hash(newPass.trim(), Number(process.env.CRYPTO_DIGEST));
		return new Promise(async (next) => {
			await this.usersRepository
				.findOne({ where: { id }})
				.then(async (result) => {
					if (result && await compare(password.trim(), result.password)) {
						result.password = newPassWord;
						await result.save();
						next({ etat: true, result });
					} else {
						next({ etat: false, error: new Error('Verifié vos coordonnés') });
					}
				})
				.catch((error) => next({ etat: false, error }));
		});
	}

	async verifyUserForConnect(numberClient: string, password: string): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.usersRepository
				.findOne({where: { numberClient}})
				.then(async (result) => {
          if (result) {
            const state = await compare(password, result.password)
			if(state) {
              // eslint-disable-next-line @typescript-eslint/camelcase
              result.updated_at = new Date();
              await result.save();
						next({ etat: true, result });
            } else {
              next({ etat: false, error: new Error('Verified your password') });
            }
					} else {
						next({ etat: false, error: new Error('Verified your number') });
					}
				})
				.catch((error) => next({ etat: false, error }));
		});
	}

	async verifyUserApi(id: number, recovery: string): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.usersRepository.findOne({where: { id, recovery}})
			.then(async (result) => {
          if (result) {
			next({ etat: true, result });
		  } else {
			  next({ etat: false, error: new Error('Verified identifiant') });
			}
		})
		.catch((error) => next({ etat: false, error }));
		});
	}

	async createUser(user: User): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.usersRepository
				.findOne({
					where : {email: user.email.trim()}
				})
				.then(async (res) => {
					if (res) {
						next({ etat: false, error: new Error('This email is already associated with another account') });
					} else {
						const { numero, password, name, email } = user;
						const recovery = await generateRecoveryForHelp();
						const pass = await hash(password.trim(), Number(process.env.CRYPTO_DIGEST));
						await this.usersRepository
							.save({
                				parrainid : 3,
								numberClient: numero.trim(),
								name: name.trim(),
	              				email: email.trim(),
								recovery,
								password: pass,
								endForfait: new Date(),
								prefix: user.prefix,
								alpha2code: user.alpha2code,
								region: user.region,
								subregion: user.subregion,
								country: user.country,
								flag: '',
								language: user.language,
								currencies: user.currencies,
								// eslint-disable-next-line @typescript-eslint/camelcase
								iso639_1: user.iso639_1,
							})
							.then((result) => {
								next({ etat: true, result });
							})
							.catch((error) => next({ etat: false, error: error }));
					}
				})
				.catch((error) => next({ etat: false, error }));
		});
	}

	async updateUserForExpiration(id: number): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.usersRepository
				.findOne({where: {id}})
				.then(async (res) => {
					res.inscription = 0;
					await res.save()
					next({ etat: true, result: res });
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("Server side error has occurred, please try again later")
					})
				);
		});
  }

  async updateUserForPayeSolde(id: number, soldeGain: number, soldeInvestissement: number): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.usersRepository
				.findOne({where: {id}})
				.then(async (res) => {
          res.soldeGain = soldeGain;
          res.soldeInvestissement = soldeInvestissement;
					await res.save()
					next({ etat: true, result: res });
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("Server side error has occurred, please try again later")
					})
				);
		});
	}


	async updateUserForUnlock(id: number): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.usersRepository
				.findOne({where: {id}})
				.then(async (res) => {
					res.isActive = true;
					await res.save()
					next({ etat: true, result: res });
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("Server side error has occurred, please try again later")
					})
				);
		});
  }

  async demographieUser(): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.usersRepository
				.query('SELECT COUNT(id) nombre, alpha2code FROM user_entity GROUP BY alpha2code')
				.then((res) => {
					next({ etat: true, result: res });
				})
				.catch((error) =>
					next({
						etat: false,
						error
					})
				);
		});
	}



  async deleteUser(id: number): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.usersRepository
				.findOne({ where: { id }})
				.then(async (result) => {
					if (result) {
						const res = result;
						await this.usersRepository.remove(result)
						next({ etat: true, result: res });
					} else {
						next({
							etat: false,
							error: new Error("Utilisateur introuvable")
						});
					}
				})
				.catch((error) =>
					next({
						etat: false,
						error
					})
				);
		});
	}

	// get forfait information in table

	async getAllForfait(): Promise<ForfaitEntity[]> {
		return await this.forfaitRepository.find({order: {min: "ASC"}});
  }
  async updateForfait(id: number, result: any): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.forfaitRepository
				.update(id, result)
				.then((result) => {
					next({ etat: true, result });
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("l'enregistrement de l'utilisateur a échoué, veuillez ressayer plutard")
					})
				);
		});
	}

  async setForfait(montant: number, inscription: number, name: string, color: string): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.forfaitRepository
				.save({})
				.then((result) => {
					next({ etat: true, result });
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("l'enregistrement du forfait a échoué, veuillez ressayer plutard")
					})
				);
		});
  }

	// get demande information in table

  async getCountDemandeByUserInRange(endContratTime: Date, userid: number): Promise<ResponseProvider> {
		return new Promise(async (next) => {
      const current = await this.demandesRepository
        .query('SELECT COUNT(id) as nombre FROM demande_entity WHERE userid = ? AND create_at >= ?', [
          userid, endContratTime
        ]);

			next({ etat: true, result: current[0].nombre });
		});
	}

	async getCountDemandeByUserInRangeNoFilter(endContratTime: Date, userid: number): Promise<ResponseProvider> {
		return new Promise(async (next) => {
      const current = await this.demandesRepository
        .query('SELECT COUNT(id) as nombre FROM demande_entity WHERE userid = ? AND create_at >= ?', [
          userid, endContratTime
        ]);

			next({ etat: true, result: current[0].nombre });
		});
	}

  	async getAllDemandesYesterday(yesTerDay: Date): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.demandesRepository.find({
				where: {// eslint-disable-next-line @typescript-eslint/camelcase
        //updated_at: MoreThanOrEqualDate(yesTerDay, EDateType.Date),
	}, relations: ['forfaits']
			})
      .then(res => {
					next({ etat: true, result:res });
				})
				.catch((error) =>
					next({
						etat: false,
						error
					})
				);
		});
  }

	async getDemandeWaitOrLoading2(userId: number): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.demandesRepository
				.query(
					'SELECT * FROM demande_entity WHERE userid = ? AND (etatid = ? OR etatid = ?)) OR (userid = ? AND etatid = 3) LIMIT 2',
					[ userId, 1, 2, userId ]
				)
				.then((res) => {
					if (res.length > 1) {
						next({
							etat: false,
							error: new Error("Vous avez déjà des demandes d'aide pas terminées")
						});
					} else {
						next({ etat: true, result: res });
					}
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("Server side error has occurred, please try again later")
					})
				);
		});
	}


	async getCountDemandeUserForPostNewDemande(userid: number): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.demandesRepository
				.count({ where: { userid }})
				.then(async (res) => {
					const valide = await this.demandesRepository.count({ where: { userid}})
					next({ etat: (res === valide && res > 0) ? true : false });
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("Server side error has occurred, please try again later")
					})
				);
		});
	}

	async getDemandeWaitForAuto(userId: number, id: number): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.demandesRepository
				.query(
					'SELECT * FROM demande_entity WHERE userid = ? AND id > ?',
					[ userId, id ]
				)
				.then((res) => {
					if (res.length === 0) {
						next({ etat: true, result: res });

					} else {
						next({
							etat: false,
							error: new Error("Vous avez déjà des demandes d'aide pas terminées")
						});
					}
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("Server side error has occurred, please try again later")
					})
				);
		});
	}

	async getDemandeWaitOrLoading(userId: number): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.demandesRepository
				.query(
					'SELECT * FROM demande_entity WHERE (userid = ? AND (etatid = ? OR etatid = ?)) OR (userid = ? AND etatid = 3) LIMIT 1',
					[ userId, 1, 2, userId ]
				)
				.then((res) => {
					if (res.length > 1) {
						next({
							etat: false,
							error: new Error("Vous avez déjà des demandes d'aide pas terminées")
						});
					} else {
						next({ etat: true, result: res });
					}
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("Server side error has occurred, please try again later")
					})
				);
		});
	}

	async getCountDemandeFinished(): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.demandesRepository
				.count({where:{etatid: 3}})
				.then((result) => next({ etat: true, result }))
				.catch((error) => next({ etat: false, error }));
		});
	}

	async getAllDemandeWait(): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.demandesRepository
				.find({where: { etatid: 1 }})
				.then((res) => {
					if (res.length > 0) {
						next({ etat: true, result: res });
					} else {
						next({
							etat: false,
							error: new Error('Aucune demande en Attente')
						});
					}
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("Server side error has occurred, please try again later")
					})
				);
		});
  }

  async getAllDemandeWaitForMY(): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.demandesRepository
				// eslint-disable-next-line @typescript-eslint/camelcase
				.find({ where : { etatid: 3}, order: { updated_at: 'ASC'}, relations: [ 'forfaits', 'users' ]})
				.then((result) => {
					next({ etat: true, result });
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("Server side error has occurred, please try again later")
					})
				);
		});
	}
	async getAllDemandeByUserid(userid: number): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.demandesRepository
				.find({ where: { userid },order: { id: 'DESC' }, relations: [ 'forfaits' ] })
				.then((res) => {
					next({ etat: true, result: res });
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("Server side error has occurred, please try again later")
					})
				);
		});
  }

  async repousserDemandeById(id: number): Promise<ResponseProvider> {
	return new Promise(async (next) => {
		await this.demandesRepository
			.findOne({where: { id }})
			.then(async (result) => {
				if (result && result.accord === 2) {
					result.create_at = new Date();
					await result.save().then(res => next({ etat: true, result: res })).catch(error => next({ etat: false, error }))
				} else {
					next({
						etat: false,
						error: new Error("Cette Demande n'est pas en attente")
					});
				}
			})
			.catch((error) =>
				next({
					etat: false,
					error
				})
			);
	});
}

  async deleteDemande(id: number): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.demandesRepository
				.findOne({where:{ id }})
				.then(async (result) => {
					if (result && result.accord !== 3) {
						const res = result;
						await this.demandesRepository.remove(result)
						next({ etat: true, result: res });
					} else {
						next({
							etat: false,
							error: new Error("Cette Demande n'est pas en attente")
						});
					}
				})
				.catch((error) =>
					next({
						etat: false,
						error
					})
				);
		});
	}

	async getForfaitById(id: number): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.forfaitRepository
				.findOne({where: { id }})
				.then((res) => {
					next({ etat: true, result: res });
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("Server side error has occurred, please try again later")
					})
				);
		});
  }
  async getForfaitByItem(item): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.forfaitRepository
				.findOne({where: item})
				.then((result) => {
					if (result) {
						next({ etat: true, result });
					} else {
						next({ etat: false, error: new Error('Verifié vos coordonnés') });
					}
				})
				.catch((error) => next({ etat: false, error }));
		});
	}

	async getAllDemande(): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.demandesRepository
				.find({ relations: [ 'forfaits', 'users' ] })
				.then((res) => {
					next({ etat: true, result: res });
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("Server side error has occurred, please try again later")
					})
				);
		});
	}

	async getDemandeLoadingByUserId(userid: number): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.demandesRepository
				.findOne({where: { userid, etatid: 2 }})
				.then(
					(res) =>
						res
							? next({
									etat: false,
									error: new Error('Vous avez déjà une aide en cours')
								})
							: next({ etat: true, result: res })
				)
				.catch((error) =>
					next({
						etat: false,
						error: new Error("Server side error has occurred, please try again later")
					})
				);
		});
	}

	async getDemandeFinishedAndNoCheck(userid: number): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.demandesRepository
				// eslint-disable-next-line @typescript-eslint/camelcase
				.findOne({ where: { etatid: 3, userid: Not(userid) }, order: { updated_at: 'ASC' } })
				.then((res) => {
					if (res) {
						next({ etat: true, result: res });
					} else {
						next({
							etat: false,
							error: new Error("Aucune Demande est terminé et en Attente pour l'instant")
						});
					}
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("Server side error has occurred, please try again later")
					})
				);
		});
	}

	async getDemandeFinishedAndNoCheckFilterByForfait(userid: number, forfaitid: number): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.demandesRepository
				// eslint-disable-next-line @typescript-eslint/camelcase
				.findOne({ where: { etatid: 3, forfaitid, userid: Not(userid) }, order: { updated_at: 'ASC' } })
				.then((res) => {
					if (res) {
						next({ etat: true, result: res });
					} else {
						next({
							etat: false,
							error: new Error("Aucune Demande est terminé et en Attente pour l'instant")
						});
					}
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("Server side error has occurred, please try again later")
					})
				);
		});
	}

	async getAllDemandeFinishedAndNoCheck(forfaitid: number): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.demandesRepository
				// eslint-disable-next-line @typescript-eslint/camelcase
				.find({ where: { etatid: 3, forfaitid }, order: { updated_at: 'ASC' }, relations : ['forfaits', 'users'] })
				.then((res) => {
					next({ etat: true, result: res });
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("Server side error has occurred, please try again later")
					})
				);
		});
	}
	async getLastDemandeForSuivie(userid: number): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.demandesRepository
				.findOne({ where: { userid }, order: { id: 'DESC' } })
				.then((res) => {
					if (res) {
						next({ etat: true, result: res });
					} else {
						next({
							etat: false,
							error: new Error('Aucune Demande Trouvé')
						});
					}
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("Server side error has occurred, please try again later")
					})
				);
		});
	}

	async getLastDemandeForSuivieForUnlocked(userid: number): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.demandesRepository
				.findOne({ where: { userid }, order: { id: 'DESC' } })
				.then(async (res) => {
					if (res) {
						// eslint-disable-next-line @typescript-eslint/camelcase
						res.create_at = new Date();
						await res.save();
						next({ etat: true, result: res });
					} else {
						next({
							etat: false,
							error: new Error('Aucune Demande Trouvé')
						});
					}
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("Server side error has occurred, please try again later")
					})
				);
		});
	}

	async getLastDemandeForUpdateDate(userid: number): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.demandesRepository
				.findOne({ where: { userid }, order: { id: 'DESC' } })
				.then(async (res) => {
					if (res) {
						// eslint-disable-next-line @typescript-eslint/camelcase
						res.updated_at = new Date()
						await res.save()
						next({ etat: true, result: res });
					} else {
						next({
							etat: false,
							error: new Error('Aucune Demande Trouvé')
						});
					}
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("Server side error has occurred, please try again later")
					})
				);
		});
	}

	async getLastDemandeForSuivie2(userid: number): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.demandesRepository
				.query('SELECT * FROM demande_entity WHERE userid = ? and etatid = 3 ORDER BY id DESC LIMIT 3', [
					userid
				])
				.then((res) => {
					if (res.length > 0) {
						next({ etat: true, result: res });
					} else {
						next({ etat: false, error: new Error('Aucun traitement fait') });
					}
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("Server side error has occurred, please try again later")
					})
				);
		});
	}

	async getDemandeById(id: number): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.demandesRepository
				.findOne({ where: { id }, relations: [ 'forfaits', 'users' ] })
				.then((res) => {
					if (res) {
						next({ etat: true, result: res });
					} else {
						next({
							etat: false,
							error: new Error("Aucune Demande est terminé et en Attente pour l'instant")
						});
					}
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("Server side error has occurred, please try again later")
					})
				);
		});
	}

	async setDemande(forfaitid: number, userid: number): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.demandesRepository
				// eslint-disable-next-line @typescript-eslint/camelcase
				.save({ forfaitid, userid, updated_at: new Date(), create_at: new Date() })
				.then((result) => {
					next({ etat: true, result });
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("l'enregistrement du forfait a échoué, veuillez ressayer plutard")
					})
				);
		});
  }
  async setDemandeMY(forfaitid: number, userid: number, etatid: number, finality: number): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.demandesRepository
				// eslint-disable-next-line @typescript-eslint/camelcase
				.save({ forfaitid, userid, updated_at: new Date(), etatid, finality, create_at: new Date() })
				.then((result) => {
					next({ etat: true, result });
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("l'enregistrement du forfait a échoué, veuillez ressayer plutard")
					})
				);
		});
	}

	async updateDemande(demandeid: number, result: any): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.demandesRepository
				.update(demandeid, result)
				.then((result) => {
					next({ etat: true, result });
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("l'enregistrement du forfait a échoué, veuillez ressayer plutard")
					})
				);
		});
	}

	async updateDemandeForlocked(userid: number): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.demandesRepository
				.update({userid}, {etatid:3})
				.then((result) => {
					next({ etat: true, result });
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("l'enregistrement du forfait a échoué, veuillez ressayer plutard")
					})
				);
		});
	}

	async getCountDemandeForStatToDay(forfaitid: number): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			// eslint-disable-next-line @typescript-eslint/camelcase
			const current = await this.demandesRepository.count({where: {
				forfaitid,
				// eslint-disable-next-line @typescript-eslint/camelcase
				//create_at: MoreThanOrEqualDate(this.myDateRange[0], EDateType.Date)
			}});
			const month1 = await this.demandesRepository.count({where: {
				forfaitid,
				// eslint-disable-next-line @typescript-eslint/camelcase
				//create_at: BetweenDate(this.myDateRange[1], this.myDateRange[0], EDateType.Date)
			}});
			const month2 = await this.demandesRepository.count({where: {
				forfaitid,
				// eslint-disable-next-line @typescript-eslint/camelcase
				//create_at: BetweenDate(this.myDateRange[2], this.myDateRange[1], EDateType.Date)
			}});


			next({ etat: true, result: [ current, month1, month2 ] });
		});
	}

	// notifications table

	async setNotification(userid: number, type: number, content: string): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.notificationRepository
				.save({ userid, type, content })
				.then((result) => {
					next({ etat: true, result });
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("l'enregistrement du forfait a échoué, veuillez ressayer plutard")
					})
				);
		});
	}

	async getNotificationsByUserid(userid: number): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.notificationRepository
				.find({ where: { userid } })
				.then((res) => {
					next({ etat: true, result: res });
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("Server side error has occurred, please try again later")
					})
				);
		});
  }

  async getLatestNotifications(): Promise<ResponseProvider> {
	return new Promise(async (next) => {
		await this.notificationRepository
			.query("SELECT notification_entity.content, notification_entity.type, user_entity.name, notification_entity.create_at FROM notification_entity LEFT JOIN user_entity ON notification_entity.userid= user_entity.id WHERE notification_entity.isOpen=1 ORDER BY notification_entity.id DESC LIMIT 15")
			.then((res) => {
				next({ etat: true, result: res });
			})
			.catch((error) =>
				next({
					etat: false,
					error: new Error("Server side error has occurred, please try again later")
				})
			);
	});
}

  async deleteAllNotificationsByUserid(userid: number): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.notificationRepository
				.find({ where: { userid } })
				.then(async(res) => {
          for(let i = 0; i < res.length; i++) {
            await this.notificationRepository.remove(res[i])
          }
					next({ etat: true, result: res });
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("Server side error has occurred, please try again later")
					})
				);
		});
	}

	async getCountNotificationsByUserid(userid: number): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.notificationRepository
				.count({ where: { userid, isOpen: false }})
				.then((res) => {
					next({ etat: true, result: res });
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("Server side error has occurred, please try again later")
					})
				);
		});
	}

	async updateNotificationsByUserid(userid: number, result: any): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.notificationRepository
				.find({where: { userid }})
				.then(async (result) => {
					for (let i = 0; i < result.length; i++) {
						result[i].isOpen = true;
						await result[i].save();
					}
					next({ etat: true, result });
				})
				.catch((error) =>
					next({
						etat: false,
						error: error
					})
				);
		});
  }


  // scrap TxHash

	async convertMoney(value:number): Promise<ResponseProvider> {
        const url = `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=7HQZ18D5IZ7CC313Y31XTY5GPWC53GR6F8`; // URL we're scraping
        const AxiosInstance = axios.create();
		    return new Promise(async (next) => {
            AxiosInstance.get(url)
                .then( // Once we have data returned ...
                    response => {
                    const json = response.data;
					const dollars = parseFloat(json.result.ethusd);

                    next({etat:true, result: dollars * value})
                    }
                )
                .catch(error => {next({etat:false, error})});

			});
	}

  async verifyTxHash(ref: string, value: number, destinationAddress: string = ADDRESS_TROVA_INVESTMENT): Promise<ResponseProvider> {
        const url = `https://etherscan.io/tx/${ref}`; // URL we're scraping
        const AxiosInstance = axios.create();
		return new Promise(async (next) => {
            AxiosInstance.get(url)
                .then( // Once we have data returned ...
                    async response => {
						const html = response.data;
						const $ = cheerio.load(html);
						const state = $('span.u-label.u-label--sm');
						const montant = $('#ContentPlaceHolder1_spanValue > span');
						const destination = $('#contractCopy');
						const arrayMontant = montant.text().trim().split('ETH');
						const valueEth = parseFloat(arrayMontant[0]);
						const montantUsd = await this.convertMoney(valueEth);
						if(state.text().trim() === "Success" && destination.text().trim() === destinationAddress) {
							if((value - montantUsd.result) <= 1) {
								next({etat:true, result: {ref, montant: 0, montant_net_send: montantUsd.result}})
							} else {
								next({etat:false, result: {ref, montant: value - montantUsd.result, montant_net_send: montantUsd.result}, error: new Error("incomplete transaction")});
							}
							
						} else if(state.text().trim() === "Pending") {
							next({etat:false, error: new Error("this transaction is still in progress so please reach for it to be completed before entering the TxHash code")})
						} else {
							next({etat:false, error: new Error("this transaction has failed, please make a new transaction to sign your contract")})
						}
                    }
                )
                .catch(error => {next({etat:false, error})});

		});

  }

  async getValueInCurrencie(fromCurrencie: string, toCurrencie: string): Promise<ResponseProvider> {
        const url = `https://wise.com/fr/currency-converter/${fromCurrencie.toLocaleLowerCase()}-to-${toCurrencie.toLocaleLowerCase()}-rate?amount=1`; // URL we're scraping
        const AxiosInstance = axios.create();
		return new Promise(async (next) => {
            AxiosInstance.get(url)
                .then( // Once we have data returned ...
                    async response => {
						const html = response.data;
						const $ = cheerio.load(html);
						const value = $('#calculator span.text-success').text().trim();
                        next({etat:true, result: {fromCurrencie: fromCurrencie.toLocaleUpperCase(), toCurrencie: toCurrencie.toLocaleUpperCase(), value: parseFloat(value).toFixed(2)}})
                    }
                )
                .catch(error => {next({etat:false, error})});

		});

  }

  async getValueOfLittle(): Promise<ResponseProvider> {
	const url = `https://coinmarketcap.com/fr/currencies/little-rabbit/`; // URL we're scraping
	const AxiosInstance = axios.create();
	return new Promise(async (next) => {
		AxiosInstance.get(url)
			.then( // Once we have data returned ...
				async response => {
				const html = response.data;
				const $ = cheerio.load(html);
				const value = $('div.priceValue.smallerPrice');
				
				
				next({etat: true, result:value.text().trim()});
				}
			)
			.catch(error => {next({etat:false, error})});

	});

}

  async verifyTxHashAllTypeCrypto(ref: string, value: number, destinationAddress: string = ADDRESS_BILLIONARY_INVESTMENT_FOR_SUBSRIPTION, endpointcrypto: string = 'bitcoin'): Promise<ResponseProvider> {
	  if(endpointcrypto.toLocaleLowerCase().indexOf('binance coin') !== -1) {
		  return await this.verifyTxHashForExchangeBinanceCoin(ref, value, destinationAddress);
	  } else if(endpointcrypto.toLocaleLowerCase().indexOf('ethereum') !== -1) {
		return await this.verifyTxHashForExchange(ref, value);
	  }  else if(endpointcrypto.toLocaleLowerCase().indexOf('tron') !== -1) {
		return await this.verifyTxHashForTronx(ref, value, destinationAddress);
	  } else if(endpointcrypto.toLocaleLowerCase().indexOf('usdt - trc20') !== -1) {
		return await this.verifyTxHashForTronx(ref, value, destinationAddress, true);
	  }  else if(endpointcrypto.toLocaleLowerCase().indexOf('shiba inu - erc20') !== -1) {
		return await this.verifyTxHashForExchangeShibaInuErc20(ref, value, destinationAddress);
	  } else if(endpointcrypto.toLocaleLowerCase().indexOf('shibnobi shinja - erc20') !== -1) {
		return await this.verifyTxHashForExchangeShibnobiShinjaErc20(ref, value, destinationAddress);
	  }else if(endpointcrypto.toLocaleLowerCase().indexOf('radio caca v2 - erc20') !== -1) {
		return await this.verifyTxHashForExchangeUniversalClassicErc20(ref, value, destinationAddress, 'Radio Caca V... (RACA)');
	  } else if(endpointcrypto.toLocaleLowerCase().indexOf('shiba inu - bep20') !== -1) {
		return await this.verifyTxHashForExchangeShibaInuBep20(ref, value, destinationAddress);
	  } else if(endpointcrypto.toLocaleLowerCase().indexOf('pappay') !== -1) {
		return await this.verifyTxHashForExchangePappayBep20(ref, value, destinationAddress);
	  } else if(endpointcrypto.toLocaleLowerCase().indexOf('metacity') !== -1) {
		return await this.verifyTxHashForExchangeMetaCityBep20(ref, value, destinationAddress);
	  } else if(endpointcrypto.toLocaleLowerCase().indexOf('silva token') !== -1) {
		return await this.verifyTxHashForExchangeUniversalClassicBep20(ref, value, destinationAddress, 'Silva Token (SILVA)');
	  } else if(endpointcrypto.toLocaleLowerCase().indexOf('web3 inu') !== -1) {
		return await this.verifyTxHashForExchangeUniversalClassicBep20(ref, value, destinationAddress, 'WEB3 Inu (WEB3)');
	  } else if(endpointcrypto.toLocaleLowerCase().indexOf('baby musk coin') !== -1) {
		return await this.verifyTxHashForExchangeUniversalClassicBep20(ref, value, destinationAddress, 'BabyMUSK (BabyMU...)');
	  } else if(endpointcrypto.toLocaleLowerCase().indexOf('little rabbit') !== -1) {
		return await this.verifyTxHashForExchangeUniversalClassicBep20(ref, value, destinationAddress, 'LITTLE RABBI... (LTRBT)');
	  } else if(endpointcrypto.toLocaleLowerCase().indexOf('radio caca v2 - bep20') !== -1) {
		return await this.verifyTxHashForExchangeUniversalClassicBep20(ref, value, destinationAddress, 'Radio Caca V... (RACA)');
	  } else if(endpointcrypto.toLocaleLowerCase().indexOf('saitama') !== -1) {
		return await this.verifyTxHashForExchangeSaitamaErc20(ref, value, destinationAddress);
	  } else if(endpointcrypto.toLocaleLowerCase().indexOf('little rabbit') !== -1) {
		return await this.verifyTxHashForExchangeLittleRabbitBep20(ref, value, destinationAddress);
	  } else if(endpointcrypto.toLocaleLowerCase().indexOf('ariva - bep20') !== -1) {
		return await this.verifyTxHashForExchangeArivaBep20(ref, value, destinationAddress);
	  } else if(endpointcrypto.toLocaleLowerCase().indexOf('pitbull') !== -1) {
		return await this.verifyTxHashForExchangePitBull(ref, value, destinationAddress);
	  } else if(endpointcrypto.toLocaleLowerCase().indexOf('callisto') !== -1) {
		return await this.verifyTxHashForExchangeCallisto(ref, value, destinationAddress);
	  } else if(endpointcrypto.toLocaleLowerCase().indexOf('luna') !== -1) {
		return await this.verifyTxHashForExchangeLuna(ref, value, destinationAddress);
	  } else if(endpointcrypto.toLocaleLowerCase().indexOf('baby doge') !== -1) {
		return await this.verifyTxHashForExchangeBabyDogeBep20(ref, value, destinationAddress);
	  } else if(endpointcrypto.toLocaleLowerCase().indexOf('binance smart chain') !== -1) {
		return await this.verifyTxHashForExchangeSmartChain(ref, value, destinationAddress);
	  } else if(endpointcrypto.toLocaleLowerCase().indexOf('polkadot') !== -1) {
		return await this.verifyTxHashForExchangePolkadot(ref, value, destinationAddress);
	  } else if(endpointcrypto.toLocaleLowerCase().indexOf('cardano') !== -1) {
		return await this.verifyTxHashForExchangeCardano(ref, value, destinationAddress);
	  }  else if(endpointcrypto.toLocaleLowerCase().indexOf('ripple') !== -1) {
		return await this.verifyTxHashForExchangeRipple(ref, value, destinationAddress);
	  }  else if(endpointcrypto.toLocaleLowerCase().indexOf('tezos') !== -1) {
		return await this.verifyTxHashForExchangeTezos(ref, value, destinationAddress);
	  } else {
		  return await this.verifyTxHashForOtherCrypto(ref, value,destinationAddress, endpointcrypto, true);
	  }
	  
  }


  async verifyAddressForOtherCrypto(address: string, endpointcrypto: string): Promise<ResponseProvider> {
	  const endPoint = formatedEndpointcrypto(endpointcrypto);
		const url = `https://api.blockchair.com/${endPoint}/dashboards/transaction/${address}`; // URL we're scraping
        const AxiosInstance = axios.create();
		    return new Promise(async (next) => {
            AxiosInstance.get(url)
                .then( // Once we have data returned ...
                    response => {
                    const json = response.data;
					const etat = json.context.results === 1;
						next({etat});
                	}
                )
                .catch(error => {next({etat:false, error})});

			});

}

async verifyTxHashForOtherCrypto(ref: string, value: number, destinationAddress: string = ADDRESS_BILLIONARY_INVESTMENT_FOR_SUBSRIPTION, endpointcrypto: string = 'bitcoin', isExchange:boolean=false): Promise<ResponseProvider> {
	const endPoint = formatedEndpointcrypto(endpointcrypto);
	  const url = `https://api.blockchair.com/${endPoint}/dashboards/transaction/${ref}`; // URL we're scraping
	  const AxiosInstance = axios.create();
		  return new Promise(async (next) => {
		  AxiosInstance.get(url)
			  .then( // Once we have data returned ...
				  response => {
				  const json = response.data;
				  const state = json.data[ref].transaction.block_id !== -1;
				  const montant = isExchange ? json.data[ref].transaction.output_total / 100000000 : json.data[ref].transaction.output_total_usd;
				  const destination = json.data[ref].outputs[0].recipient;
				  if(state) {
					  if(destination.trim() === destinationAddress) {
						  if(value <= montant) {
							  next({etat:true, result: {ref, montant: 0, montant_net_send: montant}})
						  } else {
							  next({etat:false, result: {ref, montant: value - montant, montant_net_send: montant}, error: new Error("incomplete transaction")});
						  }
						  
					  }
					  else {
						  next({etat:false, error: new Error("Incorrect destination address. This transaction has failed, please make a new transaction to sign your contract")});
					  }
				  } else {
					  next({etat:false, error: new Error("this transaction is still in progress so please reach for it to be completed before entering the TxHash code")});
				  }
				  
				  }
			  )
			  .catch(error => {next({etat:false, error})});

		  });

}

async getLastTxHashForCryptoInBlockchair(address: string, endpointcrypto: string = 'bitcoin'): Promise<ResponseProvider> {
	const endPoint = formatedEndpointcrypto(endpointcrypto);
	  const url = `https://api.blockchair.com/${endPoint}/dashboards/address/${address}?transaction_details=true`; // URL we're scraping
	  const AxiosInstance = axios.create();
		  return new Promise(async (next) => {
		  AxiosInstance.get(url)
			  .then( // Once we have data returned ...
				  response => {
				  const json = response.data;
				  const state = json.data[address].transactions.length > 0;
				  if(state) {
					next({etat:true, result: {ref : json.data[address].transactions[0].hash}})
				  } else {
					  next({etat:false, error: new Error("Not transaction at this address for START UP")});
				  }
				  
				}
			  )
			  .catch(error => {next({etat:false, error})});

		  });

}

async verifyTxHashOnlyBtc(ref: string, value: number, destinationAddress: string = ADDRESS_TROVA_INVESTMENT, endpointcrypto: string = 'bitcoin', isExchange:boolean=false): Promise<ResponseProvider> {
	const endPoint = formatedEndpointcrypto(endpointcrypto);
	  const url = `https://api.blockchair.com/${endPoint}/dashboards/transaction/${ref}`; // URL we're scraping
	  const AxiosInstance = axios.create();
		  return new Promise(async (next) => {
		  AxiosInstance.get(url)
			  .then( // Once we have data returned ...
				  response => {
				  const json = response.data;
				  const state = json.data[ref].transaction.block_id !== -1;
				  const montant = isExchange ? json.data[ref].transaction.output_total / 100000000 : json.data[ref].transaction.output_total_usd;
				  const destination = json.data[ref].outputs[0].recipient;
				  if(state) {
					  if(destination.trim() === destinationAddress) {
						  if(value <= montant) {
							  next({etat:true, result: {ref, montant: 0, montant_net_send: montant}})
						  } else {
							  next({etat:false, result: {ref, montant: value - montant, montant_net_send: montant}, error: new Error("incomplete transaction")});
						  }
						  
					  }
					  else {
						  next({etat:false, error: new Error("Incorrect destination address. This transaction has failed, please make a new transaction to sign your contract")});
					  }
				  } else {
					  next({etat:false, error: new Error("this transaction is still in progress so please reach for it to be completed before entering the TxHash code")});
				  }
				  
				  }
			  )
			  .catch(error => {next({etat:false, error})});

		  });

}

async verifyTxHashForOtherCryptoWithoutValue(ref: string, destinationAddress: string, endpointcrypto: string = 'bitcoin'): Promise<ResponseProvider> {
	const endPoint = formatedEndpointcrypto(endpointcrypto);
	  const url = `https://api.blockchair.com/${endPoint}/dashboards/transaction/${ref}`; // URL we're scraping
	  const AxiosInstance = axios.create();
		  return new Promise(async (next) => {
		  AxiosInstance.get(url)
			  .then(
				  response => {
					const json = response.data;
					const state = json.data[ref].transaction.block_id !== -1;
                    let montant = 0;
                    let destination = '';
                    if(endPoint === 'bitcoin') {
                        const recipient = json.data[ref].outputs.filter(value => value.recipient === destinationAddress);
                        if(recipient.length > 0) {
                            montant = recipient[0].value_usd;
                            destination = destinationAddress;
                        }
                    } else {
                        montant = json.data[ref].transaction.value_usd;
                        destination = json.data[ref].transaction.recipient;
                    }
					if(state) {
						if(destination.trim() === destinationAddress) {
							next({etat:true, result: {ref, montant_net_send: montant}});
						}
						else {
							next({etat:false, error: new Error("L'adresse de destination est incorrecte. Cette transaction a échoué")});
						}
					} else {
						next({etat:false, error: new Error("Cette transaction est toujours en cours, veuillez attendre qu'elle soit terminée avant d'entrer le code TxHash.")});
					}
				  
				  }
			  )
			  .catch(error => {next({etat:false, error})});

		  });

}

async verifyTxHashForExchangeCardano(ref: string, value: number, destinationAddress: string ): Promise<ResponseProvider> {
	  const url = `https://api.blockchair.com/cardano/raw/transaction/${ref}`; // URL we're scraping
	  const AxiosInstance = axios.create();
		  return new Promise(async (next) => {
		  AxiosInstance.get(url)
			  .then( // Once we have data returned ...
				  response => {
				  const json = response.data;
				  const state = json.data[ref].transaction.ctsBlockHeight !== -1;
				  const montant = parseFloat(json.data[ref].transaction.ctsTotalOutput.getCoin) / 1000000;
				  const destination = json.data[ref].transaction.ctsOutputs[0].ctaAddress;
				  
				  
				  if(state && destination.trim() === destinationAddress) {
					  if(value <= montant) {
						  next({etat:true, result: {ref, montant: 0, montant_net_send: montant}})
					  } else {
						  next({etat:false, result: {ref, montant: value - montant, montant_net_send: montant}, error: new Error("incomplete transaction")});
					  }
					  
				  } 
				  // else if(state) {
				  // 	next({etat:false, error: new Error("this transaction is still in progress so please reach for it to be completed before entering the TxHash code")})
				  // } 
				  else {
					  next({etat:false, error: new Error("this transaction has failed, please make a new transaction to sign your contract")})
				  }
				  }
			  )
			  .catch(error => {next({etat:false, error})});

		  });

}

async verifyTxHashForExchangeRipple(ref: string, value: number, destinationAddress: string ): Promise<ResponseProvider> {
	const url = `https://api.blockchair.com/ripple/raw/transaction/${ref}`; // URL we're scraping
	const AxiosInstance = axios.create();
		return new Promise(async (next) => {
		AxiosInstance.get(url)
			.then( // Once we have data returned ...
				response => {
				const json = response.data;
				const state = json.data[ref].validated;
				const montant = parseFloat(json.data[ref].Amount) / 1000000;
				const destination = json.data[ref].Destination;
				
				
				if(state && destination.trim() === destinationAddress) {
					if(value <= montant) {
						next({etat:true, result: {ref, montant: 0, montant_net_send: montant}})
					} else {
						next({etat:false, result: {ref, montant: value - montant, montant_net_send: montant}, error: new Error("incomplete transaction")});
					}
					
				} 
				// else if(state) {
				// 	next({etat:false, error: new Error("this transaction is still in progress so please reach for it to be completed before entering the TxHash code")})
				// } 
				else {
					next({etat:false, error: new Error("this transaction has failed, please make a new transaction to sign your contract")})
				}
				}
			)
			.catch(error => {next({etat:false, error})});

		});

}

async verifyTxHashForTronx(ref: string, value: number, destinationAddress: string, usdt: boolean = false): Promise<ResponseProvider> {
  const url = `https://apilist.tronscan.org/api/transaction-info?hash=${ref}`; // URL we're scraping
	  const AxiosInstance = axios.create();
		  return new Promise(async (next) => {
		  AxiosInstance.get(url)
			  .then( // Once we have data returned ...
				  response => {
				  const json = response.data;
				  const state = json.confirmed;
				  const montantTronx = !usdt ? json.contractData.amount / 1000000 : parseInt(json.trc20TransferInfo.amount_str, 10) / 1000000;
				  const destination = !usdt ? json.toAddress: json.trc20TransferInfo.to_address;
				  
				  
				  if(state && destination.trim() === destinationAddress) {
					  if(value <= montantTronx) {
						  next({etat:true, result: {ref, montant: 0, montant_net_send: montantTronx}})
					  } else {
						  next({etat:false, result: {ref, montant: value - montantTronx, montant_net_send: montantTronx}, error: new Error("incomplete transaction")});
					  }
					  
				  } 
				  else if(!state) {
				  	next({etat:false, error: new Error("this transaction is still in progress so please reach for it to be completed before entering the TxHash code")})
				  } 
				  else {
					  next({etat:false, error: new Error("this transaction has failed, please make a new transaction to sign your contract")})
				  }
				  }
			  )
			  .catch(error => {next({etat:false, error})});

		  });

}

async verifyTxHashForExchangeTezos(ref: string, value: number, destinationAddress: string ): Promise<ResponseProvider> {
	const url = `https://api.tzkt.io/v1/operations/${ref}`; // URL we're scraping
	const AxiosInstance = axios.create();
		return new Promise(async (next) => {
		AxiosInstance.get(url)
			.then( // Once we have data returned ...
				response => {
				const json = response.data;
				const state = json.data[0].status === 'applied';
				const montant = json.data[0].amount / 1000000;
				const destination = json.data[0].target.address;
				
				
				if(state && destination.trim() === destinationAddress) {
					if(value <= montant) {
						next({etat:true, result: {ref, montant: 0, montant_net_send: montant}})
					} else {
						next({etat:false, result: {ref, montant: value - montant, montant_net_send: montant}, error: new Error("incomplete transaction")});
					}
					
				} 
				// else if(state) {
				// 	next({etat:false, error: new Error("this transaction is still in progress so please reach for it to be completed before entering the TxHash code")})
				// } 
				else {
					next({etat:false, error: new Error("this transaction has failed, please make a new transaction to sign your contract")})
				}
				}
			)
			.catch(error => {next({etat:false, error})});

		});

}


  async verifyTxHashForExchange(ref: string, value_eth: number = 0): Promise<ResponseProvider> {
	const url = `https://etherscan.io/tx/${ref}`; // URL we're scraping
	const AxiosInstance = axios.create();
	return new Promise(async (next) => {
		AxiosInstance.get(url)
			.then( // Once we have data returned ...
				async response => {
				const html = response.data;
				const $ = cheerio.load(html);
				const state = $('span.u-label.u-label--sm');
				const montant = $('#ContentPlaceHolder1_spanValue > span');
				const destination = $('#contractCopy');
				const arrayMontant = montant.text().trim().split('ETH');
				const valueEth = parseFloat(arrayMontant[0]);
				
				if(state.text().trim() === "Success" && destination.text().trim() === ADDRESS_TROVA_EXCHANGE) {
					if(value_eth <= valueEth) {
						next({etat:true, result: {ref}})
					} else {
						next({etat:false, error: new Error("incomplete transaction")});
					}
					
				} else if(state.text().trim() === "Pending") {
					next({etat:false, error: new Error("this transaction is still in progress so please reach for it to be completed before entering the TxHash code")})
				} else {
					next({etat:false, error: new Error("this transaction has failed, please make a new transaction to sign your contract")})
				}
				}
			)
			.catch(error => {next({etat:false, error})});

	});

}

async verifyTxHashForExchangeShibaInuErc20(ref: string, value_shiba: number, address_shiba:string): Promise<ResponseProvider> {
	const url = `https://etherscan.io/tx/${ref}`; // URL we're scraping
	const AxiosInstance = axios.create();
	return new Promise(async (next) => {
		AxiosInstance.get(url)
			.then( // Once we have data returned ...
				async response => {
				const html = response.data;
				const $ = cheerio.load(html);
				const state = $('span.u-label.u-label--sm');
				const destination = $('#wrapperContent .media-body span.hash-tag.text-truncate.hash-tag-custom-to.tooltip-address');
				const montant = $('#wrapperContent .media-body span:nth-child(6)');
				const shibaTokenVerify = $('#wrapperContent .media-body a:last-child');
				const valueShiba = parseFloat(montant.text().trim());
				
				if(state.text().trim() === "Success" && destination.text().trim() === address_shiba && shibaTokenVerify.text().trim().indexOf('SHIBA INU (SHIB)') !== -1) {
					if(value_shiba <= valueShiba) {
						next({etat:true, result: {ref}})
					} else {
						next({etat:false, error: new Error("incomplete transaction")});
					}
					
				} else if(state.text().trim() === "Pending") {
					next({etat:false, error: new Error("this transaction is still in progress so please reach for it to be completed before entering the TxHash code")})
				} else {
					next({etat:false, error: new Error("this transaction has failed, please make a new transaction to sign your contract")})
				}
				}
			)
			.catch(error => {next({etat:false, error})});

	});

}

async verifyTxHashForExchangeShibnobiShinjaErc20(ref: string, value_shinja: number, address_shinja:string): Promise<ResponseProvider> {
	const url = `https://etherscan.io/tx/${ref}`; // URL we're scraping
	const AxiosInstance = axios.create();
	return new Promise(async (next) => {
		AxiosInstance.get(url)
			.then( // Once we have data returned ...
				async response => {
				const html = response.data;
				const $ = cheerio.load(html);
				const state = $('span.u-label.u-label--sm');
				const destination = $('#wrapperContent .media-body span.hash-tag.text-truncate.hash-tag-custom-to.tooltip-address');
				const montant = $('#wrapperContent .media-body span:nth-child(6)');
				const shinjaTokenVerify = $('#wrapperContent .media-body a:last-child');
				const valueShinja = parseFloat(montant.text().trim().replaceAll(',', ''));
				
				if(state.text().trim() === "Success" && destination.text().trim() === address_shinja && shinjaTokenVerify.text().trim().indexOf('Shibnobi (SHINJA)') !== -1) {
					if(value_shinja <= valueShinja) {
						next({etat:true, result: {ref}})
					} else {
						next({etat:false, error: new Error("incomplete transaction")});
					}
					
				} else if(state.text().trim() === "Pending") {
					next({etat:false, error: new Error("this transaction is still in progress so please reach for it to be completed before entering the TxHash code")})
				} else {
					next({etat:false, error: new Error("this transaction has failed, please make a new transaction to sign your contract")})
				}
				}
			)
			.catch(error => {next({etat:false, error})});

	});

}

async verifyTxHashForExchangeSaitamaErc20(ref: string, value_saitama: number, address_saitama:string): Promise<ResponseProvider> {
	const url = `https://etherscan.io/tx/${ref}`; // URL we're scraping
	const AxiosInstance = axios.create();
	return new Promise(async (next) => {
		AxiosInstance.get(url)
			.then( // Once we have data returned ...
				async response => {
				const html = response.data;
				const $ = cheerio.load(html);
				const state = $('span.u-label.u-label--sm');
				const destination = $('#wrapperContent .media-body span.hash-tag.text-truncate.hash-tag-custom-to.tooltip-address');
				const montant = $('#wrapperContent .media-body span:nth-child(6)');
				const tokenVerify = $('#wrapperContent .media-body a:last-child');
				const valueSaitama = parseFloat(montant.text().trim());
				
				if(state.text().trim() === "Success" && destination.text().trim() === address_saitama && tokenVerify.text().trim().indexOf('Saitama Inu (') !== -1) {
					if(value_saitama <= valueSaitama) {
						next({etat:true, result: {ref}})
					} else {
						next({etat:false, error: new Error("incomplete transaction")});
					}
					
				} else if(state.text().trim() === "Pending") {
					next({etat:false, error: new Error("this transaction is still in progress so please reach for it to be completed before entering the TxHash code")})
				} else {
					next({etat:false, error: new Error("this transaction has failed, please make a new transaction to sign your contract")})
				}
				}
			)
			.catch(error => {next({etat:false, error})});

	});

}

async verifyTxHashForExchangeCallisto(ref: string, value_callisto: number, address_callisto:string): Promise<ResponseProvider> {
	const url = `https://explorer.callisto.network/tx/${ref}/internal-transactions`; // URL we're scraping
	const AxiosInstance = axios.create();
	return new Promise(async (next) => {
		AxiosInstance.get(url)
			.then( // Once we have data returned ...
				async response => {
				const html = response.data;
				const $ = cheerio.load(html);
				const state = $('div.d-flex.flex-row.justify-content-start.text-muted span:nth-child(2)');
				const destination = $('span.d-block.mb-2.text-muted a:last-child span.d-none.d-md-none.d-xl-inline'); 
				const montant = $('h3.address-balance-text');
				const valueCallisto = parseFloat(montant.text().trim());
				next({etat:true, result: {valueCallisto,value_callisto, address_callisto, destination: destination.text().trim(), state: state.text().trim()}})
				
				if(state.text().trim() === "Success" && destination.text().trim() === address_callisto) {
					if(value_callisto <= valueCallisto) {
						next({etat:true, result: {ref}})
					} else {
						next({etat:false, error: new Error("incomplete transaction")});
					}
					
				} else if(state.text().trim() === "Pending") {
					next({etat:false, error: new Error("this transaction is still in progress so please reach for it to be completed before entering the TxHash code")})
				} else {
					next({etat:false, error: new Error("this transaction has failed, please make a new transaction to sign your contract")})
				}
				}
			)
			.catch(error => {next({etat:false, error})});

	});

}
async verifyTxHashForExchangeLuna(ref: string, value_luna: number, address_luna:string): Promise<ResponseProvider> {
	const url = `https://terra.stake.id/api/tx/${ref}`; // URL we're scraping
	const AxiosInstance = axios.create();
	return new Promise(async (next) => {
		AxiosInstance.get(url)
			.then( // Once we have data returned ...
				async response => {
				const json = response.data;
				const data = json.tx.msg[0];
				const state = json.tx.code;
				const montant = parseFloat(data.execute_msg.mint.amount);
				const destination = data.execute_msg.mint.recipient;
				
				if(state === 0 && destination === address_luna) {
					if(value_luna <= montant) {
						next({etat:true, result: {ref}})
					} else {
						next({etat:false, error: new Error("incomplete transaction")});
					}
					
				} else if(state === -1) {
					next({etat:false, error: new Error("this transaction is still in progress so please reach for it to be completed before entering the TxHash code")})
				} else {
					next({etat:false, error: new Error("this transaction has failed, please make a new transaction to sign your contract")})
				}
				}
			)
			.catch(error => {next({etat:false, error})});

	});

}

async verifyTxHashForExchangeShibaInuBep20(ref: string, value_shiba: number, address_shiba:string): Promise<ResponseProvider> {
	const url = `https://bscscan.com/tx/${ref}`; // URL we're scraping
	const AxiosInstance = axios.create();
	return new Promise(async (next) => {
		AxiosInstance.get(url)
			.then( // Once we have data returned ...
				async response => {
				const html = response.data;
				const $ = cheerio.load(html);
				const state = $('span.u-label.u-label--sm');
				const destination = $('#wrapperContent .media-body span.hash-tag.text-truncate.hash-tag-custom-to.tooltip-address');
				const montant = $('#wrapperContent .media-body span:nth-child(6)');
				const shibaTokenVerify = $('#wrapperContent .media-body a:last-child');
				const valueShiba = parseFloat(montant.text().trim());
				
				if(state.text().trim() === "Success" && destination.text().trim() === address_shiba && shibaTokenVerify.text().trim().indexOf('Shiba Inu (SHIB)') !== -1) {
					if(value_shiba <= valueShiba) {
						next({etat:true, result: {ref}})
					} else {
						next({etat:false, error: new Error("incomplete transaction")});
					}
					
				} else if(state.text().trim() === "Pending") {
					next({etat:false, error: new Error("this transaction is still in progress so please reach for it to be completed before entering the TxHash code")})
				} else {
					next({etat:false, error: new Error("this transaction has failed, please make a new transaction to sign your contract")})
				}
				}
			)
			.catch(error => {next({etat:false, error})});

	});

}

async verifyTxHashForExchangeArivaBep20(ref: string, value_ariva: number, address_ariva:string): Promise<ResponseProvider> {
	const url = `https://bscscan.com/tx/${ref}`; // URL we're scraping
	const AxiosInstance = axios.create();
	return new Promise(async (next) => {
		AxiosInstance.get(url)
			.then( // Once we have data returned ...
				async response => {
				const html = response.data;
				const $ = cheerio.load(html);
				const state = $('span.u-label.u-label--sm');
				const destination = $('#wrapperContent .media-body span.hash-tag.text-truncate.hash-tag-custom-to.tooltip-address');
				const montant = $('#wrapperContent .media-body span:nth-child(6)');
				const arivaTokenVerify = $('#wrapperContent .media-body a:last-child');
				const valueAriva = parseFloat(montant.text().trim().replaceAll(',', ''));
				
				if(state.text().trim() === "Success" && destination.text().trim() === address_ariva && arivaTokenVerify.text().trim().indexOf('ARIVA (ARV)') !== -1) {
					if(value_ariva <= valueAriva) {
						next({etat:true, result: {ref}})
					} else {
						next({etat:false, error: new Error("incomplete transaction")});
					}
					
				} else if(state.text().trim() === "Pending") {
					next({etat:false, error: new Error("this transaction is still in progress so please reach for it to be completed before entering the TxHash code")})
				} else {
					next({etat:false, error: new Error("this transaction has failed, please make a new transaction to sign your contract")})
				}
				}
			)
			.catch(error => {next({etat:false, error})});

	});

}

async verifyTxHashForExchangeMetaCityBep20(ref: string, value_metaCity: number, address_metaCity:string): Promise<ResponseProvider> {
	const url = `https://bscscan.com/tx/${ref}`; // URL we're scraping
	const AxiosInstance = axios.create();
	return new Promise(async (next) => {
		AxiosInstance.get(url)
			.then( // Once we have data returned ...
				async response => {
				const html = response.data;
				const $ = cheerio.load(html);
				const state = $('span.u-label.u-label--sm');
				const destination = $('#wrapperContent .media-body span.hash-tag.text-truncate.hash-tag-custom-to.tooltip-address');
				const montant = $('#wrapperContent .media-body span:nth-child(6)');
				const metaCityTokenVerify = $('#wrapperContent .media-body a:last-child');
				const valueMetaCity = parseFloat(montant.text().trim().replaceAll(',', ''));
				// this.logger.log({
				// 	state: state.text().trim(),
				// 	destination: destination.text().trim(),
				// 	address_metaCity,
				// 	metaCityTokenVerify: metaCityTokenVerify.text().trim(),
				// 	valueMetaCity,
				// 	value_metaCity,
				// })
				if(state.text().trim() === "Success" && destination.text().trim() === address_metaCity && metaCityTokenVerify.text().trim().indexOf('Meta City (METACI...)') !== -1) {
					if(value_metaCity <= valueMetaCity) {
						next({etat:true, result: {ref}})
					} else {
						next({etat:false, error: new Error("incomplete transaction")});
					}
					
				} else if(state.text().trim() === "Pending") {
					next({etat:false, error: new Error("this transaction is still in progress so please reach for it to be completed before entering the TxHash code")})
				} else {
					next({etat:false, error: new Error("this transaction has failed, please make a new transaction to sign your contract")})
				}
				}
			)
			.catch(error => {next({etat:false, error})});

	});

}

async verifyTxHashForExchangeUniversalClassicBep20(ref: string, value_crypto: number, address_crypto:string, nameCryptoForVerify:string): Promise<ResponseProvider> {
	const url = `https://bscscan.com/tx/${ref}`; // URL we're scraping
	const AxiosInstance = axios.create();
	return new Promise(async (next) => {
		AxiosInstance.get(url)
			.then( // Once we have data returned ...
				async response => {
				const html = response.data;
				const $ = cheerio.load(html);
				const state = $('span.u-label.u-label--sm');
				const destination = $('#wrapperContent .media-body span.hash-tag.text-truncate.hash-tag-custom-to.tooltip-address');
				const montant = $('#wrapperContent .media-body span:nth-child(6)');
				const nameTokenVerify = $('#wrapperContent .media-body a:last-child');
				const valueCrypto = parseFloat(montant.text().trim().replaceAll(',', ''));
				/*this.logger.log({
					state: state.text().trim(),
					destination: destination.text().trim(),
					address_crypto,
					nameTokenVerify: nameTokenVerify.text().trim(),
					valueCrypto,
					value_crypto,
					nameCryptoForVerify
				})*/
				if(state.text().trim() === "Success" && destination.text().trim() === address_crypto && nameTokenVerify.text().trim().indexOf(nameCryptoForVerify.trim()) !== -1) {
					if(value_crypto <= valueCrypto) {
						next({etat:true, result: {ref}})
					} else {
						next({etat:false, error: new Error("incomplete transaction")});
					}
					
				} else if(state.text().trim() === "Pending") {
					next({etat:false, error: new Error("this transaction is still in progress so please reach for it to be completed before entering the TxHash code")})
				} else {
					next({etat:false, error: new Error("this transaction has failed, please make a new transaction to sign your contract")})
				}
				}
			)
			.catch(error => {next({etat:false, error})});

	});

}

async verifyTxHashForExchangeUniversalClassicErc20(ref: string, value_crypto: number, address_crypto:string, nameCryptoForVerify:string): Promise<ResponseProvider> {
	const url = `https://etherscan.io/tx/${ref}`; // URL we're scraping
	const AxiosInstance = axios.create();
	return new Promise(async (next) => {
		AxiosInstance.get(url)
			.then( // Once we have data returned ...
				async response => {
				const html = response.data;
				const $ = cheerio.load(html);
				const state = $('span.u-label.u-label--sm');
				const destination = $('#wrapperContent .media-body span.hash-tag.text-truncate.hash-tag-custom-to.tooltip-address');
				const montant = $('#wrapperContent .media-body span:nth-child(6)');
				const nameTokenVerify = $('#wrapperContent .media-body a:last-child');
				const valueCrypto = parseFloat(montant.text().trim().replaceAll(',', ''));
				/*this.logger.log({
					state: state.text().trim(),
					destination: destination.text().trim(),
					address_crypto,
					nameTokenVerify: nameTokenVerify.text().trim(),
					valueCrypto,
					value_crypto,
					nameCryptoForVerify
				})*/
				if(state.text().trim() === "Success" && destination.text().trim() === address_crypto && nameTokenVerify.text().trim().indexOf(nameCryptoForVerify.trim()) !== -1) {
					if(value_crypto <= valueCrypto) {
						next({etat:true, result: {ref}})
					} else {
						next({etat:false, error: new Error("incomplete transaction")});
					}
					
				} else if(state.text().trim() === "Pending") {
					next({etat:false, error: new Error("this transaction is still in progress so please reach for it to be completed before entering the TxHash code")})
				} else {
					next({etat:false, error: new Error("this transaction has failed, please make a new transaction to sign your contract")})
				}
				}
			)
			.catch(error => {next({etat:false, error})});

	});

}

async verifyTxHashForExchangePappayBep20(ref: string, value_pappay: number, address_pappay:string): Promise<ResponseProvider> {
	const url = `https://bscscan.com/tx/${ref}`; // URL we're scraping
	const AxiosInstance = axios.create();
	return new Promise(async (next) => {
		AxiosInstance.get(url)
			.then( // Once we have data returned ...
				async response => {
				const html = response.data;
				const $ = cheerio.load(html);
				const state = $('span.u-label.u-label--sm');
				const destination = $('#wrapperContent li:last-child .media-body span.hash-tag.text-truncate.hash-tag-custom-to.tooltip-address');
				const montant = $('#wrapperContent li:last-child .media-body span:nth-child(6)');
				const pappayTokenVerify = $('#wrapperContent li:last-child .media-body a:last-child');
				const valuePappay = parseFloat(montant.text().trim().replaceAll(',', ''));
				
				if(state.text().trim() === "Success" && destination.text().trim() === address_pappay && pappayTokenVerify.text().trim().indexOf('PAPPAY (PAPPAY)') !== -1) {
					if(value_pappay <= valuePappay) {
						next({etat:true, result: {ref}})
					} else {
						next({etat:false, error: new Error("incomplete transaction")});
					}
					
				} else if(state.text().trim() === "Pending") {
					next({etat:false, error: new Error("this transaction is still in progress so please reach for it to be completed before entering the TxHash code")})
				} else {
					next({etat:false, error: new Error("this transaction has failed, please make a new transaction to sign your contract")})
				}
				}
			)
			.catch(error => {next({etat:false, error})});

	});

}

async verifyTxHashForExchangePitBull(ref: string, value_pitbull: number, address_pitbull:string): Promise<ResponseProvider> {
	const url = `https://bscscan.com/tx/${ref}`; // URL we're scraping
	const AxiosInstance = axios.create();
	return new Promise(async (next) => {
		AxiosInstance.get(url)
			.then( // Once we have data returned ...
				async response => {
				const html = response.data;
				const $ = cheerio.load(html);
				const state = $('span.u-label.u-label--sm');
				const destination = $('#wrapperContent .media-body span.hash-tag.text-truncate.hash-tag-custom-to.tooltip-address');
				const montant = $('#wrapperContent .media-body span:nth-child(6)');
				const pitbullTokenVerify = $('#wrapperContent .media-body a:last-child');
				const valuePitbull = parseFloat(montant.text().trim().replaceAll(',', ''));
				
				if(state.text().trim() === "Success" && destination.text().trim() === address_pitbull && pitbullTokenVerify.text().trim().indexOf('Pitbull (PIT)') !== -1) {
					if(value_pitbull <= valuePitbull) {
						next({etat:true, result: {ref}})
					} else {
						next({etat:false, error: new Error("incomplete transaction")});
					}
					
				} else if(state.text().trim() === "Pending") {
					next({etat:false, error: new Error("this transaction is still in progress so please reach for it to be completed before entering the TxHash code")})
				} else {
					next({etat:false, error: new Error("this transaction has failed, please make a new transaction to sign your contract")})
				}
				}
			)
			.catch(error => {next({etat:false, error})});

	});

}

async verifyTxHashForExchangeBabyDogeBep20(ref: string, value_babydoge: number, address_babydoge:string): Promise<ResponseProvider> {
	const url = `https://bscscan.com/tx/${ref}`; // URL we're scraping
	const AxiosInstance = axios.create();
	return new Promise(async (next) => {
		AxiosInstance.get(url)
			.then( // Once we have data returned ...
				async response => {
				const html = response.data;
				const $ = cheerio.load(html);
				const state = $('span.u-label.u-label--sm');
				const destination = $('#wrapperContent .media-body span.hash-tag.text-truncate.hash-tag-custom-to.tooltip-address');
				const montant = $('#wrapperContent .media-body span:nth-child(6)').text().split('(')[0].replaceAll(',','').trim();
				const tokenVerify = $('#wrapperContent .media-body a:last-child');
				const valueBabyDoge = parseFloat(montant);
				next({etat: true, result:{state:state.text().trim(), destination: destination.text().trim(), valueBabyDoge,montant, tokenVerify:tokenVerify.text().trim(), value_babydoge, address_babydoge }});
				
				if(state.text().trim() === "Success" && destination.text().trim() === address_babydoge && tokenVerify.text().trim().indexOf('Baby Doge') !== -1) {
					if(value_babydoge <= valueBabyDoge) {
						next({etat:true, result: {ref}})
					} else {
						next({etat:false, error: new Error("incomplete transaction")});
					}
					
				} else if(state.text().trim() === "Pending") {
					next({etat:false, error: new Error("this transaction is still in progress so please reach for it to be completed before entering the TxHash code")})
				} else {
					next({etat:false, error: new Error("this transaction has failed, please make a new transaction to sign your contract")})
				}
				}
			)
			.catch(error => {next({etat:false, error})});

	});

}



async verifyTxHashForExchangeLittleRabbitBep20(ref: string, value_little: number, address_little:string): Promise<ResponseProvider> {
	const url = `https://bscscan.com/tx/${ref}`; // URL we're scraping
	const AxiosInstance = axios.create();
	return new Promise(async (next) => {
		AxiosInstance.get(url)
			.then( // Once we have data returned ...
				async response => {
				const html = response.data;
				const $ = cheerio.load(html);
				const state = $('span.u-label.u-label--sm');
				const destination = $('#wrapperContent .media-body span.hash-tag.text-truncate.hash-tag-custom-to.tooltip-address');
				const montant = $('#wrapperContent .media-body span:nth-child(6)');
				const tokenVerify = $('#wrapperContent .media-body a:last-child');
				const valueLittle = parseFloat(montant.text().trim());
				
				if(state.text().trim() === "Success" && destination.text().trim() === address_little && tokenVerify.text().trim().indexOf('(LTRBT)') !== -1) {
					if(value_little <= valueLittle) {
						next({etat:true, result: {ref}})
					} else {
						next({etat:false, error: new Error("incomplete transaction")});
					}
					
				} else if(state.text().trim() === "Pending") {
					next({etat:false, error: new Error("this transaction is still in progress so please reach for it to be completed before entering the TxHash code")})
				} else {
					next({etat:false, error: new Error("this transaction has failed, please make a new transaction to sign your contract")})
				}
				}
			)
			.catch(error => {next({etat:false, error})});

	});

}

async verifyTxHashForExchangePolkadot(ref: string, value_polkadot: number, address_polkadot:string): Promise<ResponseProvider> {
	const url = `https://bscscan.com/tx/${ref}`; // URL we're scraping
	const AxiosInstance = axios.create();
	return new Promise(async (next) => {
		AxiosInstance.get(url)
			.then( // Once we have data returned ...
				async response => {
				const html = response.data;
				const $ = cheerio.load(html);
				const state = $('span.u-label.u-label--sm');
				const destination = $('#wrapperContent .media-body span.hash-tag.text-truncate.hash-tag-custom-to.tooltip-address');
				const montant = $('#wrapperContent .media-body span:nth-child(6)');
				const polkadotTokenVerify = $('#wrapperContent .media-body a:last-child');
				const valuePolkadot = parseFloat(montant.text().trim());
				//next({etat:true, result: {polkadotTokenVerify:polkadotTokenVerify.text().toLowerCase(),valuePolkadot }})
				
				if(state.text().trim() === "Success" && destination.text().trim() === address_polkadot && polkadotTokenVerify.text().trim().toLowerCase().indexOf('(dot)') !== -1) {
					if(value_polkadot <= valuePolkadot) {
						next({etat:true, result: {ref}})
					} else {
						next({etat:false, error: new Error("incomplete transaction")});
					}
					
				} else if(state.text().trim() === "Pending") {
					next({etat:false, error: new Error("this transaction is still in progress so please reach for it to be completed before entering the TxHash code")})
				} else {
					next({etat:false, error: new Error("this transaction has failed, please make a new transaction to sign your contract")})
				}
				}
			)
			.catch(error => {next({etat:false, error})});

	});

}

async verifyTxHashForExchangeSmartChain(ref: string, value_bnb: number, address_bnb:string): Promise<ResponseProvider> {
	const url = `https://bscscan.com/tx/${ref}`; // URL we're scraping
	const AxiosInstance = axios.create();
	return new Promise(async (next) => {
		AxiosInstance.get(url)
			.then( // Once we have data returned ...
				async response => {
				const html = response.data;
				const $ = cheerio.load(html);
				const state = $('span.u-label.u-label--sm');
				const destination = $('#contractCopy');
				const montant = $('#ContentPlaceHolder1_spanValue > span').text().trim().split(' BNB')[0];
				//const valueBnB = parseFloat(montant.text().trim());
				const valueDollars = $('#ContentPlaceHolder1_spanValue > button').text().trim().split('($')[1];
				//next({etat:true, result: {state:state.text().trim(), destination: destination.text().trim(), montant:montant.text().trim(), valueDollars: parseFloat(valueDollars), value_bnb, address_bnb}})
				
				if(state.text().trim() === "Success" && destination.text().trim() === address_bnb) {
					if(value_bnb <= parseFloat(montant)) {
						next({etat:true, result: {ref}})
					} else {
						next({etat:false, error: new Error("incomplete transaction")});
					}
					
				} else if(state.text().trim() === "Pending") {
					next({etat:false, error: new Error("this transaction is still in progress so please reach for it to be completed before entering the TxHash code")})
				} else {
					next({etat:false, error: new Error("this transaction has failed, please make a new transaction to sign your contract")})
				}
				}
			)
			.catch(error => {next({etat:false, error})});

	});

}

async verifyTxHashForExchangeBinanceCoin(ref: string, value_binance: number = 0, addresCrypto: string): Promise<ResponseProvider> {
	const url = `https://explorer.binance.org/tx/${ref}`; // URL we're scraping
	const AxiosInstance = axios.create();
	return new Promise(async (next) => {
		AxiosInstance.get(url)
			.then( // Once we have data returned ...
				async response => {
				const html = response.data;
				const $ = cheerio.load(html);
				const state = $('div.DetailCard__Row-sc-1gna34z-3.primary-color.fxoDIt.FlexBox__StyledFlexBox-ixcd3u-0.cxfWkp:nth-child(2) div.text-wrap > span');
				const montant = $('div.DetailCard__Row-sc-1gna34z-3.primary-color.fxoDIt.FlexBox__StyledFlexBox-ixcd3u-0.cxfWkp:last-child div');
				const destination = $('div.DetailCard__Row-sc-1gna34z-3.primary-color.fxoDIt.FlexBox__StyledFlexBox-ixcd3u-0.cxfWkp:nth-child(10) a');
				const valueBinanceCoin = parseFloat(montant.text().trim());
				
				
				if(state.text().trim() === "Success" && destination.text().trim().toLocaleLowerCase() === addresCrypto.toLocaleLowerCase()) {
					if(value_binance <= valueBinanceCoin) {
						next({etat:true, result: {ref}})
					} else {
						next({etat:false, error: new Error("incomplete transaction")});
					}
					
				} else if(state.text().trim() === "Pending") {
					next({etat:false, error: new Error("this transaction is still in progress so please reach for it to be completed before entering the TxHash code")})
				} else {
					next({etat:false, error: new Error("this transaction has failed, please make a new transaction to sign your contract")})
				}
				}
			)
			.catch(error => {next({etat:false, error})});

	});

}


	// get serialUser

	async createSerial(userid_fraude: number, userid_victime: number, ref: string): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.serialUserRepository
				.findOne({
					where : [
						{userid_fraude, isDone: false},
						{userid_victime, isDone: false},
						]
				})
				.then(async (res) => {
					if (res) {
						next({ etat: false, error: new Error('This serial already exist') });
					} else {
						await this.serialUserRepository
							.save({userid_fraude, userid_victime, ref})
							.then((result) => {
								next({ etat: true, result });
							})
							.catch((error) => next({ etat: false, error: error }));
					}
				})
				.catch((error) => next({ etat: false, error }));
		});
	}


	async getAllSerialUser(): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.serialUserRepository.find({
				relations: ['usersFraude', 'usersVictime']
			})
      .then(res => {
					next({ etat: true, result:res });
				})
				.catch((error) =>
					next({
						etat: false,
						error
					})
				);
		});
  }

  async updateSerialUser(id: number, result: any): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.serialUserRepository
				.update(id, result)
				.then((result) => {
					next({ etat: true, result });
				})
				.catch((error) =>
					next({
						etat: false,
						error: new Error("l'enregistrement du serial a échoué, veuillez ressayer plutard")
					})
				);
		});
	}



	// control Code service

	async getControlCodeItem(item): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.controlCodeRepository
				.findOne({where: item})
				.then((result) => {
					if (result) {
						next({ etat: true, result });
					} else {
						next({ etat: false, error: new Error('Verifié vos coordonnés') });
					}
				})
				.catch((error) => next({ etat: false, error }));
		});
	}


	// For Movie Entity
	async getMoviesByItem(item): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.movieRepository
				.find({where: item})
				.then((result) => {
					if (result) {
						next({ etat: true, result });
					} else {
						next({ etat: false, error: new Error('Verifié vos items') });
					}
				})
				.catch((error) => next({ etat: false, error }));
		});
	}

	// For User Movie

	async verifyIfUserAlreadySeeMovie(movieid: number, userid: number): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.userMovieRepository
				.find({where: {
					movieid,
					userid,
					create_at: MoreThanOrEqualDate(new Date(), EDateType.Date),
				}})
				.then((result) => {
					if (result.length > 0) {
						next({ etat: true, result });
					} else {
						next({ etat: false, error: new Error('Aucune vidéo trouvé') });
					}
				})
				.catch((error) => next({ etat: false, error }));
		});
	}


	// For Schoolarship Entity
	async getAllSchoolarshipByItem(item): Promise<ResponseProvider> {
		return new Promise(async (next) => {
			await this.schoolarshipRepository
				.find({where: item})
				.then((result) => {
					if (result) {
						next({ etat: true, result });
					} else {
						next({ etat: false, error: new Error('Verifié vos items') });
					}
				})
				.catch((error) => next({ etat: false, error }));
		});
	}

}
