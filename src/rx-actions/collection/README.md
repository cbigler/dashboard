# Collection actions

Collections are a central data storage concept. Essentially, they are a way of
storing an array of objects in a consistent fashion, and include baked in ways of doing common
things, such as a loding interval, filters, paging, etc.

## General structure
A collection has two parts - the actions and the reducer.

Each action performs a distinct action, and many are reminiscent of CRUD. Their structure is very
predictable, because like all actions they are mirrored after their location on disk. Since
collection actions are in the `collections` folder, all collection actions start with `COLLECTION_`.

Here's a few of common actions types that are used in most collections:
- `set`: Given an array of items, replace all items in the collection with the passed array.
- `push`: Given a single item, try to intelligently merge in the item. This means:
  - If a pushed item has an id that matches an item already in the collection, then update any
    fields passed with the new values. For example, if the collection is `[{id: 1, a: 'b', c: 'd'},
    {id: 2, a: 'foo', c: 'bar'}]` and I push an item with `{id: 1, a: 'baz'}`, then the new
    collection would look like `[{id: 1, a: 'baz', c: 'd'}, {id: 2, a: 'foo', c: 'bar'}]`.
  - If a pushed item isn't in the colelction, it's appended to the collection.
- `filter`: Set a filter within the collection. Next time the collection is fetched, use the given
  filter to segment the response.
- `fetch`: Fetch data from a server into the collection.
