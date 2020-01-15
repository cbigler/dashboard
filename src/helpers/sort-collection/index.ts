export const SORT_A_Z = 'SORT_A_Z',
             SORT_NEWEST = 'SORT_NEWEST';

export default function sortCollection(items, method) {
  // Don't sort a set of items when no sort method is defined.
  if (!method) {
    return items;
  }

  // Sort the items.
  return items.sort((a, b) => {
    if (method === SORT_A_Z) {
      return a.name > b.name ? 1 : -1;
    } else if (method === SORT_NEWEST) {
      return (new Date(b.created_at).getTime()) - (new Date(a.created_at).getTime());
    } else if (typeof method === 'function') {
      return method(a, b);
    } else {
      return 0;
    }
  });
}
