import React from 'react';
import { InputBox } from '@density/ui/src';
import styles from './styles.module.scss';

export default function MarkdownEditor(props) {
  return (
    <div className={styles.markdownEditorWrapper}>
      <InputBox type="textarea" height={300} {...props} />
      <ul className={styles.markdownEditorHints}>
        <li><strong>**bold**</strong></li>
        <li><em>_italics_</em></li>
        <li><span className={styles.red}>red{'{'}colored text{'}'}</span></li>
        <li><span className={styles.link}>[link text](http://example.com)</span></li>
      </ul>
    </div>
  );
}

