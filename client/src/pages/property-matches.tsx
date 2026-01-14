import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { PropertyRequest, PropertyOffer, PropertyMatch } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin, DollarSign, Maximize, Bed, Bath, Phone, User, Check, MessageCircle, Building2, Star } from "lucide-react";

const saudiCities = [
  { value: "riyadh", labelEn: "Riyadh", labelAr: "الرياض" },
  { value: "jeddah", labelEn: "Jeddah", labelAr: "جدة" },
  { value: "makkah", labelEn: "Makkah", labelAr: "مكة المكرمة" },
  { value: "madinah", labelEn: "Madinah", labelAr: "المدينة المنورة" },
  { value: "dammam", labelEn: "Dammam", labelAr: "الدمام" },
  { value: "khobar", labelEn: "Khobar", labelAr: "الخبر" },
  { value: "dhahran", labelEn: "Dhahran", labelAr: "الظهران" },
  { value: "tabuk", labelEn: "Tabuk", labelAr: "تبوك" },
  { value: "abha", labelEn: "Abha", labelAr: "أبها" },
  { value: "taif", labelEn: "Taif", labelAr: "الطائف" },
  { value: "jubail", labelEn: "Jubail", labelAr: "الجبيل" },
  { value: "yanbu", labelEn: "Yanbu", labelAr: "ينبع" },
];

function MatchCard({ 
  match, 
  offer, 
  onContact 
}: { 
  match: PropertyMatch; 
  offer: PropertyOffer; 
  onContact: () => void;
}) {
  const { t, language } = useI18n();
  const cityLabel = saudiCities.find(c => c.value === offer.city);

  const getMatchDetails = (details: string | null) => {
    if (!details) return [];
    const detailMap: Record<string, { en: string; ar: string }> = {
      city_match: { en: "City Match", ar: "مطابقة المدينة" },
      type_match: { en: "Type Match", ar: "مطابقة النوع" },
      price_match: { en: "Price Match", ar: "مطابقة السعر" },
      district_match: { en: "District Match", ar: "مطابقة الحي" },
      condition_match: { en: "Condition Match", ar: "مطابقة الحالة" },
    };
    return details.split(",").map(d => detailMap[d]?.[language] || d);
  };

  return (
    <Card className="hover-elevate" data-testid={`card-match-${match.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default" className="bg-green-500">
                <Check className="h-3 w-3 ltr:mr-1 rtl:ml-1" />
                {t("matching.propertyAvailable")}
              </Badge>
              <Badge variant="secondary">
                {match.matchScore}% {t("matching.matchScore")}
              </Badge>
            </div>
            <CardTitle className="text-lg">
              {language === "ar" ? offer.descriptionAr || offer.description : offer.description}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {language === "ar" && cityLabel ? cityLabel.labelAr : cityLabel?.labelEn || offer.city}
              {offer.district && ` - ${language === "ar" ? offer.districtAr || offer.district : offer.district}`}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary" dir="ltr">
              {parseInt(offer.price || "0").toLocaleString()} SAR
            </div>
            <div className="text-sm text-muted-foreground">
              {offer.listingType === "rent" ? (language === "ar" ? "/ سنوياً" : "/ year") : ""}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-1 bg-muted px-3 py-1.5 rounded-md">
            <Maximize className="h-4 w-4 text-muted-foreground" />
            <span>{offer.area} {language === "ar" ? "م²" : "sqm"}</span>
          </div>
          {offer.bedrooms && (
            <div className="flex items-center gap-1 bg-muted px-3 py-1.5 rounded-md">
              <Bed className="h-4 w-4 text-muted-foreground" />
              <span>{offer.bedrooms}</span>
            </div>
          )}
          {offer.bathrooms && (
            <div className="flex items-center gap-1 bg-muted px-3 py-1.5 rounded-md">
              <Bath className="h-4 w-4 text-muted-foreground" />
              <span>{offer.bathrooms}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          {getMatchDetails(match.matchDetails).map((detail, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              <Star className="h-3 w-3 ltr:mr-1 rtl:ml-1 text-yellow-500" />
              {detail}
            </Badge>
          ))}
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4 text-muted-foreground" />
                {t("matching.marketerName")}: {offer.brokerName}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Phone className="h-4 w-4" />
                <span dir="ltr">{offer.brokerPhone}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {offer.brokerPhone && (
                <Button 
                  variant="outline"
                  size="sm"
                  asChild
                  data-testid={`button-whatsapp-${match.id}`}
                >
                  <a 
                    href={`https://wa.me/${offer.brokerPhone.replace(/\s+/g, "").replace("+", "")}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
                    {language === "ar" ? "واتساب" : "WhatsApp"}
                  </a>
                </Button>
              )}
              <Button 
                onClick={onContact}
                data-testid={`button-contact-${match.id}`}
              >
                <Phone className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
                {t("matching.contactMarketer")}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MatchesSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function PropertyMatches() {
  const { t, language } = useI18n();
  const { toast } = useToast();
  const [, params] = useRoute("/property-requests/:id/matches");
  const requestId = params?.id;

  const { data: request } = useQuery<PropertyRequest>({
    queryKey: ["/api/property-requests", requestId],
    enabled: !!requestId,
  });

  const { data: matches, isLoading } = useQuery<{ match: PropertyMatch; offer: PropertyOffer }[]>({
    queryKey: ["/api/property-requests", requestId, "matches"],
    enabled: !!requestId,
  });

  const contactMutation = useMutation({
    mutationFn: async (matchId: string) => {
      return apiRequest("PATCH", `/api/property-matches/${matchId}`, {
        status: "contacted",
        contactedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/property-requests", requestId, "matches"] });
      toast({
        title: language === "ar" ? "تم التسجيل" : "Contact Recorded",
        description: language === "ar" ? "تم تسجيل التواصل مع المسوق" : "Contact with marketer has been recorded",
      });
    },
  });

  const handleContact = (matchId: string, phone: string) => {
    contactMutation.mutate(matchId);
    window.open(`tel:${phone}`, "_self");
  };

  const cityLabel = request ? saudiCities.find(c => c.value === request.city) : null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/property-requests">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold" data-testid="text-matches-title">
            {t("matching.viewMatches")}
          </h1>
          {request && (
            <p className="text-muted-foreground">
              {request.propertyType} - {language === "ar" && cityLabel ? cityLabel.labelAr : cityLabel?.labelEn || request.city}
              {request.district && ` - ${request.district}`}
            </p>
          )}
        </div>
      </div>

      {request && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span>{request.propertyType}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>
                  {language === "ar" && cityLabel ? cityLabel.labelAr : cityLabel?.labelEn || request.city}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <span dir="ltr">
                  {request.minPrice ? `${parseInt(request.minPrice).toLocaleString()} - ` : ""}
                  {parseInt(request.maxPrice).toLocaleString()} SAR
                </span>
              </div>
              {request.clientName && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span>{request.clientName}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <MatchesSkeleton />
      ) : !matches?.length ? (
        <Card className="p-12 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">{t("matching.noMatches")}</h3>
          <p className="text-muted-foreground mb-4">{t("matching.noMatchesDesc")}</p>
          <Link href="/property-requests">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {language === "ar" ? "العودة للطلبات" : "Back to Requests"}
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {matches.length} {t("matching.matchesFound")}
            </h2>
          </div>
          {matches.map(({ match, offer }) => (
            <MatchCard 
              key={match.id} 
              match={match} 
              offer={offer}
              onContact={() => handleContact(match.id, offer.brokerPhone)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
