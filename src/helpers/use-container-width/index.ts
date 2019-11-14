import { useEffect, useState } from 'react';


export default function useContainerWidth(container: React.RefObject<HTMLElement>, initialWidth: number = 500) {
  const [width, setWidth] = useState<number>(initialWidth);
  useEffect(() => {
    if (!container.current) return;
    const onResize = () => {
      if (!container.current) return;
      const bbox = container.current.getBoundingClientRect();
      setWidth(bbox.width);
    }
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, [width, container]);
  return width;
}
