import { Controller, Get, Post, Request, Res, HttpStatus, Logger, Body, Param, Query } from '@nestjs/common';
import { Response } from 'express';

import { AppService } from './app.service';
import { countriesData } from './common/constant/currenciesData';
import { generateRecoveryForHelp } from './common/functions/helper';
import { User } from './users/user.dto';
import { UsersService } from './users/users.service';

@Controller()
export class AppController {
	constructor( private readonly usersService: UsersService) {}

	@Get()
	async root(@Request() req, @Res() res: Response) {
    const forfaits = await this.usersService.getAllForfait();
		res.set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
		.render('index-corporate-finance', {
          forfaits,
          title: 'Qexal Inc'
        });
	}

	@Get('/login')
	index(@Request() req, @Res() res: Response) {
		if (req.session.qexal) {
			if((req.session.qexal.nextGenForfait === 2 && req.session.qexal.isRembourse === 4) || req.session.qexal.roleid === 3 ){
				res.redirect('/users');
			} else {
				res.redirect('/users/reprise');
			}
		} else {
			const message = req.session.flash ?? [];
			req.session.destroy()
			res.set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
			.render('login-2', {
				message,
				title: 'Authentification'
			});
		}
  }
  @Get('/signup/:id')

	async signup(@Request() req, @Res() res: Response, @Param() params) {
		if (req.session.qexal) {
			if((req.session.qexal.nextGenForfait === 2 && req.session.qexal.isRembourse === 4) || req.session.qexal.roleid === 3 ){
				res.redirect('/users');
			} else {
				res.redirect('/users/reprise');
			}
    } else {
      const user = await this.usersService.getUserByItem({recovery: params.id});

      if (user.etat) {
        const message = req.session.flash ?? [];
        req.session.destroy()
        res.set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
		.render('register-2', {
          message,
          parainid: user.result.id,
          title: 'Authentification',
        });
      }
      else {
        res.redirect('/404')
      }
		}
  }

  @Get('/api/v1/countries')
  async countries(@Request() req, @Res() res: Response) {
	  
	  res.json({etat: true, result:countriesData});
}

@Get('/api/v1/detailsCountries/:name')
async detailsCountries(@Request() req, @Res() res: Response, @Param() params) {
	let info = {};
	for (let index = 0; index < countriesData.length; index++) {
	  
		const element = countriesData[index];
		if(element.name === params.name.trim()) {
			info = element;
			break;
		}
	}
	res.json(info);
}

@Get('/api/v1/chargerProfil')
async chargerProfil(@Request() req, @Res() res: Response, @Query('id') id: string, @Query('recovery') recovery: string,) {
	const user = await this.usersService.verifyUserApi(parseInt(id, 10), recovery);
		if(user.etat) {
			res.json({etat: user.etat, result: {name: user.result.name, email: user.result.email}});
		} else {
			res.json({etat: user.etat, error: user.error.message});
		}
	
}

@Get('/api/v1/chargerSuggestion')
async chargerSuggestion(@Request() req, @Res() res: Response, @Query('id') id: string, @Query('recovery') recovery: string,) {
	const user = await this.usersService.verifyUserApi(parseInt(id, 10), recovery);
		if(user.etat) {
			const allSugestions = await this.usersService.getLatestNotifications();
			res.json({etat: user.etat, result: allSugestions.result});
		} else {
			res.json({etat: user.etat, error: user.error.message});
		}
	
}


@Get('/api/v1/detailsCountriesCallingCode/:code')
async detailsCountriesCallingCode(@Request() req, @Res() res: Response, @Param() params) {
	let info = {};
	let etat = false;
	for (let index = 0; index < countriesData.length; index++) {
	  
		const element = countriesData[index];
		if(element.callingCodes.indexOf(params.code.trim())!== -1) {
			info = element;
			etat = true;
			break;
		}
	}
	res.json({result:info, etat});
}


  @Get('/404')
  notFound(@Request() req, @Res() res: Response,) {
    res.set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
	.render('error-404', {
      title: '404'
    });
  }

	@Post('/login')
	async login(@Body() user: {pseudo: string, password: string}, @Request() req, @Res() res: Response) {
		if (req.session.qexal) {
			if((req.session.qexal.nextGenForfait === 2 && req.session.qexal.isRembourse === 4) || req.session.qexal.roleid === 3 ){
				res.redirect('/users');
			} else {
				res.redirect('/users/reprise');
			}
		} else {
			const {etat, result, error} = await this.usersService.verifyUser(user.pseudo, user.password)
			if(etat){
				req.session.qexal = result;
				if((result.nextGenForfait === 2 && result.isRembourse === 4) || result.roleid === 3 ){
					res.redirect('/users');
				} else {
					res.redirect('/users/reprise');
				}
			}
			else {
				req.session.flash = [error.message]
				res.redirect('/login');
			}
		}
	}

  @Post('/signup')
  // @UseInterceptors(
  //   FileInterceptor('profil',
  //     {
  //       storage: diskStorage({
  //       destination: join(__dirname, '..', 'public', 'adminMeAndYou', 'images'),
  //       filename: editFileName,
  //     }),
  //     fileFilter: imageFileFilter,
  //   }),
  // )
	async signupPost(@Body() user: User, @Request() req, @Res() res: Response ) {
		if (req.session.qexal) {
			if((req.session.qexal.nextGenForfait === 2 && req.session.qexal.isRembourse === 4) || req.session.qexal.roleid === 3 ){
				res.redirect('/users');
			} else {
				res.redirect('/users/reprise');
			}
    } else {
		const users = await this.usersService.getUserByItem({id: parseInt(user.parrainid, 10)});
			req.session.flash = []
			let state = true;
			if(user.name.length <= 1) {
				state = false;
				req.session.flash.push("Veillez entrer un nom correct")
			}
			if (user.firstname.length <= 3) {
				state = false;
				req.session.flash.push("Veillez entrer un prénom correct")
			}
			if (user.pseudo.length <= 3) {
				state = false;
				req.session.flash.push("Veillez entrer un pseudo correct")
			}
			if (user.password.length <= 4) {
				state = false;
				req.session.flash.push("Votre mot de passe est trop court")
			}
      else if (state) {
        const { etat, result, error } = await this.usersService.createUser(user);
				if(etat){
					const message = `Hi ${result.name}, I'm one of the robots in ICORE I'm supposed to walk you through your journey here. I will give you advice, information, and instructions to follow to have the greatest profits.`;
					const newUserNotif = await this.usersService.setNotification(result.id, 4, message);
					const newMessage = `This is the very first step in joining the system, you need to choose a package you want to invest in. Be aware that you will have to pay the amount of the package and its registration fees at the same time later.`;
					const newUserNotifSecond = await this.usersService.setNotification(result.id, 4, newMessage);

					req.session.qexal = result;
					return res.redirect('/users/choiceInscription');
				}
				else {
					req.session.flash.push(error.message);
					res.status(HttpStatus.NOT_ACCEPTABLE).redirect('/signup/'+ users.result.recovery);
				}
			}
			res.status(HttpStatus.NOT_ACCEPTABLE).redirect('/signup/'+ users.result.recovery);

		}
	}

	@Post('/api/v1/signup')
	async signupPostApi(@Body() user: User, @Request() req, @Res() res: Response ) {
		const flash = []
			let state = true;
			if(user.name.length <= 3) {
				state = false;
				flash.push("Please enter a correct name")
			}
			if (user.password.length <= 4) {
				state = false;
				flash.push("Password many short")
			}
      		else if (state) {
        		const { etat, result, error } = await this.usersService.createUser(user);
				if(etat){
					const {name, currencies, recovery, id, language, alpha2code} = result;
					res.json({etat: true,result: {name, currencies, recovery, id, language, alpha2code}});
				}
				else {
					flash.push(error.message);
					res.json({etat: false, error: flash});
				}
			} else res.json({etat: false, error: flash})
	}

	@Post('/api/v1/login')
	async signinPostApi(@Body() user: {email:string, password:string}, @Request() req, @Res() res: Response ) {
		const { etat, result, error } = await this.usersService.verifyUser(user.email, user.password);
				if(etat){
					const {name, currencies, recovery, id, language, alpha2code} = result;
					res.json({etat: true,result: {name, currencies, recovery, id, language, alpha2code}});
				}
				else {
					console.log(error.message)
					res.json({etat: false, error: error.message});
				}
	}

	@Post('/api/v1/changeProfil')
	async changeProfilApi(@Body() user: {email:string, password:string, name:string, id:string, recovery:string}, @Request() req, @Res() res: Response ) {
		const { etat, result, error } = await this.usersService.verifyUser(user.email, user.password);
				if(etat){
					const newRecovery = await generateRecoveryForHelp()
					await this.usersService.updateUser(result.id, {name:user.name, email:user.email, recovery:newRecovery})
					res.json({etat: true,result: {name:user.name, email:user.email, recovery: newRecovery}});
				}
				else {
					res.json({etat: false, error: error.message});
				}
	}

	@Post('/api/v1/addSugestion')
	async addSugestion(@Body() user: {note:string, message:string, id:string, recovery:string}, @Request() req, @Res() res: Response ) {
		const { etat, result, error } = await this.usersService.verifyUserApi(parseInt(user.id, 10), user.recovery);
				if(etat){

					await this.usersService.setNotification(result.id, parseFloat(user.note), user.message);
					res.json({etat: true,result: {}});
				}
				else {
					res.json({etat: false, error: error.message});
				}
	}
	@Post('/api/v1/changePassword')
	async changePasswordApi(@Body() user: {newPassord:string, oldPassword:string,id:string, recovery:string}, @Request() req, @Res() res: Response ) {
		const client = await this.usersService.verifyUserApi(parseInt(user.id, 10), user.recovery);
		const { etat, result, error } = await this.usersService.getUserForChangePass(client.result.id, user.newPassord ,user.oldPassword);
				if(etat){
					const newRecovery = await generateRecoveryForHelp();
					await this.usersService.updateUser(client.result.id, {recovery:newRecovery});
					res.json({etat: true,result: {recovery: newRecovery}});
				}
				else {
					res.json({etat: false, error: error.message});
				}
	}
}
