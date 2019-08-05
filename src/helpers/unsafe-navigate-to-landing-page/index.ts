import stringToBoolean from '../string-to-boolean/index';

export default function unsafeNavigateToLandingPage(settings, redirect, force = false) {
  // If there is a URL hash present, don't redirect to any default page
  if (!force && ['', '#', '#/', '#/login'].indexOf(window.location.hash) < 0) {
    return;
  // If there is an explicit redirect queued, use that {
  } else if (redirect) {
    window.location.hash = redirect;
  // If the dashboards page is enabled, redirect to the dashboards page on first navigation
  } else if (stringToBoolean(settings.dashboardEnabled)) {
    window.location.hash = '#/dashboards';
  // If the explore page is locked, redirect to the live page.
  } else if (stringToBoolean(settings.insightsPageLocked || settings.explorePageLocked)) {
    window.location.hash = '#/spaces/live';
  // Otherwise land on the explore page
  } else {
    window.location.hash = '#/spaces';
  }
}
