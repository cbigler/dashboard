import styles from './styles.module.scss';

import React from 'react';

import {
  AppBar,
  AppBarSection,
  AppBarTitle,
  AppBarContext,
  Button,
  ButtonGroup,
  InputBox,
  RadioButton,
  Modal,
} from '@density/ui';

import FormLabel from '../form-label';

const READONLY = 'readonly', READWRITE = 'readwrite';

export default function TokenCreate({
  visible,
  token,
  onDismiss,
  onUpdate,
  onSubmit
}) {
  return (
    <Modal
      visible={visible}
      width={460}
      height={450}
      onBlur={onDismiss}
      onEscape={onDismiss}
    >
      <AppBar>
        <AppBarTitle>Create Token</AppBarTitle>
      </AppBar>
      <div className={styles.tokenCreate}>
        <FormLabel
          label="Token name"
          htmlFor="update-token-name"
          input={<InputBox
            type="text"
            id="update-token-name"
            width="100%"
            value={token.name}
            onChange={e => onUpdate({...token, name: e.target.value})}
          />}
        />
        <FormLabel
          label="Token description"
          htmlFor="token-create-desc"
          input={<InputBox
            type="textarea"
            className={styles.tokenCreateDescriptionField}
            id="token-create-desc"
            value={token.description}
            onChange={e => onUpdate({...token, description: e.target.value})}
          />}
        />
        <FormLabel
          label="Token type"
          htmlFor=""
          editable={false}
          input={<div className={styles.tokenCreateTokenTypeRadioGroup}>
            <div className={styles.tokenCreateTokenTypeRadioItem}>
              <RadioButton 
                name="token-create-token-type"
                onChange={() => onUpdate({...token, tokenType: READONLY})}
                checked={token.tokenType === READONLY}
                text="Read-only"
              />
            </div>
            <div className={styles.tokenCreateTokenTypeRadioItem}>
              <RadioButton 
                name="token-create-token-type"
                onChange={() => onUpdate({...token, tokenType: READWRITE})}
                checked={token.tokenType === READWRITE}
                text="Read-write"
              />
            </div>
          </div>}
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
                id="admin-token-create-modal-submit"
                onClick={() => onSubmit({
                  name: token.name,
                  tokenType: token.tokenType,
                  description: token.description || undefined,
                })}
              >Save token</Button>
            </ButtonGroup>
          </AppBarSection>
        </AppBar>
      </AppBarContext.Provider>
    </Modal>
  );
}
