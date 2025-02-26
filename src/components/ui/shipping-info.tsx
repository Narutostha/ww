import { Package, Truck, Clock } from "lucide-react";
import { SHIPPING } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";

export const ShippingInfo = () => {
  return (
    <div className="space-y-4 text-gray-600">
      <div className="flex items-center gap-2">
        <Truck className="h-4 w-4" />
        <p>
          Free shipping on orders over {formatPrice(SHIPPING.freeShippingThreshold)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        <p>Delivery within {SHIPPING.deliveryTimes.kathmanduValley} in Kathmandu Valley</p>
      </div>
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4" />
        <p>Delivery within {SHIPPING.deliveryTimes.outsideValley} outside Valley</p>
      </div>
      <div className="text-sm text-muted-foreground">
        <p>Kathmandu Valley: {formatPrice(SHIPPING.baseShippingCost.kathmanduValley)} shipping fee</p>
        <p>Outside Valley: {formatPrice(SHIPPING.baseShippingCost.outsideValley)} shipping fee</p>
      </div>
    </div>
  );
};