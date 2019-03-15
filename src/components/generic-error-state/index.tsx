import React from 'react';

export default function GenericErrorState() {
  return (
    <div className="generic-error-state">
      <span className="generic-error-state-whoops">Whoops</span>
      <span className="generic-error-state-message">
        Try refreshing the page, or contacting <a href="mailto:support@density.io">support</a>.
      </span>
    </div>
  );
}
