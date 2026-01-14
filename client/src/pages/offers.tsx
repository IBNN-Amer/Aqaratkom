import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { PropertyOffer } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Ruler,
  BedDouble,
  Bath,
  FileText
} from "lucide-react";

function OfferCard({ offer, onReview }: { offer: PropertyOffer; onReview: (id: string, status: string, notes?: string) => void }) {
  const { t, language } = useI18n();
  const [reviewNotes, setReviewNotes] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: JSX.Element }> = {
      pending: { variant: "secondary", icon: <Clock className="h-3 w-3" /> },
      approved: { variant: "default", icon: <CheckCircle className="h-3 w-3" /> },
      rejected: { variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
      needs_revision: { variant: "outline", icon: <AlertCircle className="h-3 w-3" /> },
    };
    const statusLabels: Record<string, string> = {
      pending: t("offers.pending"),
      approved: t("offers.approved"),
      rejected: t("offers.rejected"),
      needs_revision: t("offers.needsRevision"),
    };
    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {statusLabels[status] || status}
      </Badge>
    );
  };

  const cityName = language === "ar" ? offer.cityAr : offer.city;
  const districtName = language === "ar" ? offer.districtAr : offer.district;
  const description = language === "ar" ? offer.descriptionAr : offer.description;

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat(language === "ar" ? "ar-SA" : "en-SA", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  return (
    <Card className="hover-elevate" data-testid={`card-offer-${offer.id}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">
            {t(`city.${offer.city}`)} - {districtName}
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{t(`offers.${offer.propertyType}`)}</Badge>
            <Badge variant="outline">{t(`offers.${offer.listingType}`)}</Badge>
          </div>
        </div>
        {getStatusBadge(offer.reviewStatus)}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span>{formatPrice(offer.price)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-muted-foreground" />
            <span>{offer.area} {language === "ar" ? "م²" : "sqm"}</span>
          </div>
          {offer.bedrooms && (
            <div className="flex items-center gap-2">
              <BedDouble className="h-4 w-4 text-muted-foreground" />
              <span>{offer.bedrooms}</span>
            </div>
          )}
          {offer.bathrooms && (
            <div className="flex items-center gap-2">
              <Bath className="h-4 w-4 text-muted-foreground" />
              <span>{offer.bathrooms}</span>
            </div>
          )}
        </div>

        <div className="border-t pt-3 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{offer.brokerName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span dir="ltr">{offer.brokerPhone}</span>
          </div>
          {offer.brokerEmail && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>{offer.brokerEmail}</span>
            </div>
          )}
          {offer.falLicenseNumber && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span dir="ltr">{offer.falLicenseNumber}</span>
            </div>
          )}
        </div>

        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        )}

        {offer.reviewNotes && (
          <div className="bg-muted p-2 rounded text-sm">
            <strong>{t("offers.reviewNotes")}:</strong> {offer.reviewNotes}
          </div>
        )}

        {offer.reviewStatus === "pending" && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={() => onReview(offer.id, "approved")}
              className="flex-1"
              data-testid={`button-approve-${offer.id}`}
            >
              <CheckCircle className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
              {t("offers.approve")}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onReview(offer.id, "rejected")}
              className="flex-1"
              data-testid={`button-reject-${offer.id}`}
            >
              <XCircle className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
              {t("offers.reject")}
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" data-testid={`button-revision-${offer.id}`}>
                  <AlertCircle className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("offers.requestRevision")}</DialogTitle>
                </DialogHeader>
                <Textarea
                  placeholder={t("offers.reviewNotes")}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  data-testid="input-review-notes"
                />
                <Button
                  onClick={() => {
                    onReview(offer.id, "needs_revision", reviewNotes);
                    setDialogOpen(false);
                    setReviewNotes("");
                  }}
                  data-testid="button-submit-revision"
                >
                  {t("common.save")}
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function OffersSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Offers() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");

  const { data: offers, isLoading } = useQuery<PropertyOffer[]>({
    queryKey: ["/api/property-offers"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      return apiRequest("PATCH", `/api/property-offers/${id}`, {
        reviewStatus: status,
        reviewNotes: notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/property-offers"] });
      toast({
        title: t("common.save"),
        description: "Offer status updated successfully",
      });
    },
  });

  const handleReview = (id: string, status: string, notes?: string) => {
    updateMutation.mutate({ id, status, notes });
  };

  const filteredOffers = offers?.filter((offer) => {
    if (activeTab === "all") return true;
    return offer.reviewStatus === activeTab;
  }) || [];

  const counts = {
    all: offers?.length || 0,
    pending: offers?.filter((o) => o.reviewStatus === "pending").length || 0,
    approved: offers?.filter((o) => o.reviewStatus === "approved").length || 0,
    rejected: offers?.filter((o) => o.reviewStatus === "rejected").length || 0,
    needs_revision: offers?.filter((o) => o.reviewStatus === "needs_revision").length || 0,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold" data-testid="text-offers-title">
          {t("offers.title")}
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">
            {t("common.all")} ({counts.all})
          </TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending">
            {t("offers.pending")} ({counts.pending})
          </TabsTrigger>
          <TabsTrigger value="approved" data-testid="tab-approved">
            {t("offers.approved")} ({counts.approved})
          </TabsTrigger>
          <TabsTrigger value="needs_revision" data-testid="tab-needs-revision">
            {t("offers.needsRevision")} ({counts.needs_revision})
          </TabsTrigger>
          <TabsTrigger value="rejected" data-testid="tab-rejected">
            {t("offers.rejected")} ({counts.rejected})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <OffersSkeleton />
          ) : filteredOffers.length === 0 ? (
            <Card className="p-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">{t("offers.noOffers")}</h3>
              <p className="text-muted-foreground">{t("offers.addFirst")}</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} onReview={handleReview} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
