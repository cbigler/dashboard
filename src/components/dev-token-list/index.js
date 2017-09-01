import * as React from 'react';
import { connect } from 'react-redux';

import showModal from '../../actions/modal/show';
import hideModal from '../../actions/modal/hide';

import TokenCard from '../dev-token-card/index';
import TokenCreateModal from '../dev-token-create-modal/index';
import TokenUpdateModal from '../dev-token-update-modal/index';
import DescriptionModal from '../dev-description-popover/index';
import LoadingSpinner from '../loading-spinner/index';
import ErrorBar from '../error-bar/index';

import collectionTokensCreate from '../../actions/collection/tokens/create';
import collectionTokensUpdate from '../../actions/collection/tokens/update';
import collectionTokensFilter from '../../actions/collection/tokens/filter';
import collectionTokensDestroy from '../../actions/collection/tokens/destroy';

import Fab from '@density/ui-fab';
import InputBox from '@density/ui-input-box';

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
  const modals = <div>
    {activeModal.name === 'token-create' ? <TokenCreateModal
      loading={tokens.loading}
      error={tokens.error}

      onSubmit={onCreateToken}
      onDismiss={onCloseModal}
    /> : null}
    {activeModal.name === 'token-update' ? <TokenUpdateModal
      initialToken={activeModal.data.token}
      loading={tokens.loading}
      error={tokens.error}

      onSubmit={onUpdateToken}
      onDismiss={onCloseModal}
      onDestroyToken={onDestroyToken}
    /> : null}
  </div>;

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
    <ErrorBar message={tokens.error} showRefresh modalOpen={Boolean(activeModal.name)} />

    <div className="token-list-container">
      <div className="token-list-header">
        <span>
          <h1 className="token-list-header-text">Tokens</h1>
          <DescriptionModal>
            <p>
              A token is a secret, random string used to authenticate that you have access and authorize
              permission to Density data. Ready to start using them?
            </p>
            <a
              className="token-list-description-link"
              href="http://docs.density.io"
              target="_blank"
              rel="noopener noreferrer"
            >Visit our API Documentation</a>
          </DescriptionModal>
        </span>

        {/* Search box to filter the list of tokens */}
        <div className="token-list-search">
          <InputBox
            placeholder="Filter tokens ..."
            value={tokens.filters.search}
            onChange={e => onFilterTokenList(e.target.value)}
          />
        </div>
      </div>

      {/* The Fab triggers the space doorway context menu to make a new space or doorway */}
      <Fab
        type="primary"
        className="fab"
        onClick={() => {
          if (activeModal.name) {
            return onCloseModal();
          } else {
            return onOpenModal('token-create');
          }
        }}
      >&#xe92b;</Fab>

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

export default connect(state => {
  return {
    tokens: state.tokens,
    activeModal: state.activeModal,
  };
}, dispatch => {
  return {
    onCreateToken(token) {
      dispatch(collectionTokensCreate(token)).then(ok => {
        ok && dispatch(hideModal());
      });
    },
    onUpdateToken(token) {
      dispatch(collectionTokensUpdate(token)).then(ok => {
        ok && dispatch(hideModal());
      });
    },
    onDestroyToken(token) {
      dispatch(collectionTokensDestroy(token)).then(ok => {
        ok && dispatch(hideModal());
      });
    },

    onOpenModal(name, data) {
      dispatch(showModal(name, data));
    },
    onCloseModal() {
      dispatch(hideModal());
    },
    onFilterTokenList(value) {
      dispatch(collectionTokensFilter('search', value));
    },
  }
})(TokenList);
