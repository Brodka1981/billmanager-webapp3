import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdminService } from '../../services/admin.service';
import { Bill, BillService, Property } from '../../services/bill.service';
import { AuthService } from '../../services/auth.service';
import { ErrorHandlerService } from '../../shared/error-handler.service';
import { BILL_TYPE_LABELS, DEFAULT_BILL_TYPES_BY_ASSET } from '../../shared/bill-type-labels';
import { AssetType } from '../../shared/asset-types';

type ChartView = 'grouped' | 'stacked';

interface MonthlyStatistics {
  monthIndex: number;
  totals: Partial<Record<string, number>>;
  total: number;
}

@Component({
  selector: 'app-annual-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './annual-statistics.component.html',
  styleUrl: './annual-statistics.component.css'
})
export class AnnualStatisticsComponent implements OnInit, OnDestroy {
  propertyId!: number;
  property?: Property;
  propertyAssetType: AssetType = 'RealEstate';

  readonly billTypeLabels: Record<string, string> = BILL_TYPE_LABELS;

  availableYears: number[] = [];
  selectedYear!: number;

  billTypesForYear: string[] = [];
  monthlyStatistics: MonthlyStatistics[] = [];
  totalByType: Record<string, number> = {};
  maxAmountForChart = 0;
  maxStackedAmount = 0;
  private readonly chartHeightPx = 420;
  hasDataForYear = false;

  isLoading = false;

  chartView: ChartView = 'stacked';

  private routeSubscription?: Subscription;

  private readonly monthLabels = [
    'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu',
    'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'
  ];

  private readonly billTypeColors: Record<string, string> = {
    Luce: '#feee0fff',
    Gas: '#fa5252',
    Acqua: '#228be6',
    Tari: '#37b24d',
    Bonifica: '#c17d44',
    SpeseCondominiali: '#845ef7',
    Bollo: '#3b5bdb',
    Assicurazione: '#339af0',
    Revisione: '#40c057',
    Tagliando: '#fab005'
  };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly billService: BillService,
    private readonly adminService: AdminService,
    private readonly authService: AuthService,
    private readonly errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.initAvailableYears();
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const id = params.get('propertyId');
      if (!id) {
        return;
      }
      this.propertyId = +id;
      this.loadProperty();
      if (!this.selectedYear) {
        this.selectedYear = this.availableYears[0];
      }
      this.loadStatisticsForYear(this.selectedYear);
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  get monthNames(): string[] {
    return this.monthLabels;
  }

  get isVehicleProperty(): boolean {
    return this.propertyAssetType === 'Vehicle';
  }

  get billPluralLabel(): string {
    return this.isVehicleProperty ? 'Spese' : 'Bollette';
  }

  onYearChange(): void {
    if (!this.propertyId) {
      return;
    }
    this.loadStatisticsForYear(this.selectedYear);
  }

  setChartView(view: ChartView): void {
    this.chartView = view;
  }

  getColorForType(type: string): string {
    return this.billTypeColors[type] ?? '#495057';
  }

  getBarHeight(amount: number): number {
    if (!this.maxAmountForChart) {
      return 0;
    }
    return Math.round((amount / this.maxAmountForChart) * this.chartHeightPx);
  }

  getStackedSegmentHeight(month: MonthlyStatistics, type: string): number {
    if (!this.maxStackedAmount) {
      return 0;
    }
    const amount = Number(month.totals[type] ?? 0);
    if (!amount) {
      return 0;
    }
    return Math.round((amount / this.maxStackedAmount) * this.chartHeightPx);
  }

  getFormattedAmount(amount: number | undefined): string {
    const safeAmount = Number(amount ?? 0);
    return safeAmount.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  private initAvailableYears(): void {
    const currentYear = new Date().getFullYear();
    this.availableYears = Array.from({ length: 6 }, (_, index) => currentYear - index);
    this.selectedYear = currentYear;
  }

  private loadProperty(): void {
    const token = this.authService.getToken();
    if (!token) {
      return;
    }

    this.adminService.getPropertyById(token, this.propertyId).subscribe({
      next: (property) => {
        this.property = property;
        this.propertyAssetType = property.assetType ?? 'RealEstate';
      },
      error: (error) => this.errorHandler.handleHttpError(error)
    });
  }

  private loadStatisticsForYear(year: number): void {
    if (!this.propertyId) {
      return;
    }

    this.billTypesForYear = [];
    this.monthlyStatistics = [];
    this.totalByType = {};
    this.maxAmountForChart = 0;
    this.maxStackedAmount = 0;
    this.hasDataForYear = false;
    this.isLoading = true;
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    this.billService.getBillsByFilters(this.propertyId, { startDate, endDate }).subscribe({
      next: (bills) => {
        this.processBillsForStatistics(bills ?? [], year);
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorHandler.handleHttpError(error);
      }
    });
  }

  private processBillsForStatistics(bills: Bill[], year: number): void {
    const monthlyTotals: MonthlyStatistics[] = Array.from({ length: 12 }, (_, index) => ({
      monthIndex: index,
      totals: {},
      total: 0
    }));

    const totalsByType: Record<string, number> = {};
    const encounteredTypes = new Set<string>();

    bills.forEach((bill) => {
      const dueDate = new Date(bill.dueDate);
      if (Number.isNaN(dueDate.getTime())) {
        return;
      }

      const billYear = dueDate.getFullYear();
      if (billYear !== year) {
        return;
      }

      const monthIndex = dueDate.getMonth();
      const amount = Number(bill.amount);
      if (Number.isNaN(amount)) {
        return;
      }

      const currentAmount = monthlyTotals[monthIndex].totals[bill.type] ?? 0;
      monthlyTotals[monthIndex].totals[bill.type] = currentAmount + amount;
      monthlyTotals[monthIndex].total += amount;

      totalsByType[bill.type] = (totalsByType[bill.type] ?? 0) + amount;
      encounteredTypes.add(bill.type);
    });

    const { grouped, stacked } = this.calculateMaxAmounts(monthlyTotals);
    this.maxAmountForChart = grouped;
    this.maxStackedAmount = stacked;
    this.hasDataForYear = Math.max(grouped, stacked) > 0;

    if (!this.hasDataForYear && encounteredTypes.size === 0 && this.propertyAssetType) {
      const fallbackTypes = DEFAULT_BILL_TYPES_BY_ASSET[this.propertyAssetType] ?? [];
      fallbackTypes.forEach((type) => encounteredTypes.add(type));
    }

    this.billTypesForYear = Array.from(encounteredTypes).sort();
    this.monthlyStatistics = monthlyTotals;
    this.totalByType = totalsByType;
  }

private calculateMaxAmounts(monthlyTotals: MonthlyStatistics[]): { grouped: number; stacked: number } {
    let maxSingleValue = 0;
    let maxStackedValue = 0;

    monthlyTotals.forEach((month) => {
      let monthTotal = 0;
      Object.values(month.totals).forEach((value) => {
        const amount = value ?? 0;
        if (amount > maxSingleValue) {
          maxSingleValue = amount;
        }
        monthTotal += amount;
      });
      if (monthTotal > maxStackedValue) {
        maxStackedValue = monthTotal;
      }
    });
    return { grouped: maxSingleValue, stacked: maxStackedValue };
  }

  getMonthTotal(month: MonthlyStatistics): string {
    return this.getFormattedAmount(month.total);
  }
}
