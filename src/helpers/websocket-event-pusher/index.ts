import { EventEmitter } from 'events';
import objectSnakeToCamel from '../object-snake-to-camel/index';

import debug from 'debug';

import { core } from '../../client';

// If disconnected, try to connect at minimum this often.
const MINIMUM_CONNECTION_INTERVAL = 500;

// Every 60 seconds, send a ping on the websocket connection. This is to ensure that it stays open.
const WEBSOCKET_PING_MESSAGE_INTERVAL_IN_SECONDS = 60 * 1000;

export const CONNECTION_STATES = {
  CLOSED: 'CLOSED',
  WAITING_FOR_SOCKET_URL: 'WAITING_FOR_SOCKET_URL',
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  ERROR: 'ERROR',
};

export default class WebsocketEventPusher extends EventEmitter {
  WebSocket: any;
  log: any;
  socket: any;
  connectionState: string;
  gracefulDisconnect: boolean;
  pingIntervalId: any;

  constructor(WebSocket=(window as any).WebSocket) {
    super();
    this.WebSocket = WebSocket;

    this.log = debug('density:websocket-event-pusher');

    this.gracefulDisconnect = false;
    this.connectionState = CONNECTION_STATES.CLOSED;
    this.emit('connectionStateChange', this.connectionState);

    this.socket = null;
    this.connect()
  }

  async connect(iteration=0) {
    this.log('CONNECT TO SOCKET');
    if (!this.WebSocket) {
      return false;
    }

    // If connected already, close the connection before connecting again.
    if (this.connectionState === CONNECTION_STATES.CONNECTED) {
      this.log('   ... SOCKET IS ALREADY CONNECTED');
      return false;
    }

    // Ensure that only one connection can occur at a time.
    if (this.connectionState === CONNECTION_STATES.WAITING_FOR_SOCKET_URL || this.connectionState === CONNECTION_STATES.CONNECTING) {
      this.log('   ... SOCKET CONNECTION ALREADY IN PROGRESS');
      return false;
    }

    if (!core.config().token) {
      this.log(' ... NO TOKEN SET, NOT CONNECTING TO SOCKET.');
      return false;
    }

    // Start the socket url connection process
    this.connectionState = CONNECTION_STATES.WAITING_FOR_SOCKET_URL;
    this.log('   ... CONNECTION STATE UPDATE %o', this.connectionState);
    this.emit('connectionStateChange', this.connectionState);

    try {
      const response = await core.sockets.create();

      this.connectionState = CONNECTION_STATES.CONNECTING;
      this.log('   ... CONNECTION STATE UPDATE: %o', this.connectionState);
      this.emit('connectionStateChange', this.connectionState);

      this.socket = new this.WebSocket(response.url);
      this.socket.onopen = () => {
        this.connectionState = CONNECTION_STATES.CONNECTED;
        this.log('   ... CONNECTION STATE UPDATE: %o', this.connectionState);
        this.emit('connectionStateChange', this.connectionState);

        // When a successful connection occurs, reset the iteration count back to zero so that the
        // backoff is reset.
        iteration = 0;
        this.emit('connected');

        // Every one and a while, send a message to the server to keep the websocket message alive.
        this.log('   ... INITIATING PERIODIC PING INTERVAL OF %o', WEBSOCKET_PING_MESSAGE_INTERVAL_IN_SECONDS);
        this.pingIntervalId = window.setInterval(() => {
          this.log('   ... PINGING SOCKETS SERVER TO KEEP WEBSOCKET OPEN');
          this.socket.send('"ping"');
        }, WEBSOCKET_PING_MESSAGE_INTERVAL_IN_SECONDS);
      };

      // Currently, the only events are space updates.
      this.socket.onmessage = e => {
        this.log('SOCKET MESSAGE RECEIVED: %o', e.data);
        this.emit('space', objectSnakeToCamel(JSON.parse(e.data)).payload);
      }

      // When the connection disconnects, reconnect after a delay.
      this.socket.onclose = () => {
        this.connectionState = CONNECTION_STATES.CLOSED;
        this.log('SOCKET CLOSE', this.gracefulDisconnect);
        this.emit('disconnect');

        // Clear the interval that sends a ping to the sockets server if it is open.
        if (this.pingIntervalId) {
          window.clearInterval(this.pingIntervalId);
        }

        if (this.gracefulDisconnect) {
          this.log('   ... GRACEFULLY DISCONNECTING');
          this.gracefulDisconnect = false;
          return;
        }

        // We're not gracefully disconnecting, so try to reconnect.

        // Calculate the timeout before the next reconnect attempt. Use an exponential backoff.
        const backoffTimeout = MINIMUM_CONNECTION_INTERVAL + (Math.pow(iteration, 2) * 1000);

        // Queue up the next attempt to reconnect to the socket server.
        setTimeout(() => this.connect(iteration+1), backoffTimeout);

        // Reset the graceful disconenct value after perfoming the disconnect (ie, default to a
        // non-graceful disconnect)
        this.gracefulDisconnect = false;
      };

      this.emit('fetchedUrl');
    } catch (err) {
      // An error occured while connection. so log it and try to reconnect.
      this.connectionState = CONNECTION_STATES.ERROR;
      this.log('SOCKET ERROR: %o', err);
      this.emit('connectionStateChange', this.connectionState);

      // Attempt to reconnect after an error.

      // Calculate the timeout before the next reconnect attempt. Use an exponential backoff.
      const backoffTimeout = MINIMUM_CONNECTION_INTERVAL + (Math.pow(iteration, 2) * 1000);

      // Queue up the next attempt to reconnect to the socket server.
      setTimeout(() => this.connect(iteration+1), backoffTimeout);
    }
  }

  disconnect() {
    this.log('INITIATING GRACEFUL DISCONNECT');
    this.gracefulDisconnect = true;
    if (this.socket) {
      this.socket.close();
    }

    this.connectionState = CONNECTION_STATES.CLOSED;
    this.emit('connectionStateChange', this.connectionState);
  }
}
