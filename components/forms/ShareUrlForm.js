import React, { useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import { useRouter } from 'next/router';
import Button from 'components/common/Button';
import FormLayout, { FormButtons, FormRow } from 'components/layout/FormLayout';
import CopyButton from 'components/common/CopyButton';

export default function TrackingCodeForm({ values, onClose }) {
  const ref = useRef();
  const { basePath } = useRouter();
  const { name, shareId } = values;

  return (
    <FormLayout>
      <p>
        <FormattedMessage
          id="message.share-url"
          defaultMessage="This is the publicly shared URL for {target}."
          values={{ target: <b>{values.name}</b> }}
        />
      </p>
      <FormRow>
        <textarea
          ref={ref}
          rows={3}
          cols={60}
          spellCheck={false}
          defaultValue={`${
            document.location.origin
          }${basePath}/share/${shareId}/${encodeURIComponent(name)}`}
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
