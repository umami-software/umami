import React, { useRef } from 'react';
import Button from 'components/common/Button';
import FormLayout, { FormButtons, FormRow } from 'components/layout/FormLayout';
import CopyButton from '../common/CopyButton';

export default function TrackingCodeForm({ values, onClose }) {
  const ref = useRef();
  const { name, share_id } = values;

  return (
    <FormLayout>
      <p>
        This is the publicly shared URL for <b>{values.name}</b>.
      </p>
      <FormRow>
        <textarea
          ref={ref}
          rows={3}
          cols={60}
          spellCheck={false}
          defaultValue={`${document.location.origin}/share/${share_id}/${encodeURIComponent(name)}`}
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
