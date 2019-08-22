import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';

import styles from './doorways.module.scss';
import colorVariables from '@density/ui/variables/colors.json';
import convertUnit, { INCHES, CENTIMETERS } from '../../helpers/convert-unit/index';
import AdminLocationsImageUpload from '../admin-locations-image-upload/index';

import {
  AppBar,
  AppBarSection,
  AppBarTitle,
  AppBarContext,
  Button,
  ButtonGroup,
  Icons,
  InputBox,
  ListView,
  ListViewColumn,
  Modal,
  RadioButton,
} from '@density/ui';

import Checkbox from '../checkbox';
import FormLabel from '../form-label/index';

import AdminLocationsDetailModule from './index';
import filterCollection from '../../helpers/filter-collection';
import { fileToDataURI } from '../../helpers/media-files';

import showModal from '../../actions/modal/show';
import hideModal from '../../actions/modal/hide';
import updateModal from '../../actions/modal/update';
import spaceManagementCreateDoorway from '../../actions/space-management/create-doorway';
import spaceManagementUpdateDoorway from '../../actions/space-management/update-doorway';
import spaceManagementDeleteDoorway from '../../actions/space-management/delete-doorway';

import {
  DOORWAY_ICON,
  MOUNTING_SPACE_GLYPH,
  INSIDE_THE_SPACE_GLYPH,
  OUTSIDE_THE_SPACE_GLYPH
} from './doorway_glyphs';

const AC_OUTLET = 'AC_OUTLET',
      POWER_OVER_ETHERNET = 'POWER_OVER_ETHERNET';

function processModalData(data) {
  const width = parseFloat(data.width);
  const height = parseFloat(data.height);
  return {
    ...data,
    width: isNaN(width) ? null : width,
    height: isNaN(height) ? null : height,
  };
}

function DpuPosition({spaceName, value, onChange}) {
  return (
    <div className={styles.dpuPositionWrapper}>
      <p>
        Is the DPU inside or outside of{' '}
        <strong>{spaceName && spaceName.length > 0 ? spaceName : 'this space'}</strong>?
      </p>
      <div className={styles.dpuPositionButtonWrapper}>
        <div
          className={classnames(styles.dpuPositionButton, {[styles.active]: value === 1})}
          onClick={() => onChange(1)}
        >
          {INSIDE_THE_SPACE_GLYPH}
          <RadioButton
            checked={value === 1}
            onChange={() => onChange(1)}
            text="Inside the space"
          />
        </div>
        <div
          className={classnames(styles.dpuPositionButton, {[styles.active]: value === -1})}
          onClick={() => onChange(-1)}
        >
          {OUTSIDE_THE_SPACE_GLYPH}
          <RadioButton
            checked={value === -1}
            onChange={() => onChange(-1)}
            text="Outside the space"
          />
        </div>
      </div>
    </div>
  );
}

function AdminLocationsDetailModulesDoorwayDpuPositionModal({
  visible,
  spaceName,
  sensorPlacement,
  updateHistoricCounts,
  onUpdateSensorPlacement,
  onUpdateHistoricCounts,
  onCloseModal,
  onSubmitModal,
}) {
  return (
    <Modal
      visible={visible}
      width={486}
      onBlur={onCloseModal}
      onEscape={onCloseModal}
    >
      <AppBar>
        <AppBarTitle>DPU position</AppBarTitle>
      </AppBar>

      <div className={styles.modalSection}>
        <DpuPosition
          spaceName={spaceName}
          value={sensorPlacement}
          onChange={onUpdateSensorPlacement}
        />
        <div className={styles.updateHistoricCheckbox}>
          <Checkbox
            label="Update historic space counts"
            checked={updateHistoricCounts}
            onChange={() => onUpdateHistoricCounts(!updateHistoricCounts)}
          />
        </div>
      </div>

      <AppBarContext.Provider value="BOTTOM_ACTIONS">
        <AppBar>
          <AppBarSection />
          <AppBarSection>
            <ButtonGroup>
              <Button variant="underline" onClick={onCloseModal}>Cancel</Button>
              <Button
                type="primary"
                variant="filled"
                onClick={() => onSubmitModal(sensorPlacement, updateHistoricCounts)}
              >Save Link</Button>
            </ButtonGroup>
          </AppBarSection>
        </AppBar>
      </AppBarContext.Provider>
    </Modal>
  );
}

function AdminLocationsDetailModulesDoorwayModal({
  visible,
  modalState,
  spaceName,
  onUpdateModalState,
  onCloseModal,
  onSubmitModal,
  onDeleteDoorway,
}) {
  function onChangeField(key, value) {
    onUpdateModalState({
      ...modalState,
      data: { ...modalState.data, [key]: value },
    });
  }

  const shortMeasurementUnit = (
    <span className={styles.formMeasurementUnit}>
      {
        ({
          [CENTIMETERS]: '(cm)',
          [INCHES]: '(in)',
        })[modalState.data.measurementUnit] || ''
      }
    </span>
  );

  const formValid = (
    modalState.data.name && modalState.data.name.length > 0 &&
    modalState.data.sensorPlacement &&
    // Require a measurement unit if the user has an entered width / height
    ((modalState.data.width || modalState.data.height) ? modalState.data.measurementUnit : true)
  );

  const createMode = modalState.type === 'CREATE';

  return (
    <Modal
      visible={visible}
      width={486}
      onBlur={onCloseModal}
      onEscape={onCloseModal}
    >
      <AppBar>
        <AppBarTitle>
          {createMode ? 'New doorway' : 'Edit doorway'}
        </AppBarTitle>
      </AppBar>

      <div className={styles.modalFirstSection}>
        <FormLabel
          label="Name"
          htmlFor="admin-locations-detail-modules-doorways-name"
          input={
            <InputBox
              type="text"
              id="admin-locations-detail-modules-doorways-name"
              value={modalState.data.name || ''}
              placeholder={'ex: "Main Entry", "Stairwell A"'}
              onChange={e => onChangeField('name', e.target.value)}
              width="100%"
            />
          }
        />
      </div>

      <AppBarContext.Provider value="CARD_SUBHEADER">
        <AppBar>
          <AppBarTitle>DPU position</AppBarTitle>
        </AppBar>
      </AppBarContext.Provider>
      <div className={styles.modalSection}>
        <DpuPosition
          value={modalState.data.sensorPlacement}
          spaceName={spaceName}
          onChange={sensorPlacement => onChangeField('sensorPlacement', sensorPlacement)}
        />
        {!createMode && <>
          <div className={styles.updateHistoricCheckbox}>
            <Checkbox
              label="Update historic space counts"
              checked={modalState.data.updateHistoricCounts}
              onChange={() => onChangeField('updateHistoricCounts', !modalState.data.updateHistoricCounts)}
            />
          </div>
        </>
        }

      </div>

      <AppBarContext.Provider value="CARD_SUBHEADER">
        <AppBar>
          <AppBarTitle>Installation details</AppBarTitle>
        </AppBar>
      </AppBarContext.Provider>

      <div className={styles.modalSection}>
        <div className={styles.modalSectionHorizontalForm}>
          <FormLabel
            label="Units"
            htmlFor="admin-locations-detail-modules-doorways-units"
            input={
              <InputBox
                type="select"
                id="admin-locations-detail-modules-doorways-units"
                value={modalState.data.measurementUnit}
                placeholder="Pick units"
                choices={[
                  {id: CENTIMETERS, label: 'Metric'},
                  {id: INCHES, label: 'Imperial'},
                ]}
                onChange={item => {
                  const updatedModalState = {
                    ...modalState,
                    data: {
                      ...modalState.data,
                      measurementUnit: item.id,
                    },
                  };

                  // Convert width / height when management unit is changed
                  if (modalState.data.measurementUnit && item.id !== modalState.data.measurementUnit) {
                    (['width', 'height']).forEach(fieldName => {
                      const parsedValue = parseFloat(modalState.data[fieldName]);
                      if (!isNaN(parsedValue)) {
                        const converted = convertUnit(parsedValue, modalState.data.measurementUnit, item.id);
                        updatedModalState.data[fieldName] = converted;
                      }
                    });
                  }

                  onUpdateModalState(updatedModalState);
                }}
                width={130}
              />
            }
          />
          <FormLabel
            label={<span>Height {shortMeasurementUnit}</span>}
            htmlFor="admin-locations-detail-modules-doorways-height"
            input={
              <InputBox
                type="number"
                id="admin-locations-detail-modules-doorways-height"
                value={modalState.data.height || ''}
                placeholder={'ex: "84"'}
                onChange={e => onChangeField('height', e.target.value)}
                width={130}
              />
            }
          />
          <FormLabel
            label={<span>Width {shortMeasurementUnit}</span>}
            htmlFor="admin-locations-detail-modules-doorways-width"
            input={
              <InputBox
                type="number"
                id="admin-locations-detail-modules-doorways-width"
                value={modalState.data.width || ''}
                placeholder={'ex: "84"'}
                onChange={e => onChangeField('width', e.target.value)}
                width={130}
              />
            }
          />
        </div>
        <div className={styles.modalSectionMountingSpace}>
          <p>Is there enough mounting space above this doorway?</p>
          <div className={styles.modalSectionHorizontalForm}>
            <div className={styles.formMountingSpaceRadioButtonGroup}>
              <RadioButton
                text="Yes"
                checked={modalState.data.clearance === true}
                onChange={e => onChangeField('clearance', e.target.checked)}
              />
              <RadioButton
                text="No"
                checked={modalState.data.clearance === false}
                onChange={e => onChangeField('clearance', !e.target.checked)}
              />
            </div>
						{MOUNTING_SPACE_GLYPH}
          </div>
        </div>
        <FormLabel
          label="Power option"
          htmlFor="admin-locations-detail-modules-doorways-power"
          input={
            <InputBox
              type="select"
              id="admin-locations-detail-modules-doorways-power"
              value={modalState.data.powerType}
              choices={[
                {id: POWER_OVER_ETHERNET, label: 'Power over Ethernet (803.2at PoE+)'},
                {id: AC_OUTLET, label: 'AC Outlet'},
              ]}
              onChange={item => onChangeField('powerType', item.id)}
              width="100%"
            />
          }
        />
      </div>

      <AppBarContext.Provider value="CARD_SUBHEADER">
        <AppBar>
          <AppBarTitle>Photos</AppBarTitle>
        </AppBar>
      </AppBarContext.Provider>
      <div className={styles.modalSection}>
        <AdminLocationsImageUpload
          label="Photo from inside the space"
          value={modalState.data.newInsideImageData || modalState.data.insideImageUrl}
          onChange={async file => {
            if (file) {
              const result = await fileToDataURI(file);
              onUpdateModalState({
                ...modalState,
                data: {
                  ...modalState.data,
                  newInsideImageData: result,
                  newInsideImageFile: file,
                },
              });
            } else {
              onUpdateModalState({
                ...modalState,
                data: {
                  ...modalState.data,
                  newInsideImageData: null,
                  newInsideImageFile: null,
                },
              });
            }
          }}
        />
        <AdminLocationsImageUpload
          label="Photo from outside the space"
          value={modalState.data.newOutsideImageData || modalState.data.outsideImageUrl}
          onChange={async file => {
            if (file) {
              const result = await fileToDataURI(file);
              onUpdateModalState({
                ...modalState,
                data: {
                  ...modalState.data,
                  newOutsideImageData: result,
                  newOutsideImageFile: file,
                },
              });
            } else {
              onUpdateModalState({
                ...modalState,
                data: {
                  ...modalState.data,
                  newOutsideImageData: null,
                  newOutsideImageFile: null,
                },
              });
            }
          }}
        />
      </div>

      {modalState.type !== 'CREATE' ? (
        <div className={styles.modalDangerZoneWrapper}>
          <div className={styles.modalDangerZoneText}>
            <h4>Delete this doorway</h4>
            <p>Once deleted, it will be gone forever. Please be certain.</p>
          </div>
          <div>
            <Button
              variant="underline"
              type="danger"
              onClick={() => onDeleteDoorway(modalState.data.id)}
            >Delete this doorway</Button>
          </div>
        </div>
      ) : null}

      <AppBarContext.Provider value="BOTTOM_ACTIONS">
        <AppBar>
          <AppBarSection />
          <AppBarSection>
            <ButtonGroup>
              <Button variant="underline" onClick={onCloseModal}>Cancel</Button>
              <Button
                variant="filled"
                type="primary"
                disabled={!formValid}
                onClick={() => onSubmitModal(modalState)}
              >Save doorway</Button>
            </ButtonGroup>
          </AppBarSection>
        </AppBar>
      </AppBarContext.Provider>
    </Modal>
  );
}

function DoorwayList({
  selectedSpaceId,
  doorways,
  shaded=false,
  onSelectDoorway,
  onChangeDoorwaySensorPlacement,
  onEditDoorway,
  onShowModal,
}) {
  return (
    <div className={classnames(styles.list, {[styles.shaded]: shaded})}>
      <ListView data={doorways}>
        <ListViewColumn
          id="Doorways"
          template={item => {
            const newDoorwayCheckboxState = !item.selected;
            return (
              <Fragment>
                <Checkbox
                  checked={item.selected}
                  onChange={() => onSelectDoorway(item, newDoorwayCheckboxState)}
                />
                <div
                  className={styles.itemContainer}
                  onClick={() => onSelectDoorway(item, newDoorwayCheckboxState)}
                >
                  <Icons.Doorway color={colorVariables.grayDarkest} />
                  <span className={styles.name}>{item.name}</span>
                </div>
              </Fragment>
            );
          }}
          width={360}
        />
        <ListViewColumn
          id="Linked spaces"
          template={i => {
            const spacesOtherThanSelectedSpace = i.spaces.filter(s => s.id !== selectedSpaceId);
            if (spacesOtherThanSelectedSpace.length > 1) {
              return (
                <div className={styles.linkedSpacesTag}>
                  <Icons.Link />
                  <span>{spacesOtherThanSelectedSpace.length} Linked spaces</span>
                </div>
              );
            } else if (spacesOtherThanSelectedSpace.length === 1) {
              return (
                <div className={styles.linkedSpacesTag}>
                  <Icons.Link />
                  <span>{spacesOtherThanSelectedSpace[0].name}</span>
                </div>
              );
            } else {
              return (
                <Fragment>Not linked</Fragment>
              )
            }
          }}
          width={200}
        />
        <ListViewColumn
          id="DPU position"
          template={i => {
            return (
              <Fragment>
                {i.sensorPlacement !== null ? (
                  <Fragment>
                    <Button
                      size="small"
                      width={40}
                      height={40}
                      onClick={() => {
                        // Prompt the user for the dpu position in a modal
                        onShowModal('MODAL_SPACE_MANAGEMENT_DPU_POSITION', {
                          sensorPlacement: i.sensorPlacement, /* initial value */
                          updateHistoricCounts: true,
                          onComplete: (sensorPlacement, updateHistoricCounts) => {
                            onChangeDoorwaySensorPlacement(i, sensorPlacement, updateHistoricCounts);
                          },
                        });
                      }}
                    >
                      <div style={{marginTop: 6}}>
                        <Icons.Switch color={colorVariables.brandPrimary} />
                      </div>
                    </Button>
                    <span className={styles.dpuPosition}>
                      {i.sensorPlacement === 1 ? 'Inside' : 'Outside'}
                    </span>
                  </Fragment>
                ) : (
                  <Fragment>&mdash;</Fragment>
                )}
              </Fragment>
            );
          }}
          width={140}
        />
        <ListViewColumn
          id={null}
          template={i => i.selected ? (
            <div
              className={styles.editLink}
              onClick={() => onEditDoorway(i)}
            >
              Edit
            </div>
          ): null}
          width={50}
        />
      </ListView>
    </div>
  );
}

function AdminLocationsDetailModulesDoorways({
  formState,
  activeModal,
  selectedSpaceIdOrNull,

  onChangeDoorwaysFilter,
  onChangeField,
  onSetDoorwayField,

  onShowModal,
  onHideModal,
  onUpdateModalData,
  onUpdateDoorway,
  onCreateDoorway,
  onDeleteDoorway,
}) {
  const doorwaysFilter = filterCollection({fields: ['name']});
  const filteredDoorways = doorwaysFilter(formState.doorways, formState.doorwaysFilter);

	const topDoorways = filteredDoorways.filter(x => x.list === 'TOP');
	const bottomDoorways = filteredDoorways.filter(x => x.list === 'BOTTOM');

  function onSelectDoorway(doorway, state) {
    if (state) {
      // Prompt the user for the dpu position in a modal
      onShowModal('MODAL_SPACE_MANAGEMENT_DPU_POSITION', {
        sensorPlacement: 1 /* initial value */,
        updateHistoricCounts: true,
        onComplete: (sensorPlacement, updateHistoricCounts) => {
          // And then move the doorway to the top section
          onSetDoorwayField(doorway.id, 'selected', true);
          onSetDoorwayField(doorway.id, 'sensorPlacement', sensorPlacement);
          onSetDoorwayField(doorway.id, 'updateHistoricCounts', updateHistoricCounts);
          onSetDoorwayField(
            doorway.id,
            'operationToPerform',
            doorway.linkExistsOnServer ? 'UPDATE' : 'CREATE',
          );
        },
      });
    } else {
      // Otherwise move the doorway back down to the bottom section
      onSetDoorwayField(doorway.id, 'selected', false);
      onSetDoorwayField(doorway.id, 'sensorPlacement', null);
      onSetDoorwayField(
        doorway.id,
        'operationToPerform',
        doorway.linkExistsOnServer ? 'DELETE' : null,
      );
    }
  }
  function onChangeDoorwaySensorPlacement(doorway, sensorPlacement, updateHistoricCounts) {
    onSetDoorwayField(doorway.id, 'sensorPlacement', sensorPlacement);
    onSetDoorwayField(doorway.id, 'updateHistoricCounts', updateHistoricCounts);
    onSetDoorwayField(
      doorway.id,
      'operationToPerform',
      doorway.operationToPerform === 'CREATE' ? 'CREATE' : 'UPDATE',
    );
  }
  function onEditDoorway(doorway) {
    onShowModal('MODAL_SPACE_MANAGEMENT_DOORWAY', { type: 'EDIT', data: doorway });
  }

  return (
    <Fragment>
      {activeModal.name === 'MODAL_SPACE_MANAGEMENT_DOORWAY' ? (
        <AdminLocationsDetailModulesDoorwayModal
          visible={activeModal.visible}
          modalState={activeModal.data}
          spaceName={formState.name}
          onUpdateModalState={onUpdateModalData}
          onCloseModal={onHideModal}
          onSubmitModal={activeModalData => {
            const data = processModalData(activeModalData.data);
            if (activeModalData.type === 'CREATE') {
              onCreateDoorway(data);
            } else {
              onUpdateDoorway(data);
            }
          }}
          onDeleteDoorway={onDeleteDoorway}
        />
      ) : null}

      {activeModal.name === 'MODAL_SPACE_MANAGEMENT_DPU_POSITION' ? (
        <AdminLocationsDetailModulesDoorwayDpuPositionModal
          visible={activeModal.visible}
          spaceName={formState.name}
          sensorPlacement={activeModal.data.sensorPlacement}
          updateHistoricCounts={activeModal.data.updateHistoricCounts}
          onUpdateSensorPlacement={sensorPlacement => onUpdateModalData({...activeModal, sensorPlacement})}
          onUpdateHistoricCounts={updateHistoricCounts => onUpdateModalData({...activeModal, updateHistoricCounts})}
          onCloseModal={onHideModal}
          // Call a function within the modal data, this lets all the code for the modal submitting
          // be in the onSelectDoorway function above
          onSubmitModal={() => {
            onHideModal();
            activeModal.data.onComplete(
                activeModal.data.sensorPlacement,
                activeModal.data.updateHistoricCounts
            );
          }}
        />
      ) : null}

      <AdminLocationsDetailModule title="Doorways" includePadding={false}>
        <AppBar>
          <AppBarSection>
            <InputBox
              leftIcon={<Icons.Search />}
              placeholder={'ex: "Doorway A", "Stairwell B"'}
              width={344}
              value={formState.doorwaysFilter}
              onChange={e => onChangeDoorwaysFilter(e.target.value)}
            />
          </AppBarSection>
          <AppBarSection>
            <Button onClick={() => onShowModal('MODAL_SPACE_MANAGEMENT_DOORWAY', {
              type: 'CREATE',
              data: {
                spaceName: formState.name,
                sensorPlacement: 1,
                measurementUnit: INCHES,
                width: '',
                height: '',
                clearance: null,
                powerType: POWER_OVER_ETHERNET,
              },
            })}>
              Add a new doorway
            </Button>
          </AppBarSection>
        </AppBar>
        <div className={styles.lists}>
          {topDoorways.length > 0 ? (
            <DoorwayList
              selectedSpaceId={selectedSpaceIdOrNull}
              doorways={topDoorways}
              onSelectDoorway={onSelectDoorway}
              onChangeDoorwaySensorPlacement={onChangeDoorwaySensorPlacement}
              onEditDoorway={onEditDoorway}
              onShowModal={onShowModal}
            />
          ): (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateInner}>
                {formState.doorwaysFilter.length > 0 ? (
                  <div className={styles.emptyStateInnerRight}>
                    <h3>Whoops</h3>
                    <p>We couldn't find any linked doorways that matched "{formState.doorwaysFilter}"</p>
                  </div>
                ) : (
                  <Fragment>
                    {bottomDoorways.find(i => i.selected) ? (
                      <div className={styles.emptyStateInnerRight}>
                        <h3>Great, now save this space!</h3>
                        <p>Save a doorway, save a space</p>
                      </div>
                    ) : (
                      <Fragment>
                        <div className={styles.emptyStateInnerLeft}>{DOORWAY_ICON}</div>
                        <div className={styles.emptyStateInnerRight}>
                          <h3>You haven't assigned any linked doorways to this space yet</h3>
                          <p>Start assigning and start counting</p>
                        </div>
                      </Fragment>
                    )}
                  </Fragment>
                )}
              </div>
            </div>
          )}

          {bottomDoorways.length === 0 && formState.doorwaysFilter.length > 0 ? (
            <Fragment>
              <div className={classnames(styles.emptyState, styles.shaded)}>
                <div className={styles.emptyStateInner}>
                  <div className={styles.emptyStateInnerRight}>
                    <h3>Whoops</h3>
                    <p>We couldn't find any unlinked doorways that matched "{formState.doorwaysFilter}"</p>
                  </div>
                </div>
              </div>
            </Fragment>
          ): (
            <DoorwayList
              selectedSpaceId={selectedSpaceIdOrNull}
              doorways={filteredDoorways.filter(x => x.list === 'BOTTOM')}
              onSelectDoorway={onSelectDoorway}
              onChangeDoorwaySensorPlacement={onChangeDoorwaySensorPlacement}
              onEditDoorway={onEditDoorway}
              onShowModal={onShowModal}
              shaded
            />
          )}
        </div>
      </AdminLocationsDetailModule>
    </Fragment>
  );
}

export default connect((state: any) => ({
  activeModal: state.activeModal,
  selectedSpaceIdOrNull: state.spaceManagement.spaces.selected,
}), dispatch => ({
  onHideModal() {
    dispatch<any>(hideModal());
  },
  onShowModal(modalName, data={}) {
    dispatch<any>(showModal(modalName, data))
  },
  onUpdateModalData(data) {
    dispatch<any>(updateModal(data));
  },

  onCreateDoorway(data) {
    dispatch<any>(spaceManagementCreateDoorway(data));
  },
  onUpdateDoorway(data) {
    dispatch<any>(spaceManagementUpdateDoorway(data));
  },
  onDeleteDoorway(doorwayId) {
    dispatch<any>(spaceManagementDeleteDoorway(doorwayId));
  },
}))(AdminLocationsDetailModulesDoorways);
