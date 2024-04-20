import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  Logger,
  Res,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
@Controller('boutique')
export class BoutiqueController {
  @Get()
  async dashboard(@Request() req, @Res() res: Response) {
    res.render('BoutiqueIndex');
  }
}
