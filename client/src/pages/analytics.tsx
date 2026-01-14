import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  Handshake,
  MessageCircle,
  Clock,
  Target
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KpiCard } from "@/components/kpi-card";
import { KpiCardSkeleton } from "@/components/loading-skeleton";
import { useI18n } from "@/lib/i18n";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from "recharts";
import { cn } from "@/lib/utils";

interface AnalyticsData {
  totalLeads: number;
  leadChange: number;
  activeDeals: number;
  dealChange: number;
  conversionRate: number;
  conversionChange: number;
  revenue: number;
  revenueChange: number;
  avgResponseTime: number;
  responseTimeChange: number;
  messagesCount: number;
  messagesChange: number;
  propertiesListed: number;
  propertiesChange: number;
  meetingsScheduled: number;
  meetingsChange: number;
}

interface LeadTrend {
  date: string;
  leads: number;
  conversions: number;
}

interface AgentPerformance {
  name: string;
  leads: number;
  deals: number;
  revenue: number;
}

interface SourcePerformance {
  source: string;
  leads: number;
  conversion: number;
}

const CHART_COLORS = [
  "hsl(210, 85%, 45%)",
  "hsl(25, 90%, 50%)",
  "hsl(150, 60%, 45%)",
  "hsl(280, 65%, 50%)",
  "hsl(340, 75%, 50%)",
  "hsl(45, 90%, 50%)",
];

export default function Analytics() {
  const { t } = useI18n();

  const { data: analytics, isLoading: analyticsLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
  });

  const { data: leadTrends } = useQuery<LeadTrend[]>({
    queryKey: ["/api/analytics/lead-trends"],
  });

  const { data: agentPerformance } = useQuery<AgentPerformance[]>({
    queryKey: ["/api/analytics/agent-performance"],
  });

  const { data: sourcePerformance } = useQuery<SourcePerformance[]>({
    queryKey: ["/api/analytics/source-performance"],
  });

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">{t("analytics.title")}</h1>
          <p className="text-muted-foreground mt-1">
            Track your sales performance and team metrics
          </p>
        </div>

        <Select defaultValue="month">
          <SelectTrigger className="w-[180px]" data-testid="select-date-range">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">{t("common.thisWeek")}</SelectItem>
            <SelectItem value="month">{t("common.thisMonth")}</SelectItem>
            <SelectItem value="year">{t("common.thisYear")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {analyticsLoading ? (
          <>
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </>
        ) : (
          <>
            <KpiCard
              title={t("dashboard.totalLeads")}
              value={analytics?.totalLeads || 0}
              change={analytics?.leadChange}
              changeLabel="vs last period"
              icon={Users}
              testId="kpi-total-leads"
            />
            <KpiCard
              title={t("dashboard.activeDeals")}
              value={analytics?.activeDeals || 0}
              change={analytics?.dealChange}
              changeLabel="vs last period"
              icon={Handshake}
              testId="kpi-active-deals"
            />
            <KpiCard
              title={t("dashboard.conversionRate")}
              value={`${analytics?.conversionRate || 0}%`}
              change={analytics?.conversionChange}
              changeLabel="vs last period"
              icon={Target}
              testId="kpi-conversion-rate"
            />
            <KpiCard
              title={t("dashboard.revenue")}
              value={`AED ${formatCurrency(analytics?.revenue || 0)}`}
              change={analytics?.revenueChange}
              changeLabel="vs last period"
              icon={TrendingUp}
              testId="kpi-revenue"
            />
          </>
        )}
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {analyticsLoading ? (
          <>
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </>
        ) : (
          <>
            <KpiCard
              title="Avg Response Time"
              value={`${analytics?.avgResponseTime || 0} min`}
              change={analytics?.responseTimeChange ? -analytics.responseTimeChange : 0}
              changeLabel="vs last period"
              icon={Clock}
              testId="kpi-response-time"
            />
            <KpiCard
              title="Messages Sent"
              value={analytics?.messagesCount || 0}
              change={analytics?.messagesChange}
              changeLabel="vs last period"
              icon={MessageCircle}
              testId="kpi-messages"
            />
            <KpiCard
              title="Properties Listed"
              value={analytics?.propertiesListed || 0}
              change={analytics?.propertiesChange}
              changeLabel="vs last period"
              icon={Building2}
              testId="kpi-properties"
            />
            <KpiCard
              title="Meetings Scheduled"
              value={analytics?.meetingsScheduled || 0}
              change={analytics?.meetingsChange}
              changeLabel="vs last period"
              icon={TrendingUp}
              testId="kpi-meetings"
            />
          </>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">
            Overview
          </TabsTrigger>
          <TabsTrigger value="performance" data-testid="tab-performance">
            Performance
          </TabsTrigger>
          <TabsTrigger value="sources" data-testid="tab-sources">
            Lead Sources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold font-heading">
                Lead & Conversion Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leadTrends && leadTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={leadTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(210, 85%, 45%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(210, 85%, 45%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(150, 60%, 45%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(150, 60%, 45%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="leads" 
                      stroke="hsl(210, 85%, 45%)" 
                      fillOpacity={1}
                      fill="url(#colorLeads)"
                      name="New Leads"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="conversions" 
                      stroke="hsl(150, 60%, 45%)" 
                      fillOpacity={1}
                      fill="url(#colorConversions)"
                      name="Conversions"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  No trend data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold font-heading">
                Agent Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {agentPerformance && agentPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={agentPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Legend />
                    <Bar dataKey="leads" fill="hsl(210, 85%, 45%)" name="Leads" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="deals" fill="hsl(150, 60%, 45%)" name="Deals" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                  No agent performance data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold font-heading">
                  Leads by Source
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sourcePerformance && sourcePerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sourcePerformance}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="leads"
                        nameKey="source"
                      >
                        {sourcePerformance.map((entry, index) => (
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
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No source data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold font-heading">
                  Conversion by Source
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sourcePerformance && sourcePerformance.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart 
                      data={sourcePerformance} 
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" tick={{ fontSize: 12 }} unit="%" />
                      <YAxis 
                        dataKey="source" 
                        type="category" 
                        tick={{ fontSize: 12 }}
                        width={80}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                        formatter={(value: number) => [`${value}%`, "Conversion Rate"]}
                      />
                      <Bar 
                        dataKey="conversion" 
                        fill="hsl(150, 60%, 45%)" 
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No conversion data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
