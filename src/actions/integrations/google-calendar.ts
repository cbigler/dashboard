import core from '../../client/core';


export default function doGoogleCalendarAuthRedirect() {
    core().get('/integrations/google_calendar/').then(resp => window.location.href = resp.data);
}
