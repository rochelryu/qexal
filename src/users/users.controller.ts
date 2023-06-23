import { Controller, Post, Body, Get, Request, Logger, Res, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { Response } from 'express';
import { MotifLocked } from 'src/common/enum/EnumDate';
// import translate from 'translate';
import { Retrait } from './retrait.dto';
import { generateRecovery,generateRecoveryForHelp, messageOfDelevryCash, nextStepForPackaheUpgrade, sendMail, messageOfFraudeForTrova, messageOfDelevryCashForHopInvest, payementVerifyByPromo, messageOfDelevryCashForBillionaryInvest, sendMailBillionary, sendMailStartUp, getValueOfEthInUsd } from 'src/common/functions/helper';
import { verifyWeekend } from 'src/common/functions/date';
import { RecoveryDto } from './recovery.dto';
import { MailOptions } from 'src/common/interfaces/Mail.interface';
import { EMAIL, EMAIL_BILLIONARY_INVEST, EMAIL_START_UP, NUMBER_OF_USE_NEXT_WEEK, PayementByTrovaExchange, POURCENTAGE_ADMIN, POURCENTAGE_BUSINESS, POURCENTAGE_PARRAIN, POURCENTAGE_PAYNET, POURCENTAGE_PAY_BY_WEEK, RATE_CRYPTO_INVERSION, Reabonnement } from 'src/common/constant/constant';
import { hash } from 'bcrypt';
import { differenceInSeconds, subDays, addDays, startOfWeek } from 'date-fns';
import { currencies } from 'src/common/constant/currenciesData';

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
		const getLastDemandeParrain = await this.service.getLastDemandeForSuivie(user.result.id);
		/*if(getLastDemandeParrain.etat && getLastDemandeParrain.result.finality === 1 && differenceInSeconds(addDays(new Date(getLastDemandeParrain.result.create_at), 7),new Date()) <= -5 // -5 pour dire que le paiement hebdomadaire se fait 5 secondes après la date de paiement) ) {
			const payeDemandeAuto = await this.payeDemandeAuto(getLastDemandeParrain.result.id);
			if(payeDemandeAuto.etat && payeDemandeAuto.result === "Transaction successfully completed this account is at the same time locked for re-subscription"){
				req.session.destroy();
			}

		}*/
		const allMovies = await this.service.getMoviesByItem({});
		
		for (const movie of allMovies.result) {
			const allMovie = await this.service.verifyIfUserAlreadySeeMovie(movie.id, user.result.id);
			this.logger.log(allMovie);
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
			const rowData = [row[1][1], row[0][1]];
			dataOfDemographie.push(rowData);
		}
		user = await this.service.getUserByItem({id :req.session.qexal.id});
		const weekendBeginerDate = subDays(startOfWeek(new Date()),2);
		
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
			schoolarships:schoolarships.result
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

	@Get('forfaittaxe')
	async createDemande(@Request() req, @Res() res: Response) {
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
			this.logger.error(user);
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


	async payeDemandeAuto(demandeId: number) {
      const update = await this.service.updateDemande(demandeId, { finality: 2 });
      const demandes = await this.service.getDemandeById(demandeId)
      //const forfait = await this.service.getForfaitById(demandes.result.forfaitid);

      if (update.etat) {
        const user = await this.service.getUserByItem({ id: demandes.result.userid });

        const forfait = await this.service.getForfaitByItem({id: user.result.forfaitid});
        const soldeGain =  user.result.soldeGain + (nextStepForPackaheUpgrade(user.result.nextGenForfait,forfait.result.montant, forfait.result.nextGenForfaitMontant) * payementVerifyByPromo(user.result.isNewUserBenefit)); // taxe.result.commission is between value 1.5 at 2
        const newPayementForUser = await this.service.updateUser(user.result.id, {soldeGain});
        const numberDemande = await this.service.getCountDemandeByUserInRange(new Date(user.result.endContratTime), demandes.result.userid);
		
        if(user.result.accord === 0) {
            // const reservoireGain = await this.service.getReservoireByItem({ id: 1});
            // const reservoireTransaction = await this.service.getReservoireByItem({ id: 2 });
            // const montantGain = (forfait.result.nextGenForfaitMontant * POURCENTAGE_ADMIN) / 2;
            // const updateReservoireGain = await this.service.updateReservoire(1, {montant : reservoireGain.result.montant + montantGain});
            // const updateReservoireTransaction = await this.service.updateReservoire(2, { montant: reservoireTransaction.result.montant + montantGain });
          if (numberDemande.result > 1) {
            const lockedUser = await this.service.updateUser(user.result.id, { isActive: false, inscription: 3, motif: "Recherche de fillieuls pour debloquage"});
            const demande = await this.service.setDemandeMY(user.result.forfaitid,user.result.id, 3, 1);
			const newUserNotif = await this.service.setNotification(user.result.id, 6, `Your account has just been locked, You should to search one person for follow to you, But you can to remote your balance Win: ${soldeGain}. Thank you`);
            return {
              etat: true,
              result: 'Transaction successfully completed this account is ON The same time locked to search for godchildren.'
            };
          } else {
            const demande = await this.service.setDemandeMY(user.result.forfaitid,user.result.id, 3, 1);
            return {
              etat: true,
              result: 'Transaction successfully completed'
            };
          }
        } else {
			const limitDemande = user.result.isEligibleForNextWeek === 1 ? 6: 5;
			if(limitDemande === 6) {
				const messageForUserLockedInSubcribe = `${user.result.pseudo}: <a href='/users/viewAllInfo?id=${user.result.id}' target="_bank">${user.result.id}</a> va à 6 receptions`;
				await this.service.setNotification(3, 1,messageForUserLockedInSubcribe);
			}
          if (numberDemande.result >= limitDemande) {
			  if(user.result.isEligibleForNextWeek === 0) { // for pay 10% of montant when the contrat is end but the user have not win the bonus week (Insufficient personne in matrix);
				const filleuilInMatrix = await this.service.getUserFollowInRange(user.result.dateMatrixCount, user.result.id);
				for (let index = 0; index < filleuilInMatrix.result.length; index++) {
					const element = filleuilInMatrix.result[index];
					const forfaitUser = await this.service.getForfaitById(element.forfaitid);
					await this.service.updateUser(element.id, {soldeGain: user.result.soldeGain + (nextStepForPackaheUpgrade(element.nextGenForfait,forfaitUser.result.montant, forfaitUser.result.nextGenForfaitMontant) * POURCENTAGE_PARRAIN) });
				}
			  }
            const messageForUserLockedInSubcribe = 'Your account has just been locked, You must to subscribe an one package for continuous to use the system, In this state, you can\'t to remote your balance Win. Thank you';
            const lockedUser = await this.service.updateUser(user.result.id, { isActive: false, inscription: 0, ref: 'old-'+ user.result.ref, motif: "Reabonnement", soldeInvestissement: 0, isEligibleForNextWeek: 0});
			const newUserNotif = await this.service.setNotification(user.result.id, 1,messageForUserLockedInSubcribe);
            const mailOptionUser: MailOptions = {
              from: `QEXAL <${EMAIL}>`,
              to: user.result.email,
              subject: 'ACCOUNT LOCKED ON QEXAL',
              html: `<div style="background:#eee; padding: 20px"> <p>${messageForUserLockedInSubcribe}</p></div>`
            };
            const sendParain = await sendMail(mailOptionUser);
            return {
              etat: true,
              result: 'Transaction successfully completed this account is at the same time locked for re-subscription'
            };
          } else {
			
            // const reservoireGain = await this.service.getReservoireByItem({ id: 1});
            // const reservoireTransaction = await this.service.getReservoireByItem({ id: 2 });
            // const montantGain = (forfait.result.nextGenForfaitMontant * POURCENTAGE_ADMIN) / 2;
            // const updateReservoireGain = await this.service.updateReservoire(1, {montant : reservoireGain.result.montant + montantGain});
            // const updateReservoireTransaction = await this.service.updateReservoire(2, { montant: reservoireTransaction.result.montant + montantGain });
            const demande = await this.service.setDemandeMY(user.result.forfaitid,user.result.id, 3, 1);
			const numberDemandeAfter = await this.service.getCountDemandeByUserInRangeNoFilter(new Date(user.result.endContratTime), demandes.result.userid);
			if(numberDemandeAfter.result > 5) {
				const messageForUserLockedInSubcribe = `${user.result.pseudo}: <a href='https://trova.vip/users/viewAllInfo?id=${user.result.id}' target="_bank">${user.result.id}</a> va à 6 receptions`;
				const mailOptionUser: MailOptions = {
					from: `QEXAL <${EMAIL}>`,
					to: EMAIL,
					subject: 'ACCOUNT WICH RECEIVE 6',
					html: `<div style="background:#eee; padding: 20px"> <p>${messageForUserLockedInSubcribe}</p></div>`
				  };
				  await sendMail(mailOptionUser);
			}
            return {
              etat: true,
              result: 'Transaction effectuée avec succès'
            };
          }
        }

			} else {
				return {
					etat: false,
					error: 'Echec de la transaction'
				};
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



  @Get('/filleuil')
	async filleuil(@Request() req, @Res() res: Response) {
    if (req.session.qexal) {
      const isVerifyWeekend = verifyWeekend();
      const inscription = await this.service.getUsersByItem({ parrainid: req.session.qexal.id });
      const user = await this.service.getUserByItem({id :req.session.qexal.id})
			const notifications = await this.service.getNotificationsByUserid(req.session.qexal.id);
			const countNotifications = await this.service.getCountNotificationsByUserid(req.session.qexal.id);
			const countNotif =
        countNotifications.result > 0 ? { etat: true, result: countNotifications.result } : { etat: false };
			res.set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
			.render('filleuil', {
				user: user.result,
				countNotif,
        notifications,
        isVerifyWeekend,
				inscription: inscription.result,
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
