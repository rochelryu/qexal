export const moreInfoMailSenderIfSucces = (info: {
  language: string;
  subregion: string;
  percentageWithdraw: number;
  amountInvest: number;
}): string => {
  if (info.language === 'French') {
    return `Vu êtes situé en ${info.subregion} donc vos retraits sont faisable du samedi matin 09h GMT + 0 jusqu'au dimanche matin 09H GMT + 0.
        Le montant minimum de retrait est 50$.
        Aussi vous pourriez commencer à retirer dès que vous arrez eu votre solde de gain superieur à ${info.percentageWithdraw * 100}% du montant que vous avez investis (rêgle de la structure que vous avez choisis).
        Aucun parrainage est obligatoire.
        Votre argent vient directement dans votre portefeuille électronique.`;
  } else {
    return `As you are located in ${info.subregion}, you can withdraw from Saturday morning 09h GMT + 0 until Sunday morning 09h GMT + 0.
        The minimum withdrawal amount is $50.
        So you can start withdrawing as soon as your winnings exceed ${info.percentageWithdraw * 100}% of the amount you've invested (depending on the structure you've chosen).
        No referral is required.
        Your money comes directly into your electronic wallet.`;
  }
};
export const libelleMailSenderIfSucces = (info: {
  language: string;
  nameStructure: string;
  times: number;
}): string => {
  if (info.language === 'French') {
    return `Vous avez investis dans la structure ${info.nameStructure} qui propose des revenus à ${info.times < 45 ? 'cours termes' : info.times < 62 ? 'moyen terme' : 'long terme'} (${info.times} jours). Nous prenons toute garantie en cas de litige entre vous et eux. Merci d'avoir utilisé Qexal.`;
  } else {
    return `You have invested in the structure ${info.nameStructure} which offers income at ${info.times < 45 ? 'short term' : info.times < 62 ? 'medium term' : 'long term'} (${info.times} days). We take full responsibility for any dispute between you and them. Thank you for using Qexal.`;
  }
};

export const titleMailSenderIfSucces = (info: { language: string }): string => {
  if (info.language === 'French') {
    return `Action en cours`;
  } else {
    return `Action in progress`;
  }
};
