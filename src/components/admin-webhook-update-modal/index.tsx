import styles from './styles.module.scss';

import React, { Fragment } from 'react';

import {
  AppBar,
  AppBarSection,
  AppBarContext,
  AppBarTitle,
  Button,
  ButtonGroup,
  InputBox,
  Modal,
} from '@density/ui';

import FormLabel from '../form-label';

export default function WebhookUpdateModal({
  visible,
  webhook,
  isDestroying,
  onDismiss,
  onUpdate,
  onSubmit,
  onDestroyWebhook,
}) {
  let contents;
  if (isDestroying) {
    contents = (
      <Fragment>
        <AppBar><AppBarSection><AppBarTitle>Destroy Webhook</AppBarTitle></AppBarSection></AppBar>

        <div className={styles.webhookUpdateModalBody}>
          <p>
            Please confirm you'd like to destroy the webhook "{webhook.name}".
          </p>
        </div>

        <AppBarContext.Provider value="BOTTOM_ACTIONS">
          <AppBar>
            <AppBarSection />
            <AppBarSection>
              <ButtonGroup>
                <Button variant="underline" onClick={onDismiss}>Cancel</Button>
                <Button
                  variant="filled"
                  type="primary"
                  onClick={() => onDestroyWebhook(webhook)}
                >Destroy webhook</Button>
              </ButtonGroup>
            </AppBarSection>
          </AppBar>
        </AppBarContext.Provider>
      </Fragment>
    );
  } else {
    contents = (
      <Fragment>
        <AppBar>
          <AppBarSection>
            <AppBarTitle>Edit Webhook</AppBarTitle>
          </AppBarSection>
        </AppBar>
        <div className={styles.webhookUpdateModalBody}>
          <FormLabel
            htmlFor="webhook-update-name"
            label="Webhook name"
            input={<InputBox
              type="text"
              id="webhook-update-name"
              value={webhook.name}
              onChange={e => onUpdate({...webhook, name: e.target.value})}
            />}
          />
          <FormLabel
            htmlFor="webhook-update-description"
            label="Description"
            input={<InputBox
              type="textarea"
              id="webhook-update-description"
              value={webhook.description}
              onChange={e => onUpdate({...webhook, description: e.target.value})}
            />}
          />
        </div>
        <AppBarContext.Provider value="BOTTOM_ACTIONS">
          <AppBar>
            <AppBarSection />
            <AppBarSection>
              <ButtonGroup>
                <Button variant="underline" onClick={onDismiss}>Cancel</Button>
                <Button
                  variant="filled"
                  type="primary"
                  disabled={webhook.name.length === 0}
                  onClick={() => onSubmit({
                    id: webhook.id,
                    name: webhook.name,
                    description: webhook.description,
                  })}
                >Save webhook</Button>
              </ButtonGroup>
            </AppBarSection>
          </AppBar>
        </AppBarContext.Provider>
      </Fragment>
    );
  }

  return (
    <Modal
      visible={visible}
      width={480}
      onBlur={onDismiss}
      onEscape={onDismiss}
    >
      {contents}
    </Modal>
  );
}
