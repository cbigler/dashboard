import React from 'react';
import { connect } from 'react-redux';

import {
  InputBox,
  InfoPopup,
} from '@density/ui';

import showModal from '../../actions/modal/show';
import hideModal from '../../actions/modal/hide';
import collectionWebhooksCreate from '../../actions/collection/webhooks/create';
import collectionWebhooksFilter from '../../actions/collection/webhooks/filter';
import collectionWebhooksUpdate from '../../actions/collection/webhooks/update';
import collectionWebhooksDestroy from '../../actions/collection/webhooks/destroy';
import LoadingSpinner from '../loading-spinner/index';
import ErrorBar from '../error-bar/index';

import Subnav, { SubnavItem } from '../subnav/index';

import WebhookCard from '../dev-webhook-card/index';
import WebhookCreateModal from '../dev-webhook-create/index';
import WebhookUpdateModal from '../dev-webhook-update-modal/index';

import filterCollection from '../../helpers/filter-collection/index';

const webhookFilter = filterCollection({fields: ['name', 'endpoint']});

export function WebhookList({
  webhooks,
  activeModal,

  onCreateWebhook,
  onFilterWebhookList,
  onUpdateWebhook,
  onDestroyWebhook,
  onOpenModal,
  onCloseModal,
}) {
  const modals = <div>
    {activeModal.name === 'webhook-create' && activeModal.visible ? <WebhookCreateModal
      error={webhooks.error}
      loading={webhooks.loading}

      onSubmit={onCreateWebhook}
      onDismiss={onCloseModal}
    /> : null}

    {activeModal.name === 'webhook-update' && activeModal.visible ? <WebhookUpdateModal
      initialWebhook={activeModal.data.webhook}
      error={webhooks.error}
      loading={webhooks.loading}

      onSubmit={onUpdateWebhook}
      onDismiss={onCloseModal}
      onDestroyWebhook={onDestroyWebhook}
    /> : null}
  </div>;

  // Sub navigation under the main navbar. USed to navigate within the dev tools section.
  const subnav = <Subnav>
    <SubnavItem href="#/dev/tokens">Tokens</SubnavItem>
    <SubnavItem active href="#/dev/webhooks">Webhooks</SubnavItem>
    <SubnavItem external href="http://docs.density.io/">API Documentation</SubnavItem>
  </Subnav>;

  if (webhooks.loading) {
    return (
      <div className="webhook">
        {modals}
        {subnav}
        <div className="webhook-list-loading"><LoadingSpinner /></div>
      </div>
    );
  }

  return <div className="webhook">
    {modals}
    {subnav}

    {/* Render any errors for the page */}
    <ErrorBar message={webhooks.error} showRefresh modalOpen={activeModal.visible} />

    <div className="webhook-container">
      <div className="webhook-list-header">
        <div className="webhook-list-header-title">
          <h1 className="webhook-list-header-text">Webhooks</h1>
          <InfoPopup
            horizontalIconOffset={8}
            verticalIconOffset={10}
          >
            <p>
              Webhooks allow us to push your data whenever your Density sensors count an event. Create a webhook, tell us what endpoint to hit, and we'll send you a HTTP request for each event.
            </p>
            <a
              className="webhook-list-description-link"
              href="http://docs.density.io"
              target="_blank"
              rel="noopener noreferrer"
            >View our API Documentation</a>
          </InfoPopup>
        </div>

        {/* Search box to filter webhook list */}
        <div className="webhook-list-search">
          <InputBox
            type="text"
            placeholder="Filter Webhooks ..."
            value={webhooks.filters.search}
            onChange={e => onFilterWebhookList(e.target.value)}
          />
        </div>
      </div>

      {/* Link to create new webhook */}
      <div
        className="webhook-list-create-webhook-link"
        role="button"
        onClick={() => onOpenModal('webhook-create')}
      >
        Add a Webhook
      </div>


      <div className="webhook-list">
        {webhookFilter(webhooks.data, webhooks.filters.search).map(webhook => {
          return <div className="webhook-list-item" key={webhook.id}>
            <WebhookCard
              webhook={webhook}
              onClickEdit={() => onOpenModal('webhook-update', {webhook})}
            />
          </div>;
        })}
      </div>
    </div>
  </div>;
}


export default connect((state: any) => {
  return {
    webhooks: state.webhooks,
    activeModal: state.activeModal,
  };
}, dispatch => {
  return {
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
  };
})(WebhookList);
