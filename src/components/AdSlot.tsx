import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID?.trim() ?? '';
const topSlotId = import.meta.env.VITE_ADSENSE_TOP_SLOT_ID?.trim() ?? '';
const contentSlotId = import.meta.env.VITE_ADSENSE_CONTENT_SLOT_ID?.trim() ?? '';

if (clientId && !/^ca-pub-\d+$/.test(clientId)) {
  throw new Error('VITE_ADSENSE_CLIENT_ID must be a Google AdSense publisher ID (ca-pub-...).');
}

for (const [name, slotId] of [
  ['VITE_ADSENSE_TOP_SLOT_ID', topSlotId],
  ['VITE_ADSENSE_CONTENT_SLOT_ID', contentSlotId],
] as const) {
  if (slotId && !/^\d+$/.test(slotId)) {
    throw new Error(`${name} must contain only the AdSense ad-unit ID digits.`);
  }
  if (slotId && !clientId) {
    throw new Error(`Set VITE_ADSENSE_CLIENT_ID before configuring ${name}.`);
  }
}

interface AdSlotProps {
  placement: 'top' | 'content';
}

export default function AdSlot({ placement }: AdSlotProps) {
  const slotId = placement === 'top' ? topSlotId : contentSlotId;

  useEffect(() => {
    if (!clientId || !slotId) return;

    const scriptUrl = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
    let script = document.querySelector<HTMLScriptElement>('script[data-adsense-loader]');
    if (!script) {
      script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.dataset.adsenseLoader = 'true';
      script.src = scriptUrl;
      document.head.appendChild(script);
    } else if (script.src !== scriptUrl) {
      throw new Error('Only one AdSense publisher ID can be configured per page.');
    }

    (window.adsbygoogle ||= []).push({});
  }, [slotId]);

  return (
    <aside className="ad-placement" aria-label="Advertisement">
      {clientId && slotId ? (
        <ins
          className="adsbygoogle"
          data-ad-client={clientId}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <div className="ad-slot-placeholder">Advertisement</div>
      )}
    </aside>
  );
}
