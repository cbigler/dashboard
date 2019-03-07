import React from 'react';

import ModalHeaderActionButton from '../modal-header-action-button/index';
import { InputBox } from '@density/ui';

export default function WebhookCard({
  webhook,
  onClickEdit,
}) {
  return <div className="webhook-card">
    <div className="webhook-card-header">
      <span className="webhook-card-header-text">{webhook.name || '(no name)'}</span>

      <ModalHeaderActionButton
        onClick={onClickEdit}
        className="webhook-card-edit"
      >Edit</ModalHeaderActionButton>
    </div>
    <div className="webhook-card-body">
      <span className="webhook-card-endpoint-label">Payload URL</span>
      <input
        type="text"
        className="webhook-card-endpoint"
        value={webhook.endpoint}
        readOnly={true}
        // Text box is read only and does not contain data that can be spell-checked.
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />

      <div className="webhook-card-active-checkbox">
        <input defaultChecked={true} type="checkbox" id={`webhook-card-${webhook.id}-active`} />
        <label htmlFor={`webhook-card-${webhook.id}-active`}>Active</label>
      </div>
    </div>
  </div>;
}
