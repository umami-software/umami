import useConfig from 'hooks/useConfig';
import { useRef } from 'react';
import { Form, FormRow, TextArea } from 'react-basics';

export default function TrackingCodeForm({ websiteId }) {
  const ref = useRef(null);
  const { trackerScriptName } = useConfig();
  const code = `<script async defer src="${trackerScriptName}" data-website-id="${websiteId}"></script>`;

  return (
    <>
      <Form ref={ref}>
        <FormRow>
          <p>
            To track stats for this website, place the following code in the{' '}
            <code>&lt;head&gt;</code> section of your HTML.
          </p>
          <TextArea rows={4} value={code} readOnly allowCopy />
        </FormRow>
      </Form>
    </>
  );
}
