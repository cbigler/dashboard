import moment from 'moment';

export default function isMultiWeekSelection(startDate, endDate) {
	let multiWeekSelection = false;
	const startDateMoment = moment(startDate);
	const endDateMoment = moment(endDate);
	return endDateMoment.diff(startDateMoment, 'days') > 7;
}