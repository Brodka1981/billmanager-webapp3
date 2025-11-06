export type AssetType = 'RealEstate' | 'Vehicle';

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  RealEstate: 'Immobile',
  Vehicle: 'Veicolo'
};

export const ASSET_TYPE_OPTIONS: AssetType[] = ['RealEstate', 'Vehicle'];
