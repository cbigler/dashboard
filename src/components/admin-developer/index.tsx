import styles from './styles.module.scss';

import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux';

import {
  AppBar,
  AppBarSection,
  AppScrollView,
  Button,
  Icons
} from '@density/ui';

import colorVariables from '@density/ui/variables/colors.json';

import ListView, { ListViewColumn, ListViewClickableLink } from '../list-view';
import TokenCreateModal from '../admin-token-create-modal';
import TokenUpdateModal from '../admin-token-update-modal';
import WebhookCreateModal from '../admin-webhook-create-modal';
import WebhookUpdateModal from '../admin-webhook-update-modal';

import showModal from '../../actions/modal/show';
import hideModal from '../../actions/modal/hide';
import showToast from '../../actions/toasts';
import collectionTokensCreate from '../../actions/collection/tokens/create';
import collectionTokensUpdate from '../../actions/collection/tokens/update';
import collectionTokensFilter from '../../actions/collection/tokens/filter';
import collectionTokensDestroy from '../../actions/collection/tokens/destroy';
import collectionWebhooksCreate from '../../actions/collection/webhooks/create';
import collectionWebhooksFilter from '../../actions/collection/webhooks/filter';
import collectionWebhooksUpdate from '../../actions/collection/webhooks/update';
import collectionWebhooksDestroy from '../../actions/collection/webhooks/destroy';

const DASHBOARD_BACKGROUND = '#FAFAFA';

const PERMISSION_TEXT = {
  'readonly': 'Read-Only',
  'readwrite': 'Read-Write'
}

export function TokenKeyHider ({value, onCopyToken}) {
  const [hidden, setHidden] = useState(true);
  return <span className={styles.adminDeveloperListviewValue}>
    <span
      onClick={() => onCopyToken(value)}
      style={{
        fontFamily: 'monospace',
        cursor: 'pointer',
        marginRight: '16px'
      }}
    >{hidden ? '*'.repeat(value.length) : value}</span>
    <Button
      size="small"
      type="primary"
      width={60}
      onClick={() => setHidden(!hidden)}
    >{hidden ? 'Show' : 'Hide'}</Button>
  </span>
}


export function AdminDeveloper({
  tokens,
  webhooks,
  activeModal,
  onCreateToken,
  onUpdateToken,
  onDestroyToken,
  onFilterTokenList,
  onCreateWebhook,
  onUpdateWebhook,
  onDestroyWebhook,
  onFilterWebhookList,
  onOpenModal,
  onCloseModal,
  onCopyToken,
}) {
  return <Fragment>

    {activeModal.name === 'token-create' ? <TokenCreateModal
      visible={activeModal.visible}
      loading={tokens.loading}
      error={tokens.error}

      onSubmit={onCreateToken}
      onDismiss={onCloseModal}
    /> : null}
    {activeModal.name === 'token-update' ? <TokenUpdateModal
      visible={activeModal.visible}
      initialToken={activeModal.data.token}
      isDestroying={activeModal.data.isDestroying}
      loading={tokens.loading}
      error={tokens.error}

      onSubmit={onUpdateToken}
      onDismiss={onCloseModal}
      onDestroyToken={onDestroyToken}
    /> : null}

    {activeModal.name === 'webhook-create' ? <WebhookCreateModal
      visible={activeModal.visible}
      error={webhooks.error}
      loading={webhooks.loading}

      onSubmit={onCreateWebhook}
      onDismiss={onCloseModal}
    /> : null}
    {activeModal.name === 'webhook-update' ? <WebhookUpdateModal
      visible={activeModal.visible}
      initialWebhook={activeModal.data.webhook}
      isDestroying={activeModal.data.isDestroying}
      error={webhooks.error}
      loading={webhooks.loading}

      onSubmit={onUpdateWebhook}
      onDismiss={onCloseModal}
      onDestroyWebhook={onDestroyWebhook}
    /> : null}

    <AppBar>
      <AppBarSection>
       Looking for more information on our API? Read our&nbsp;
       <a href="http://docs.density.io" target="_blank">API Docs</a>
      </AppBarSection>
      <AppBarSection>
        <Button type="primary" onClick={() => onOpenModal('token-create')}>Add Token</Button>
        &nbsp;&nbsp;
        <Button type="primary" onClick={() => onOpenModal('webhook-create')}>Add Webhook</Button>
      </AppBarSection>
    </AppBar>

    <AppScrollView backgroundColor={DASHBOARD_BACKGROUND}>
      <div className={styles.adminDeveloperTokenList}>
        <div className={styles.adminDeveloperSectionHeader}>Tokens</div>
        <ListView keyTemplate={item => item.key} data={tokens.data}>
          <ListViewColumn title="Name" template={item => (
            <strong className={styles.adminDeveloperListviewValue}>{item.name}</strong>
          )} />
          <ListViewColumn title="Permissions" template={item => (
            <span className={styles.adminDeveloperListviewValue}>{PERMISSION_TEXT[item.tokenType]}</span>
          )} />
          <ListViewColumn title="Token" template={item => <TokenKeyHider value={item.key} onCopyToken={onCopyToken} />} />
          <ListViewColumn flexGrow={1} />
          <ListViewColumn
            template={item => <ListViewClickableLink>Edit</ListViewClickableLink>}
            onClick={item => onOpenModal('token-update', {token: item, isDestroying: false})} />
          <ListViewColumn
            template={item => <Icons.Trash color={colorVariables.grayDarker} />}
            onClick={item => onOpenModal('token-update', {token: item, isDestroying: true})} />
        </ListView>
      </div>
      <div className={styles.adminDeveloperWebhookList}>
        <div className={styles.adminDeveloperSectionHeader}>Webhooks</div>
        <ListView data={webhooks.data}>
          <ListViewColumn title="Name" template={item => (
            <strong className={styles.adminDeveloperListviewValue}>{item.name}</strong>
          )} />
          <ListViewColumn title="Payload URL" template={item => (
            <span className={styles.adminDeveloperListviewValue}>{item.endpoint}</span>
          )} />
          <ListViewColumn flexGrow={1} />
          <ListViewColumn
            template={item => <ListViewClickableLink>Edit</ListViewClickableLink>}
            onClick={item => onOpenModal('webhook-update', {webhook: item, isDestroying: false})} />
          <ListViewColumn
            template={item => <Icons.Trash color={colorVariables.grayDarker} />}
            onClick={item => onOpenModal('webhook-update', {webhook: item, isDestroying: true})} />
        </ListView>
      </div>
    </AppScrollView>
  </Fragment>;
}

export default connect((state: any) => {
  return {
    tokens: state.tokens,
    webhooks: state.webhooks,
    activeModal: state.activeModal,
  };
}, dispatch => {
  return {
    onCreateToken(token) {
      dispatch<any>(collectionTokensCreate(token)).then(ok => {
        if (ok) {
          dispatch<any>(hideModal());
        }
      });
    },
    onUpdateToken(token) {
      dispatch<any>(collectionTokensUpdate(token)).then(ok => {
        if (ok) {
          dispatch<any>(hideModal());
        }
      });
    },
    onDestroyToken(token) {
      dispatch<any>(collectionTokensDestroy(token)).then(ok => {
        if (ok) {
          dispatch<any>(hideModal());
        }
      });
    },

    onFilterTokenList(value) {
      dispatch(collectionTokensFilter('search', value));
    },

    onCreateWebhook(webhook) {
      dispatch<any>(collectionWebhooksCreate(webhook)).then(ok => {
        if (ok) {
          dispatch<any>(hideModal());
        }
      });
    },
    onUpdateWebhook(webhook) {
      dispatch<any>(collectionWebhooksUpdate(webhook)).then(ok => {
        if (ok) {
          dispatch<any>(hideModal());
        }
      });
    },
    onDestroyWebhook(webhook) {
      dispatch<any>(collectionWebhooksDestroy(webhook)).then(ok => {
        if (ok) {
          dispatch<any>(hideModal());
        }
      });
    },
    onFilterWebhookList(value) {
      dispatch<any>(collectionWebhooksFilter('search', value));
    },

    onOpenModal(name, data) {
      dispatch<any>(showModal(name, data));
    },
    onCloseModal() {
      dispatch<any>(hideModal());
    },

    onCopyToken(value) {
      const element = document.createElement('input');
      element.value = value;
      document.body.appendChild(element);
      element.select();
      document.execCommand('copy');
      document.body.removeChild(element);
      dispatch<any>(showToast({ text: 'Copied token to clipboard'}));
    }
  }
})(AdminDeveloper);
