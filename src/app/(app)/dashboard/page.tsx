import { Car, CheckCircle2, Clock, CircleDot, IndianRupee, TrendingUp } from "lucide-react";
import { getDashboardData } from "@/lib/services/dashboard";
import { KPICard } from "@/components/ui/KPICard";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { VehicleCard } from "@/components/ui/VehicleCard";
import { FinanceChart } from "@/components/ui/FinanceChart";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { TodaySchedule } from "@/components/dashboard/TodaySchedule";
import { PaymentPendingCard } from "@/components/dashboard/PaymentPendingCard";
import { ServiceDueCard } from "@/components/dashboard/ServiceDueCard";
import { formatCurrency } from "@/lib/utils";
import { getCurrentAdmin } from "@/lib/auth";

function getGreeting() {
  const hour = new Intl.DateTimeFormat("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }).format(
    new Date()
  );
  const h = Number(hour);
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const [data, admin] = await Promise.all([getDashboardData(), getCurrentAdmin()]);
  const { kpis, vehiclePerf, schedule, paymentPending, serviceDue } = data;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-secondary mb-1">
            {getGreeting()}, {admin?.name?.split(" ")[0]}
          </p>
          <h1 className="text-page-title">KAR GO RENTALS</h1>
          <p className="text-body mt-1.5">Your fleet and business at a glance.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <KPICard label="Total Cars" value={String(kpis.totalCars)} icon={Car} tone="neutral" />
        <KPICard label="Available" value={String(kpis.available)} icon={CheckCircle2} tone="success" />
        <KPICard label="Booked" value={String(kpis.booked)} icon={Clock} tone="gold" />
        <KPICard label="Active" value={String(kpis.active)} icon={CircleDot} tone="blue" />
        <KPICard label="Today's Revenue" value={formatCurrency(kpis.todayRevenue)} icon={IndianRupee} tone="gold" />
        <KPICard label="This Month's Profit" value={formatCurrency(kpis.monthProfit)} icon={TrendingUp} tone="success" />
      </div>

      <DashboardHero items={vehiclePerf} />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-section-title">Fleet Status</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {vehiclePerf.map((item) => (
            <VehicleCard
              key={item.vehicle.id}
              vehicle={item.vehicle}
              revenue={item.revenue}
              expenses={item.expenses}
              profit={item.profit}
              nextBooking={item.nextBooking}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PaymentPendingCard items={paymentPending} />
        <ServiceDueCard items={serviceDue} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodaySchedule items={schedule} />
        <Card padding="md">
          <CardHeader>
            <CardTitle>Business Performance</CardTitle>
          </CardHeader>
          <FinanceChart />
        </Card>
      </div>
    </div>
  );
}
