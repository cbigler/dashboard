import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import showModal from '../../actions/modal/show';
import hideModal from '../../actions/modal/hide';

import TokenCard from '../dev-token-card/index';
import TokenCreateModal from '../dev-token-create-modal/index';
import TokenUpdateModal from '../dev-token-update-modal/index';
import LoadingSpinner from '../loading-spinner/index';
import ErrorBar from '../error-bar/index';

import collectionTokensCreate from '../../actions/collection/tokens/create';
import collectionTokensUpdate from '../../actions/collection/tokens/update';
import collectionTokensFilter from '../../actions/collection/tokens/filter';
import collectionTokensDestroy from '../../actions/collection/tokens/destroy';

import {
  InputBox,
  InfoPopup,
} from '@density/ui';

import Subnav, { SubnavItem } from '../subnav/index';

import filterCollection from '../../helpers/filter-collection/index';
const tokenFilter = filterCollection({fields: ['name', 'key']});

export function TokenList({
  tokens,
  activeModal,

  onCreateToken,
  onUpdateToken,
  onDestroyToken,
  onOpenModal,
  onCloseModal,
  onFilterTokenList,
}) {
  const modals = (
    <Fragment>
      {activeModal.name === 'token-create' && activeModal.visible ? <TokenCreateModal
        loading={tokens.loading}
        error={tokens.error}

        onSubmit={onCreateToken}
        onDismiss={onCloseModal}
      /> : null}
      {activeModal.name === 'token-update' && activeModal.visible ? <TokenUpdateModal
        initialToken={activeModal.data.token}
        loading={tokens.loading}
        error={tokens.error}

        onSubmit={onUpdateToken}
        onDismiss={onCloseModal}
        onDestroyToken={onDestroyToken}
      /> : null}
    </Fragment>
  );

  // Sub navigation under the main navbar. USed to navigate within the dev tools section.
  const subnav = <Subnav>
    <SubnavItem active href="#/dev/tokens">Tokens</SubnavItem>
    <SubnavItem href="#/dev/webhooks">Webhooks</SubnavItem>
    <SubnavItem external href="http://docs.density.io/">API Documentation</SubnavItem>
  </Subnav>;


  if (tokens.loading) {
    return <div className="token-list">
      {modals}
      {subnav}
      <div className="token-list-loading"><LoadingSpinner /></div>
    </div>;
  }

  return <div className="token-list">
    {modals}
    {subnav}

    {/* Show errors in the tokens collection */}
    <ErrorBar message={tokens.error} showRefresh modalOpen={activeModal.visible} />

    <div className="token-list-container">
      <div className="token-list-header">
        <div className="token-list-header-title">
          <h1 className="token-list-header-text">Tokens</h1>
          <InfoPopup
            horizontalIconOffset={8}
            verticalIconOffset={15}
          >
            <p>
              Tokens are randomized strings that are used to access your Density data via our API. Keep these secret!
            </p>

            <a
              className="token-list-description-link"
              href="http://docs.density.io"
              target="_blank"
              rel="noopener noreferrer"
            >View our documentation</a>
          </InfoPopup>
        </div>

        {/* Search box to filter the list of tokens */}
        <div className="token-list-search">
          <InputBox
            type="text"
            placeholder="Filter tokens ..."
            value={tokens.filters.search}
            onChange={e => onFilterTokenList(e.target.value)}
          />
        </div>
      </div>

      {/* Link to create new token */}
      <div
        className="token-list-create-token-link"
        role="button"
        onClick={() => onOpenModal('token-create')}
      >
        Add a Token
      </div>

      <div className="token-list-row">
        {tokenFilter(tokens.data, tokens.filters.search).map(token => {
          return <div className="token-list-item" key={token.key}>
            <TokenCard token={token} onClickEdit={() => onOpenModal('token-update', {token})} />
          </div>;
        })}
      </div>
    </div>
  </div>;
}

export default connect((state: any) => {
  return {
    tokens: state.tokens,
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

    onOpenModal(name, data) {
      dispatch<any>(showModal(name, data));
    },
    onCloseModal() {
      dispatch<any>(hideModal());
    },
    onFilterTokenList(value) {
      dispatch(collectionTokensFilter('search', value));
    },
  }
})(TokenList);
