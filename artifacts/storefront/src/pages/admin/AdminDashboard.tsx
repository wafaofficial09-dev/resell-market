import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetOrderStats, useListOrders } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Package, TrendingUp, Clock, CheckCircle, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";

const STATUS_COLORS: Record<string, string> = {
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
  shipped: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  processing: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  packed: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
};

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetOrderStats();
  const { data: recentOrders, isLoading: ordersLoading } = useListOrders();

  const statCards = [
    {
      title: "Total Orders",
      value: stats?.total,
      icon: Package,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      suffix: "",
    },
    {
      title: "Total Revenue",
      value: stats?.totalRevenue,
      icon: TrendingUp,
      iconBg: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-600",
      prefix: "₹",
    },
    {
      title: "Pending",
      value: stats?.pending,
      icon: Clock,
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600",
    },
    {
      title: "Delivered",
      value: stats?.delivered,
      icon: CheckCircle,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-600",
    },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back — here's what's happening</p>
        </div>
        <Button asChild className="rounded-full" variant="outline">
          <Link href="/admin/orders">View All Orders <ArrowUpRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {statCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="glass-card border-white/30 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/3 pointer-events-none" />
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-2xl ${card.iconBg}`}>
                    <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                </div>
                {statsLoading ? (
                  <Skeleton className="h-9 w-24 mb-1" />
                ) : (
                  <div className="text-3xl font-display font-bold mb-1">
                    {card.prefix}{card.value !== undefined ? card.value : 0}
                  </div>
                )}
                <p className="text-sm text-muted-foreground font-medium">{card.title}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <Card className="glass-card border-white/30 shadow-xl shadow-primary/5">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg font-display">Recent Orders</CardTitle>
          <Button asChild variant="ghost" size="sm" className="text-primary">
            <Link href="/admin/orders">View all <ArrowUpRight className="ml-1 h-3.5 w-3.5" /></Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {ordersLoading ? (
            <div className="p-6 space-y-3">
              {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase">
                  <tr className="border-b border-border/50 bg-muted/20">
                    <th className="px-6 py-3 font-semibold">Order ID</th>
                    <th className="px-6 py-3 font-semibold">Customer</th>
                    <th className="px-6 py-3 font-semibold">Date</th>
                    <th className="px-6 py-3 font-semibold">Amount</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {recentOrders?.slice(0, 6).map((order) => (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-primary/80">{order.orderId}</td>
                      <td className="px-6 py-4 font-medium">{order.customerName}</td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4 font-bold">₹{order.total}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentOrders?.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                        <Package className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                        No orders yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
