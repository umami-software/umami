function getHostName(url: string) {
  const match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?=]+)/im);
  return match && match.length > 1 ? match[1] : null;
}

export function Favicon({ domain, ...props }) {
  if (process.env.privateMode) {
    return null;
  }

  const hostName = domain ? getHostName(domain) : null;

  return hostName ? (
    <img
      src={`https://icons.duckduckgo.com/ip3/${hostName}.ico`}
      width={16}
      height={16}
      alt=""
      {...props}
    />
  ) : null;
}

export default Favicon;
