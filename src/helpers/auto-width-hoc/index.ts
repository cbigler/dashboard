import React from 'react';
import unsafeHandleWindowResize from '../unsafe-handle-window-resize';

export interface AutoWidthHocProps { width: number };

export default <P>(Component: React.FunctionComponent<P>, delay = 300) => {
  class AutoWidthComponent extends React.Component<Exclude<P, AutoWidthHocProps>> {
    container: any;
    resizeListener: any;
    state = { width: 0 };

    resize() {
      if (this.container) {
        this.setState({ width: this.container.offsetWidth });
      }
    }

    componentDidMount() {
      this.resizeListener = unsafeHandleWindowResize(this.resize.bind(this), delay);
      this.resize.call(this);
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.resizeListener);
    }

    render() {
      const width = this.state.width;
      return React.createElement('div', { ref: r => this.container = r, style: { width: '100%', height: '100%' } },
        React.createElement(Component, { width, ...this.props })
      );
    }
  }

  (AutoWidthComponent as any).displayName = `AutoWidth(${
    Component.displayName || Component.name || 'Component'
  })`

  return AutoWidthComponent;
}
