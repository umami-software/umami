export function TypeIcon({
  type,
  value,
}: {
  type: 'browser' | 'country' | 'device' | 'os';
  value: string;
}) {
  return (
    <img
      src={`${process.env.basePath || ''}/images/${type}/${value || 'unknown'}.png`}
      alt={value}
      width={type === 'country' ? undefined : 16}
      height={type === 'country' ? undefined : 16}
    />
  );
}

export default TypeIcon;
