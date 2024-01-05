import styles from './Favicon.module.css';

function getHostName(url: string) {
  const match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?=]+)/im);
  return match && match.length > 1 ? match[1] : null;
}

export function Favicon({ domain, ...props }) {
  const hostName = domain ? getHostName(domain) : null;

  return hostName ? (
    <img
      className={styles.favicon}
      src={`https://icons.duckduckgo.com/ip3/${hostName}.ico`}
      height="16"
      alt=""
      {...props}
    />
  ) : null;
}

export default Favicon;
