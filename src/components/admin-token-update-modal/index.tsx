import styles from './styles.module.scss';

import React, { Fragment } from 'react';

import {
  AppBar,
  AppBarSection,
  AppBarContext,
  AppBarTitle,
  Button,
  ButtonGroup,
  InputBox,
  Modal,
} from '@density/ui';

import FormLabel from '../form-label';

export default function TokenUpdateModal({
  visible,
  token,
  isDestroying,
  onDismiss,
  onUpdate,
  onSubmit,
  onDestroyToken,
}) {
  let contents;
  if (isDestroying) {
    contents = (
      <Fragment>
        <AppBar><AppBarSection><AppBarTitle>Destroy Token</AppBarTitle></AppBarSection></AppBar>

        <div className={styles.tokenUpdateModalBody}>
          <h2 className={styles.tokenUpdateDestroyWarning}>Are you ABSOLUTELY sure?</h2>

          <p>
            The act of removing a token is irreversible and generating a duplicate token (with the
            same value) is impossible. Type in the name of this token below
            ("{token.name}") to remove.
          </p>

          <div className={styles.tokenUpdateDestroyConfirmation}>
            <InputBox
              type="text"
              width="100%"
              value={token.destroyNameConfirmation}
              placeholder="Token Name"
              onChange={e => onUpdate({...token, destroyNameConfirmation: e.target.value})}
            />
          </div>
        </div>
        <AppBarContext.Provider value="BOTTOM_ACTIONS">
          <AppBar>
            <AppBarSection />
            <AppBarSection>
              <ButtonGroup>
                <Button variant="underline" onClick={onDismiss}>Cancel</Button>
                <Button
                  variant="filled"
                  type="primary"
                  disabled={token.name !== token.destroyNameConfirmation}
                  onClick={() => onDestroyToken(token)}
                >I understand the consequences. Delete.</Button>
              </ButtonGroup>
            </AppBarSection>
          </AppBar>
        </AppBarContext.Provider>
      </Fragment>
    );
  } else {
    contents = (
      <Fragment>
        <AppBar><AppBarSection><AppBarTitle>Edit Token</AppBarTitle></AppBarSection></AppBar>

        <div className={styles.tokenUpdateModalBody}>
          <FormLabel
            label="Token name"
            htmlFor="token-update-name"
            input={<InputBox
              type="text"
              id="update-token-name"
              value={token.name}
              onChange={e => onUpdate({...token, name: e.target.value})}
              width="100%"
            />}
          />
          <FormLabel
            label="Description"
            htmlFor="token-update-description"
            input={<InputBox
              type="textarea"
              className={styles.tokenUpdateDescriptionField}
              id="token-update-description"
              value={token.description}
              onChange={e => onUpdate({...token, description: e.target.value})}
            />}
          />
          <FormLabel
            label="Permissions"
            htmlFor="token-update-permissions"
            input={<span>To update permissions you must create a new token.</span>}
          />
        </div>

        <AppBarContext.Provider value="BOTTOM_ACTIONS">
          <AppBar>
            <AppBarSection />
            <AppBarSection>
              <ButtonGroup>
                <Button variant="underline" onClick={onDismiss}>Cancel</Button>
                <Button
                  variant="filled"
                  type="primary"
                  disabled={token.name.length === 0}
                  onClick={() => onSubmit({
                    key: token.key,
                    name: token.name,
                    description: token.description || undefined,
                  })}
                >Save changes</Button>
              </ButtonGroup>
            </AppBarSection>
          </AppBar>
        </AppBarContext.Provider>
      </Fragment>
    );
  }

  return (
    <Modal
      visible={visible}
      width={480}
      onBlur={onDismiss}
      onEscape={onDismiss}
    >
      {contents}
    </Modal>
  );
}
