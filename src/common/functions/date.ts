import { MoreThan, MoreThanOrEqual, LessThan, LessThanOrEqual, Between } from 'typeorm';
import { format } from 'date-fns';
import { EDateType } from '../enum/EnumDate';

const MoreThanDate = (date: Date, type: EDateType) => MoreThan(format(date, type));
export const verifyWeekend = () => new Date().getDay() % 6 === 0 ;
const MoreThanOrEqualDate = (date: Date, type: EDateType) => MoreThanOrEqual(format(date, type));
const LessThanDate = (date: Date, type: EDateType) => LessThan(format(date, type));
const LessThanOrEqualDate = (date: Date, type: EDateType) => LessThanOrEqual(format(date, type));

const BetweenDate = (begDate: Date, endDate: Date, type: EDateType) =>
	Between(format(begDate, type), format(endDate, type));

export { MoreThanDate, MoreThanOrEqualDate, LessThanDate, LessThanOrEqualDate, BetweenDate };
