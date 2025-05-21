'use client';
import { Column, Button, Heading } from '@umami/react-zen';

export function GoalsPage({ websiteId }: { websiteId: string }) {
  return (
    <Column>
      {websiteId}
      <Button>Add goal</Button>
      <Heading>Goal 1</Heading>
      <Heading>Goal 2</Heading>
      <Heading>Goal 3</Heading>
    </Column>
  );
}
