import * as React from 'react';

export default function autoRefresh({shouldComponentUpdate}) {
  return Component => {
    class RealtimeComponent extends React.Component<any, any> {
      animationFrame: any;

      constructor(props) {
        super(props);
        this.state = { lastFrame: window.performance.now() };
        this.shouldComponentUpdate = shouldComponentUpdate || this.shouldComponentUpdate;
        this.handleVisibility = this.handleVisibility.bind(this);
        this.tick = this.tick.bind(this);
      }
      componentDidMount() {
        this.animationFrame = window.requestAnimationFrame(this.tick);
        document.addEventListener('visibilitychange', this.handleVisibility);
      }
      componentWillUnmount() {
        document.removeEventListener('visibilitychange', this.handleVisibility);
        window.cancelAnimationFrame(this.animationFrame);
      }
      handleVisibility() {
        if (document.visibilityState === 'visible') {
          this.animationFrame = window.requestAnimationFrame(this.tick);
        } else {
          window.cancelAnimationFrame(this.animationFrame);
        }
      }
      tick() {
        this.setState({ lastFrame: window.performance.now() });
        this.animationFrame = window.requestAnimationFrame(this.tick);
      }
      render() {
        return React.createElement(Component, this.props);
      }
    }

    (RealtimeComponent as any).displayName = `AutoRefresh(${
      Component.displayName || Component.name || 'Component'
    })`
    return RealtimeComponent;
  };
}
