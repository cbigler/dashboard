import styles from './styles.module.scss';

import React from 'react';

import {
  Button,
  ButtonGroup,
  InputBox,
  AppBar,
  AppBarTitle,
  AppBarContext,
  AppBarSection,
  Modal,
} from '@density/ui';

import FormLabel from '../form-label';

export default function WebhookCreateModal({
  visible,
  webhook,
  onDismiss,
  onUpdate,
  onSubmit
}) {
  return (
    <Modal
      visible={visible}
      width={895}
      height={500}
      onBlur={onDismiss}
      onEscape={onDismiss}
    >
      <AppBar>
        <AppBarTitle>Create Webhook</AppBarTitle>
      </AppBar>
      <div className={styles.webhookCreateColumns}>
        <div className={`${styles.webhookCreateColumn} ${styles.left}`}>
          <FormLabel
            htmlFor="webhook-create-name"
            label="Webhook name"
            input={<InputBox
              type="text"
              width="100%"
              id="webhook-create-name"
              value={webhook.name}
              onChange={e => onUpdate({...webhook, name: e.target.value})}
            />}
          />
          <FormLabel
            htmlFor="webhook-create-desc"
            label="Webhook description"
            input={<InputBox
              type="textarea"
              id="webhook-create-desc"
              value={webhook.description}
              height="5em"
              onChange={e => onUpdate({...webhook, description: e.target.value})}
            />}
          />
          <FormLabel
            htmlFor="webhook-create-endpoint"
            label="Webhook URL"
            input={<InputBox
              type="text"
              width="100%"
              leftIcon={<strong>POST</strong>}
              id="webhook-create-endpoint"
              placeholder="(ie, http://example.com)"
              value={webhook.endpoint}
              onChange={e => onUpdate({...webhook, endpoint: e.target.value})}
            />}
          />
        </div>

        <div className={`${styles.webhookCreateColumn} ${styles.right}`}>
          <div className={styles.webhookCreateExample}>
            <p>Webhooks will be sent as POST requests to the URL specified in JSON.</p>
            <p>
              Here's an example webhook payload:
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://docs.density.io/v2/#webhooks-receiving"
              >More information</a>
            </p>
            <pre className={styles.webhookCreateExamplePayload}>{
              JSON.stringify({
                "space_id": "spc_12284369797403919085",
                "doorway_id": "drw_16131794227371328677",
                "direction": 1,
                "count": 32
              }, null, 2)
            }</pre>
          </div>
        </div>
      </div>
      
      <AppBarContext.Provider value="BOTTOM_ACTIONS">
        <AppBar>
          <AppBarSection />
          <AppBarSection>
            <ButtonGroup>
              <Button variant="underline" onClick={onDismiss}>Cancel</Button>
              <Button
                type="primary"
                variant="filled"
                disabled={webhook.endpoint.length === 0}
                onClick={() => onSubmit({
                  name: webhook.name,
                  description: webhook.description,
                  endpoint: webhook.endpoint,
                })}
              >Save webhook</Button>
            </ButtonGroup>
          </AppBarSection>
        </AppBar>
      </AppBarContext.Provider>
    </Modal>
  );
}
