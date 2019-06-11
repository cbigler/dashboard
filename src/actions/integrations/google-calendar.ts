import core from '../../client/core';

export default function doGoogleCalendarAuthRedirect() {
    return core().get('/integrations/google_calendar/')
        .then(resp => window.location.href = resp.data)
        .catch(() => window.location.href = '/#/admin/integrations/google-calendar/fail');
}
