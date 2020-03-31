import React from 'react';
import styles from './styles.module.scss'

export default function Roadmap() {
  return (
    <div className={styles.roadmapPage}>
      <iframe
        title="roadmap"
        src="https://www.density.io/"
        sandbox="allow-same-origin allow-scripts"
        width="100%"
        height="100%"
        className={styles.roadmapIframe} />
    </div>
  );
}
