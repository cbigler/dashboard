import React, { Fragment } from 'react';
import classnames from 'classnames';

import styles from './styles.module.scss';
import colorVariables from '@density/ui/variables/colors.json';

import {
  AppBar,
  AppBarSection,
  Button,
  Icons,
  InputBox,
} from '@density/ui';

import ListView, { ListViewColumn } from '../list-view';
import Checkbox from '../checkbox';

import AdminLocationsDetailModule from './index';
import filterCollection from '../../helpers/filter-collection';

function DoorwayList({
  doorways,
  shaded=false,
  onSelectDoorway,
  onChangeDoorwaySensorPlacement,
  onEditDoorway,
}) {
  return (
    <div className={classnames(styles.doorwayList, {[styles.shaded]: shaded})}>
      <ListView data={doorways}>
        <ListViewColumn
          title="Doorways"
          template={item => {
            const newDoorwayCheckboxState = !item.selected;
            return (
              <Fragment>
                <Checkbox
                  checked={item.selected}
                  onChange={() => onSelectDoorway(item.id, newDoorwayCheckboxState)}
                />
                <div
                  className={styles.doorwayItemContainer}
                  onClick={() => onSelectDoorway(item.id, newDoorwayCheckboxState)}
                >
                  <Icons.Doorway color={colorVariables.grayDarkest} />
                  <span className={styles.doorwayName}>{item.name}</span>
                </div>
              </Fragment>
            );
          }}
          flexGrow={1}
          flexShrink={1}
          width={320}
        />
        <ListViewColumn
          title="Linked Spaces"
          template={i => {
            if (i.spaces.length > 1) {
              return (
                <div className={styles.linkedSpacesTag}>
                  <Icons.Link />
                  <span>{i.spaces.length} Linked Spaces</span>
                </div>
              );
            } else if (i.spaces.length === 1) {
              return (
                <div className={styles.linkedSpacesTag}>
                  <Icons.Link />
                  <span>{i.spaces[0].name}</span>
                </div>
              );
            } else {
              return (
                <Fragment>Not linked</Fragment>
              )
            }
          }}
          width={240}
        />
        <ListViewColumn
          title="DPU Position"
          template={i => {
            return (
              <Fragment>
                {i.sensorPlacement !== null ? (
                  <Fragment>
                    <Button
                      size="small"
                      width={40}
                      height={40}
                      onClick={() => onChangeDoorwaySensorPlacement(
                        i.id,
                        i.sensorPlacement === 1 ? -1 : 1,
                      )}
                    >
                      <Icons.Switch color={colorVariables.brandPrimary} />
                    </Button>
                    <span className={styles.doorwaysDpuPosition}>
                      {i.sensorPlacement === 1 ? 'Inside' : 'Outside'}
                    </span>
                  </Fragment>
                ) : (
                  <Fragment>&mdash;</Fragment>
                )}
              </Fragment>
            );
          }}
          width={160}
        />
        <ListViewColumn
          title={null}
          template={i => i.selected ? (
            <div
              className={styles.doorwaysEditLink}
              onClick={onEditDoorway}
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

export default function AdminLocationsDetailModulesDoorways({
  formState,
  onChangeDoorwaysFilter,
  onChangeField,
  onSetDoorwayField,
}) {

  const doorwaysFilter = filterCollection({fields: ['name']});
  const filteredDoorways = doorwaysFilter(formState.doorways, formState.doorwaysFilter);

  function onSelectDoorway(doorwayId, state) {
    onSetDoorwayField(doorwayId, 'selected', state);
    if (state) {
      onSetDoorwayField(doorwayId, 'sensorPlacement', 1);
    } else {
      onSetDoorwayField(doorwayId, 'sensorPlacement', null);
    }
  }
  function onChangeDoorwaySensorPlacement(doorwayId, sensorPlacement) {
    onSetDoorwayField(doorwayId, 'sensorPlacement', sensorPlacement);
  }
  function onEditDoorway(doorwayId) {
    console.log('EDIT', doorwayId);
  }

  return (
    <AdminLocationsDetailModule title="Doorways" includePadding={false}>
      <AppBar>
        <AppBarSection>
          <InputBox
            leftIcon={<Icons.Search />}
            placeholder={'ex: "Doorway A", "Stairwell B"'}
            width={344}
            onChange={e => onChangeDoorwaysFilter(e.target.value)}
          />
        </AppBarSection>
        <AppBarSection>
          <Button onClick={() => {
            console.log('CREATE');
          }}>
            Add a doorway
          </Button>
        </AppBarSection>
      </AppBar>
      <div className={styles.doorwayLists}>
        <DoorwayList
          doorways={filteredDoorways.filter(x => x.list === 'TOP')}
          onSelectDoorway={onSelectDoorway}
          onChangeDoorwaySensorPlacement={onChangeDoorwaySensorPlacement}
          onEditDoorway={onEditDoorway}
        />
        <DoorwayList
          doorways={filteredDoorways.filter(x => x.list === 'BOTTOM')}
          onSelectDoorway={onSelectDoorway}
          onChangeDoorwaySensorPlacement={onChangeDoorwaySensorPlacement}
          onEditDoorway={onEditDoorway}
          shaded
        />
      </div>
    </AdminLocationsDetailModule>
  );
}
