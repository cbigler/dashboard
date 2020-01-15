import styles from './styles.module.scss';

import React, { Fragment, useState } from 'react';

import {
  AppBar,
  AppBarSection,
  AppScrollView,
  Button,
  Icons,
  ListView,
  ListViewColumn,
  ListViewColumnSpacer,
  ListViewClickableLink,
} from '@density/ui/src';

import colorVariables from '@density/ui/variables/colors.json';

import TokenCreateModal from '../admin-token-create-modal';
import TokenUpdateModal from '../admin-token-update-modal';
import WebhookCreateModal from '../admin-webhook-create-modal';
import WebhookUpdateModal from '../admin-webhook-update-modal';

import showModal from '../../rx-actions/modal/show';
import hideModal from '../../rx-actions/modal/hide';
import { showToast } from '../../rx-actions/toasts';
import collectionTokensCreate from '../../rx-actions/collection/tokens/create';
import collectionTokensUpdate from '../../rx-actions/collection/tokens/update';
// import collectionTokensFilter from '../../rx-actions/collection/tokens/filter';
import collectionTokensDestroy from '../../rx-actions/collection/tokens/destroy';
import collectionWebhooksCreate from '../../rx-actions/collection/webhooks/create';
// import collectionWebhooksFilter from '../../rx-actions/collection/webhooks/filter';
import collectionWebhooksUpdate from '../../rx-actions/collection/webhooks/update';
import collectionWebhooksDestroy from '../../rx-actions/collection/webhooks/destroy';
import updateModal from '../../rx-actions/modal/update';
import useRxStore from '../../helpers/use-rx-store';
import ActiveModalStore from '../../rx-stores/active-modal';
import useRxDispatch from '../../helpers/use-rx-dispatch';
import WebhooksStore from '../../rx-stores/webhooks';
import TokensStore from '../../rx-stores/tokens';


const READONLY = 'readonly', READWRITE = 'readwrite';
const PERMISSION_TEXT = {
  [READONLY]: 'Read-only',
  [READWRITE]: 'Read-write'
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
    >{hidden ? '**********************************************' : value}</span>
    <Button
      size="small"
      type="primary"
      variant="filled"
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
  onSaveToken,
  onDestroyToken,
  onCreateWebhook,
  onUpdateWebhook,
  onSaveWebhook,
  onDestroyWebhook,
  onOpenModal,
  onCloseModal,
  onCopyToken,
}) {
  return <Fragment>

    {activeModal.name === 'token-create' ? <TokenCreateModal
      visible={activeModal.visible}
      token={activeModal.data.token}

      onUpdate={onUpdateToken}
      onSubmit={onCreateToken}
      onDismiss={onCloseModal}
    /> : null}
    {activeModal.name === 'token-update' ? <TokenUpdateModal
      visible={activeModal.visible}
      token={activeModal.data.token}
      isDestroying={activeModal.data.isDestroying}

      onUpdate={onUpdateToken}
      onSubmit={onSaveToken}
      onDismiss={onCloseModal}
      onDestroyToken={onDestroyToken}
    /> : null}

    {activeModal.name === 'webhook-create' ? <WebhookCreateModal
      visible={activeModal.visible}
      webhook={activeModal.data.webhook}

      onUpdate={onUpdateWebhook}
      onSubmit={onCreateWebhook}
      onDismiss={onCloseModal}
    /> : null}
    {activeModal.name === 'webhook-update' ? <WebhookUpdateModal
      visible={activeModal.visible}
      webhook={activeModal.data.webhook}
      isDestroying={activeModal.data.isDestroying}

      onUpdate={onUpdateWebhook}
      onSubmit={onSaveWebhook}
      onDismiss={onCloseModal}
      onDestroyWebhook={onDestroyWebhook}
    /> : null}

    <AppBar>
      <AppBarSection>
       Looking for more information on our API? Read our&nbsp;
       <a href="http://docs.density.io" target="_blank" rel="noopener noreferrer">API Docs</a>
      </AppBarSection>
      <AppBarSection>
        <Button
          variant="filled"
          type="primary"
          onClick={() => onOpenModal('token-create', {token: {name: '', description: '', token_type: READONLY}})}
        >Add token</Button>
        &nbsp;&nbsp;
        <Button
          variant="filled"
          type="primary"
          onClick={() => onOpenModal('webhook-create', {webhook: {name: '', description: '', endpoint: ''}})}
        >Add webhook</Button>
      </AppBarSection>
    </AppBar>

    <AppScrollView backgroundColor={colorVariables.grayLightest}>
      <div className={styles.adminDeveloperTokenList}>
        <div className={styles.adminDeveloperSectionHeader}>Tokens</div>
        <ListView keyTemplate={item => item.key} data={tokens.data}>
          <ListViewColumn
            id="Name"
            width={240}
            template={item => (
              <strong className={styles.adminDeveloperListviewValue}>{item.name}</strong>
            )}
          />
          <ListViewColumn
            id="Permissions"
            width={120}
            template={item => (
              <span className={styles.adminDeveloperListviewValue}>{PERMISSION_TEXT[item.token_type]}</span>
            )} />
          <ListViewColumn
            id="Token"
            width={560}
            template={item => <TokenKeyHider value={item.key} onCopyToken={onCopyToken} />}
          />
          <ListViewColumnSpacer />
          <ListViewColumn
            id="Edit"
            title=" "
            width={60}
            align="right"
            template={item => <ListViewClickableLink>Edit</ListViewClickableLink>}
            onClick={item => onOpenModal('token-update', {token: item, isDestroying: false})} />
          <ListViewColumn
            id="Delete"
            title=" "
            width={30}
            align="right"
            template={item => <Icons.Trash color={colorVariables.grayDarker} />}
            onClick={item => onOpenModal('token-update', {token: item, isDestroying: true})} />
        </ListView>
      </div>
      <div className={styles.adminDeveloperWebhookList}>
        <div className={styles.adminDeveloperSectionHeader}>Webhooks</div>
        <ListView data={webhooks.data}>
          <ListViewColumn
            id="Name"
            width={240}
            template={item => (
              <strong className={styles.adminDeveloperListviewValue}>{item.name}</strong>
            )}
          />
          <ListViewColumn
            id="Payload URL"
            width={680}
            template={item => (
              <span className={styles.adminDeveloperListviewValue}>{item.endpoint}</span>
            )}
          />
          <ListViewColumnSpacer />
          <ListViewColumn
            id="Edit"
            title=" "
            width={60}
            align="right"
            template={item => <ListViewClickableLink>Edit</ListViewClickableLink>}
            onClick={item => onOpenModal('webhook-update', {webhook: item, isDestroying: false})} />
          <ListViewColumn
            id="Delete"
            title=" "
            width={30}
            align="right"
            template={item => <Icons.Trash color={colorVariables.grayDarker} />}
            onClick={item => onOpenModal('webhook-update', {webhook: item, isDestroying: true})} />
        </ListView>
      </div>
    </AppScrollView>
  </Fragment>;
}


const ConnectedAdminDeveloper: React.FC = () => {
  const dispatch = useRxDispatch();
  const activeModal = useRxStore(ActiveModalStore);
  const webhooks = useRxStore(WebhooksStore);
  const tokens = useRxStore(TokensStore);

  const onOpenModal = (name, data) => {
    showModal(dispatch, name, data);
  }
  const onCloseModal = async () => {
    await hideModal(dispatch);
  }

  const onCreateToken = async (token) => {
    const ok = await collectionTokensCreate(dispatch, token);
    if (ok) { hideModal(dispatch); }
  }
  const onUpdateToken = (token) => {
    updateModal(dispatch, { token });
  }
  const onSaveToken = async (token) => {
    const ok = await collectionTokensUpdate(dispatch, token);
    if (ok) { hideModal(dispatch); }
  }
  const onDestroyToken = async (token) => {
    const ok = await collectionTokensDestroy(dispatch, token);
    if (ok) { hideModal(dispatch); }
  }
  const onCopyToken = (value) => {
    const element = document.createElement('input');
    element.value = value;
    document.body.appendChild(element);
    element.select();
    document.execCommand('copy');
    document.body.removeChild(element);
    showToast(dispatch, { text: 'Copied token to clipboard' });
  }

  const onCreateWebhook = async (webhook) => {
    const ok = await collectionWebhooksCreate(dispatch, webhook);
    if (ok) { hideModal(dispatch); }
  }
  const onUpdateWebhook = (webhook) => {
    updateModal(dispatch, { webhook });
  }
  const onSaveWebhook = async (webhook) => {
    const ok = await collectionWebhooksUpdate(dispatch, webhook);
    if (ok) { await hideModal(dispatch); }
  }
  const onDestroyWebhook = async (webhook) => {
    const ok = await collectionWebhooksDestroy(dispatch, webhook);
    if (ok) { await hideModal(dispatch); }
  }

  // FIXME: these don't appear to be used, but they were provided by "connect" previously
  // const onFilterTokenList = (value) => {
  //   dispatch(collectionTokensFilter('search', value) as Any<FixInRefactor>);
  // }
  // const onFilterWebhookList = (value) => {
  //   dispatch(collectionWebhooksFilter('search', value) as Any<FixInRefactor>);
  // }

  return (
    <AdminDeveloper
      tokens={tokens}
      activeModal={activeModal}
      webhooks={webhooks}
      
      onOpenModal={onOpenModal}
      onCloseModal={onCloseModal}

      onCreateToken={onCreateToken}
      onSaveToken={onSaveToken}
      onUpdateToken={onUpdateToken}
      onDestroyToken={onDestroyToken}

      onCreateWebhook={onCreateWebhook}
      onSaveWebhook={onSaveWebhook}
      onUpdateWebhook={onUpdateWebhook}
      onDestroyWebhook={onDestroyWebhook}

      // onFilterTokenList={onFilterTokenList}
      // onFilterWebhookList={onFilterWebhookList}

      onCopyToken={onCopyToken}

    />
  )
}

export default ConnectedAdminDeveloper;

