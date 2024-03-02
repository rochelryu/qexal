import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/user.entity';
import { ForfaitEntity } from 'src/forfait/forfait.entity';
import { WithdrawEntity } from 'src/withdraw/withdraw.entity';
import { NotificationEntity } from 'src/notification/notification.entity';
import { SerialUserEntity } from 'src/message/serial-user.entity';
import { DemandeEntity } from 'src/demande/demande.entity';
import { ControlCodeEntity } from 'src/control-code/control-code.entity';
import { MovieEntity } from 'src/entities/movie.entity';
import { UserMovieEntity } from 'src/entities/user_movie.entity';
import { SchoolarshipEntity } from 'src/entities/schoolarship.entity';

export const BASE_URL = '';
export const BASE_API = 'api/v1/';
export const Reabonnement = 'Reabonnement avec montant suffisant';
export const PayementByqexalExchange = 'Payement By qexal Exchange';
export const DefaultSponSorCodeStartUp = 'F6Ë1n9wy';
export const DefaultSponSorCodeBillionary = 'F6Ë1n9wy';
export const PREFIX_RENDER_DIR = '/pages';
export const MOTIF_PAYEMENT = 'INVESTISMENT OF BUSINESS';
export const NAME_PAYEMENT = 'Coré Irié Wilfried';
export const EMAIL = 'qexalvip@gmail.com';
export const EMAIL_START_UP = 'startupfillial@outlook.com';
export const EMAIL_BILLIONARY_INVEST = 'billionaryinvest@outlook.com';
export const EMAIL_CRYPTO_WILD_INVEST = 'crypto-wild@outlook.com';
export const EMAILPAYPAL = 'core.irie@gmail.com';
export const MERCHAND_ID_PAYPAL = '6WDL94BSW2Z9Q';
export const PASSWORD_MAIL = 'oeildufaucon225R#';
export const PRICE_BALL_LOTO = 5;
export const NUMBER_MULTIPLE_GAIN_BALL_LOTO = 4;
export const RATE_CRYPTO_INVERSION = 0.92;
export const POURCENTAGE_PAYEND_CONTRAT_WITHOUT_FILLEUL = 0.8;
export const POURCENTAGE_ADMIN = 0.2; // commission prise par l'administration a chaque action (inscription, payeDemande virtuel);
export const POURCENTAGE_PARRAIN = 0.1; // commission prise par le parain pour chaque filleul envoyé et debloqué si celui a une action Inférieur au parain.
export const POURCENTAGE_PARRAIN_BILLIONARY = 0.1; // commission prise par le parain pour chaque filleul envoyé et debloqué si celui a une action Inférieur au parain.
export const POURCENTAGE_PARRAIN_BILLIONARY_PREMIUM = 0.15; // commission prise par le parain pour chaque filleul envoyé et debloqué si celui a une action Inférieur au parain.
export const POURCENTAGE_PAY_BY_WEEK = 0.33; // pourcentage de payement hebdo
export const POURCENTAGE_PAY_BY_WEEK_FOR_NEW_USER = 0.35; // pourcentage de payement hebdo
export const POURCENTAGE_PAY_BY_WEEK_FOR_OLD_USER = 0.33; // pourcentage de payement hebdo
export const POURCENTAGE_PAY_BY_DAY_BILLIONARY_FOR_FIRST_PAYEMENT = 0.01; // pourcentage de payement hebdo
export const NUMBER_OF_USE_NEXT_WEEK = 3; // nombre de filleul a avoir pour beneficier d'une semaine supplementaire.
export const POURCENTAGE_EXCHANGE = 1.2; // commission prise par l'administration exchange pour les altCoin;
export const POURCENTAGE_EXCHANGE_STABLE_COIN = 1.2; // commission prise par l'administration exchange pour les stablecoins;
export const POURCENTAGE_STOP_PAYEMENT_START_UP = 1.3; // commission prise par l'administration exchange pour les stablecoins;
export const POURCENTAGE_EXCHANGE_SHIT_COIN = 1.5; // commission prise par l'administration exchange pour les shitCoins;
export const POURCENTAGE_BUSINESS = 0.8; // pourcentage de l'argent qui rentre dans la caisse lors de l'inscription de chaque membre
export const POURCENTAGE_PAYNET = 0.9; //pourcentage a payer a l'utilisateur lorsqu'il demande son argent en cash par Liquidités
export const POURCENTAGE_PAYNET_EXCHANGE = 0.85; //pourcentage a payer a l'utilisateur lorsqu'il vend sa crypto
export const ALPHABET = "qwertyuiopkmjnhbgvfcdxsazAQWZSXEDCRFVTGBYHNUJKIOLPM1234567890"; //pourcentage a payer a l'utilisateur lorsqu'il demande son argent en cash

export const ADDRESS_qexal_INVESTMENT = "0x1880868d5617ba08975803ee1ea6d7e0d1be8450";
export const ADDRESS_qexal_EXCHANGE = "0x0704228829e671958a3271e58c71e0cc7f2ddacb";
export const ADDRESS_ANONYMOUS_INVESTMENT = "bc1qh5g3jhy8aajgrcs690ufue4eufm8g9swf5ufu4";
export const ADDRESS_BILLIONARY_INVESTMENT_FOR_SUBSRIPTION = "1Fp1JtyeVWGH95diPG5oe4TcuipbwE3boR";
export const WALLET_CONNECT_VERIFY_DOMAIN = "e79d3053-a360-42bd-8a0f-fcd69138ad95=52a85b477a586c79d3c8e43812cb912bc2eb51bbc068163e147dd5de1b2fa002e79d3053-a360-42bd-8a0f-fcd69138ad95=ea7354a6f0eecab57dc18675563dd36088e512b9c1e2853aa12c2cffd4e65cd8";


// NEW SYSTEME
export const POURCENTAGE_TOTAL_RECEIVE = 2; //pourcentage total a payer a l'utilisateur pour la durré d'une action contrat 1.9 pour signifier 190%

export const ALL_ENTITY = [
		TypeOrmModule.forFeature([ UserEntity ]),
		TypeOrmModule.forFeature([ DemandeEntity ]),
		TypeOrmModule.forFeature([ ForfaitEntity ]),
		TypeOrmModule.forFeature([ NotificationEntity ]),
		TypeOrmModule.forFeature([ MovieEntity ]),
		TypeOrmModule.forFeature([ SchoolarshipEntity ]),
		TypeOrmModule.forFeature([ UserMovieEntity ]),
		TypeOrmModule.forFeature([ SerialUserEntity ]),
		TypeOrmModule.forFeature([ WithdrawEntity ]),

		// Exchange
		TypeOrmModule.forFeature([ ControlCodeEntity ]),

		//BET
	];
