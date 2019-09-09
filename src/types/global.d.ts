// Please DO NOT add many types to this file!
// It is for types that *must* be global in our codebase
// NEVER use import or export keywords in this file

type InAHurry = 'InAHurry';
type FixInReview = 'FixInReview';
type FixInRefactor = 'FixInRefactor';
type Any<T extends InAHurry | FixInReview | FixInRefactor> = any;
