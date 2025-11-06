import { AssetType } from "./asset-types";

export const BILL_TYPE_LABELS: Record<string, string> = {
  Luce: 'Luce',
  Gas: 'Gas',
  Acqua: 'Acqua',
  Tari: 'Tari',
  Bonifica: 'Bonifica',
  SpeseCondominiali: 'Spese Condominiali',
  Bollo: 'Bollo',
  Assicurazione: 'Assicurazione',
  Revisione: 'Revisione',
  Tagliando: 'Tagliando'
};

export const DEFAULT_BILL_TYPES_BY_ASSET: Record<AssetType, string[]> = {
  RealEstate: ['Luce', 'Gas', 'Acqua', 'Tari', 'Bonifica', 'SpeseCondominiali'],
  Vehicle: ['Bollo', 'Assicurazione', 'Revisione', 'Tagliando']
};

export const BILL_TYPES: string[] = Array.from(
  new Set(Object.values(DEFAULT_BILL_TYPES_BY_ASSET).flat())
);
