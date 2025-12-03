import { weightedRandom, pickRandom, type WeightedOption } from '../utils.js';

interface GeoLocation {
  country: string;
  region: string;
  city: string;
}

const countryWeights: WeightedOption<string>[] = [
  { value: 'US', weight: 0.35 },
  { value: 'GB', weight: 0.08 },
  { value: 'DE', weight: 0.06 },
  { value: 'FR', weight: 0.05 },
  { value: 'CA', weight: 0.04 },
  { value: 'AU', weight: 0.03 },
  { value: 'IN', weight: 0.08 },
  { value: 'BR', weight: 0.04 },
  { value: 'JP', weight: 0.03 },
  { value: 'NL', weight: 0.02 },
  { value: 'ES', weight: 0.02 },
  { value: 'IT', weight: 0.02 },
  { value: 'PL', weight: 0.02 },
  { value: 'SE', weight: 0.01 },
  { value: 'MX', weight: 0.02 },
  { value: 'KR', weight: 0.02 },
  { value: 'SG', weight: 0.01 },
  { value: 'ID', weight: 0.02 },
  { value: 'PH', weight: 0.01 },
  { value: 'TH', weight: 0.01 },
  { value: 'VN', weight: 0.01 },
  { value: 'RU', weight: 0.02 },
  { value: 'UA', weight: 0.01 },
  { value: 'ZA', weight: 0.01 },
  { value: 'NG', weight: 0.01 },
];

const regionsByCountry: Record<string, { region: string; city: string }[]> = {
  US: [
    { region: 'CA', city: 'San Francisco' },
    { region: 'CA', city: 'Los Angeles' },
    { region: 'NY', city: 'New York' },
    { region: 'TX', city: 'Austin' },
    { region: 'TX', city: 'Houston' },
    { region: 'WA', city: 'Seattle' },
    { region: 'IL', city: 'Chicago' },
    { region: 'MA', city: 'Boston' },
    { region: 'CO', city: 'Denver' },
    { region: 'GA', city: 'Atlanta' },
    { region: 'FL', city: 'Miami' },
    { region: 'PA', city: 'Philadelphia' },
  ],
  GB: [
    { region: 'ENG', city: 'London' },
    { region: 'ENG', city: 'Manchester' },
    { region: 'ENG', city: 'Birmingham' },
    { region: 'SCT', city: 'Edinburgh' },
    { region: 'ENG', city: 'Bristol' },
  ],
  DE: [
    { region: 'BE', city: 'Berlin' },
    { region: 'BY', city: 'Munich' },
    { region: 'HH', city: 'Hamburg' },
    { region: 'HE', city: 'Frankfurt' },
    { region: 'NW', city: 'Cologne' },
  ],
  FR: [
    { region: 'IDF', city: 'Paris' },
    { region: 'ARA', city: 'Lyon' },
    { region: 'PAC', city: 'Marseille' },
    { region: 'OCC', city: 'Toulouse' },
  ],
  CA: [
    { region: 'ON', city: 'Toronto' },
    { region: 'BC', city: 'Vancouver' },
    { region: 'QC', city: 'Montreal' },
    { region: 'AB', city: 'Calgary' },
  ],
  AU: [
    { region: 'NSW', city: 'Sydney' },
    { region: 'VIC', city: 'Melbourne' },
    { region: 'QLD', city: 'Brisbane' },
    { region: 'WA', city: 'Perth' },
  ],
  IN: [
    { region: 'MH', city: 'Mumbai' },
    { region: 'KA', city: 'Bangalore' },
    { region: 'DL', city: 'New Delhi' },
    { region: 'TN', city: 'Chennai' },
    { region: 'TG', city: 'Hyderabad' },
  ],
  BR: [
    { region: 'SP', city: 'Sao Paulo' },
    { region: 'RJ', city: 'Rio de Janeiro' },
    { region: 'MG', city: 'Belo Horizonte' },
  ],
  JP: [
    { region: '13', city: 'Tokyo' },
    { region: '27', city: 'Osaka' },
    { region: '23', city: 'Nagoya' },
  ],
  NL: [
    { region: 'NH', city: 'Amsterdam' },
    { region: 'ZH', city: 'Rotterdam' },
    { region: 'ZH', city: 'The Hague' },
  ],
};

const defaultRegions = [{ region: '', city: '' }];

export function getRandomGeo(): GeoLocation {
  const country = weightedRandom(countryWeights);
  const regions = regionsByCountry[country] || defaultRegions;
  const { region, city } = pickRandom(regions);

  return { country, region, city };
}

const languages: WeightedOption<string>[] = [
  { value: 'en-US', weight: 0.4 },
  { value: 'en-GB', weight: 0.08 },
  { value: 'de-DE', weight: 0.06 },
  { value: 'fr-FR', weight: 0.05 },
  { value: 'es-ES', weight: 0.05 },
  { value: 'pt-BR', weight: 0.04 },
  { value: 'ja-JP', weight: 0.03 },
  { value: 'zh-CN', weight: 0.05 },
  { value: 'ko-KR', weight: 0.02 },
  { value: 'ru-RU', weight: 0.02 },
  { value: 'it-IT', weight: 0.02 },
  { value: 'nl-NL', weight: 0.02 },
  { value: 'pl-PL', weight: 0.02 },
  { value: 'hi-IN', weight: 0.04 },
  { value: 'ar-SA', weight: 0.02 },
  { value: 'tr-TR', weight: 0.02 },
  { value: 'vi-VN', weight: 0.01 },
  { value: 'th-TH', weight: 0.01 },
  { value: 'id-ID', weight: 0.02 },
  { value: 'sv-SE', weight: 0.01 },
  { value: 'da-DK', weight: 0.01 },
];

export function getRandomLanguage(): string {
  return weightedRandom(languages);
}
