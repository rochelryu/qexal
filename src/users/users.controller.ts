import { Controller, Post, Body, Get, Request, Logger, Res, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { Response } from 'express';
import { MotifLocked } from 'src/common/enum/EnumDate';
// import translate from 'translate';
import { Retrait } from './retrait.dto';
import { generateRecovery,generateRecoveryForHelp, messageOfDelevryCash, nextStepForPackaheUpgrade, sendMail, messageOfFraudeForqexal, messageOfDelevryCashForHopInvest, payementVerifyByPromo, messageOfDelevryCashForBillionaryInvest, sendMailBillionary, sendMailStartUp, getValueOfEthInUsd, formatInitDemande, fakeDataCountry } from 'src/common/functions/helper';
import { verifyWeekend } from 'src/common/functions/date';
import { RecoveryDto } from './recovery.dto';
import { MailOptions } from 'src/common/interfaces/Mail.interface';
import { EMAIL, EMAIL_BILLIONARY_INVEST, EMAIL_START_UP, NUMBER_OF_USE_NEXT_WEEK, PayementByqexalExchange, POURCENTAGE_ADMIN, POURCENTAGE_BUSINESS, POURCENTAGE_PARRAIN, POURCENTAGE_PAYNET, POURCENTAGE_PAY_BY_WEEK, RATE_CRYPTO_INVERSION, Reabonnement } from 'src/common/constant/constant';
import { hash } from 'bcrypt';
import { differenceInSeconds, subDays, addDays, startOfWeek } from 'date-fns';
import { currencies } from 'src/common/constant/currenciesData';
import { createDemandeDto } from './demande.dto';

@Controller('users')
export class UsersController {
	private logger: Logger = new Logger('UsersController');
	constructor(private service: UsersService) {}



	// @Get()
	// async dashboard(@Request() req, @Res() res: Response) {
	// 	res.redirect('/users/settings')
	// }
	

	@Get()
	async dashboardSecond(@Request() req, @Res() res: Response) {

      	const toDay = new Date();
      	let user = await this.service.getUserByItem({id :req.session.qexal.id})
		const movieDisplayAtClient = [];
		const notifications = await this.service.getNotificationsByUserid(req.session.qexal.id);
		const countNotifications = await this.service.getCountNotificationsByUserid(req.session.qexal.id);
		const countNotif = countNotifications.result > 0 ? { etat: true, result: countNotifications.result } : { etat: false };
		let lastDemande = await this.service.getLastDemandeForSuivieByItem({userid: user.result.id, etatid: 2});
		if(lastDemande.etat){
			await this.payeDemandeAuto(lastDemande.result.id);
		}
		const usdToEth = await this.service.convertUsdToEth(1);
		lastDemande = await this.service.getLastDemandeForSuivieByItem({userid: user.result.id, etatid: 2});
		const allMovies = await this.service.getAllMoviesByItem({});
		
		for (const movie of allMovies.result) {
			const allMovie = await this.service.verifyIfUserAlreadySeeMovie(movie.id, user.result.id);
			
			if(!allMovie.etat && allMovie.error.message === "Aucune vidéo trouvé") {
				movieDisplayAtClient.push(movie);
			}
		}
		//get All Forfait
		const forfaits = await this.service.getAllForfait();
		//get All Schoolarship
		const schoolarships = await this.service.getAllSchoolarshipByItem({});


		const mesDemandes = await this.service.getAllDemandeByUserid(user.result.id);
		const countUserActif = await this.service.getCountUsersConnectedToDay();
		const countAllUser = await this.service.getCountUsers();
		const countDemandeDone = await this.service.getCountDemandeFinished();
		const newInscrit = await this.service.getCountUsersAdhesionToDay();
		const demographieUser = await this.service.demographieUser();
		const numberDemande = await this.service.getCountDemandeByUserInRange(new Date(user.result.endContratTime), user.result.id);
		toDay.setDate(toDay.getDate() - 1);
		const allDemandeYesterday = await this.service.getAllDemandesYesterday(toDay);
		const percentage = (user.result.accord === 0) ? (numberDemande.result * 100)/2 : (numberDemande.result * 100)/(user.result.isEligibleForNextWeek === 1 ? 6: 5);
		const dataOfDemographie = [];
		for (const value of demographieUser.result) {
			const row= Object.entries(value);
			const rowData = fakeDataCountry(row[1][1] as string, row[0][1] as number);
			dataOfDemographie.push(rowData);
		}
		const fakeData = [['CA', 0], ['US', 0],['CN', 0],['NG', 0],['GH', 0],['DZ', 0],['FR', 0],['GA', 0],['DE', 0],['IN', 0],['KE', 0]];
		for (const value of fakeData) {
			const rowData = fakeDataCountry(value[0] as string, value[1] as number);
			dataOfDemographie.push(rowData);
		}
		user = await this.service.getUserByItem({id :req.session.qexal.id});
		//const weekendBeginerDate = subDays(startOfWeek(new Date()),2);
		const infos = {
			percentage,
			countAllUser: countAllUser.result,
			dataOfDemographie,
			countUserActif: countUserActif.result,
			countDemandeDone: countDemandeDone.result,
			newInscrit: newInscrit.result,
			mesDemandes: mesDemandes.result,
			allDemandeYesterday: allDemandeYesterday.result,
			movieDisplayAtClient,
			forfaits,
			valueUsdToCurrency: currencies.results[user.result.currencies],
			schoolarships:schoolarships.result,
			lastDemande: lastDemande.etat ? lastDemande: {},
			usdToEth: usdToEth.result
		}
		res
		.set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
		.render('Interindex', {
			user: user.result,
			countNotif,
			notifications,
			title: `${req.session.qexal.name} - Accueil`,
			infos,
		});
	}

	


	@Post('createDemande')
	async createDemande(@Body() demande: createDemandeDto, @Request() req) {
		if(req.session.qexal){
			const user = await this.service.getUserByItem({id: req.session.qexal.id});
			if(user.etat) {
				//Verify If TxHash already Exist
				const txHashAlreadyExist = await this.service.getControlCodeItem({txHash: demande.txHash.trim()});
				if(txHashAlreadyExist.etat) {
					//Send Mail to explain txHash already Exist
				const mailOptionParain: MailOptions = {
						from: `QEXAL <${EMAIL}>`,
						to: user.result.email,
						subject: 'TxHash Already Exist',
						html: ``
						};
						const send = await sendMail(mailOptionParain);
						// Ce TxHash exist déjà : faire une methode de traduction automatique
						return {etat: false, error: "Ce TxHash exist déjà"}
				} else {
					//getInfo from Forfait
					const forfait = await this.service.getForfaitById(demande.forfaitId);
					//TODO verifyInfo of txHash
					const amountValid = demande.amount - 1;
					const verifyTxHashInfo = await this.service.verifyTxHash(user.result.id, demande.txHash, amountValid);
					if(forfait.result.min - 2 <= verifyTxHashInfo.result.montant_net_send && verifyTxHashInfo.result.montant_net_send <= forfait.result.max) {
						//Create Demande of Client
						const initDemande = formatInitDemande(forfait.result.id, forfait.result.numberDayTotalVersement, user.result.id, verifyTxHashInfo.result.montant_net_send, forfait.result.commissionTotal, demande.txHash.trim());
						const {etat, error} = await this.service.setDemande(initDemande);
						await this.service.updateUser(user.result.id, {soldeGain: 0, soldeInvestissement: demande.amount + user.result.soldeGain});
						if(etat) {
							//Send Mail at client for signal valid transaction
							return {
								etat, result: "Invest Valid"
							}
						} else {
							return {
								etat, error: error.message
							}
						}

					} else {
						// Notify Client demande note create and rembourse client when Transaction arise
						return {
							etat:false, error: "Votre transaction ne rentre pas dans les règles de cette action donc contacté le support pour remboursement."
						}

					}
				}
				
			} else {
				return {etat: false, error: "Client not found..."}
			}
		}

  }

  @Post('setRecompenseMovie')
	async setRecompenseMovie(@Body() body: {playerId:string}, @Request() req) {
		if(req.session.qexal){
			const user = await this.service.getUserByItem({id: req.session.qexal.id});
			const movie = await this.service.getMovieByItem({linkId: body.playerId.trim()});
			//verify if user and movie exist
			if(user.etat && movie.etat && user.result.inscription <= 50) {
				const userAlreadyViewMovie = await this.service.verifyIfUserAlreadySeeMovie(movie.result.id, user.result.id);
				//verify if user at already view this video
				if(!userAlreadyViewMovie.etat && userAlreadyViewMovie.error.message === 'Aucune vidéo trouvé') {
					await this.service.setMovieVisualisation(movie.result.id, user.result.id);
					const allMovies = await this.service.getAllMoviesByItem({});
					const bonus = parseFloat((1/allMovies.result.length).toFixed(2));
					await this.service.updateUserForPayeSoldeGainIncrement(user.result.id, bonus);
					await this.service.updateUser(user.result.id, {inscription: user.result.inscription + 1});
					return {etat: true, result:{bonus, soldeGain: user.result.soldeGain + bonus}}
					
				} else {
					//TODO SEND RESPONSE AT CLIENT TO SIGNAL ALREADY VIEW THIS MOVIE OR ERROR IS EXIST
					if(userAlreadyViewMovie.etat) {
						return {etat:false, error: "Vous avez déjà régardé cette vidéo"}
					}
					return {etat:false, error: "Un problème est survenu, veuillez reprendre s'il vous plait."}
				}
				
			} else {
				return {etat: false, error: user.etat && user.result.inscription  <= 50 ? "Vous avez déjà atteint votre quota de vidéo" : "User not found..."}
			}
		} else {
			return {etat: false, error: "User not found..."}
		}

  }

  async payeDemandeAuto(demandeId: number) {
	try {
		const demande = await this.service.getDemandeById(demandeId)
		const user = await this.service.getUserByItem({ id: demande.result.userid });
		//Get diffDay to Moment at create_at demande
		const diffInSecond = differenceInSeconds(new Date(), new Date(demande.result.last_date_payement));
		const differenceDay = parseInt((diffInSecond / 86400).toString(), 10);
		if(differenceDay > 0) {
			const cumulPercentage =
			demande.result.cumulPercentage + (differenceDay * demande.result.commissionDay) <= demande.result.percentageTotal ? 
			demande.result.cumulPercentage + (differenceDay * demande.result.commissionDay) : demande.result.percentageTotal;

			const soldeGain = demande.result.cumulPercentage + (differenceDay * demande.result.commissionDay) <= demande.result.percentageTotal ?
			user.result.soldeGain + (differenceDay * demande.result.commissionDay * demande.result.amount) : user.result.soldeGain + ((demande.result.percentageTotal - demande.result.cumulPercentage) * demande.result.amount);
			await this.service.updateDemande(demandeId, { cumulPercentage,  etatid : cumulPercentage === demande.result.percentageTotal ? 3: 2, last_date_payement: addDays(new Date(demande.result.last_date_payement), differenceDay)});
			await this.service.updateUser(user.result.id, {soldeGain});
		}
		return {etat:true}
		
	} catch (error) {
		//throw new Error(error.message);
		return {etat: false, error: error.message};
	}
  }

	/* 
	
	-------------------END SECTION
	
	*/


	@Get('forfaittaxe')
	async forfaittaxe(@Request() req, @Res() res: Response) {
			if(req.session.qexal && req.session.qexal.roleid === 3){
      const notifications = await this.service.getNotificationsByUserid(req.session.qexal.id);
			const countNotifications = await this.service.getCountNotificationsByUserid(req.session.qexal.id);
			const forfaits = await this.service.getAllForfait();
			
      const user = await this.service.getUserByItem({id :req.session.qexal.id})
			const countNotif =
				countNotifications.result > 0 ? { etat: true, result: countNotifications.result } : { etat: false };
			res.set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
			.render('pricing2', {
				user: user.result,
				forfaits,
				POURCENTAGE_PAY_BY_WEEK,
				notifications,
				countNotif,
				title: `${req.session.qexal.name} - forfait`
			});
      } else {
        res.redirect('/login')
      }
	}

  @Get('retrait')
	async retrait(@Request() req, @Res() res: Response) {
    if(req.session.qexal && req.session.qexal.roleid === 3){
    const user = await this.service.getUserByItem({id :req.session.qexal.id})
    const notifications = await this.service.getNotificationsByUserid(req.session.qexal.id);
			const countNotifications = await this.service.getCountNotificationsByUserid(req.session.qexal.id);
			const countNotif = countNotifications.result > 0 ? { etat: true, result: countNotifications.result } : { etat: false };
		const inWaitPayement = await this.service.getUsersInWaitPayement();
      res.set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'").render('retrait2', { user: user.result, paycheckDemande: inWaitPayement.result, countNotif, notifications,title: `${req.session.qexal.name} - retrait` });
    } else {
      res.redirect('/login')
    }
  }

  @Get('startRetrait')
  async startRetrait(@Request() req, @Res() res: Response) {
	if(req.session.qexal && req.session.qexal.roleid === 3){
	const user = await this.service.getUserByItem({id :req.session.qexal.id})
	const notifications = await this.service.getNotificationsByUserid(req.session.qexal.id);
			const countNotifications = await this.service.getCountNotificationsByUserid(req.session.qexal.id);
			const countNotif = countNotifications.result > 0 ? { etat: true, result: countNotifications.result } : { etat: false };
		res.set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'").render('retraitClient2', { user: user.result, paycheckDemande: [], countNotif, notifications,title: `${req.session.qexal.name} - retrait` });
	} else {
		res.redirect('/login')
	}
}

  @Post('addForfait')
	async addForfait(@Body() forfait: { name: string, montant: string, inscription: string, color: string}, @Request() req, @Res() res: Response) {
		if (req.session.qexal && req.session.qexal.roleid === 3) {
			const newForfait = await this.service.setForfait(parseFloat(forfait.montant), parseFloat(forfait.inscription), forfait.name, forfait.color);
      res.redirect('/users/forfaittaxe')
		} else {
			res.redirect('/login')
		}
  }

  @Post('emailrec')
	async emailrec(@Body() demande: RecoveryDto) {
      const user = await this.service.getUserByItem({email: demande.email});
      if(user.etat) {
        const newRecovery = await generateRecovery(user.result.recovery);
        const updateUser = await this.service.updateUser(user.result.id, {recovery: newRecovery})
        const mailOptionParain: MailOptions = {
          from: `QEXAL <${EMAIL}>`,
          to: user.result.email,
          subject: 'RESET ACCOUNT ON QEXAL',
          html: `<div style="background:#eee; padding: 20px"><h2>Verification Code </h2> <p>A request to renew your password has been requested, please enter the following code to prove that you are responsible for this action : <br/> <span style="#1EBBD7; font-weight:bold; font-size:2em">${newRecovery}</span></p></div>`
        };
        const send = await sendMail(mailOptionParain);
        return {etat: true}
      } else {
        return {etat: false, error: "Email not found..."}
      }

  }


  @Post('recovery')
	async recovery(@Body() demande: {recovery: string}) {
      const user = await this.service.getUserByItem({recovery: demande.recovery.trim()});
      if(user.etat) {
        const newRecovery = await generateRecovery(user.result.recovery);
        const newRecoveryAgain = await generateRecovery(newRecovery);
        const password = await hash(newRecoveryAgain.trim() + newRecovery.trim(), Number(process.env.CRYPTO_DIGEST));
        const updateUser = await this.service.updateUser(user.result.id, { password })
        const mailOptionParain: MailOptions = {
          from: `QEXAL <${EMAIL}>`,
          to: user.result.email,
          subject: 'NEW PASSWORD FOR YOUR ACCOUNT ON QEXAL',
          html: `<div style="background:#fff; padding: 20px; box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);"><h2>New Password</h2> <p>Your password has been changed by the system following a request for a forgotten password .<br/>Your pseudo is ${user.result.pseudo} and your new password is: <span style="#1EBBD7; font-weight:bold; font-size:2em">${newRecoveryAgain.trim() + newRecovery.trim()}</span> <br/> Please after your next connection remember to change the password generated by another that you can remember without intervention of this email.</p></div>`,
        };
        const send = await sendMail(mailOptionParain);
        return {etat: true}
      } else {
        return {etat: false, error: "Incorrect code, Please verified your mail"}
      }

	}

	

  @Post('demandeRetrait')
	async demandeRetrait(@Request() req) {
		if (req.session.qexal) {
			const user = await this.service.getUserByItem({id :req.session.qexal.id})
      if(user.result.isActive) {
        if(user.etat && user.result.soldeGain > 0) {
          const updateUser = await this.service.updateUser(req.session.qexal.id, {accord: 1});
          return { etat: true, result: "Your Withdrawal Request is registered. Admins will contact you..." };
        }
        else {
          return { etat: false, error: "You cannot request a withdrawal because the balance is insufficient." };
        }
      } else {
        req.session.qexal = user.result;
        return { etat: false, error: "You cannot request a withdrawal because your subscription has expired, please refresh this page." };
      }

		} else {
			return { etat: false, error: "You are not authorized" };
		}

	}

	@Get('settings')
	async settings(@Request() req, @Res() res: Response) {
      const user = await this.service.getUserByItem({id :req.session.qexal.id})
			const notifications = await this.service.getNotificationsByUserid(req.session.qexal.id);
			const countNotifications = await this.service.getCountNotificationsByUserid(req.session.qexal.id);
			const countNotif =
				countNotifications.result > 0 ? { etat: true, result: countNotifications.result } : { etat: false };
			res.set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
			.render('forms2', {
				user: user.result,
				notifications,
				countNotif,
				title: `${req.session.qexal.name} - Settings`
			});
	}
	

	@Post('changeBasicInfo')
	async settingsPost(
		@Body()
		demande: {
			name: string,
			firstName: string,
			numberClient: string,
			password: string,
			address: string,
			addressCrypto: string,
		},
		@Request() req,
  ) {
		if (req.session.qexal) {
			if (demande.name.length <= 1) {
				return { etat: false, error: 'Please enter a correct name' };
			}
			if (demande.firstName.length <= 3) {
				return { etat: false, error: 'Please enter a correct firstname' };
			}
			if (demande.numberClient.length <= 3) {
				return { etat: false, error: 'Please enter a correct pseudo' };
			}
			if (demande.addressCrypto.length !== 42) {
				return {
					etat: false,
					error: 'Please enter your Correct addresse ETHEREUM.'
				};
			}
			if (demande.password.length <= 3) {
				return {
					etat: false,
					error: 'Please enter your password to confirm the change.'
				};
			} else {
				const newinfo = await this.service.getUserByAndChangeInfo(
					req.session.qexal.id,
					demande.name,
					demande.numberClient,
					demande.address,
					demande.addressCrypto,
					demande.password,
				);
				if (newinfo.etat) {
					req.session.qexal = newinfo.result;
					return {
						etat: true,
						result: 'Your changes have been successfully saved'
					};
				} else {
					return { etat: false, error: 'Your password is incorrect' };
				}
			}
		} else {
			return { etat: false, error: 'Please log in' };
		}
	}

	@Post('reprise')
	async reprisePost(
		@Body()
		infos: {
			response: string
		},
		@Request() req,
		@Res() res: Response
  ) {
		if (req.session.qexal) {
			const user = await this.service.updateUser(req.session.qexal.id, {haveVote: true, vote:parseInt(infos.response, 10)});
			res.redirect('/users/reprise');
		} else {
			res.redirect('/users/login');
		}
	}


	@Post('setting')
	async settingsPostForPassword(
		@Body() demande: { oldPass: string; newpass: string; confirm: string },
		@Request() req
	) {
		if (req.session.qexal) {
			if (demande.oldPass.length <= 3 || demande.newpass.length <= 3 || demande.confirm.length <= 3) {
				return {
					etat: false,
					error: 'Passwords must be more than 3 letters long.'
				};
			}
			if (demande.newpass !== demande.confirm) {
				return {
					etat: false,
					error:
						'The new password does not match the value entered in the confirmation of this password'
				};
			} else {
				const newinfo = await this.service.getUserForChangePass(
					req.session.qexal.id,
					demande.newpass,
					demande.oldPass
				);
				if (newinfo.etat) {
					req.session.qexal = newinfo.result;
					return {
						etat: true,
						result: 'Your changes have been successfully saved'
					};
				} else {
					return { etat: false, error: 'Your password is incorrect' };
				}
			}
		} else {
			return { etat: false, error: 'Please log in' };
		}
	}

	@Post('payeDemande')
	async payeDemande(@Body() demande: { ref: string }, @Request() req) {
		if (req.session.qexal && req.session.qexal.roleid === 3) {
      		const update = await this.payeDemandeAuto(parseInt(demande.ref, 10));
    

			if(update.etat) {
				return update;
			} else {
				return {
					etat: false,
					error: 'Echec de la transaction'
				};
			}
		} else {
			return { etat: false, error: 'veuillez vous authentifier' };
		}
  }

  @Post('removeDemande')
	async removeDemande(@Body() demande: { ref: string }, @Request() req) {
		if (req.session.qexal && req.session.qexal.roleid === 3) {
      const update = await this.service.deleteDemande(parseInt(demande.ref, 10));

      if (update.etat) {
        return {
          etat: true,
          result: 'Remove with success.'
        };
      } else {
				return {
					etat: false,
					error: update.error.message
				};
			}
		} else {
			return { etat: false, error: 'veuillez vous authentifier' };
		}
	}

	@Post('repousserDemande')
	async repousserDemande(@Body() demande: { ref: string }, @Request() req) {
		if (req.session.qexal && req.session.qexal.roleid === 3) {
      const update = await this.service.repousserDemandeById(parseInt(demande.ref, 10));

      if (update.etat) {
        return {
          etat: true,
          result: 'Update with success.'
        };
      } else {
				return {
					etat: false,
					error: update.error.message
				};
			}
		} else {
			return { etat: false, error: 'veuillez vous authentifier' };
		}
	}



  @Get('/withdraw')
	async withdraw(@Request() req, @Res() res: Response) {
    if (req.session.qexal) {
      const isVerifyWeekend = verifyWeekend();
      const user = await this.service.getUserByItem({id :req.session.qexal.id})
			const notifications = await this.service.getNotificationsByUserid(req.session.qexal.id);
			const countNotifications = await this.service.getCountNotificationsByUserid(req.session.qexal.id);
			const countNotif =
        countNotifications.result > 0 ? { etat: true, result: countNotifications.result } : { etat: false };
		let lastDemande = await this.service.getLastDemandeForSuivieByItem({userid: user.result.id, etatid: 2});
			res.set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
			.render('filleuil', {
				user: user.result,
				countNotif,
        notifications,
        isVerifyWeekend,
		lastDemande,
				title: `${req.session.qexal.name} - Filleul`
			});
    } else {
      res.redirect("/login")
    }
	}

  @Get('view')
	async view(@Request() req, @Res() res: Response, @Query() query) {
    const user = await this.service.getUserByItem({id: parseInt(query.id)})
     if(user.etat) {
       if (req.session.qexal.roleid === 3) {
          const notifications = await this.service.getNotificationsByUserid(req.session.qexal.id);
          const countNotifications = await this.service.getCountNotificationsByUserid(req.session.qexal.id);
          const countNotif = countNotifications.result > 0 ? { etat: true, result: countNotifications.result } : { etat: false };
         	const allRetraitInfo = {result: []};// await this.service.getAllTraitementByUserId(user.result.id);
          const mesDemandes = await this.service.getAllDemandeByUserid(parseInt(user.result.id));
		  const soldeCumul = mesDemandes.result.reduce((total, element)=> {
			if(element.etatid === 3) {
				return total + (element.monatnt.montant * POURCENTAGE_PAY_BY_WEEK);
			} else return total;
		}, 0);
		const retraitCumul = allRetraitInfo.result.reduce((total, element)=> {
		  if(element.etatid === 3) {
			  return total + element.monatnt;
		  }  else return total;
	  }, 0);
		  const filleul = await this.service.getUsersByItem({ parrainid: user.result.id });
          res.set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
		  .render('otherCount2', {
              users: user.result,
              user: req.session.qexal,
              countNotif,
              notifications,
              inWait: allRetraitInfo.result[0],
              title: `${user.result.name} - View`,
              infos: {
				filleul: filleul.result,
				allRetraitInfo: allRetraitInfo.result,
                mesDemandes: mesDemandes.result,
				soldeCumul,
				retraitCumul,
              }
            });
      } else {
          res.redirect('/users');
      }
    } else {
        res.redirect('/users');
    }

	}

	@Get('envoiereception')
	async envoiereception(@Request() req, @Res() res: Response) {
		if (req.session.qexal && req.session.qexal.roleid === 3) {
      const allDemandes = await this.service.getAllDemandeWaitForMY();
      const allSerialUserForFraude = await this.service.getAllSerialUser();
			const lockedUser = await this.service.getUsersLocked();
      const inscription = await this.service.getUsersByItem({inscription: 2, isActive: true});
      const intrusion = await this.service.getUsersByItem({inscription: 1, ref: ''});
      const inscriptionForLocked = await this.service.getUsersByItem({inscription: 2, isActive:false})
			const admissible = await this.service.getUsersByItem({roleid: 1})
			const inscriptionFinal = [];
      const inscriptionFinalForLocker = [];
			for(let i = 0; i < inscription.result.length; i++) {
				const forfait = await this.service.getForfaitById(inscription.result[i].forfaitid);
				inscriptionFinal.push({...inscription.result[i], montants: parseFloat(forfait.result.inscription) + parseFloat(forfait.result.nextGenForfaitMontant) })
			}
      for(let i = 0; i < inscriptionForLocked.result.length; i++) {
				const forfait = await this.service.getForfaitById(inscriptionForLocked.result[i].forfaitid);
				inscriptionFinalForLocker.push({...inscriptionForLocked.result[i], montants: parseFloat(forfait.result.inscription) + parseFloat(forfait.result.nextGenForfaitMontant)})
			}

			const notifications = await this.service.getNotificationsByUserid(req.session.qexal.id);
			const countNotifications = await this.service.getCountNotificationsByUserid(req.session.qexal.id);
			const countNotif =
				countNotifications.result > 0 ? { etat: true, result: countNotifications.result } : { etat: false };
			res.set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
			.render('envoieRecetion2', {
				user: req.session.qexal,
				countNotif,
				allSerialUserForFraude: allSerialUserForFraude.result,
				allDemandes: allDemandes.result,
        admissible: admissible.result,
        notifications,
        intrusion: intrusion.result,
				lockedUser: lockedUser.result,
				inscription: inscriptionFinal,
        inscriptionFinalForLocker,
				title: `${req.session.qexal.name} - Admissibilite`
			});
		} else {
			res.redirect('/login');
		}
	}

	@Get('locked')
	async locked(@Request() req, @Res() res: Response) {
		if (req.session.qexal && req.session.qexal.roleid > 1) {
			const allDemandes = await this.service.getAllDemande();
			const allUsers = await this.service.getUsers();
			const notifications = await this.service.getNotificationsByUserid(req.session.qexal.id);
			const countNotifications = await this.service.getCountNotificationsByUserid(req.session.qexal.id);
			const countNotif =
				countNotifications.result > 0 ? { etat: true, result: countNotifications.result } : { etat: false };
			res.set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
			.render('locked', {
				user: req.session.qexal,
				infos: { allDemandes: allDemandes.result, allUsers },
				countNotif,
				notifications,
				title: `${req.session.qexal.name} - Bloqué`
			});
		} else {
			res.redirect('/login');
		}
	}


  @Post('deleteUser')
	async deleteUser(@Body() demande: { ref: string }, @Request() req) {
		if(req.session.qexal && req.session.qexal.roleid === 3) {
      const id = parseInt(demande.ref, 10);
      const delAllNotification = await this.service.deleteAllNotificationsByUserid(id);
      const user = await this.service.deleteUser(id);
      if(user.etat) {
        return {etat: user.etat, result: 'Supprimé avec succès'};
      } else {
        return {etat: user.etat, error: user.error.message};
      }

		} else {
			return { etat: false, error: "You are not authorized" };
		}
	}

	@Post('changeLink')
	async changeLink(@Request() req) {
		if(req.session.qexal) {
      const recovery = await generateRecoveryForHelp();
      const updateUser = await this.service.updateUser(req.session.qexal.id, {recovery});

      if(updateUser.etat) {
		  const user = await this.service.getUserByItem({ id:req.session.qexal.id });
        return {etat: updateUser.etat, result: user.result.recovery};
      } else {
        return {etat: updateUser.etat, error: "Problems Connection"};
      }

		} else {
			return { etat: false, error: "You are not authorized" };
		}
	}

	@Post('unlocked')
	async unlocked(@Body() demande: { ref: string }, @Request() req) {
		if (req.session.qexal && req.session.qexal.roleid === 3) {
			const id = parseInt(demande.ref, 10);
			const validNumber = await this.service.updateUserForUnlock(id);
			const unlockedDemande = await this.service.getLastDemandeForSuivieForUnlocked(id);
			if (validNumber.etat) {
				return {
					etat: true,
					result: 'Debloqué avec Succès'
				};
			} else {
				return {
					etat: false,
					error: "Erreur Lors du debloquage"
				};
			}
		} else {
			return { etat: false, error: "You are not authorized" };
		}
  	}

	  @Post('doneFraude')
	async doneFraude(@Body() demande: { idFraude: string, idVictime: string, idSerial: string }, @Request() req) {
		if (req.session.qexal && req.session.qexal.roleid === 3) {
			const idFraude = parseInt(demande.idFraude, 10);
			const idVictime = parseInt(demande.idVictime, 10);
			const idSerial = parseInt(demande.idSerial, 10);
			const userInVictime = await this.service.getUserByItem({id: idVictime});
			const clearUserFraude = await this.service.updateUser(idFraude, {isActive:true, motif: "", inscription: 1, ref: userInVictime.result.ref});
			const incrimineVictime = await this.service.updateUser(idVictime, {isActive:false, inscription: 4 , motif: "Use txHash for other account"});
			const clearSerial = await this.service.updateSerialUser(idSerial, {isDone:true});
			if (clearUserFraude.etat && incrimineVictime.etat && clearSerial.etat) {
				return {
					etat: true,
					result: 'Action Terminé pour le fraudeur'
				};
			} else {
				return {
					etat: false,
					error: "Erreur Lors du l'action"
				};
			}
		} else {
			return { etat: false, error: "You are not authorized" };
		}
  	}

	@Post('doneVictime')
	async doneVictime(@Body() demande: { idSerial: string }, @Request() req) {
		if (req.session.qexal && req.session.qexal.roleid === 3) {
			const idSerial = parseInt(demande.idSerial, 10);
			const clearSerial = await this.service.updateSerialUser(idSerial, {isDone:true});
			if (clearSerial.etat) {
				return {
					etat: true,
					result: 'Action Terminé pour la Victime'
				};
			} else {
				return {
					etat: false,
					error: "Erreur Lors du l'action"
				};
			}
		} else {
			return { etat: false, error: "You are not authorized" };
		}
  	}

	@Post('updateForfaitInRetrograde')
	async updateForfaitInRetrograde(@Body() userinfo: { id: string }, @Request() req) {
		if (req.session.qexal && req.session.qexal.roleid === 3) {
			const id = parseInt(userinfo.id, 10);
			const user = await this.service.getUserByItem({id});
			const updateUser = await this.service.updateUser(id, {forfaitid: user.result.forfaitid - 1});
			if (updateUser.etat) {
				return {
					etat: true,
					result: 'Il est retrogradé au forfait anterieur'
				};
			} else {
				return {
					etat: false,
					error: "Erreur Lors de la montée"
				};
			}
		} else {
			return { etat: false, error: "You are not authorized" };
		}
  	}

  @Post('renewLimit')
	async renewLimit(@Body() demande: { id: string, limit: string, nextGenForfaitMontant: string }, @Request() req) {
		if (req.session.qexal && req.session.qexal.roleid === 3) {
			const id = parseInt(demande.id, 10);
      const limit = parseInt(demande.limit, 10);
      const nextGenForfaitMontant = parseInt(demande.nextGenForfaitMontant, 10);
			const updateForfait = await this.service.updateForfait(id, {limit, nextGenForfaitMontant});
			if (updateForfait.etat) {
				return {
					etat: true,
					result: 'Limite mis à jour'
				};
			} else {
				return {
					etat: false,
					error: "Erreur Lors de la mise à jour"
				};
			}
		} else {
			return { etat: false, error: "You are not authorized" };
		}
  }



	@Get('/logout')
	logout(@Request() req, @Res() res: Response) {
		req.session.destroy();
		res.redirect('/');
	}

	@Get('/testTransaction')
	async testTransaction(@Request() req, @Res() res: Response) {
		//const verifyTxHashInfo = await this.service.verifyTxHash(1, "0xa0d4e4aed7f651256b777169ece4b6303f1318877eda88afda6108dcf747068f", 5, "0x1880868d5617bA08975803EE1EA6d7e0D1BE8450");
		const lastTransaction = await this.service.getLatestTransactions();
		// this.logger.debug(lastTransaction);
		// if(lastTransaction.etat) {
		// 	const amount_usd = await this.service.convertEthToUsd(parseFloat(lastTransaction.result.amount));
		// 	lastTransaction.result = {...lastTransaction.result, amount_usd: amount_usd.result}
		//   }
		res.json(lastTransaction);
	}

	

	@Get('/delaccount')
	async delaccount(@Request() req, @Res() res: Response) {
		if (req.session.qexal && req.session.qexal.roleid === 1 && req.session.qexal.inscription === 2) {

			const delAllNotification = await this.service.deleteAllNotificationsByUserid(req.session.qexal.id);
			const user = await this.service.deleteUser(req.session.qexal.id);
			req.session.destroy();
			res.redirect('/');
		} else {
			res.redirect('/');
		}
	}

	@Post('videNotif')
	async videNotif(@Request() req) {
		if (req.session.qexal) {
			const updateNotif = await this.service.updateNotificationsByUserid(req.session.qexal.id, {
				isOpen: true
			});
			return { etat: true };
		} else {
			return { etat: false, error: 'Please authenticate yourself' };
		}
  }

  @Get('/faq')
	async faq(@Request() req, @Res() res: Response) {
    const user = await this.service.getUserByItem({ id: req.session.qexal.id });
      const notifications = await this.service.getNotificationsByUserid(req.session.qexal.id);
			const countNotifications = await this.service.getCountNotificationsByUserid(req.session.qexal.id);
			const countNotif =
				countNotifications.result > 0 ? { etat: true, result: countNotifications.result } : { etat: false };
			
      res.set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
	  .render('faq', { user: user.result,countNotif,notifications, title: `${req.session.qexal.name} - Faq` });
  }
}
