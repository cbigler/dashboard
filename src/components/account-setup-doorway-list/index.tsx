import React from 'react';
import { connect } from 'react-redux';

import hideModal from '../../actions/modal/hide';

import Button from '@density/ui-button';
import Card, { CardBody, CardLoading } from '@density/ui-card';
import Subnav, { SubnavItem } from '../subnav/index';
import Toast from '@density/ui-toast';

import ImageRetry from '../image-retry';
import AccountSetupHeader from '../account-setup-header/index';

// Text and colors for doorway status labels
function doorwayStatusText(status) {
  return {
    'legacy': 'In Production',
    'production': 'In Production',
    'pending': 'In Review',
    'approved': 'Approved',
    'declined': 'Declined'
  }[status];
}
function doorwayStatusColor(status) {
  return {
    'legacy': '#666666',
    'production': '#666666',
    'pending': '#4198FF',
    'approved': '#80CD80',
    'declined': '#FF5454'
  }[status];
}

export function AccountSetupDoorwayList({
  doorways,
  activeModal,

  onCreateDoorway,
  onHideSuccessToast,
}) {
  return <div className="account-setup-doorway-list">
    <Subnav visible>
      <SubnavItem href="#/onboarding/overview">Overview</SubnavItem>
      <SubnavItem href={undefined} active >Doorways</SubnavItem>
    </Subnav>

    <AccountSetupHeader
      greeter="Doorways"
      detail="Please provide more information about your doorways."
    />

    {activeModal.name === 'unit-setup-added-doorway' && activeModal.visible ? <div className="account-setup-doorway-list-success-toast">
      <Toast
        type="success"
        icon={<span className="account-setup-doorway-list-success-toast-icon">&#xe908;</span>}
      >
        <span
          className="account-setup-doorway-list-success-toast-dismiss"
          onClick={onHideSuccessToast}
        >&times;</span>
        <div className="account-setup-doorway-list-success-toast-header" role="heading">Doorway saved!</div>
        Great, we've added your doorway(s) for review! We'll be in touch shortly!
      </Toast>
    </div> : null}

    <div className="account-setup-doorway-list-body-container">
      <h1 className="account-setup-doorway-list-title">
        Your Doorways
        <span
          className="account-setup-doorways-list-add-doorway-link"
          role="button"
          onClick={onCreateDoorway}
        >Add a doorway</span>
      </h1>
      <Card className="account-setup-doorway-list-body">
        {/* If the doorways collection is still loading, show the card in a loading state */}
        {doorways.loading ? <CardLoading indeterminate /> : null}

        {/* The doorway list */}
        {(function(doorways) {
          if (doorways.data.length > 0) {
            return <CardBody>
              <ul className="account-detail-doorway-list">
                {doorways.data.map(doorway => {
                  const environment = doorway.environment || {};

                  return <li key={doorway.id}>
                    <a
                      className="account-setup-doorway-list-item"
                      href={`#/onboarding/doorways/${doorway.id}`}
                    >
                      <div className="account-setup-doorway-list-item-image-container">
                        <ImageRetry
                          src={environment.insideImageUrl}
                          alt="Doorway from inside"
                          className="account-setup-doorway-list-item-image"
                          retries={5}
                        />
                      </div>

                      <span className="account-setup-doorway-list-item-name">
                        {doorway.name}
                      </span>

                      <span
                        className="account-setup-doorway-list-item-status"
                        style={{ color: doorwayStatusColor(environment.status) }}
                      >{doorwayStatusText(environment.status)}</span>
                    </a>
                  </li>;
                })}
              </ul>
            </CardBody>;
          } else if (doorways.loading) {
            return <CardBody>Loading doorways...</CardBody>;
          } else {
            // When no doorways are visible, add a button to create the first doorway.
            return <CardBody>
              <Button
                className="account-setup-doorway-list-create"
                onClick={onCreateDoorway}
              >
                Create your first doorway
              </Button>
            </CardBody>;
          }
        })(doorways)}
      </Card>
    </div>
  </div>;
}

export default connect((state: any) => {
  return {
    doorways: state.doorways,
    activeModal: state.activeModal,
  };
}, dispatch => {
  return {
    onCreateDoorway() {
      window.location.href = '#/onboarding/doorways/new';
    },
    onHideSuccessToast() {
      dispatch<any>(hideModal());
    },
  };
})(AccountSetupDoorwayList);
