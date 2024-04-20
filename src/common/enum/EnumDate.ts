export enum EDateType {
  Date = 'yyyy-MM-dd',
  DateTime = 'yyyy-MM-dd HH:MM:SS',
}

export enum TypeSectionEntrie {
  Dashboard = 'Dashboard',
  MakeDemande = 'MakeDemande',
  SuivieDemande = 'SuivieDemande',
  ConfirmationDemande = 'ConfirmationDemande',
  Params = 'Params',
}

export enum MotifLocked {
  NotReinvest = 'Pas Réinvestie',
  NotPay = 'Refus Paiement',
  DelayOutForFinishedStepDemande = 'Delais depassé pour validation des étapes',
}
