import * as React from 'react';
import handleVisibilityChange from '../visibility-change';

export default function autoRefresh({shouldComponentUpdate}) {
  return Component => {
    class RealtimeComponent extends React.Component<any, any> {
      animationFrame: any;
      cancelHandleVisibilityChange: any;

      constructor(props) {
        super(props);
        this.state = { lastFrame: window.performance.now() };
        this.shouldComponentUpdate = shouldComponentUpdate || this.shouldComponentUpdate;
        this.tick = this.tick.bind(this);
      }
      componentDidMount() {
        this.animationFrame = window.requestAnimationFrame(this.tick);
        this.cancelHandleVisibilityChange = handleVisibilityChange(hidden => hidden ? 
          this.animationFrame = window.requestAnimationFrame(this.tick) :
          window.cancelAnimationFrame(this.animationFrame)
        );
      }
      componentWillUnmount() {
        this.cancelHandleVisibilityChange();
        window.cancelAnimationFrame(this.animationFrame);
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
