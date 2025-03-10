import {
  MoreThan,
  MoreThanOrEqual,
  LessThan,
  LessThanOrEqual,
  Between,
} from 'typeorm';
import { format } from 'date-fns';
import { EDateType } from '../enum/EnumDate';

const MoreThanDate = (date: Date, type: EDateType) =>
  MoreThan(new Date(format(date, type)));
export const verifyWeekend = () => new Date().getDay() % 6 === 0;
const MoreThanOrEqualDate = (date: Date, type: EDateType) =>
  MoreThanOrEqual(new Date(format(date, type)));
const LessThanDate = (date: Date, type: EDateType) =>
  LessThan(new Date(format(date, type)));
const LessThanOrEqualDate = (date: Date, type: EDateType) =>
  LessThanOrEqual(new Date(format(date, type)));

const BetweenDate = (begDate: Date, endDate: Date, type: EDateType) =>
  Between(new Date(format(begDate, type)), new Date(format(endDate, type)));
export const formatDateAndTime = (date: Date) => format(date, 'dd/MM/yyyy HH:mm');
export {
  MoreThanDate,
  MoreThanOrEqualDate,
  LessThanDate,
  LessThanOrEqualDate,
  BetweenDate,
};
