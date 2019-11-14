export const REDIRECT_AFTER_LOGIN = 'REDIRECT_AFTER_LOGIN';

export default function redirectAfterLogin(hash) {
  if (['', '#', '#/', '#/login'].indexOf(window.location.hash) < 0) {
    return {
      type: REDIRECT_AFTER_LOGIN,
      hash: hash
    };
  } else {
    return {
      type: REDIRECT_AFTER_LOGIN,
      hash: null
    };
  }
}
