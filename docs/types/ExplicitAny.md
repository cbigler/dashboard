# Explicit Any Types

The dashboard is migrating to disallow the implicit `any` type. All variables that need to be `any` should be tagged explicitly with one of the following:

```TypeScript
// The correct type here is probably very difficult to understand -
// it should be fixed when we spend time improving the codebase
const a: Any<FixInRefactor> = 123;

// The correct type here should be added before shipping, either
// by the PR submitter, or by a reviewer if they prefer
const b: Any<FixInReview> = 123;

// The correct type here might be easy, but the author is in a hurry
const c: Any<InAHurry> = 123;

// This is properly an `any` type and we have no plans to change it
const d: any = 123;
```
