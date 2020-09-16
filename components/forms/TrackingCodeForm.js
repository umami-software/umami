import React, { useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import Button from 'components/common/Button';
import FormLayout, { FormButtons, FormRow } from 'components/layout/FormLayout';
import CopyButton from '../common/CopyButton';

export default function TrackingCodeForm({ values, onClose }) {
  const ref = useRef();

  return (
    <FormLayout>
      <p>
        <FormattedMessage
          id="message.track-stats"
          defaultMessage="To track stats for {target}, place the following code in the {head} section of your website."
          values={{ head: '<head>', target: <b>{values.name}</b> }}
        />
      </p>
      <FormRow>
        {/* Run `npm run build-snippet, and copy paste here the content of public/snippet.js */}
        {/* TODO: use webpack importing function to import the content of the file here ? */}
        <textarea
          ref={ref}
          rows={3}
          cols={60}
          spellCheck={false}
          defaultValue={`!function(){"use strict";!function(e){var t=e.umami=e.umami||[];if(!t.registerAutoEvents)if(t.invoked)e.console&&console.error&&console.error("Umami snippet included twice.");else{t.invoked=!0,t.calls=[],t.methods=["registerAutoEvents","event","pageView"],t.factory=function(e){return function(){var r=Array.prototype.slice.call(arguments);return r.unshift(e),t.calls.push(r),t}};for(var r=0;r<t.methods.length;r++){var i=t.methods[r];t[i]=t.factory(i)}t.load=function(e,t,r){var i=document.createElement("script");i.type="text/javascript",i.defer=!0,i.async=!0,i.setAttribute("data-website-id",t),r&&i.setAttribute("data-skip-auto","true"),i.src=e;var o=document.getElementsByTagName("script")[0];o.parentNode.insertBefore(i,o)},t.load("${document.location.origin}/umami.js","${values.website_uuid}",!1)}}(window)}();`}
          readOnly
        />
      </FormRow>
      <FormButtons>
        <CopyButton type="submit" variant="action" element={ref} />
        <Button onClick={onClose}>
          <FormattedMessage id="button.cancel" defaultMessage="Cancel" />
        </Button>
      </FormButtons>
    </FormLayout>
  );
}
