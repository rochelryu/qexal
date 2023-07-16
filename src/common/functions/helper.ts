import { coreEncode } from 'crypto-core';
import { ALPHABET, EMAIL, EMAIL_BILLIONARY_INVEST, EMAIL_CRYPTO_WILD_INVEST, EMAIL_START_UP, MOTIF_PAYEMENT, NAME_PAYEMENT, PASSWORD_MAIL, POURCENTAGE_EXCHANGE, POURCENTAGE_EXCHANGE_SHIT_COIN, POURCENTAGE_EXCHANGE_STABLE_COIN, POURCENTAGE_PAY_BY_WEEK, POURCENTAGE_PAY_BY_WEEK_FOR_NEW_USER } from '../constant/constant';
import { createTransport } from 'nodemailer';
import { MailOptions } from '../interfaces/Mail.interface';
import 'dotenv/config';
import { addDays, format } from 'date-fns';
import axios, { AxiosInstance } from 'axios';
import { ResponseProvider } from '../interfaces/response.interface';
import { FormatInitDemandeInterface } from '../interfaces/formatDataIO.interface';

const axiosInstance: AxiosInstance = axios.create();


export const getValueOfEthInUsd = (): Promise<ResponseProvider> => {
    const url = `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=7HQZ18D5IZ7CC313Y31XTY5GPWC53GR6F8`; // URL we're scraping
        return new Promise(async (next) => {
            axiosInstance.get(url)
            .then( // Once we have data returned ...
                response => {
                const json = response.data;
                const priceEthInUsd = parseFloat(json.result.ethusd).toFixed(2);

                next({etat:true, result:priceEthInUsd})
                }
            )
            .catch(error => {next({etat:false, error})});

        });
}

export const choiceTaxeId = (filleulMontant_subscription: number, parrainMontant_subscription:number, nextGenForfait: number): {taxeId: number, finality:number} => {
    if(nextGenForfait === 0) {
        if(filleulMontant_subscription <= (parrainMontant_subscription * 0.99)){
            return {taxeId:3, finality:1};
        }
        else if(filleulMontant_subscription > (parrainMontant_subscription * 0.99) && filleulMontant_subscription < (parrainMontant_subscription * 2)) {
            return {taxeId:4, finality:1};
        }
        else {
            return {taxeId:5, finality:1};
        }
    } else if (nextGenForfait === 1) {
        if(filleulMontant_subscription < parrainMontant_subscription * 0.5){
            return {taxeId:2, finality:1};
        }
        else if(filleulMontant_subscription >= (parrainMontant_subscription * 0.5) && filleulMontant_subscription < (parrainMontant_subscription * 2)) {
            return {taxeId:3, finality:1};
        }
        else {
            return {taxeId:4, finality:1};
        }
    } else {
        if(filleulMontant_subscription < (parrainMontant_subscription * 2)){
            return {taxeId:2, finality:1};
        }
        else {
            return {taxeId:3, finality:1};
        }
    }
  }


export const formatedEndpointcrypto = (endpointcrypto: string): string => {
  if(endpointcrypto.trim().toLocaleLowerCase().indexOf('bitcoin cash') !== -1) {
    return 'bitcoin-cash';
  } else if (endpointcrypto.trim().toLocaleLowerCase().indexOf('bitcoin sv') !== -1){
    return 'bitcoin-sv';
  }
  return endpointcrypto.trim().toLocaleLowerCase();
}

export const percentageExchangeEvaluateByCategorieCoin = (categorieCoin: number): number => {
  if(categorieCoin === 0) {
    return POURCENTAGE_EXCHANGE;
  } else if(categorieCoin === 1) {
    return POURCENTAGE_EXCHANGE_STABLE_COIN;
  } else if(categorieCoin === 2) {
    return POURCENTAGE_EXCHANGE_SHIT_COIN;
  }
  return POURCENTAGE_EXCHANGE_SHIT_COIN;
}

export async function prettyPrint(jsonData, pre=""){
  let pretty = "";
  function capitalize(string) {
      return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }
  for (let key in jsonData){
      if (jsonData.hasOwnProperty(key)){
          if (isNaN(parseInt(key, 10)))
            pretty += pre + capitalize(key) + ": ";
          else
            pretty += pre + (parseInt(key) + 1) + ": ";
          if (typeof jsonData[key] === "object"){
              pretty += "\n";
              pretty += await prettyPrint(jsonData[key], pre + "    ");
          }
          else {
              pretty += jsonData[key] + "\n";
          }

      }
  }
  return pretty;
}

const transport = createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL,
    pass: PASSWORD_MAIL
  }
});

const transportStartUp = createTransport({
    host: 'smtp.office365.com',
    secure: false,
    port: 587,
    tls: {
      ciphers: 'SSLv3',
    },
    auth: {
      user: EMAIL_START_UP,
      pass: PASSWORD_MAIL
    }
});

const transportBillionary = createTransport({
  host: 'smtp.office365.com',
  secure: false,
  port: 587,
  tls: {
    ciphers: 'SSLv3',
  },
  auth: {
    user: EMAIL_BILLIONARY_INVEST,
    pass: PASSWORD_MAIL
  }
});

const transportCrypto = createTransport({
  host: 'smtp.office365.com',
  secure: false,
  port: 587,
  tls: {
    ciphers: 'SSLv3',
  },
  auth: {
    user: EMAIL_CRYPTO_WILD_INVEST,
    pass: PASSWORD_MAIL
  }
});

export const sendMail = async (mailOptions: MailOptions) => {
  const result = await transport.sendMail(mailOptions);
  return result;
}

export const sendMailStartUp = async (mailOptions: MailOptions) => {
  const result = await transportStartUp.sendMail(mailOptions);
  return result;
}

export const sendMailBillionary = async (mailOptions: MailOptions) => {
  const result = await transportBillionary.sendMail(mailOptions);
  return result;
}

export const sendMailCryptoWild = async (mailOptions: MailOptions) => {
  const result = await transportCrypto.sendMail(mailOptions);
  return result;
}


export async function generateRecovery(pseudo: string): Promise<string> {
	const crypt = await coreEncode(pseudo.replace(' ','').trim(), Number(process.env.CRYPTO_DIGEST));
  return new Promise(next => next(crypt));
}

export async function generateRecoveryForHelp(): Promise<string> {
  const ALPHABET_ARRAY = ALPHABET.split('');
  const recovery = [0,0,0,0,0,0,0,0].map((value)=>ALPHABET[Math.floor(Math.random() * ALPHABET_ARRAY.length - 1)]).join('');
	const crypt = await coreEncode(recovery.trim(), Number(process.env.CRYPTO_DIGEST));
  return new Promise(next => next(crypt));
}

export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    return callback(new Error('Que les images peuvent être chargées.'), false);
  }
  callback(null, true);
};

export const editFileName = (req, file, callback) => {
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${randomName}-${file.originalname}`);
};


export const messageOfDelevryCash = (isMoneyGram: boolean, isWesternUnion: boolean, isCryptoWallet: boolean, name: string, ref: string, montant: number, address: string, numberClientWithPrefix: string, numberPiece: string, receiverName: string) => {
  if (isMoneyGram) return `Hello ${name}, your transaction with Money Gram is ready. Ref: ${ref} , Sender: ${NAME_PAYEMENT}, Balance: ${montant} $, Motif: ${MOTIF_PAYEMENT}. qexal thanks you`;
  else if (isWesternUnion) return `Hello ${name}, your transaction with Western Union is ready. MTCN: ${ref} , Sender: ${NAME_PAYEMENT}, Balance: ${montant} $, Address: ${address}, Number : ${numberClientWithPrefix}, Receiver: ${receiverName}, Number Piece: ${numberPiece}, Question: Who is best ?, Response: QEXAL. qexal thanks you`;
  else if (isCryptoWallet) return `Hello ${name}, your transaction in your Crypto Wallet is ready. Ref: ${ref} , Balance: ${montant} $. qexal thanks you`;
}

export const messageOfDelevryCashForHopInvest = (montant: number) => {
  return `Nous venons de faire votre virement de ${montant.toString()}$ sur votre adresse bitcoin.<br/>Merci d'avoir investi avec nous.<br/>Nous sommes toujours ouvert pour vos recommandations.<br/><br/>Plate Forme d'investissement<br/><a href="https://www.startupinvest.online">https://www.startupinvest.online</a>`;
}

export const messageOfDelevryCashForBillionaryInvest = ( ref: string, montant: number, newSolde: number) => {
  return `<p>Hello, we hope you are doing well, <br/> we have processed your $ ${montant} withdrawal request. The TxId is as follows: <br/> <span style="color:green">${ref}</span> <br/> <strong>Your current balance is: $ ${newSolde}<strong></p>.`;
}

export const messageOfFraudeForqexal = (pseudoFraude: string, pseudoVictiome: string, nameFraude: string, nameVictiome: string, txhash: string) => {
  return `L'utilisateur ${nameFraude} du pseudo ${pseudoFraude} a fait entrer le même TxHash que l'utilisateur ${nameVictiome} du pseudo ${pseudoVictiome}. <br/> <a href="https://blockchair.com/bitcoin/transaction/${txhash}" target="_blank">${txhash}</a> <br/> Alors nous demandons à chacun de ces utilisateurs de faire parvenir dans l'immédiat des captures d'ecrans de telephone montrant les informations suivantes: <ul><ol> le code txHash dans le portefeuille</ol><ol> l'adresse Ethereum du propriétaire du portefeuille</ol></ul> <br /><br /><br /> <strong>N.B : Une quelconque capture d'ecran provenant d'un site scan est nulle et sans effet. Toutes les captures d'ecrans montrant les informations demandées doivent être prise dans le portefeuille.</strong>`;
}

export const messageOfFraudeForAnonymous = (emailFraude: string, emailVictiome: string, txhash: string, crypto:string = 'BITCOIN', linkVerification:string = 'https://blockchair.com/bitcoin/transaction') => {
  return `L'utilisateur ${emailFraude} a fait entrer le même TxHash que l'utilisateur ${emailVictiome}. <br/> <a href="${linkVerification}/${txhash}" target="_blank">${txhash}</a> <br/> Alors nous demandons à chacun de ces utilisateurs de faire parvenir dans l'immédiat des captures d'ecrans de telephone montrant les informations suivantes: <ul><ol> le code txHash dans le portefeuille</ol><ol> l'adresse ${crypto} du propriétaire du portefeuille</ol></ul> <br /><br /><br /> <strong>N.B : Une quelconque capture d'ecran provenant d'un site scan est nulle et sans effet. Toutes les captures d'ecrans montrant les informations demandées doivent être prise dans le portefeuille.</strong>`;
}


export const messageOfExchangeDone = (nameCrypto:string,receptionid:number, date_create_at:string, montantCurrencie:number, currencie:string, montant_eth:number, montant_usd:number, addressCrypto:string, ref:string, type:number, validate:boolean = true) => {
  let typeTransaction = '';
  if(type === 0) typeTransaction = 'PayPal';
  if(type === 1) typeTransaction = 'Orange Money';
  if(type === 2) typeTransaction = 'Mtn Money';
  if(type === 3) typeTransaction = 'Moov Money';
  if(type === 4) typeTransaction = 'Perfect Money';
  if(type === 5) typeTransaction = 'Wave';
  return `
  <style>
  @import url('https://rsms.me/inter/inter-ui.css');
::selection {
  background: #2D2F36;
}
::-webkit-selection {
  background: #2D2F36;
}
::-moz-selection {
  background: #2D2F36;
}
.body {
  background: white;
  font-family: 'Inter UI', sans-serif;
  margin: 0;
  padding: 20px;
}
.page {
  background: #e2e2e5;
  display: flex;
  flex-direction: column;
  height: calc(100% - 40px);
  position: absolute;
  place-content: center;
  width: calc(100% - 40px);
}
@media (max-width: 767px) {
  .page {
    height: auto;
    margin-bottom: 20px;
    padding-bottom: 20px;
  }
}
.container {
  display: flex;
  height: 320px;
  margin: 0 auto;
  width: 640px;
}
@media (max-width: 767px) {
  .container {
    flex-direction: column;
    height: 630px;
    width: 320px;
  }
}
.left {
  background: white;
  height: calc(100% - 40px);
  top: 20px;
  position: relative;
  width: 50%;
}
@media (max-width: 767px) {
  .left {
    height: 100%;
    left: 20px;
    width: calc(100% - 40px);
    max-height: 270px;
  }
}
.login {
  font-size: 30px;
  font-weight: 900;
  margin: 50px 40px 40px;
}
.eula {
  color: #999;
  font-size: 14px;
  line-height: 1.5;
  margin: 40px;
}
.right {
  background: #474A59;
  box-shadow: 0px 0px 40px 16px rgba(0,0,0,0.22);
  color: #F1F1F2;
  position: relative;
  width: 50%;
}
@media (max-width: 767px) {
  .right {
    flex-shrink: 0;
    height: 100%;
    width: 100%;
    max-height: 350px;
  }
}

.content {
  margin: 40px;
  position: absolute;
}
.right h4 {
  color:  #c2c2c5;
  text-decoration: underline;
  display: block;
  font-size: 18px;
  height: 16px;
  margin-top: 20px;
  margin-bottom: 5px;
}
.right p {
  font-family: 'Inter UI', sans-serif;
}
.right a {
  color: #1EBBD7 !important;
  text-decoration: none;
  margin-top: 5px;
}

  </style>
  <div class="body">
  <div class="page">
  <div class="container">
    <div class="left">
      <div class="login">QEXAL EXCHANGE</div>
      <div class="eula"><strong style='color: ${validate ? '#7ed321': '#DC143C'}'>Transaction ${validate ? 'completed (Ethereum Purchase)': 'canceled (Ethereum Failed)'} </strong>, ${validate ? 'Qexal Exchange hope you enjoyed the service.': 'Qexal Exchange have removed your request.'}  Looking forward to seeing you again.</div>
    </div>
    <div class="right">
      <div class="content">
        <h4>Informations</h4>
        <p>Order N° ${receptionid}
          <br>
            Date: ${date_create_at}
          <br>
            Exchange Local: ${montantCurrencie.toFixed(2)} ${currencie}
          <br>
            Exchange ${nameCrypto}: ${montant_eth}
          <br>
            Exchange USD: ${montant_usd.toFixed(2)}
          <br>
          Address ${nameCrypto}: ${addressCrypto}
          <br>
          reference transaction: ${ref}
          <br>
          type transaction: ${typeTransaction}
          </p>
        
      </div>
      
    </div>
  </div>
</div>
</div>
`;
}

export const messageOfExchangeForUserBuy = (nameCrypto:string,receptionid:number, date_create_at:string, montantCurrencie:number, currencie:string, montant_eth:number, montant_usd:number, fraisNetwork:number, addressCrypto:string, ref:string, type:number) =>{
  let typeTransaction = '';
  if(type === 0) typeTransaction = 'PayPal';
  if(type === 1) typeTransaction = 'Orange Money';
  if(type === 2) typeTransaction = 'Mtn Money';
  if(type === 3) typeTransaction = 'Moov Money';
  if(type === 4) typeTransaction = 'Perfect Money';
  if(type === 5) typeTransaction = 'Wave';
  return `
  <!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

<head>

    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title></title>

    <style type="text/css">
        table,
        td {
            color: #000000;
        }
        
        a {
            color: #0000ee;
            text-decoration: underline;
        }
        
        @media (max-width: 480px) {
            #u_content_image_5 .v-src-width {
                width: auto !important;
            }
            #u_content_image_5 .v-src-max-width {
                max-width: 22% !important;
            }
        }
        
        @media only screen and (min-width: 620px) {
            .u-row {
                width: 600px !important;
            }
            .u-row .u-col {
                vertical-align: top;
            }
            .u-row .u-col-50 {
                width: 300px !important;
            }
            .u-row .u-col-100 {
                width: 600px !important;
            }
        }
        
        @media (max-width: 620px) {
            .u-row-container {
                max-width: 100% !important;
                padding-left: 0px !important;
                padding-right: 0px !important;
            }
            .u-row .u-col {
                min-width: 320px !important;
                max-width: 100% !important;
                display: block !important;
            }
            .u-row {
                width: calc(100% - 40px) !important;
            }
            .u-col {
                width: 100% !important;
            }
            .u-col>div {
                margin: 0 auto;
            }
        }
        
        body {
            margin: 0;
            padding: 0;
        }
        
        table,
        tr,
        td {
            vertical-align: top;
            border-collapse: collapse;
        }
        
        p {
            margin: 0;
        }
        
        .ie-container table,
        .mso-container table {
            table-layout: fixed;
        }
        
        * {
            line-height: inherit;
        }
        
        a[x-apple-data-detectors='true'] {
            color: inherit !important;
            text-decoration: none !important;
        }
    </style>



    <!--[if !mso]><!-->
    <link href="https://fonts.googleapis.com/css?family=Cabin:400,700&display=swap" rel="stylesheet" type="text/css">
    <!--<![endif]-->

</head>

<body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
    <!--[if IE]><div class="ie-container"><![endif]-->
    <!--[if mso]><div class="mso-container"><![endif]-->
    <table style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%" cellpadding="0" cellspacing="0">
        <tbody>
            <tr style="vertical-align: top">
                <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #ffffff;"><![endif]-->


                    <div class="u-row-container" style="padding: 0px;background-color: transparent">
                        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #fcf9f8;">
                            <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #fcf9f8;"><![endif]-->

                                <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                                <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                                    <div style="width: 100% !important;">
                                        <!--[if (!mso)&(!IE)]><!-->
                                        <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                            <!--<![endif]-->

                                            <table id="u_content_image_5" style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                <tbody>
                                                    <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Cabin',sans-serif;" align="left">

                                                            

                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                <tbody>
                                                    <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:44px 10px 14px;font-family:'Cabin',sans-serif;" align="left">

                                                            <div style="line-height: 140%; text-align: center; word-wrap: break-word;">
                                                                <p style="font-size: 14px; line-height: 140%;"><span style="color: #e67e23; font-size: 14px; line-height: 19.6px;"><strong>TRANSACTION ${nameCrypto.toUpperCase()} SUR CRYPTO-WILD</strong></span></p>
                                                            </div>

                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                <tbody>
                                                    <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:4px 55px 10px;font-family:'Cabin',sans-serif;" align="left">

                                                            <div style="line-height: 170%; text-align: center; word-wrap: break-word;">
                                                                <p style="font-size: 14px; line-height: 170%;"><span style="font-size: 12px; line-height: 20.4px;">PROCESSUS: N&deg;${receptionid.toString()} (EN ATTENTE)</span></p>
                                                            </div>

                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                <tbody>
                                                    <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:4px 55px 10px;font-family:'Cabin',sans-serif;" align="left">

                                                            <div style="line-height: 170%; text-align: center; word-wrap: break-word;">
                                                                <p style="font-size: 14px; line-height: 170%;"><span style="font-size: 12px; line-height: 20.4px;">Montant en Liquide : ${montantCurrencie.toString()} ${currencie}</span></p>
                                                                <p style="font-size: 14px; line-height: 170%;"><span style="font-size: 12px; line-height: 20.4px;">Montant ${nameCrypto} Total: ${montant_eth+ fraisNetwork}</span></p>
                                                                <p style="font-size: 14px; line-height: 170%;"><span style="font-size: 12px; line-height: 20.4px;">Frais de r&eacute;seau ${nameCrypto} : ${fraisNetwork}</span></p>
                                                                <p style="font-size: 14px; line-height: 170%;"><span style="font-size: 12px; line-height: 20.4px;">Montant ${nameCrypto.toUpperCase()} &agrave; recevoir : ${montant_eth}</span></p>
                                                                <p style="font-size: 14px; line-height: 170%;"><span style="font-size: 12px; line-height: 20.4px;">Montant USD &agrave; recevoir: ${montant_usd}</span></p>
                                                                <p style="font-size: 14px; line-height: 170%;"><span style="font-size: 12px; line-height: 20.4px;">Adresse ${nameCrypto}: ${addressCrypto}</span></p>
                                                                <p style="font-size: 14px; line-height: 170%;"><span style="font-size: 12px; line-height: 20.4px;">Type achat : ${typeTransaction}</span></p>
                                                                <p style="font-size: 14px; line-height: 170%;"><span style="font-size: 12px; line-height: 20.4px;">Reference ${typeTransaction} : ${ref}</span></p>
                                                                <p style="font-size: 14px; line-height: 170%;"><span style="font-size: 12px; line-height: 20.4px;">Date Operation : ${format(new Date(date_create_at), 'dd/MM/yyyy HH:mm')}</span></p>
                                                            </div>

                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <!--[if (!mso)&(!IE)]><!-->
                                        </div>
                                        <!--<![endif]-->
                                    </div>
                                </div>
                                <!--[if (mso)|(IE)]></td><![endif]-->
                                <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                            </div>
                        </div>
                    </div>



                    <div class="u-row-container" style="padding: 0px;background-color: #ffffff">
                        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
                            <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: #ffffff;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]-->

                                <!--[if (mso)|(IE)]><td align="center" width="300" style="background-color: #ffffff;width: 300px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
                                <div class="u-col u-col-50" style="max-width: 320px;min-width: 300px;display: table-cell;vertical-align: top;">
                                    <div style="background-color: #ffffff;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                                        <!--[if (!mso)&(!IE)]><!-->
                                        <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                                            <!--<![endif]-->

                                            <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                <tbody>
                                                    <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">

                                                            

                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <!--[if (!mso)&(!IE)]><!-->
                                        </div>
                                        <!--<![endif]-->
                                    </div>
                                </div>
                                <!--[if (mso)|(IE)]></td><![endif]-->
                                <!--[if (mso)|(IE)]><td align="center" width="300" style="background-color: #ffffff;width: 300px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
                                <div class="u-col u-col-50" style="max-width: 320px;min-width: 300px;display: table-cell;vertical-align: top;">
                                    <div style="background-color: #ffffff;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                                        <!--[if (!mso)&(!IE)]><!-->
                                        <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                                            <!--<![endif]-->

                                            <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                <tbody>
                                                    <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">

                                                            <div style="line-height: 140%; text-align: left; word-wrap: break-word;">
                                                                <p style="font-size: 14px; line-height: 140%;"><span style="font-size: 16px; line-height: 22.4px; color: #e03e2d;">DELAI TRAITEMENT : <br /><span style="color: #000000; font-size: 12px; line-height: 16.8px;">Entre 08h-20h, nous prenons maximum 30 minutes pour le traitement de la demande. Entre 20h-08h nous pouvons prendre plus d'une heure pour le traitement</span><br
                                                                    /></span>
                                                                </p>
                                                            </div>

                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                <tbody>
                                                    <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">

                                                            <div align="center">
                                                                <div style="display: table; max-width:36px;">
                                                                    <!--[if (mso)|(IE)]><table width="36" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-collapse:collapse;" align="center"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; mso-table-lspace: 0pt;mso-table-rspace: 0pt; width:36px;"><tr><![endif]-->


                                                                    


                                                                    <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                                                                </div>
                                                            </div>

                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <!--[if (!mso)&(!IE)]><!-->
                                        </div>
                                        <!--<![endif]-->
                                    </div>
                                </div>
                                <!--[if (mso)|(IE)]></td><![endif]-->
                                <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                            </div>
                        </div>
                    </div>


                    <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                </td>
            </tr>
        </tbody>
    </table>
    <!--[if mso]></div><![endif]-->
    <!--[if IE]></div><![endif]-->
</body>

</html>
  `;
}

export const messageOfExchangeForUserSell = (nameCrypto:string,receptionid:number, date_create_at:string, montantCurrencie:number, currencie:string, montant_eth:number, montant_usd:number, addressCrypto:string, ref:string, type:number) =>{
  let typeTransaction = '';
  if(type === 0) typeTransaction = 'PayPal';
  if(type === 1) typeTransaction = 'Orange Money';
  if(type === 2) typeTransaction = 'Mtn Money';
  if(type === 3) typeTransaction = 'Moov Money';
  if(type === 4) typeTransaction = 'Perfect Money';
  if(type === 5) typeTransaction = 'Wave';
  return `
  <!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

<head>

    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title></title>

    <style type="text/css">
        table,
        td {
            color: #000000;
        }
        
        a {
            color: #0000ee;
            text-decoration: underline;
        }
        
        @media (max-width: 480px) {
            #u_content_image_5 .v-src-width {
                width: auto !important;
            }
            #u_content_image_5 .v-src-max-width {
                max-width: 22% !important;
            }
        }
        
        @media only screen and (min-width: 620px) {
            .u-row {
                width: 600px !important;
            }
            .u-row .u-col {
                vertical-align: top;
            }
            .u-row .u-col-50 {
                width: 300px !important;
            }
            .u-row .u-col-100 {
                width: 600px !important;
            }
        }
        
        @media (max-width: 620px) {
            .u-row-container {
                max-width: 100% !important;
                padding-left: 0px !important;
                padding-right: 0px !important;
            }
            .u-row .u-col {
                min-width: 320px !important;
                max-width: 100% !important;
                display: block !important;
            }
            .u-row {
                width: calc(100% - 40px) !important;
            }
            .u-col {
                width: 100% !important;
            }
            .u-col>div {
                margin: 0 auto;
            }
        }
        
        body {
            margin: 0;
            padding: 0;
        }
        
        table,
        tr,
        td {
            vertical-align: top;
            border-collapse: collapse;
        }
        
        p {
            margin: 0;
        }
        
        .ie-container table,
        .mso-container table {
            table-layout: fixed;
        }
        
        * {
            line-height: inherit;
        }
        
        a[x-apple-data-detectors='true'] {
            color: inherit !important;
            text-decoration: none !important;
        }
    </style>



    <!--[if !mso]><!-->
    <link href="https://fonts.googleapis.com/css?family=Cabin:400,700&display=swap" rel="stylesheet" type="text/css">
    <!--<![endif]-->

</head>

<body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
    <!--[if IE]><div class="ie-container"><![endif]-->
    <!--[if mso]><div class="mso-container"><![endif]-->
    <table style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%" cellpadding="0" cellspacing="0">
        <tbody>
            <tr style="vertical-align: top">
                <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #ffffff;"><![endif]-->


                    <div class="u-row-container" style="padding: 0px;background-color: transparent">
                        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #fcf9f8;">
                            <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #fcf9f8;"><![endif]-->

                                <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                                <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                                    <div style="width: 100% !important;">
                                        <!--[if (!mso)&(!IE)]><!-->
                                        <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                            <!--<![endif]-->

                                            <table id="u_content_image_5" style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                <tbody>
                                                    <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Cabin',sans-serif;" align="left">

                                                            

                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                <tbody>
                                                    <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:44px 10px 14px;font-family:'Cabin',sans-serif;" align="left">

                                                            <div style="line-height: 140%; text-align: center; word-wrap: break-word;">
                                                                <p style="font-size: 14px; line-height: 140%;"><span style="color: #e67e23; font-size: 14px; line-height: 19.6px;"><strong>TRANSACTION ${nameCrypto.toUpperCase()} SUR CRYPTO-WILD</strong></span></p>
                                                            </div>

                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                <tbody>
                                                    <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:4px 55px 10px;font-family:'Cabin',sans-serif;" align="left">

                                                            <div style="line-height: 170%; text-align: center; word-wrap: break-word;">
                                                                <p style="font-size: 14px; line-height: 170%;"><span style="font-size: 12px; line-height: 20.4px;">PROCESSUS: N&deg;${receptionid.toString()} (EN ATTENTE)</span></p>
                                                            </div>

                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                <tbody>
                                                    <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:4px 55px 10px;font-family:'Cabin',sans-serif;" align="left">

                                                            <div style="line-height: 170%; text-align: center; word-wrap: break-word;">
                                                                <p style="font-size: 14px; line-height: 170%;"><span style="font-size: 12px; line-height: 20.4px;">Montant Liquide à Recevoir : ${montantCurrencie.toString()} ${currencie}</span></p>
                                                                <p style="font-size: 14px; line-height: 170%;"><span style="font-size: 12px; line-height: 20.4px;">Montant ${nameCrypto} Envoyé: ${montant_eth}</span></p>
                                                                <p style="font-size: 14px; line-height: 170%;"><span style="font-size: 12px; line-height: 20.4px;">Montant USD &agrave; recevoir: ${montant_usd}</span></p>
                                                                <p style="font-size: 14px; line-height: 170%;"><span style="font-size: 12px; line-height: 20.4px;">Adresse ${nameCrypto}: ${addressCrypto}</span></p>
                                                                <p style="font-size: 14px; line-height: 170%;"><span style="font-size: 12px; line-height: 20.4px;">Type achat : ${typeTransaction}</span></p>
                                                                <p style="font-size: 14px; line-height: 170%;"><span style="font-size: 12px; line-height: 20.4px;">Reference ${nameCrypto} : ${ref}</span></p>
                                                                <p style="font-size: 14px; line-height: 170%;"><span style="font-size: 12px; line-height: 20.4px;">Date Operation : ${format(new Date(date_create_at), 'dd/MM/yyyy HH:mm')}</span></p>
                                                            </div>

                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <!--[if (!mso)&(!IE)]><!-->
                                        </div>
                                        <!--<![endif]-->
                                    </div>
                                </div>
                                <!--[if (mso)|(IE)]></td><![endif]-->
                                <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                            </div>
                        </div>
                    </div>



                    <div class="u-row-container" style="padding: 0px;background-color: #ffffff">
                        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
                            <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: #ffffff;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]-->

                                <!--[if (mso)|(IE)]><td align="center" width="300" style="background-color: #ffffff;width: 300px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
                                <div class="u-col u-col-50" style="max-width: 320px;min-width: 300px;display: table-cell;vertical-align: top;">
                                    <div style="background-color: #ffffff;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                                        <!--[if (!mso)&(!IE)]><!-->
                                        <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                                            <!--<![endif]-->

                                            <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                <tbody>
                                                    <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">

                                                            

                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <!--[if (!mso)&(!IE)]><!-->
                                        </div>
                                        <!--<![endif]-->
                                    </div>
                                </div>
                                <!--[if (mso)|(IE)]></td><![endif]-->
                                <!--[if (mso)|(IE)]><td align="center" width="300" style="background-color: #ffffff;width: 300px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
                                <div class="u-col u-col-50" style="max-width: 320px;min-width: 300px;display: table-cell;vertical-align: top;">
                                    <div style="background-color: #ffffff;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                                        <!--[if (!mso)&(!IE)]><!-->
                                        <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                                            <!--<![endif]-->

                                            <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                <tbody>
                                                    <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">

                                                            <div style="line-height: 140%; text-align: left; word-wrap: break-word;">
                                                                <p style="font-size: 14px; line-height: 140%;"><span style="font-size: 16px; line-height: 22.4px; color: #e03e2d;">DELAI TRAITEMENT : <br /><span style="color: #000000; font-size: 12px; line-height: 16.8px;">Entre 08h-20h, nous prenons maximum 30 minutes pour le traitement de la demande. Entre 20h-08h nous pouvons prendre plus d'une heure pour le traitement</span><br
                                                                    /></span>
                                                                </p>
                                                            </div>

                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                <tbody>
                                                    <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">

                                                            <div align="center">
                                                                <div style="display: table; max-width:36px;">
                                                                    <!--[if (mso)|(IE)]><table width="36" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-collapse:collapse;" align="center"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; mso-table-lspace: 0pt;mso-table-rspace: 0pt; width:36px;"><tr><![endif]-->


                                                                    


                                                                    <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                                                                </div>
                                                            </div>

                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <!--[if (!mso)&(!IE)]><!-->
                                        </div>
                                        <!--<![endif]-->
                                    </div>
                                </div>
                                <!--[if (mso)|(IE)]></td><![endif]-->
                                <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                            </div>
                        </div>
                    </div>


                    <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                </td>
            </tr>
        </tbody>
    </table>
    <!--[if mso]></div><![endif]-->
    <!--[if IE]></div><![endif]-->
</body>

</html>
  `;
}

export const messageOfExchangeForUserDone = (nameCrypto:string,receptionid:number, date_create_at:string, montantCurrencie:number, currencie:string, montant_eth:number, montant_usd:number, fraisNetwork:number, addressCrypto:string, ref:string, type:number, validate:boolean = true) =>{
  let typeTransaction = '';
  if(type === 0) typeTransaction = 'PayPal';
  if(type === 1) typeTransaction = 'Orange Money';
  if(type === 2) typeTransaction = 'Mtn Money';
  if(type === 3) typeTransaction = 'Moov Money';
  if(type === 4) typeTransaction = 'Perfect Money';
  if(type === 5) typeTransaction = 'Wave';
  return `
  <!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

<head>

    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title></title>

    <style type="text/css">
        table,
        td {
            color: #000000;
        }
        
        a {
            color: #0000ee;
            text-decoration: underline;
        }
        
        @media (max-width: 480px) {
            #u_content_image_5 .v-src-width {
                width: auto !important;
            }
            #u_content_image_5 .v-src-max-width {
                max-width: 22% !important;
            }
        }
        
        @media only screen and (min-width: 620px) {
            .u-row {
                width: 600px !important;
            }
            .u-row .u-col {
                vertical-align: top;
            }
            .u-row .u-col-50 {
                width: 300px !important;
            }
            .u-row .u-col-100 {
                width: 600px !important;
            }
        }
        
        @media (max-width: 620px) {
            .u-row-container {
                max-width: 100% !important;
                padding-left: 0px !important;
                padding-right: 0px !important;
            }
            .u-row .u-col {
                min-width: 320px !important;
                max-width: 100% !important;
                display: block !important;
            }
            .u-row {
                width: calc(100% - 40px) !important;
            }
            .u-col {
                width: 100% !important;
            }
            .u-col>div {
                margin: 0 auto;
            }
        }
        
        body {
            margin: 0;
            padding: 0;
        }
        
        table,
        tr,
        td {
            vertical-align: top;
            border-collapse: collapse;
        }
        
        p {
            margin: 0;
        }
        
        .ie-container table,
        .mso-container table {
            table-layout: fixed;
        }
        
        * {
            line-height: inherit;
        }
        
        a[x-apple-data-detectors='true'] {
            color: inherit !important;
            text-decoration: none !important;
        }
    </style>



    <!--[if !mso]><!-->
    <link href="https://fonts.googleapis.com/css?family=Cabin:400,700&display=swap" rel="stylesheet" type="text/css">
    <!--<![endif]-->

</head>

<body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
    <!--[if IE]><div class="ie-container"><![endif]-->
    <!--[if mso]><div class="mso-container"><![endif]-->
    <table style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%" cellpadding="0" cellspacing="0">
        <tbody>
            <tr style="vertical-align: top">
                <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #ffffff;"><![endif]-->


                    <div class="u-row-container" style="padding: 0px;background-color: transparent">
                        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #fcf9f8;">
                            <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #fcf9f8;"><![endif]-->

                                <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                                <div class="u-col u-col-100" style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                                    <div style="width: 100% !important;">
                                        <!--[if (!mso)&(!IE)]><!-->
                                        <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                            <!--<![endif]-->

                                            <table id="u_content_image_5" style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                <tbody>
                                                    <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:0px;font-family:'Cabin',sans-serif;" align="left">

                                                            

                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                <tbody>
                                                    <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:44px 10px 14px;font-family:'Cabin',sans-serif;" align="left">

                                                            <div style="line-height: 140%; text-align: center; word-wrap: break-word;">
                                                                <p style="font-size: 14px; line-height: 140%;"><span style="color: ${validate ? '#7ed321': '#DC143C'}; font-size: 14px; line-height: 19.6px;"><strong>TRANSACTION ${nameCrypto.toUpperCase()} SUR CRYPTO-WILD ${validate ? 'TERMINÉE': 'ANNULÉE'}</strong></span></p>
                                                            </div>

                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                <tbody>
                                                    <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:4px 55px 10px;font-family:'Cabin',sans-serif;" align="left">

                                                            <div style="line-height: 170%; text-align: center; word-wrap: break-word;">
                                                                <p style="font-size: 14px; line-height: 170%;"><span style="font-size: 12px; line-height: 20.4px;">PROCESSUS: N&deg;${receptionid.toString()}</span></p>
                                                            </div>

                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                <tbody>
                                                    <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:4px 55px 10px;font-family:'Cabin',sans-serif;" align="left">

                                                            <div style="line-height: 170%; text-align: center; word-wrap: break-word;">
                                                                <p style="font-size: 14px; line-height: 170%;"><span style="font-size: 12px; line-height: 20.4px;">Montant en Liquide : ${montantCurrencie.toString()} ${currencie}</span></p>
                                                                <p style="font-size: 14px; line-height: 170%;"><span style="font-size: 12px; line-height: 20.4px;">Montant ${nameCrypto} Total: ${montant_eth+ fraisNetwork}</span></p>
                                                                <p style="font-size: 14px; line-height: 170%;"><span style="font-size: 12px; line-height: 20.4px;">Frais de r&eacute;seau ${nameCrypto} : ${fraisNetwork}</span></p>
                                                                <p style="font-size: 14px; line-height: 170%;"><span style="font-size: 12px; line-height: 20.4px;">Montant Bitcoin &agrave; recevoir : ${montant_eth}</span></p>
                                                                <p style="font-size: 14px; line-height: 170%;"><span style="font-size: 12px; line-height: 20.4px;">Montant USD &agrave; recevoir: ${montant_usd}</span></p>
                                                                <p style="font-size: 14px; line-height: 170%;"><span style="font-size: 12px; line-height: 20.4px;">Adresse ${nameCrypto}: ${addressCrypto}</span></p>
                                                                <p style="font-size: 14px; line-height: 170%;"><span style="font-size: 12px; line-height: 20.4px;">Type achat : ${typeTransaction}</span></p>
                                                                <p style="font-size: 14px; line-height: 170%;"><span style="font-size: 12px; line-height: 20.4px;">Reference ${typeTransaction} : ${ref}</span></p>
                                                                <p style="font-size: 14px; line-height: 170%;"><span style="font-size: 12px; line-height: 20.4px;">Date Operation : ${format(new Date(date_create_at), 'dd/MM/yyyy HH:mm')}</span></p>
                                                            </div>

                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <!--[if (!mso)&(!IE)]><!-->
                                        </div>
                                        <!--<![endif]-->
                                    </div>
                                </div>
                                <!--[if (mso)|(IE)]></td><![endif]-->
                                <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                            </div>
                        </div>
                    </div>



                    <div class="u-row-container" style="padding: 0px;background-color: #ffffff">
                        <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #ffffff;">
                            <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
                                <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: #ffffff;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #ffffff;"><![endif]-->

                                <!--[if (mso)|(IE)]><td align="center" width="300" style="background-color: #ffffff;width: 300px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
                                <div class="u-col u-col-50" style="max-width: 320px;min-width: 300px;display: table-cell;vertical-align: top;">
                                    <div style="background-color: #ffffff;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                                        <!--[if (!mso)&(!IE)]><!-->
                                        <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                                            <!--<![endif]-->

                                            <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                <tbody>
                                                    <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">

                                                            

                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <!--[if (!mso)&(!IE)]><!-->
                                        </div>
                                        <!--<![endif]-->
                                    </div>
                                </div>
                                <!--[if (mso)|(IE)]></td><![endif]-->
                                <!--[if (mso)|(IE)]><td align="center" width="300" style="background-color: #ffffff;width: 300px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;" valign="top"><![endif]-->
                                <div class="u-col u-col-50" style="max-width: 320px;min-width: 300px;display: table-cell;vertical-align: top;">
                                    <div style="background-color: #ffffff;width: 100% !important;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                                        <!--[if (!mso)&(!IE)]><!-->
                                        <div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;border-radius: 0px;-webkit-border-radius: 0px; -moz-border-radius: 0px;">
                                            <!--<![endif]-->

                                            <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                <tbody>
                                                    <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">

                                                            <div style="line-height: 140%; text-align: left; word-wrap: break-word;">
                                                                <p style="font-size: 14px; line-height: 140%;"><span style="font-size: 16px; line-height: 22.4px; color: #e03e2d;">DELAI TRAITEMENT : <br /><span style="color: #000000; font-size: 12px; line-height: 16.8px;">Entre 08h-20h, nous prenons maximum 30 minutes pour le traitement de la demande. Entre 20h-08h nous pouvons prendre plus d'une heure pour le traitement</span><br
                                                                    /></span>
                                                                </p>
                                                            </div>

                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <table style="font-family:'Cabin',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                                                <tbody>
                                                    <tr>
                                                        <td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:'Cabin',sans-serif;" align="left">

                                                            <div align="center">
                                                                <div style="display: table; max-width:36px;">
                                                                    <!--[if (mso)|(IE)]><table width="36" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-collapse:collapse;" align="center"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; mso-table-lspace: 0pt;mso-table-rspace: 0pt; width:36px;"><tr><![endif]-->


                                                                    


                                                                    <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                                                                </div>
                                                            </div>

                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <!--[if (!mso)&(!IE)]><!-->
                                        </div>
                                        <!--<![endif]-->
                                    </div>
                                </div>
                                <!--[if (mso)|(IE)]></td><![endif]-->
                                <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                            </div>
                        </div>
                    </div>


                    <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                </td>
            </tr>
        </tbody>
    </table>
    <!--[if mso]></div><![endif]-->
    <!--[if IE]></div><![endif]-->
</body>

</html>
  `;
}

export const nextStepForPackaheUpgrade = (nextGenForfait: number, prevAmount: number, nextAmount: number): number => {
  return nextGenForfait === 2 ? prevAmount : nextAmount ;
}

export const payementVerifyByPromo = (isNewUserBenefit: number): number => {
  return isNewUserBenefit === 1 ? POURCENTAGE_PAY_BY_WEEK_FOR_NEW_USER : POURCENTAGE_PAY_BY_WEEK ;
}

export const formatInitDemande = (forfaitid:number,numberDayTotalVersement:number , userid:number,amount:number, percentageTotal:number,ref:string): FormatInitDemandeInterface => {
    return {
        expire_at: addDays(new Date(), numberDayTotalVersement),
        forfaitid,
        userid,
        amount: Math.round(amount),
        last_date_payement: new Date(),
        ref,
        percentageTotal,
        commissionDay: parseFloat((percentageTotal / numberDayTotalVersement).toFixed(5))
    }
}

export const fakeDataCountry = (country:string, value:number): (string|number)[] => {
    switch (country) {
        case 'CA':
            return [country, 1134+value];
        case 'US':
            return [country, 163+value];
        case 'CN':
            return [country, 116+value];
        case 'NG':
            return [country, 34+value];
        case 'GH':
            return [country, 10+value];
        case 'DZ':
            return [country, 8+value];
        case 'BE':
            return [country, 36 + value];
        case 'FR':
            return [country, 250 + value];
        case 'GA':
            return [country, 10 + value];
        case 'DE':
            return [country, 23 + value];
        case 'IN':
            return [country, 21 + value];
        case 'KE':
            return [country, 16 + value];             
        default:
            return [country, value];
    }
}

const arrayTime = [5000, 15000, 23000, 2000, 6000, 10000, 31000, 32000, 75000, 10000, 20000, 13000, 23000, 34000,41000,54000,6600, 7100, 8900,9200];

export const randomTime = () => arrayTime[Math.floor(Math.random() * arrayTime.length)];

