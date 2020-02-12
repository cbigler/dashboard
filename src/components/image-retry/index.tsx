import styles from './styles.module.scss';
import colors from '@density/ui/variables/colors.json';

import React from 'react';
import { Icons } from '@density/ui/src';

// Display modes
const FALLBACK = 'FALLBACK';
const LOADING = 'LOADING';
const DONE = 'DONE';

// Map orientation to width and height values
const ORIENTATION_WIDTH = { 'portrait': '100%', 'landscape': 'auto' };
const ORIENTATION_HEIGHT = { 'portrait': 'auto', 'landscape': '100%' };

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
        className={styles.image}
        style={{
          width: ORIENTATION_WIDTH[this.state.orientation],
          height: ORIENTATION_HEIGHT[this.state.orientation],
          ...this.props.style
        }}
        onError={this.scheduleRetry.bind(this)}
        onLoad={this.setProportions.bind(this)}
      />;
    } else if (this.state.mode === LOADING) {
      return this.props.loadingContent || <div className={styles.imageLoading}>
        <Icons.Image color={colors.white} />
      </div>;
    } else {
      return this.props.fallbackContent || <div className={styles.imageFallback}>
        <Icons.Image color={colors.white} />
      </div>;
    }
  }
}
