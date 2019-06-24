import React from 'react';

export default Component => {
  class AutoWidthComponent extends React.Component<any, any> {
    container: any;
    state = { width: 0 };

    componentDidUpdate(prevProps, prevState) {
      const width = this.container.offsetWidth;
      if (width !== prevState.width) {
        this.setState({ width });
      }
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
