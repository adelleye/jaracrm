"use client";

import { Calculator } from "lucide-react";
import { computeSalesMetrics, formatNaira } from "@/lib/crm";
import { useCrm } from "@/lib/store";
import { Card } from "@/components/ui";

export function NumbersView() {
  const { leads, interactions, costPeriod } = useCrm();
  const metrics = computeSalesMetrics(leads, interactions, costPeriod);

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="flex items-baseline justify-between border-b border-line pb-2">
        <span className="label">Commercial ledger</span>
        <span className="mono text-[10px] tracking-[0.05em] text-[#b8ab8c]">{costPeriod.label.toUpperCase()}</span>
      </div>
      <div className="mt-5">
        <h1 className="display-title text-ink">Numbers.</h1>
        <p className="mt-5 max-w-2xl font-medium leading-7 text-[#3d2f1b]">
          A simple read on whether the team is speaking to enough people, winning enough deals, and recovering sales cost fast enough.
        </p>
      </div>

      <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="People spoken to" value={metrics.peopleSpokenTo.toString()} />
        <Metric label="Deals won" value={metrics.dealsWon.toString()} />
        <Metric label="Revenue won" value={formatNaira(metrics.revenueWon)} />
        <Metric label="Conversion rate" value={`${Math.round(metrics.conversionRate * 100)}%`} />
        <Metric label="Pipeline required" value={Math.ceil(metrics.pipelineRequired).toString()} helper="Target customers / conversion rate" />
        <Metric label="CAC" value={formatNaira(metrics.cac)} helper="Sales and marketing cost / deals won" />
        <Metric label="CAC payback" value={`${metrics.cacPaybackMonths.toFixed(1)} months`} helper="CAC / monthly gross profit" />
        <Metric label="Target customers" value={costPeriod.targetCustomers.toString()} helper={costPeriod.label} />
      </div>

      <Card className="mt-8 p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 place-items-center border border-line bg-[#f8f2e2] text-palm">
            <Calculator className="h-5 w-5" />
          </span>
          <div>
            <h2 className="serif text-3xl italic text-ink">Assumptions</h2>
            <p className="mt-2 text-sm leading-6 text-[#3d2f1b]">
              Sales cost is {formatNaira(costPeriod.salesCost)}, marketing cost is {formatNaira(costPeriod.marketingCost)}, and average monthly gross profit per customer is{" "}
              {formatNaira(costPeriod.averageMonthlyGrossProfitPerCustomer)}.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Metric({
  label,
  value,
  helper
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <Card className="p-5">
      <p className="label">{label}</p>
      <p className="mono mt-4 break-words text-3xl font-medium tracking-[-0.05em] text-ink">{value}</p>
      {helper && <p className="mt-3 text-xs leading-5 text-[#8a7b5e]">{helper}</p>}
    </Card>
  );
}
