"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, IndianRupee, TrendingDown, TrendingUp, Receipt, Wallet, Users2, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { KPICard } from "@/components/ui/KPICard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { FinanceChart } from "@/components/ui/FinanceChart";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AddExpenseModal } from "@/components/finance/AddExpenseModal";
import { PartnerTransactionModal } from "@/components/finance/PartnerTransactionModal";
import { formatCurrency, formatDate, vehicleName } from "@/lib/utils";
import { categoryLabel, paymentMethodLabel, PARTNER_TXN_TYPES } from "@/lib/constants";
import { toast } from "sonner";

export function FinancePageClient({ summary, expenses, payments, transactions, admins, vehicles }: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState(searchParams.get("tab") ?? "overview");
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [partnerOpen, setPartnerOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      setExpenseOpen(true);
      router.replace(`/finance?tab=${tab}`);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const partnerSummaries = useMemo(() => {
    return admins.map((admin: any) => {
      const txns = transactions.filter((t: any) => t.partnerId === admin.id);
      const sum = (type: string) => txns.filter((t: any) => t.type === type).reduce((s: number, t: any) => s + t.amount, 0);
      const initial = sum("INITIAL_INVESTMENT");
      const additional = sum("ADDITIONAL_INVESTMENT");
      const paidPersonally = sum("BUSINESS_EXPENSE_PAID_PERSONALLY");
      const withdrawals = sum("WITHDRAWAL");
      return {
        admin,
        initial,
        additional,
        paidPersonally,
        withdrawals,
        net: initial + additional + paidPersonally - withdrawals,
        txns,
      };
    });
  }, [admins, transactions]);

  async function handleDeleteExpense() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/expenses/${deleteId}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Could not delete expense.");
      } else {
        toast.success("Expense deleted.");
        router.refresh();
      }
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-page-title">Finance</h1>
          <p className="text-body mt-1.5">Revenue, expenses and profit across your business.</p>
        </div>
        <Button onClick={() => setExpenseOpen(true)}>
          <Plus className="size-4" /> Add Expense
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard label="Revenue (Month)" value={formatCurrency(summary.revenue)} icon={TrendingUp} tone="gold" />
        <KPICard label="Expenses (Month)" value={formatCurrency(summary.expenses)} icon={TrendingDown} tone="blue" />
        <KPICard label="Profit (Month)" value={formatCurrency(summary.profit)} icon={IndianRupee} tone="success" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="partners">Partner Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5">
          <Card padding="md">
            <CardHeader>
              <CardTitle>Business Performance</CardTitle>
            </CardHeader>
            <FinanceChart />
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="mt-5">
          {expenses.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No expenses recorded yet"
              action={
                <Button onClick={() => setExpenseOpen(true)}>
                  <Plus className="size-4" /> Add Expense
                </Button>
              }
            />
          ) : (
            <Table>
              <THead>
                <tr>
                  <TH>Date</TH>
                  <TH>Type</TH>
                  <TH>Category</TH>
                  <TH>Vehicle</TH>
                  <TH>Vendor</TH>
                  <TH>Method</TH>
                  <TH>Amount</TH>
                  <TH />
                </tr>
              </THead>
              <TBody>
                {expenses.map((e: any) => (
                  <TR key={e.id}>
                    <TD>{formatDate(e.date)}</TD>
                    <TD>{e.type === "CAR" ? "Car" : "Business"}</TD>
                    <TD>{categoryLabel(e.category)}</TD>
                    <TD>{e.vehicle ? vehicleName(e.vehicle) : "—"}</TD>
                    <TD>{e.vendor || "—"}</TD>
                    <TD>{paymentMethodLabel(e.paymentMethod)}</TD>
                    <TD className="text-ink-1 font-medium">{formatCurrency(e.amount)}</TD>
                    <TD>
                      <button onClick={() => setDeleteId(e.id)} aria-label="Delete expense" className="text-ink-4 hover:text-danger-400">
                        <Trash2 className="size-4" />
                      </button>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="payments" className="mt-5">
          {payments.length === 0 ? (
            <EmptyState icon={Wallet} title="No payments recorded yet" />
          ) : (
            <Table>
              <THead>
                <tr>
                  <TH>Date</TH>
                  <TH>Booking</TH>
                  <TH>Customer</TH>
                  <TH>Amount</TH>
                  <TH>Method</TH>
                </tr>
              </THead>
              <TBody>
                {payments.map((p: any) => (
                  <TR key={p.id}>
                    <TD>{formatDate(p.date)}</TD>
                    <TD>{p.booking.code}</TD>
                    <TD>{p.booking.customer.fullName}</TD>
                    <TD className="text-ink-1 font-medium">{formatCurrency(p.amount)}</TD>
                    <TD>{paymentMethodLabel(p.method)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="partners" className="mt-5 space-y-6">
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setPartnerOpen(true)}>
              <Plus className="size-4" /> Add Transaction
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {partnerSummaries.map(({ admin, initial, additional, paidPersonally, withdrawals, net }: any) => (
              <Card key={admin.id} padding="md">
                <CardHeader>
                  <div className="flex items-center gap-2.5">
                    <Users2 className="size-4 text-gold-400" />
                    <CardTitle>{admin.name}</CardTitle>
                  </div>
                </CardHeader>
                <div className="grid grid-cols-2 gap-y-4">
                  <MiniStat label="Initial Investment" value={formatCurrency(initial)} />
                  <MiniStat label="Additional Investment" value={formatCurrency(additional)} />
                  <MiniStat label="Business Expenses Paid" value={formatCurrency(paidPersonally)} />
                  <MiniStat label="Withdrawals" value={formatCurrency(withdrawals)} />
                </div>
                <div className="mt-4 pt-4 border-t border-border-subtle flex items-center justify-between">
                  <span className="text-meta">Net Contribution</span>
                  <span className="text-figure text-[18px] font-semibold text-success-400">{formatCurrency(net)}</span>
                </div>
              </Card>
            ))}
          </div>

          {transactions.length === 0 ? (
            <EmptyState icon={Users2} title="No partner transactions yet" />
          ) : (
            <Table>
              <THead>
                <tr>
                  <TH>Date</TH>
                  <TH>Partner</TH>
                  <TH>Type</TH>
                  <TH>Amount</TH>
                  <TH>Notes</TH>
                </tr>
              </THead>
              <TBody>
                {transactions.map((t: any) => (
                  <TR key={t.id}>
                    <TD>{formatDate(t.date)}</TD>
                    <TD>{t.partner.name}</TD>
                    <TD>{PARTNER_TXN_TYPES.find((p) => p.value === t.type)?.label ?? t.type}</TD>
                    <TD className="text-ink-1 font-medium">{formatCurrency(t.amount)}</TD>
                    <TD className="max-w-xs truncate">{t.notes || "—"}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>

      <AddExpenseModal open={expenseOpen} onOpenChange={setExpenseOpen} vehicles={vehicles} />
      <PartnerTransactionModal open={partnerOpen} onOpenChange={setPartnerOpen} admins={admins} />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Delete expense"
        description="This expense will be permanently removed and financial totals will be recalculated. This cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDeleteExpense}
      />
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-meta mb-1">{label}</p>
      <p className="text-[14px] font-medium text-ink-1">{value}</p>
    </div>
  );
}
