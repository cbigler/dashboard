import React from 'react';
import styles from './styles.module.scss';

type SkeletonProps = {
  width?: string | number,
  height?: string | number,
  color?: string,
};

export default function Skeleton({width, height, color}: SkeletonProps) {
  return (
    <span
      className={styles.skeleton}
      style={{width, height, backgroundColor: color}}
    />
  );
}

