import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  Handshake, 
  TrendingUp, 
  DollarSign,
  Building2,
  MessageCircle,
  ClipboardList
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KpiCard } from "@/components/kpi-card";
import { ActivityItem } from "@/components/activity-item";
import { PropertyCard } from "@/components/property-card";
import { KpiCardSkeleton, ActivitySkeleton, PropertyCardSkeleton } from "@/components/loading-skeleton";
import { useI18n } from "@/lib/i18n";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from "recharts";
import type { Lead, Property, Deal, Activity } from "@shared/schema";

interface DashboardStats {
  totalLeads: number;
  leadChange: number;
  activeDeals: number;
  dealChange: number;
  conversionRate: number;
  conversionChange: number;
  revenue: number;
  revenueChange: number;
  pendingOffers: number;
  offersChange: number;
}

interface LeadsBySource {
  source: string;
  count: number;
}

interface DealsByStage {
  stage: string;
  count: number;
  value: number;
}

const CHART_COLORS = [
  "hsl(210, 85%, 45%)",
  "hsl(25, 90%, 50%)",
  "hsl(150, 60%, 45%)",
  "hsl(280, 65%, 50%)",
  "hsl(340, 75%, 50%)",
  "hsl(45, 90%, 50%)",
  "hsl(190, 80%, 45%)",
];

export default function Dashboard() {
  const { t } = useI18n();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const { data: properties, isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const { data: leadsBySource, isLoading: sourcesLoading } = useQuery<LeadsBySource[]>({
    queryKey: ["/api/dashboard/leads-by-source"],
  });

  const { data: dealsByStage, isLoading: stagesLoading } = useQuery<DealsByStage[]>({
    queryKey: ["/api/dashboard/deals-by-stage"],
  });

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold font-heading">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("dashboard.welcome")}</p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
        {statsLoading ? (
          <>
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </>
        ) : (
          <>
            <KpiCard
              title={t("dashboard.totalLeads")}
              value={stats?.totalLeads || 0}
              change={stats?.leadChange}
              changeLabel="vs last month"
              icon={Users}
              testId="kpi-total-leads"
            />
            <KpiCard
              title={t("dashboard.activeDeals")}
              value={stats?.activeDeals || 0}
              change={stats?.dealChange}
              changeLabel="vs last month"
              icon={Handshake}
              testId="kpi-active-deals"
            />
            <KpiCard
              title={t("dashboard.pendingOffers")}
              value={stats?.pendingOffers || 0}
              change={stats?.offersChange}
              changeLabel="of total offers"
              icon={ClipboardList}
              testId="kpi-pending-offers"
            />
            <KpiCard
              title={t("dashboard.conversionRate")}
              value={`${stats?.conversionRate || 0}%`}
              change={stats?.conversionChange}
              changeLabel="vs last month"
              icon={TrendingUp}
              testId="kpi-conversion-rate"
            />
            <KpiCard
              title={t("dashboard.revenue")}
              value={`SAR ${formatCurrency(stats?.revenue || 0)}`}
              change={stats?.revenueChange}
              changeLabel="vs last month"
              icon={DollarSign}
              testId="kpi-revenue"
            />
          </>
        )}
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-base font-semibold font-heading">
              {t("dashboard.dealsPipeline")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stagesLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : dealsByStage && dealsByStage.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dealsByStage} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="stage" 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                    formatter={(value: number) => [`AED ${formatCurrency(value)}`, "Value"]}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No deal data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-base font-semibold font-heading">
              {t("dashboard.leadsBySource")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sourcesLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : leadsBySource && leadsBySource.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={leadsBySource}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="source"
                  >
                    {leadsBySource.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={CHART_COLORS[index % CHART_COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs text-foreground capitalize">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No lead data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-base font-semibold font-heading">
              {t("dashboard.recentActivity")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {activitiesLoading ? (
                <div className="space-y-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ActivitySkeleton key={i} />
                  ))}
                </div>
              ) : activities && activities.length > 0 ? (
                <div className="divide-y">
                  {activities.slice(0, 10).map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <MessageCircle className="h-10 w-10 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
            <CardTitle className="text-base font-semibold font-heading">
              {t("dashboard.topProperties")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {propertiesLoading ? (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <PropertyCardSkeleton key={i} />
                  ))}
                </div>
              ) : properties && properties.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  {properties.slice(0, 4).map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <Building2 className="h-10 w-10 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No properties listed yet</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
