import moment from 'moment';

export default function isMultiWeekSelection(startDate, endDate) {
	let multiWeekSelection = false;
	const startDateMoment = moment(startDate);
	const endDateMoment = moment(endDate);
	if (endDateMoment.diff(startDateMoment, 'days') > 7) {
		multiWeekSelection = true;
	}
	return multiWeekSelection;
}