import React, { Fragment, useState, useRef } from 'react';

import styles from './styles.module.scss';
import classnames from 'classnames';

import {
  Button,
  ButtonGroup,
  InputBox,
  AppBar,
  AppBarTitle,
  AppBarContext,
  AppBarSection,
  Modal,
  ListView,
  ListViewColumn,
  Switch,
} from '@density/ui/src';

import FormLabel from '../form-label';

export enum WebhookTypeChoices {
  COUNT_EVENTS = 'counts',
  TAILGATING_EVENTS = 'tailgating',
}

const WEBHOOK_TYPE_CHOICES = [
  {id: WebhookTypeChoices.COUNT_EVENTS, label: 'Count Events'},
  {id: WebhookTypeChoices.TAILGATING_EVENTS, label: 'Tailgating Events'},
];

export default function WebhookCreateModal({
  visible,
  webhook,
  onDismiss,
  onUpdate,
  onSubmit,
}) {
  const isEditing = typeof webhook.id !== 'undefined';

  return (
    <Modal
      visible={visible}
      width={976}
      onBlur={onDismiss}
      onEscape={onDismiss}
    >
      <AppBar>
        <AppBarTitle>{isEditing ? 'Update' : 'Create'} Webhook</AppBarTitle>
      </AppBar>

      <div className={styles.webhookCreateColumns}>
        <div className={classnames(styles.webhookCreateColumn, styles.left)}>
          <FormLabel
            htmlFor="webhook-create-type"
            label="Message type"
            input={<InputBox
              type="select"
              width="100%"
              id="webhook-create-type"
              choices={WEBHOOK_TYPE_CHOICES}
              value={webhook.type}
              onChange={e => onUpdate({...webhook, type: e.id})}
              disabled={isEditing}
            />}
          />
          <FormLabel
            htmlFor="webhook-create-name"
            label="Name"
            input={<InputBox
              type="text"
              width="100%"
              id="webhook-create-name"
              value={webhook.name || ''}
              onChange={e => onUpdate({...webhook, name: e.target.value})}
            />}
          />
          <FormLabel
            htmlFor="webhook-create-desc"
            label="Description"
            input={<InputBox
              type="textarea"
              id="webhook-create-desc"
              value={webhook.description || ''}
              height="5em"
              onChange={e => onUpdate({...webhook, description: e.target.value})}
            />}
          />
          {isEditing ? (
            <FormLabel
              htmlFor="webhook-create-enabled"
              label="Enabled"
              input={<Switch
                id="webhook-create-enabled"
                value={webhook.enabled}
                onChange={e => onUpdate({...webhook, enabled: e.target.checked})}
              />}
            />
          ) : null}
          <FormLabel
            htmlFor="webhook-create-endpoint"
            label="URL"
            input={<InputBox
              type="text"
              width="100%"
              leftIcon={<strong>POST</strong>}
              id="webhook-create-endpoint"
              placeholder="(ie, https://example.com)"
              value={webhook.endpoint}
              onChange={e => onUpdate({...webhook, endpoint: e.target.value})}
              disabled={!webhook.enabled}
            />}
          />
          <FormLabel
            htmlFor="webhook-create-headers"
            label="Custom Headers"
            input={<WebhookHeaderControl
              headers={webhook.headers}
              onChange={headers => onUpdate({...webhook, headers})}
              disabled={!webhook.enabled}
            />}
          />
        </div>

        <div className={classnames(styles.webhookCreateColumn, styles.right)}>
          <div className={styles.webhookCreateExample}>
            {webhook.type === WebhookTypeChoices.COUNT_EVENTS ? (
              <Fragment>
                <p>
                  A webhook will be sent as a POST request to the URL specified in JSON whenever
                  the count changes at any space in your organization.
                </p>
                <p>
                  Here's an example count event webhook payload:
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
              </Fragment>
            ) : null}
            {webhook.type === WebhookTypeChoices.TAILGATING_EVENTS ? (
              <Fragment>
                <p>
                  A webhook will be sent as a POST request to the URL specified in JSON whenever
                  a tailgating event at any of your doorways occurs.
                </p>
                <p>Here's an example tailgating event webhook payload:</p>
                <pre className={styles.webhookCreateExamplePayload}>{
                  JSON.stringify({
                    "type": "tailgating_event",
                    "request_id": "5245250ce4a447e18f513b1863c80ea0",
                    "version": "v3",
                    "payload": {
                      "doorway_id": "drw_643916192641188838",
                      "serial_number": "ZDEMO",
                      "timestamp": "2019-03-18T20:53:03.647Z",
                    },
                  }, null, 2)
                }</pre>
              </Fragment>
            ) : null}
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
                onClick={() => onSubmit(webhook)}
              >Save</Button>
            </ButtonGroup>
          </AppBarSection>
        </AppBar>
      </AppBarContext.Provider>
    </Modal>
  );
}

type Headers = {[name: string]: string};

type WebhookHeaderControlProps = {
  headers: Headers,
  onChange: (headers: Headers) => void,
  disabled: boolean,
};

const NEW_ROW = 'NEW_ROW';

const WebhookHeaderControl: React.FunctionComponent<WebhookHeaderControlProps> = ({headers, disabled, onChange}) => {
  const nameRef = useRef<HTMLInputElement>(null);

  const [ newHeaderName, setNewHeaderName ] = useState('');
  const [ newHeaderValue, setNewHeaderValue ] = useState('');

  // Check to ensure that the header being added isn't a duplicate with one that already exists
  const newHeaderNameDuplicate = typeof (
    Object.keys(headers)
      .find(name => name.toLowerCase() === newHeaderName.toLowerCase())
  ) !== 'undefined';

  const addButtonEnabled = newHeaderName.length > 0 && newHeaderValue.length > 0 && !newHeaderNameDuplicate;

  return (
    <div className={styles.webhookHeaderControl}>
      <ListView
        padOuterColumns
        data={[
          ...Object.entries(headers).map(([name, value], id) => ({id, name, value})),
          { id: NEW_ROW },
        ]}
      >
        <ListViewColumn
          id="Header Name"
          template={({id, name, value}) => (
            id === NEW_ROW ? (
              <InputBox
                type="text"
                value={newHeaderName}
                onChange={e => setNewHeaderName(e.target.value)}
                placeholder="Header Name"
                invalid={newHeaderNameDuplicate ? true : undefined}
                ref={nameRef}
                disabled={disabled}
              />
            ) : (
              name
            )
          )}
        />
        <ListViewColumn
          id="Header Value"
          template={({id, name, value}) => (
            id === NEW_ROW ? (
              <InputBox
                type="text"
                value={newHeaderValue}
                onKeyDown={e => {
                  if (e.key === 'Enter' || (e.key === 'Tab' && !e.shiftKey)) {
                    if (!addButtonEnabled) { return; }

                    e.preventDefault();
                    onChange({...headers, [newHeaderName]: newHeaderValue});
                    setNewHeaderName('');
                    setNewHeaderValue('');
                    if (nameRef.current) {
                      nameRef.current.focus();
                    }
                  }
                }}
                onChange={e => setNewHeaderValue(e.target.value)}
                placeholder="Header Value"
                disabled={disabled}
              />
            ) : (
              <InputBox
                type="text"
                value={value}
                onChange={e => onChange({...headers, [name]: e.target.value})}
                placeholder="Header Value"
                disabled={disabled}
              />
            )
          )}
        />
        <ListViewColumn
          id="Actions"
          title=" "
          width={100}
          template={({id, name, value}) => (
            id === NEW_ROW ? (
              <Button
                onClick={() => {
                  onChange({...headers, [newHeaderName]: newHeaderValue});
                  setNewHeaderName('');
                  setNewHeaderValue('');
                }}
                disabled={disabled || !addButtonEnabled}
              >Add</Button>
            ) : (
              <Button
                onClick={e => {
                  const headersCopy = { ...headers };
                  delete headersCopy[name];
                  onChange(headersCopy);
                }}
                disabled={disabled}
              >Remove</Button>
            )
          )}
        />
      </ListView>
    </div>
  );
}
