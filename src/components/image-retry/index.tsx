import React from 'react';
import styles from './styles.module.scss';


// Display modes
const FALLBACK = 'FALLBACK';
const LOADING = 'LOADING';
const DONE = 'DONE';


export default class ImageRetry extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      mode: DONE,
      retries: props.retries || 1,
      orientation: ''
    };
  }

  retry() {
    this.setState({ 
      retries: this.state.retries - 1,
      mode: DONE
    });
  }

  scheduleRetry() {
    if (this.state.retries > 0) {
      this.setState({ mode: LOADING });
      window.setTimeout(this.retry.bind(this), this.props.interval || 2000);
    } else {
      this.setState({ mode: FALLBACK });
    }
  }

  setProportions(event) {
    if (event.target.clientWidth >= event.target.clientHeight) {
      this.setState({ orientation: 'landscape' });
    } else {
      this.setState({ orientation: 'portrait' });
    }
  }

  render() {
    if (this.props.src && this.state.retries > 0 && this.state.mode === DONE) {
      return <img
        src={this.props.src}
        alt={this.props.alt}
        className={this.props.className + ' ' + this.state.orientation}
        style={this.props.style}
        onError={this.scheduleRetry.bind(this)}
        onLoad={this.setProportions.bind(this)}
      />;
    } else if (this.state.mode === LOADING) {
      return this.props.loadingContent || <div className={styles.imageRetryLoading}></div>;
    } else {
      return this.props.fallbackContent || <div className={styles.imageRetryFallback}></div>;
    }
  }
}
