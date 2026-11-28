import { Icon, Text } from '@umami/react-zen';
import type { ReactNode } from 'react';
import { DateDistance } from '@/components/common/DateDistance';
import { Favicon } from '@/components/common/Favicon';
import { TypeIcon } from '@/components/common/TypeIcon';
import { useFormat, useLocale, useMessages, useRegionNames, useTimezone } from '@/components/hooks';
import { AppWindow, Cpu, Earth, Globe, Laptop, Monitor } from '@/components/icons';
import { decodePunycodeDomain } from '@/lib/format';
import styles from './SessionInfo.module.css';

export interface SessionInfoProps {
  data: Record<string, any>;
  layout?: 'sidebar' | 'grid';
  showDistinctId?: boolean;
}

export function SessionInfo({
  data,
  layout = 'grid',
  showDistinctId = layout === 'grid',
}: SessionInfoProps) {
  const { locale } = useLocale();
  const { t, labels } = useMessages();
  const { formatValue } = useFormat();
  const { getRegionName } = useRegionNames(locale);
  const { formatTimezoneDate } = useTimezone();

  const distinctId =
    data?.distinctIds?.length > 1
      ? `${data.distinctIds.length} linked IDs`
      : data?.distinctId?.trim();
  const stitchedSessionCount = data?.stitchedSessionCount;

  const firstDate = data?.firstAt ? new Date(data.firstAt) : null;
  const lastDate = data?.lastAt ? new Date(data.lastAt) : null;
  const isSameTimestamp = Boolean(
    firstDate && lastDate && Math.abs(lastDate.getTime() - firstDate.getTime()) < 1000,
  );

  const countryName = data?.country ? formatValue(data.country, 'country') : '';
  const regionName = data?.region ? getRegionName(data.region) : '';
  const cityName = data?.city || '';
  const subLocation = [cityName, regionName].filter(Boolean).join(', ');
  const primaryLocation = subLocation || countryName;
  const secondaryLocation = subLocation && countryName ? countryName : '';

  const formattedScreen = data?.screen ? String(data.screen).replace(/x/i, ' × ') : '';
  const languageName = data?.language ? formatValue(data.language, 'language') : '';
  const formattedLanguage =
    data?.language && languageName && languageName !== data.language
      ? `${languageName} (${data.language})`
      : languageName || data?.language || '';

  return (
    <div
      className={
        layout === 'grid' ? `${styles.container} ${styles.containerGrid}` : styles.container
      }
    >
      <div className={layout === 'sidebar' ? styles.sidebar : styles.grid}>
        <section className={styles.section}>
          <div className={styles.sectionTitle}>{t(labels.session)}</div>
          <div className={styles.rows}>
            {firstDate && (
              <InfoRow label={t(labels.firstSeen)}>
                <div className={styles.rowValueStacked}>
                  <DateDistance date={firstDate} />
                  {isSameTimestamp && (
                    <span className={styles.subValue}>
                      {formatTimezoneDate(firstDate.toISOString(), 'PP · p')}
                    </span>
                  )}
                </div>
              </InfoRow>
            )}

            {lastDate && !isSameTimestamp && (
              <InfoRow label={t(labels.lastSeen)}>
                <DateDistance date={lastDate} />
              </InfoRow>
            )}

            <InfoRow label={t(labels.referrer)}>
              {data?.referrerDomain ? (
                <>
                  <span className={styles.icon}>
                    <Favicon domain={data.referrerDomain} />
                  </span>
                  <a
                    className={styles.referrerLink}
                    href={`https://${data.referrerDomain}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    title={data.referrerDomain}
                  >
                    {decodePunycodeDomain(data.referrerDomain)}
                  </a>
                </>
              ) : (
                <span className={styles.muted}>{t(labels.direct)}</span>
              )}
            </InfoRow>

            {showDistinctId && distinctId && (
              <InfoRow label={t(labels.distinctId)}>
                <span style={{ overflowWrap: 'anywhere' }}>{distinctId}</span>
              </InfoRow>
            )}

            {distinctId && stitchedSessionCount > 1 && (
              <InfoRow label="Linked sessions">
                <span className={styles.tabular}>{stitchedSessionCount}</span>
              </InfoRow>
            )}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionTitle}>{t(labels.location)}</div>
          <div className={styles.locationBlock}>
            <span className={styles.locationIcon}>
              <Icon size="sm">
                {data?.country ? <TypeIcon type="country" value={data.country} /> : <Earth />}
              </Icon>
            </span>
            <div className={styles.locationText}>
              <span className={primaryLocation ? styles.locationPrimary : styles.muted}>
                {primaryLocation || '—'}
              </span>
              {secondaryLocation && (
                <span className={styles.locationSecondary}>{secondaryLocation}</span>
              )}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionTitle}>{t(labels.system)}</div>
          <div className={styles.rows}>
            <InfoRow label={t(labels.os)}>
              {data?.os ? (
                <>
                  <span className={styles.icon}>
                    <Icon size="sm">
                      <TypeIcon type="os" value={data.os.toLowerCase().replaceAll(/\W/g, '-')} />
                    </Icon>
                  </span>
                  <Text truncate>{formatValue(data.os, 'os')}</Text>
                </>
              ) : (
                <>
                  <span className={styles.icon}>
                    <Icon size="sm">
                      <Cpu />
                    </Icon>
                  </span>
                  <span className={styles.muted}>—</span>
                </>
              )}
            </InfoRow>

            <InfoRow label={t(labels.browser)}>
              {data?.browser ? (
                <>
                  <span className={styles.icon}>
                    <Icon size="sm">
                      <TypeIcon type="browser" value={data.browser} />
                    </Icon>
                  </span>
                  <Text truncate>{formatValue(data.browser, 'browser')}</Text>
                </>
              ) : (
                <>
                  <span className={styles.icon}>
                    <Icon size="sm">
                      <AppWindow />
                    </Icon>
                  </span>
                  <span className={styles.muted}>—</span>
                </>
              )}
            </InfoRow>

            <InfoRow label={t(labels.device)}>
              {data?.device ? (
                <>
                  <span className={styles.icon}>
                    <Icon size="sm">
                      <TypeIcon type="device" value={data.device} />
                    </Icon>
                  </span>
                  <Text truncate>{formatValue(data.device, 'device')}</Text>
                </>
              ) : (
                <>
                  <span className={styles.icon}>
                    <Icon size="sm">
                      <Laptop />
                    </Icon>
                  </span>
                  <span className={styles.muted}>—</span>
                </>
              )}
            </InfoRow>

            {formattedScreen && (
              <InfoRow label={t(labels.screen)}>
                <span className={styles.icon}>
                  <Icon size="sm">
                    <Monitor />
                  </Icon>
                </span>
                <span className={styles.tabular}>{formattedScreen}</span>
              </InfoRow>
            )}

            {formattedLanguage && (
              <InfoRow label={t(labels.language)}>
                <span className={styles.icon}>
                  <Icon size="sm">
                    <Globe />
                  </Icon>
                </span>
                <Text truncate title={formattedLanguage}>
                  {formattedLanguage}
                </Text>
              </InfoRow>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={styles.rowValue}>{children}</span>
    </div>
  );
}
