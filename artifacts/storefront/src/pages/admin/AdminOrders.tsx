import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListOrders, useUpdateOrderStatus, getListOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, Package, Phone, MapPin, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

const STATUSES = ["pending", "processing", "packed", "shipped", "delivered", "cancelled"];

const STATUS_STYLES: Record<string, string> = {
  delivered: "border-green-200 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  cancelled: "border-red-200 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
  shipped: "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  processing: "border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
  pending: "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  packed: "border-cyan-200 bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800",
};

export default function AdminOrders() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: orders, isLoading } = useListOrders({
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const queryClient = useQueryClient();
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = (orderId: number, newStatus: string) => {
    updateStatus.mutate({ id: orderId, data: { status: newStatus } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
        toast.success(`Order updated to ${newStatus}`);
      },
    });
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {orders ? `${orders.length} order${orders.length !== 1 ? "s" : ""}` : "Loading orders…"}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ID or customer…"
              className="pl-9 h-11 rounded-xl"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44 h-11 rounded-xl">
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

      {/* Desktop table */}
      <Card className="glass-card border-white/30 shadow-xl shadow-primary/5 hidden md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20 text-xs text-muted-foreground uppercase">
                  <th className="px-6 py-3.5 font-semibold">Order Details</th>
                  <th className="px-6 py-3.5 font-semibold">Customer</th>
                  <th className="px-6 py-3.5 font-semibold">Items</th>
                  <th className="px-6 py-3.5 font-semibold">Total</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {isLoading ? (
                  Array(6).fill(0).map((_, i) => (
                    <tr key={i}>
                      {Array(5).fill(0).map((_, j) => (
                        <td key={j} className="px-6 py-4"><Skeleton className="h-9 w-full rounded-lg" /></td>
                      ))}
                    </tr>
                  ))
                ) : orders?.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs font-bold text-primary/80">{order.orderId}</div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(order.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <span className={`mt-1.5 inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold border uppercase tracking-wider ${order.paymentMethod === "cod" ? "border-orange-200 bg-orange-50 text-orange-700" : "border-blue-200 bg-blue-50 text-blue-700"}`}>
                        {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold">{order.customerName}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3" />{order.phone}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-start gap-1 mt-0.5 max-w-[180px]">
                        <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
                        <span className="truncate">{order.address?.split("\n")[0]}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {order.items.slice(0, 3).map((item, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs">
                            {item.productImage && (
                              <img src={item.productImage} alt="" className="w-6 h-6 rounded object-cover flex-shrink-0" />
                            )}
                            <span className="font-medium">{item.quantity}×</span>
                            <span className="truncate max-w-[120px] text-muted-foreground">{item.productName}</span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <p className="text-xs text-muted-foreground">+{order.items.length - 3} more</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-lg">₹{order.total}</td>
                    <td className="px-6 py-4 text-right">
                      <Select value={order.status} onValueChange={val => handleStatusChange(order.id, val)}>
                        <SelectTrigger className={`w-[148px] ml-auto h-9 font-semibold capitalize text-xs rounded-xl border-2 ${STATUS_STYLES[order.status] || STATUS_STYLES.pending}`}>
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
                {!isLoading && orders?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <Package className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
                      <p className="text-muted-foreground">No orders match your filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile card list */}
      <div className="space-y-4 md:hidden">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)
        ) : orders?.map((order, idx) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="glass-card border-white/30 overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-mono text-xs font-bold text-primary/80">{order.orderId}</p>
                    <p className="font-semibold text-base mt-0.5">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{order.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">₹{order.total}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  {order.items.slice(0, 2).map((item, i) => (
                    <p key={i}>{item.quantity}× {item.productName}</p>
                  ))}
                  {order.items.length > 2 && <p>+{order.items.length - 2} more items</p>}
                </div>
                <Select value={order.status} onValueChange={val => handleStatusChange(order.id, val)}>
                  <SelectTrigger className={`w-full h-10 font-semibold capitalize text-xs rounded-xl border-2 ${STATUS_STYLES[order.status] || STATUS_STYLES.pending}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map(s => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {!isLoading && orders?.length === 0 && (
          <div className="py-16 text-center bg-muted/20 rounded-2xl border border-dashed">
            <Package className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground">No orders match your filters</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
