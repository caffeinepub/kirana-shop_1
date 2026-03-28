import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Archive,
  BarChart2,
  IndianRupee,
  Package,
  Plus,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboardStats } from "../hooks/useQueries";

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

const sampleChartData = [
  { day: "Mon", sales: 1200 },
  { day: "Tue", sales: 1900 },
  { day: "Wed", sales: 1500 },
  { day: "Thu", sales: 2200 },
  { day: "Fri", sales: 2800 },
  { day: "Sat", sales: 3400 },
  { day: "Sun", sales: 2100 },
];

const KPI_CARDS = [
  {
    key: "products",
    title: "Total Products",
    bg: "bg-kpi-teal",
    textColor: "text-primary",
    icon: Package,
  },
  {
    key: "sales",
    title: "Today's Sales",
    bg: "bg-kpi-mint",
    textColor: "text-emerald-700",
    icon: TrendingUp,
  },
  {
    key: "lowstock",
    title: "Low Stock Alerts",
    bg: "bg-kpi-peach",
    textColor: "text-orange-700",
    icon: AlertTriangle,
  },
  {
    key: "count",
    title: "Total Sales Count",
    bg: "bg-kpi-pink",
    textColor: "text-rose-700",
    icon: IndianRupee,
  },
];

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { data: stats, isLoading } = useDashboardStats();

  const kpiValues: Record<string, string> = {
    products: stats ? stats.totalProducts.toString() : "0",
    sales: stats ? `₹${stats.totalSalesAmount.toFixed(0)}` : "₹0",
    lowstock: stats ? stats.lowStockCount.toString() : "0",
    count: stats ? stats.totalSalesCount.toString() : "0",
  };

  const recentSales = stats?.recentSales ?? [];

  return (
    <div className="space-y-6" data-ocid="dashboard.section">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((kpi) => (
          <Card key={kpi.key} className={`${kpi.bg} border-0 shadow-xs`}>
            <CardContent className="p-4">
              {isLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {kpi.title}
                    </span>
                    <kpi.icon className={`w-4 h-4 ${kpi.textColor}`} />
                  </div>
                  <p className={`text-2xl font-bold ${kpi.textColor}`}>
                    {kpiValues[kpi.key]}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              className="h-16 flex flex-col gap-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              data-ocid="dashboard.billing.button"
              onClick={() => onNavigate("billing")}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-xs">New Sale</span>
            </Button>
            <Button
              className="h-16 flex flex-col gap-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              data-ocid="dashboard.add_product.button"
              onClick={() => onNavigate("inventory")}
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs">Add Product</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex flex-col gap-1 border-border hover:bg-accent"
              data-ocid="dashboard.inventory.button"
              onClick={() => onNavigate("inventory")}
            >
              <Archive className="w-5 h-5 text-primary" />
              <span className="text-xs">View Inventory</span>
            </Button>
            <Button
              variant="outline"
              className="h-16 flex flex-col gap-1 border-border hover:bg-accent"
              data-ocid="dashboard.reports.button"
              onClick={() => onNavigate("reports")}
            >
              <BarChart2 className="w-5 h-5 text-primary" />
              <span className="text-xs">Sales Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts + Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-0 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Sales This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={sampleChartData}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="oklch(0.45 0.085 180)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="oklch(0.45 0.085 180)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.9 0.01 80)"
                />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [`₹${v}`, "Sales"]} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="oklch(0.45 0.085 180)"
                  fill="url(#salesGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((n) => (
                  <Skeleton key={n} className="h-10 w-full" />
                ))}
              </div>
            ) : recentSales.length === 0 ? (
              <div
                className="text-center py-8 text-muted-foreground"
                data-ocid="dashboard.sales.empty_state"
              >
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No sales yet. Create your first sale!</p>
              </div>
            ) : (
              <div className="space-y-2" data-ocid="dashboard.sales.list">
                {recentSales.slice(0, 5).map((sale, i) => (
                  <div
                    key={sale.id.toString()}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                    data-ocid={`dashboard.sales.item.${i + 1}`}
                  >
                    <div>
                      <p className="text-sm font-medium">
                        Sale #{sale.id.toString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sale.items.length} item(s)
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-kpi-mint text-emerald-800"
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
    </div>
  );
}
