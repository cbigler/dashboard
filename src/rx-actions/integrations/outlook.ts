import core from '../../client/core';

export default function doOutlookAuthRedirect() {
    return core().get('/integrations/outlook/')
        .then(resp => window.location.href = resp.data)
        .catch(() => window.location.href = '/#/admin/integrations/outlook/fail');
}
