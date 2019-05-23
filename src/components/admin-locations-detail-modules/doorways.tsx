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

function DoorwayList({doorways, onSelectDoorway, shaded=false}) {
  return (
    <div className={classnames(styles.doorwayList, {[styles.shaded]: shaded})}>
      <ListView data={doorways}>
        <ListViewColumn
          title="Doorways"
          template={i => (
            <Fragment>
              <Checkbox checked={i._formState.selected} onChange={console.log} />
              <Icons.Doorway color={colorVariables.grayDarkest} />
              <span className={styles.doorwayName}>{i.name}</span>
            </Fragment>
          )}
          onClick={onSelectDoorway}
          flexGrow={1}
        />
        <ListViewColumn
          title="Linked Spaces"
          template={i => {
            if (i.spaces.length > 1) {
              return `${i.spaces.length} Linked Spaces`;
            } else if (i.spaces.length === 1) {
              return i.spaces[0].name;
            } else {
              return null;
            }
          }}
          width={240}
        />
        <ListViewColumn
          title="DPU Position"
          template={i => 'Inside'}
          width={120}
        />
        <ListViewColumn
          title={null}
          template={i => 'Edit'}
        />
      </ListView>
    </div>
  );
}

export default function AdminLocationsDetailModulesDoorways({
  formState
}) {
  return (
    <AdminLocationsDetailModule title="Doorways" includePadding={false}>
      <AppBar>
        <AppBarSection>
          <InputBox
            leftIcon={<Icons.Search />}
            placeholder={'ex: "Doorway A", "Stairwell B"'}
            width={344}
          />
        </AppBarSection>
        <AppBarSection>
          <Button>
            Add a doorway
          </Button>
        </AppBarSection>
      </AppBar>
      <div className={styles.doorwayLists}>
        <DoorwayList
          doorways={formState.doorways.filter(x => x._formState.list === 'top')}
          onSelectDoorway={i => alert(i.name)}
        />
        <DoorwayList
          doorways={formState.doorways.filter(x => x._formState.list === 'bottom')}
          onSelectDoorway={i => alert(i.name)}
          shaded
        />
      </div>
    </AdminLocationsDetailModule>
  );
}
