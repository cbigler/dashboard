import * as React from 'react';
import classnames from 'classnames';

export default function FormLabel({label, infoLabel = '', input, htmlFor, className, editable = false}) {
  // `editable` should default to true if unset.
  editable = typeof editable === 'undefined' ? true : editable;

  return <div className={classnames('form-label', editable ? 'form-label-editable' : null, className)}>
    <label className="form-label-label" htmlFor={htmlFor}>
      <span className="form-label-label-text">{label}</span>
      {infoLabel ? <span className="form-label-info-icon" title={infoLabel}>&#xe91e;</span> : null}
    </label>
    {input}
  </div>;
}
