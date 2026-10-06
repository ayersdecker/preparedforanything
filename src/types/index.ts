export interface RiskItem {
  type: string;
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  description: string;
  seasonalMonths: number[];
  icon: string;
}
