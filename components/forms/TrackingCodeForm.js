import React, { useRef } from 'react';
import Button from 'components/common/Button';
import FormLayout, { FormButtons, FormRow } from 'components/layout/FormLayout';
import CopyButton from '../common/CopyButton';

export default function TrackingCodeForm({ values, onClose }) {
  const ref = useRef();

  return (
    <FormLayout>
      <p>
        To track stats for <b>{values.name}</b>, place the following code in the &lt;head&gt;
        section of your website.
      </p>
      <FormRow>
        <textarea
          ref={ref}
          rows={3}
          cols={60}
          spellCheck={false}
          defaultValue={`<script async defer data-website-id="${values.website_uuid}" src="${document.location.origin}/umami.js"></script>`}
          readOnly
        />
      </FormRow>
      <FormButtons>
        <CopyButton type="submit" variant="action" element={ref} />
        <Button onClick={onClose}>Cancel</Button>
      </FormButtons>
    </FormLayout>
  );
}
