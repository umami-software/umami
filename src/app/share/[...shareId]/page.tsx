import { useEffect } from 'react';
import SharePage from './SharePage';

export default function ({ params: { shareId } }) {
  useEffect(() => {
    function sendHeightToParent() {
      const height = document.body.scrollHeight;
      window.parent.postMessage({ height: height }, '*');
    }

    sendHeightToParent();
    
    // Add event listener for resize
    window.addEventListener('resize', () => {
      sendHeightToParent();
    });

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('resize', () => {
        sendHeightToParent();
      });
    };
  }, [])
  return <SharePage shareId={shareId[0]} />;
}
