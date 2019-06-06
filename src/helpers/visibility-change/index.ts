let hidden, visibilityChange; 
if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
  hidden = "hidden";
  visibilityChange = "visibilitychange";
} else if (typeof (document as any).msHidden !== "undefined") {
  hidden = "msHidden";
  visibilityChange = "msvisibilitychange";
} else if (typeof (document as any).webkitHidden !== "undefined") {
  hidden = "webkitHidden";
  visibilityChange = "webkitvisibilitychange";
}

export default function handleVisibilityChange(callback: (hidden: boolean) => any): () => any {
  const wrappedCallback = () => callback(document[hidden]);
  const cancelListener = () => window.removeEventListener(visibilityChange, wrappedCallback, true);
  window.addEventListener(visibilityChange, wrappedCallback, true);
  return cancelListener;
}
