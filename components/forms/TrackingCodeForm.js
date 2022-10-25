import React, { useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { useRouter } from 'next/router';
import Button from 'components/common/Button';
import FormLayout, { FormButtons, FormRow } from 'components/layout/FormLayout';
import CopyButton from 'components/common/CopyButton';
import useConfig from 'hooks/useConfig';

export default function TrackingCodeForm({ values, onClose }) {
  const ref = useRef();
  const { basePath } = useRouter();
  const { trackerScriptName } = useConfig();

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
        <textarea
          ref={ref}
          rows={3}
          cols={60}
          spellCheck={false}
          defaultValue={`<script async defer data-website-id="${values.websiteUuid}" src="${
            document.location.origin
          }${basePath}/${trackerScriptName ? `${trackerScriptName}.js` : 'umami.js'}"></script>`}
          readOnly
        />
      </FormRow>
      <FormButtons>
        <CopyButton type="submit" variant="action" element={ref} />
        <Button onClick={onClose}>
          <FormattedMessage id="label.cancel" defaultMessage="Cancel" />
        </Button>
      </FormButtons>
    </FormLayout>
  );
}
