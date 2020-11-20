import React from 'react';
import Link from 'components/common/Link';
import Favicon from 'components/common/Favicon';

export default function DetailsLink({ website_id, name, domain }) {
  return (
    <Link href="/website/[...id]" as={`/website/${website_id}/${name}`}>
      <Favicon domain={domain} />
      {name}
    </Link>
  );
}
