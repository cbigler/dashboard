import styles from './styles.module.scss';

import React from 'react';
import { connect } from 'react-redux';

import hideModal from '../../actions/modal/hide';

import {
  Button,
  Card,
  CardBody,
  CardLoading,
  Toast,
} from '@density/ui';

import Subnav, { SubnavItem } from '../subnav/index';

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
  return <div className={styles.accountSetupDoorwayList}>
    <Subnav visible>
      <SubnavItem href="#/onboarding/overview">Overview</SubnavItem>
      <SubnavItem href={undefined} active >Doorways</SubnavItem>
    </Subnav>

    <AccountSetupHeader
      greeter="Doorways"
      detail="Please provide more information about your doorways."
    />

    {activeModal.name === 'unit-setup-added-doorway' && activeModal.visible ? <div className={styles.accountSetupDoorwayListSuccessToast}>
      <Toast
        type="success"
        icon={<span className={styles.accountSetupDoorwayListSuccessToastIcon}>&#xe908;</span>}
      >
        <span
          className={styles.accountSetupDoorwayListSuccessToastDismiss}
          onClick={onHideSuccessToast}
        >&times;</span>
        <div className={styles.accountSetupDoorwayListSuccessToastHeader} role="heading">Doorway saved!</div>
        Great, we've added your doorway(s) for review! We'll be in touch shortly!
      </Toast>
    </div> : null}

    <div className={styles.accountSetupDoorwayListBodyContainer}>
      <h1 className={styles.accountSetupDoorwayListTitle}>
        Your Doorways
        <span
          className={styles.accountSetupDoorwayListAddDoorwayLink}
          role="button"
          onClick={onCreateDoorway}
        >Add a doorway</span>
      </h1>
      <Card className={styles.accountSetupDoorwayListBody}>
        {/* If the doorways collection is still loading, show the card in a loading state */}
        {doorways.loading ? <CardLoading indeterminate /> : null}

        {/* The doorway list */}
        {(function(doorways) {
          if (doorways.data.length > 0) {
            return <CardBody>
              <ul className={styles.accountDetailDoorwayList}>
                {doorways.data.map(doorway => {
                  const environment = doorway.environment || {};

                  return <li key={doorway.id}>
                    <a
                      className={styles.accountSetupDoorwayListItem}
                      href={`#/onboarding/doorways/${doorway.id}`}
                    >
                      <div className={styles.accountSetupDoorwayListItemImageContainer}>
                        <ImageRetry
                          src={environment.insideImageUrl}
                          alt="Doorway from inside"
                          className={styles.accountSetupDoorwayListItemImage}
                          retries={5}
                        />
                      </div>

                      <span className={styles.accountSetupDoorwayListItemName}>
                        {doorway.name}
                      </span>

                      <span
                        className={styles.accountSetupDoorwayListItemStatus}
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
                className={styles.accountSetupDoorwayListCreate}
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
