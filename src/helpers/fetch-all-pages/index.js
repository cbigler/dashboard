// Fetch all pages of data, given a functino to fetch a single page.
//
// The `fetchSinglePage` function is passed a single argument, the page of data to fetch, and
// expected to resolve a core-api-like data response, which includes these keys:
// - `next`, which indicates if there is another page of data for the system to fetch.
// - `results`, which contains an array of data items that are contained within that data page.
// - `total`, which contains the total number of items in the response.
//
// Example call: fetchSinglePage(1)
// Example response: {next: 'https://api.density.io/v2/spaces?page=2', total: 18, results: [1, 2, 3, 4, 5]}
export default function fetchAllPages(fetchSinglePage) {
  return (async function getPage(page=1) {
    const data = await fetchSinglePage(page);

    if (!data) {
      throw new Error(`Function did not return a page of data! (data=${data})`);
    }

    if (typeof data.next === 'undefined') {
      throw new Error(`Page of data did not contain .next key! (data=${data})`);
    }
    if (typeof data.results === 'undefined') {
      throw new Error(`Page of data did not contain .results key! (data=${data})`);
    }

    if (data.next) {
      return [...data.results, ...await getPage(page+1)];
    } else {
      return data.results;
    }
  })();
}
