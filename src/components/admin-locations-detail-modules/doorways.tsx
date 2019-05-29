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

const DOORWAY_ICON = (
	<svg width="93px" height="108px" viewBox="0 0 93 108">
			<g id="Admin:-Locations-(release)" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
					<g id="org.locations.space.edit" transform="translate(-479.000000, -1561.000000)">
							<g id="doorways" transform="translate(298.000000, 1358.000000)">
									<g id="empty-message" transform="translate(182.000000, 204.000000)">
											<g id="alarm-thing">
													<circle id="Oval" stroke="#D7D7D7" strokeWidth="2" cx="73" cy="31" r="3"></circle>
													<g id="chat" transform="translate(64.000000, 0.000000)">
															<path d="M0,18 L4,14 L4,2 C4,0.8954305 4.8954305,2.02906125e-16 6,0 L25,0 C26.1045695,-2.02906125e-16 27,0.8954305 27,2 L27,16 C27,17.1045695 26.1045695,18 25,18 L6,18 L0,18 Z" id="Path" stroke="#D7D7D7" strokeWidth="2" strokeLinejoin="round"></path>
															<text id="+1" font-family="Aeonik-Medium, Aeonik" font-size="12" font-weight="400" fill="#BFBFBF">
																	<tspan x="8" y="13">+1</tspan>
															</text>
													</g>
													<path d="M19.3796296,105.526012 L19.3796296,32 L58.6388889,32 L58.6388889,105.526012 L70.4166667,105.526012 L7.60185185,105.526012 L19.3796296,105.526012 Z M29,76 C30.6568542,76 32,74.6568542 32,73 C32,71.3431458 30.6568542,70 29,70 C27.3431458,70 26,71.3431458 26,73 C26,74.6568542 27.3431458,76 29,76 Z" id="Combined-Shape" stroke="#D7D7D7" strokeWidth="2"></path>
													<circle id="Oval" stroke="#D7D7D7" strokeWidth="2" cx="3" cy="21" r="3"></circle>
													<circle id="Oval" fill="#D8D8D8" cx="30.5" cy="24.5" r="1.5"></circle>
											</g>
									</g>
							</g>
					</g>
			</g>
	</svg>
);

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
                  onChange={() => onSelectDoorway(item, newDoorwayCheckboxState)}
                />
                <div
                  className={styles.doorwayItemContainer}
                  onClick={() => onSelectDoorway(item, newDoorwayCheckboxState)}
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
                        i,
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

	const topDoorways = filteredDoorways.filter(x => x.list === 'TOP');
	const bottomDoorways = filteredDoorways.filter(x => x.list === 'BOTTOM');

  function onSelectDoorway(doorway, state) {
    onSetDoorwayField(doorway.id, 'selected', state);
    if (state) {
      onSetDoorwayField(doorway.id, 'sensorPlacement', 1);
      onSetDoorwayField(
        doorway.id,
        'operationToPerform',
        doorway.linkExistsOnServer ? 'UPDATE' : 'CREATE',
      );
    } else {
      onSetDoorwayField(doorway.id, 'sensorPlacement', null);
      onSetDoorwayField(
        doorway.id,
        'operationToPerform',
        doorway.linkExistsOnServer ? 'DELETE' : null,
      );
    }
  }
  function onChangeDoorwaySensorPlacement(doorway, sensorPlacement) {
    onSetDoorwayField(doorway.id, 'sensorPlacement', sensorPlacement);
    onSetDoorwayField(
      doorway.id,
      'operationToPerform',
      doorway.operationToPerform === 'CREATE' ? 'CREATE' : 'UPDATE',
    );
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
        {topDoorways.length > 0 ? (
          <DoorwayList
            doorways={topDoorways}
            onSelectDoorway={onSelectDoorway}
            onChangeDoorwaySensorPlacement={onChangeDoorwaySensorPlacement}
            onEditDoorway={onEditDoorway}
          />
        ): (
          <div className={styles.doorwaysEmptyState}>
            <div className={styles.doorwaysEmptyStateInner}>
              {bottomDoorways.find(i => i.selected) ? (
                <div className={styles.doorwaysEmptyStateInnerRight}>
                  <h3>Great, now save this space!</h3>
                  <p>Save a doorway, save a space</p>
                </div>
              ) : (
                <Fragment>
                  <div className={styles.doorwaysEmptyStateInnerLeft}>{DOORWAY_ICON}</div>
                  <div className={styles.doorwaysEmptyStateInnerRight}>
                    <h3>You haven't assigned any doorways to this space yet</h3>
                    <p>Start assigning and start counting</p>
                  </div>
                </Fragment>
              )}
            </div>
          </div>
        )}
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
