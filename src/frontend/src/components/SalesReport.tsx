import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAllSales } from "../hooks/useQueries";

export default function SalesReport() {
  const { data: sales = [], isLoading } = useAllSales();

  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);

  const byDay: Record<string, number> = {};
  for (const s of sales) {
    const d = new Date(Number(s.timestamp) / 1_000_000);
    const key = d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
    byDay[key] = (byDay[key] ?? 0) + s.totalAmount;
  }
  const chartData = Object.entries(byDay)
    .slice(-7)
    .map(([date, amount]) => ({ date, amount }));

  const sorted = [...sales].sort(
    (a, b) => Number(b.timestamp) - Number(a.timestamp),
  );

  return (
    <div className="space-y-6" data-ocid="reports.section">
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-0 shadow-xs bg-kpi-teal">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">
                Total Revenue
              </span>
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">
              ₹{totalRevenue.toFixed(0)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-xs bg-kpi-mint">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">
                Total Transactions
              </span>
              <ShoppingCart className="w-4 h-4 text-emerald-700" />
            </div>
            <p className="text-2xl font-bold text-emerald-700">
              {sales.length}
            </p>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card className="border-0 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Daily Sales (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.9 0.01 80)"
                />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v: number) => [`₹${v.toFixed(0)}`, "Sales"]}
                />
                <Bar
                  dataKey="amount"
                  fill="oklch(0.45 0.085 180)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2" data-ocid="reports.loading_state">
              {[1, 2, 3].map((n) => (
                <Skeleton key={n} className="h-12" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="reports.empty_state"
            >
              <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No sales recorded yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sorted.map((sale, i) => (
                <div
                  key={sale.id.toString()}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                  data-ocid={`reports.item.${i + 1}`}
                >
                  <div>
                    <p className="text-sm font-medium">
                      Sale #{sale.id.toString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(
                        Number(sale.timestamp) / 1_000_000,
                      ).toLocaleString("en-IN")}
                      {" · "}
                      {sale.items.length} item(s)
                    </p>
                  </div>
                  <Badge
                    className="bg-kpi-mint text-emerald-800 border-emerald-200"
                    variant="outline"
                  >
                    ₹{sale.totalAmount.toFixed(0)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
