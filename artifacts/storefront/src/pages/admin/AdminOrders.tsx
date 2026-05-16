import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListOrders, useUpdateOrderStatus, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const STATUSES = ['pending', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { data: orders, isLoading } = useListOrders({ 
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined
  });
  
  const queryClient = useQueryClient();
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = (orderId: number, newStatus: string) => {
    updateStatus.mutate({ id: orderId, data: { status: newStatus } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
        toast.success(`Order status updated to ${newStatus}`);
      }
    });
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-display font-bold">Orders</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by ID or customer..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUSES.map(s => (
                <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4">Order Details</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-10 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-10 w-40" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-10 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-10 w-16" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-10 w-32 ml-auto" /></td>
                    </tr>
                  ))
                ) : orders?.map((order) => (
                  <tr key={order.id} className="bg-background hover:bg-muted/10">
                    <td className="px-6 py-4">
                      <div className="font-mono font-medium">{order.orderId}</div>
                      <div className="text-xs text-muted-foreground mt-1">{new Date(order.createdAt).toLocaleString()}</div>
                      <Badge variant="outline" className="mt-2 text-[10px] uppercase tracking-wider">{order.paymentMethod}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-muted-foreground">{order.phone}</div>
                      <div className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">{order.address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex gap-2 text-xs">
                            <span className="font-medium">{item.quantity}x</span>
                            <span className="truncate max-w-[150px]">{item.productName}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-lg">
                      ₹{order.total}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Select 
                        value={order.status} 
                        onValueChange={(val) => handleStatusChange(order.id, val)}
                      >
                        <SelectTrigger className={`w-[140px] ml-auto h-9 font-medium capitalize ${
                          order.status === 'delivered' ? 'border-green-200 bg-green-50 text-green-700' :
                          order.status === 'cancelled' ? 'border-red-200 bg-red-50 text-red-700' :
                          'border-yellow-200 bg-yellow-50 text-yellow-700'
                        }`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map(s => (
                            <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
                {orders?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No orders found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
