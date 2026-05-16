import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetOrderStats, useListOrders } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetOrderStats();
  const { data: recentOrders, isLoading: ordersLoading } = useListOrders();

  return (
    <AdminLayout>
      <h1 className="text-3xl font-display font-bold mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          title="Total Orders" 
          value={stats?.total} 
          icon={<Package className="h-6 w-6 text-primary" />} 
          loading={statsLoading}
        />
        <StatCard 
          title="Revenue" 
          value={stats?.totalRevenue !== undefined ? `₹${stats.totalRevenue}` : undefined} 
          icon={<TrendingUp className="h-6 w-6 text-green-500" />} 
          loading={statsLoading}
        />
        <StatCard 
          title="Pending" 
          value={stats?.pending} 
          icon={<Clock className="h-6 w-6 text-yellow-500" />} 
          loading={statsLoading}
        />
        <StatCard 
          title="Delivered" 
          value={stats?.delivered} 
          icon={<CheckCircle className="h-6 w-6 text-blue-500" />} 
          loading={statsLoading}
        />
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                  <tr>
                    <th className="px-6 py-3">Order ID</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentOrders?.slice(0, 5).map((order) => (
                    <tr key={order.id} className="bg-background hover:bg-muted/20">
                      <td className="px-6 py-4 font-mono font-medium">{order.orderId}</td>
                      <td className="px-6 py-4">{order.customerName}</td>
                      <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-medium">₹{order.total}</td>
                      <td className="px-6 py-4">
                        <Badge variant={
                          order.status === 'delivered' ? 'default' : 
                          order.status === 'cancelled' ? 'destructive' : 'secondary'
                        }>
                          {order.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {recentOrders?.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        No orders found
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

function StatCard({ title, value, icon, loading }: { title: string, value?: number | string, icon: React.ReactNode, loading: boolean }) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <h3 className="text-3xl font-display font-bold">{value !== undefined ? value : 0}</h3>
          )}
        </div>
        <div className="p-4 bg-muted/50 rounded-2xl">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
