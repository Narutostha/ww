import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { REGIONS } from "@/lib/constants";

export const LocationSelector = ({ 
  onProvinceChange, 
  onCityChange,
  selectedProvince,
  selectedCity 
}: { 
  onProvinceChange: (province: string) => void;
  onCityChange: (city: string) => void;
  selectedProvince?: string;
  selectedCity?: string;
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Province</label>
        <Select value={selectedProvince} onValueChange={onProvinceChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select Province" />
          </SelectTrigger>
          <SelectContent>
            {REGIONS.provinces.map(province => (
              <SelectItem key={province} value={province}>
                {province}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium">City</label>
        <Select value={selectedCity} onValueChange={onCityChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select City" />
          </SelectTrigger>
          <SelectContent>
            {selectedProvince && REGIONS.cities[selectedProvince]?.map(city => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};