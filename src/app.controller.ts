import { Controller, Get, Post, Request, Res, HttpStatus, Logger, Body, Param, Query } from '@nestjs/common';
import { Response } from 'express';

import { AppService } from './app.service';
import { countriesData } from './common/constant/currenciesData';
import { generateRecoveryForHelp } from './common/functions/helper';
import { User } from './users/user.dto';
import { UsersService } from './users/users.service';
import { WALLET_CONNECT_VERIFY_DOMAIN } from './common/constant/constant';

@Controller()
export class AppController {
	private logger: Logger = new Logger("AppController")
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
			res.redirect('/users');
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

  @Get('/forgotPassword')
	forgotPassword(@Request() req, @Res() res: Response) {
		if (req.session.qexal) {
			res.redirect('/users');
		} else {
			const message = req.session.flash ?? [];
			req.session.destroy()
			res.set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
			.render('forgotPassword', {
				message,
				title: 'Authentification'
			});
		}
  }

  @Get('/signup')

	async signup(@Request() req, @Res() res: Response, @Param() params) {
		if (req.session.qexal) {
			res.redirect('/users');
		} else {
			const message = req.session.flash ?? [];
			req.session.destroy()
			res.set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
			.render('register-2', {
			message,
			title: 'Authentification',
			});
		}
  }

  @Get('/api/v1/countries')
  async countries(@Request() req, @Res() res: Response) {

	  res.json({etat: true, result:countriesData});
  }

  @Get('.well-known/walletconnect.txt')
  async walletConnect(@Request() req, @Res() res: Response) {
	  res.send(WALLET_CONNECT_VERIFY_DOMAIN);
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

  @Get('/viewGeneratedPassword')
  async viewGeneratedPassword(@Request() req, @Res() res: Response,) {
    if (req.session.qexal) {
      const {result: user} = await this.usersService.getUserByItem({id: req.session.qexal})
      res.set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
  	.render('viewGeneratedPassword', {
        title: 'Password',
        newCode: user.newPasswordGenerated.trim(),
      });
    } else {
      res.redirect('/login');
    }
  }

	@Post('/forgotPassword')
	async forgotPasswordPost(@Body() user: {numberTel: string, addressCrypto: string}, @Request() req, @Res() res: Response) {
		if (req.session.qexal) {
			res.redirect('/users');
		} else {
			const {etat, result:client, error} = await this.usersService.getUserByItem({numberClient: user.numberTel, addressCrypto: user.addressCrypto})
			if(etat){
        await this.usersService.regeneratePasswordUser(client.id);
				req.session.qexal = client;
				res.redirect('/viewGeneratedPassword');
			}
			else {
				req.session.flash = [error.message]
				res.redirect('/forgotPassword');
			}
		}
	}

  @Post('/login')
	async login(@Body() user: {number: string, password: string}, @Request() req, @Res() res: Response) {
		if (req.session.qexal) {
			res.redirect('/users');
		} else {
			const {etat, result, error} = await this.usersService.verifyUserForConnect(user.number.trim(), user.password.trim())
			if(etat){
				req.session.qexal = result;
				res.redirect('/users');
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
			res.redirect('/users');
    } else {
			req.session.flash = []
			let state = true;
			if (user.password.length <= 4) {
				state = false;
				req.session.flash.push("Your password is too short")
			}
      else if (state) {
        const { etat, result, error } = await this.usersService.createUser(user);
				if(etat){
					req.session.qexal = result;
					return res.redirect('/users');
				}
				else {
					req.session.flash.push(error.message);
					res.status(HttpStatus.NOT_ACCEPTABLE).redirect(`/signup`);
				}
			}
			res.status(HttpStatus.NOT_ACCEPTABLE).redirect(`/signup`);

		}
	}

	@Post('/api/v1/signup')
	async signupPostApi(@Body() user: User, @Request() req, @Res() res: Response ) {
		const flash = []
			let state = true;
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
