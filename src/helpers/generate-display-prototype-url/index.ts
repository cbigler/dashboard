// Given a path, generate a link to the display prototype
export default function generateDisplayPrototypeUrl(path, href=window.location.href) {
  if (href.includes('density.io') || href.includes('density.rodeo')) {
    // dashboard.density.io => safe.density.io
    href = href.replace('dashboard', 'safe');
  } else {
    // localhost:3000 => localhost:4000
    const u = new URL(href);
    u.port = '4000'; /* assumes display prototype runs on port 4000 */
    href = u.toString();
  }
  const u = new URL(href);
  u.pathname = '';
  u.hash = `#${path}`;
  return u.toString();
}
