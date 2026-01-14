import { MapPin, Bed, Bath, Maximize, MoreVertical, Heart, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/lib/i18n";
import type { Property } from "@shared/schema";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
  onView?: (property: Property) => void;
}

const statusColors: Record<string, string> = {
  available: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  reserved: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  sold: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  rented: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

const placeholderImages = [
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop",
];

export function PropertyCard({ property, onEdit, onDelete, onView }: PropertyCardProps) {
  const { t, language } = useI18n();
  
  const title = language === "ar" && property.titleAr ? property.titleAr : property.title;
  const location = language === "ar" && property.locationAr ? property.locationAr : property.location;
  
  const imageUrl = property.images?.[0] || 
    placeholderImages[Math.abs(property.id.charCodeAt(0)) % placeholderImages.length];

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    if (numPrice >= 1000000) {
      return `${(numPrice / 1000000).toFixed(1)}M`;
    }
    if (numPrice >= 1000) {
      return `${(numPrice / 1000).toFixed(0)}K`;
    }
    return numPrice.toString();
  };

  return (
    <Card 
      className="overflow-hidden group cursor-pointer border-0 shadow-sm hover:shadow-md transition-shadow duration-200"
      data-testid={`card-property-${property.id}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <Badge 
            variant="secondary"
            className={cn("text-xs font-semibold shadow-sm", statusColors[property.status])}
          >
            {t(`status.${property.status}`)}
          </Badge>
          
          <div className="flex items-center gap-1.5">
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-white/90 hover:bg-white text-foreground opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
            >
              <Heart className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="bg-white/90 hover:bg-white text-foreground opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary/95 text-primary-foreground text-sm font-bold shadow-lg backdrop-blur-sm">
            SAR {formatPrice(property.price)}
          </span>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-sm line-clamp-1">{title}</h3>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0 text-primary/70" />
              <span className="truncate">{location}</span>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 shrink-0"
                data-testid={`button-property-menu-${property.id}`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(property)}>
                {t("common.view")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(property)}>
                {t("common.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.(property)}
                className="text-destructive"
              >
                {t("common.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium">
            {t(`type.${property.type}`)}
          </Badge>
          
          {property.bedrooms && (
            <div className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" />
              <span className="font-medium">{property.bedrooms}</span>
            </div>
          )}
          
          {property.bathrooms && (
            <div className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" />
              <span className="font-medium">{property.bathrooms}</span>
            </div>
          )}
          
          {property.area && (
            <div className="flex items-center gap-1">
              <Maximize className="h-3.5 w-3.5" />
              <span className="font-medium">{property.area} sqft</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
