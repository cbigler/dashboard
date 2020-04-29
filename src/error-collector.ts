import moment from 'moment';
import errorCollector from './client/error-collector';
import {
  getLocationHref,
  isErrorEvent,
  isPrimitive,
  isString,
} from '@sentry/utils';
import { eventFromUnknownInput } from '@sentry/browser/dist/eventbuilder';
import { getCurrentHub } from '@sentry/core';

import { storeDirectory } from './rx-stores';

// Include these fields in errors when they are sent to the server
const ERROR_FIELDS = {
  locationHref: () => window.location.href,
  browserTimestamp: () => moment().format(),
  userAgent: () => window.navigator.userAgent,
  storeStateSnapshots: () => {
    const snapshots = {};
    for (let displayName in storeDirectory) {
      snapshots[displayName] = storeDirectory[displayName].imperativelyGetValue();
    }
    return snapshots;
  },
};

window.onerror = (...args) => {
  const body = {
    type: 'uncaughterror',
    details: parseFromError(...args),
  };

  Object.entries(ERROR_FIELDS).forEach(([key, value]) => {
    try {
      body[key] = value();
    } catch (error) {
      console.error(`Error generating ${key}: ${error}`);
      body[key] = { error: error.stack };
    }
  });

  errorCollector().post('/errors', body).catch(error => {
    console.error('Error sending unhandled error to error collector:', error);
  });
}

window.onunhandledrejection = (e) => {
  const body = {
    type: 'unhandledrejection',
    details: parseFromUnhandledRejection(e),
  };

  Object.entries(ERROR_FIELDS).forEach(([key, value]) => {
    try {
      body[key] = value();
    } catch (error) {
      console.error(`Error generating ${key}: ${error}`);
      body[key] = { error: error.stack };
    }
  });

  errorCollector().post('/errors', body).catch(error => {
    console.error('Error sending unhandled error to error collector:', error);
  });
};

// This error handling logic is largely adapted from sentry:
// https://github.com/getsentry/sentry-javascript/blob/dd7bf9284b28bd35d893e44b5dc92d6c0f081c0b/packages/browser/src/integrations/globalhandlers.ts#L74-L110
//
// Sentry is available under this license:
// https://github.com/getsentry/sentry-javascript/blob/master/LICENSE
function parseFromError(msg, url, line, column, error) {
  const currentHub = getCurrentHub();
  const client = currentHub.getClient();

  return isPrimitive(error) ? (
     _eventFromIncompleteOnError(msg, url, line, column)
  ) : (
     _enhanceEventWithInitialFrame(
         eventFromUnknownInput(error, undefined, {
           attachStacktrace: client && client.getOptions().attachStacktrace,
           rejection: false,
         }),
         url,
         line,
         column,
       )
  );
}

function parseFromUnhandledRejection(e) {
  let error = e;

  // dig the object of the rejection out of known event types
  try {
    // PromiseRejectionEvents store the object of the rejection under 'reason'
    // see https://developer.mozilla.org/en-US/docs/Web/API/PromiseRejectionEvent
    if ('reason' in e) {
      error = e.reason;
    }
    // something, somewhere, (likely a browser extension) effectively casts PromiseRejectionEvents
    // to CustomEvents, moving the `promise` and `reason` attributes of the PRE into
    // the CustomEvent's `detail` attribute, since they're not part of CustomEvent's spec
    // see https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent and
    // https://github.com/getsentry/sentry-javascript/issues/2380
    else if ('detail' in e && 'reason' in e.detail) {
      error = e.detail.reason;
    }
  } catch (_oO) {
    // no-empty
  }

  const currentHub = getCurrentHub();
  const client = currentHub.getClient();

  const event = isPrimitive(error)
    ? _eventFromIncompleteRejection(error)
    : eventFromUnknownInput(error, undefined, {
        attachStacktrace: client && client.getOptions().attachStacktrace,
        rejection: true,
      });

  return event;
}

function _eventFromIncompleteOnError(msg: any, url: any, line: any, column: any): Event {
  const ERROR_TYPES_RE = /^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?(.*)$/i;

  // If 'message' is ErrorEvent, get real message from inside
  let message = isErrorEvent(msg) ? msg.message : msg;
  let name;

  if (isString(message)) {
    const groups = message.match(ERROR_TYPES_RE);
    if (groups) {
      name = groups[1];
      message = groups[2];
    }
  }

  const event = {
    exception: {
      values: [
        {
          type: name || 'Error',
          value: message,
        },
      ],
    },
  };

  return _enhanceEventWithInitialFrame(event, url, line, column);
}
function _enhanceEventWithInitialFrame(event, url, line, column) {
  event.exception = event.exception || {};
  event.exception.values = event.exception.values || [];
  event.exception.values[0] = event.exception.values[0] || {};
  event.exception.values[0].stacktrace = event.exception.values[0].stacktrace || {};
  event.exception.values[0].stacktrace.frames = event.exception.values[0].stacktrace.frames || [];

  const colno = isNaN(parseInt(column, 10)) ? undefined : column;
  const lineno = isNaN(parseInt(line, 10)) ? undefined : line;
  const filename = isString(url) && url.length > 0 ? url : getLocationHref();

  if (event.exception.values[0].stacktrace.frames.length === 0) {
    event.exception.values[0].stacktrace.frames.push({
      colno,
      filename,
      function: '?',
      in_app: true,
      lineno,
    });
  }

  return event;
}
/**
 * This function creates an Event from an TraceKitStackTrace that has part of it missing.
 */
function _eventFromIncompleteRejection(error) {
  return {
    exception: {
      values: [
        {
          type: 'UnhandledRejection',
          value: `Non-Error promise rejection captured with value: ${error}`,
        },
      ],
    },
  };
}
