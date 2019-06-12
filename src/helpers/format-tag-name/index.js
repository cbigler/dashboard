export default function formatTagName(tagName) {
  let dashedName = tagName.replace(/[^a-zA-Z0-9_-]/g, '-');

  // Remove duplicate dashes that are in a row.
  let lastDashedName = null;
  while (lastDashedName !== dashedName) {
    lastDashedName = dashedName;
    dashedName = dashedName.replace(/--/g, '-');
  }
  return dashedName;
}
