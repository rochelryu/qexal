import { Injectable, NestMiddleware, Logger, Request } from '@nestjs/common';
import { Response } from 'express';
import { MotifLocked } from 'src/common/enum/EnumDate';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class VerifyOutDelay implements NestMiddleware {
	constructor(private service: UsersService) {}
    async use(@Request() req, res: Response, next: Function) {
        if(req.session.qexal) {
            if(req.session.qexal.nextGenForfait === 2 && req.session.qexal.isRembourse === 4){
                if(req.session.qexal.isActive) {
                    if(req.session.qexal.inscription === 1){
                    next();
                    } else if(req.session.qexal.inscription === 2) {
                        return res.redirect('/users/paycheck')
                    }
                    else {
                        return res.redirect('/users/choiceInscription')
                    }
                } else {
                    if(req.session.qexal.inscription === 2){
                        res.redirect('/users/paycheck');
                    } else if(req.session.qexal.inscription === 3) {
                        res.redirect('/users/filleuil');
                    } else {
                        res.redirect('/users/choiceLockedInscription');
                    }
                }
            } else if(req.session.qexal.roleid === 3){
                next();
            } else {
                res.redirect('/users/reprise');
            }

        }
        else {
            res.redirect('/login')
        }

  }
}



/*if(req.session.qexal.inscription === 1){
    if(Math.floor((new Date().getTime() - req.session.qexal.endForfait.getTime())/ 1000) < 2592000) {
        next();
    } else {
        const lockedUser = await this.service.updateUserForExpiration(req.session.qexal.id);
        res.redirect('/users/paycheck')
    }

} else {
    res.redirect('/users/paycheck')
}*/

