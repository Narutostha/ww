import React, { useState } from 'react';
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { SEO } from "@/components/SEO";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ShippingRates = () => {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");

  // Updated shipping rates from the PDF
  const shippingRates = {
    "North America": {
      "USA": 3977.77,
      "Canada": 4083.35,
    },
    "Europe": {
      "UK": 2323.50,
      "Germany": 3052.35,
      "France": 4469.16,
      "Italy": 4750.34,
      "Netherlands": 2618.59,
      "Belgium": 2997.86,
      "Switzerland": 4347.10,
      "Austria": 4776.50,
      "Denmark": 4711.11,
      "Finland": 4569.43,
      "Greece": 8865.64,
      "Norway": 9794.19,
      "Sweden": 6014.58,
      "Spain": 5153.59,
      "Portugal": 5476.19,
      "Ireland": 4262.09,
      "Luxembourg": 3359.69,
      "Hungary": 4811.38,
      "Poland": 4506.22,
      "Romania": 8274.94,
      "Bulgaria": 7867.33,
      "Croatia": 7052.12
    },
    "Asia": {
      "Japan": 4264.13,
      "China": 2998.84,
      "South Korea": 2596.74,
      "Singapore": 2149.62,
      "Malaysia": 2368.52,
      "Taiwan": 2606.06,
      "Thailand": 2606.06,
      "Vietnam": 2708.52,
      "Philippines": 3060.94,
      "Indonesia": 3649.34,
      "Hong Kong": 1250.00,
      "India": 850.00,
      "Macau": 3355.00,
      "Cambodia": 3785.00
    },
    "Middle East": {
      "UAE": 1834.46,
      "Saudi Arabia": 2316.09,
      "Bahrain": 1825.65,
      "Oman": 2098.12,
      "Qatar": 2955.00,
      "Kuwait": 3630.00,
      "Israel": 2955.00,
      "Cyprus": 4260.00
    },
    "South Asia": {
      "Bangladesh": 2955.00,
      "Bhutan": 2955.00,
      "Maldives": 2955.00,
      "Pakistan": 2955.00
    },
    "Oceania": {
      "Australia": 3720.75,
      "New Zealand": 4497.00
    }
  };

  const allCountries = Object.entries(shippingRates).reduce((acc, [region, countries]) => {
    return [...acc, ...Object.keys(countries).map(country => ({
      name: country,
      region: region,
      rate: countries[country]
    }))];
  }, []).sort((a, b) => a.name.localeCompare(b.name));

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    const region = allCountries.find(c => c.name === country)?.region;
    setSelectedRegion(region);
  };

  const getShippingRate = () => {
    if (!selectedCountry) return null;
    const country = allCountries.find(c => c.name === selectedCountry);
    return country ? country.rate : null;
  };

  return (
    <>
      <SEO 
        title="International Shipping Rates | Blu Away" 
        description="View international shipping rates for different countries. Economy service rates for 1kg packages."
      />
      <div className="min-h-screen bg-white">
        <Navbar />
        <Sidebar />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto pt-24 px-8"
        >
          <h1 className="text-4xl font-light mb-12 text-gray-700">International Shipping Rates</h1>
          
          <div className="max-w-2xl mx-auto space-y-8">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-800">View Shipping Rate (1kg Package)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Select Country</label>
                  <Select onValueChange={handleCountryChange} value={selectedCountry}>
                    <SelectTrigger className="w-full border-gray-300">
                      <SelectValue placeholder="Choose destination country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {allCountries.map(({ name, region }) => (
                          <SelectItem key={name} value={name}>
                            {name} ({region})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {selectedCountry && (
                  <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Region:</span>
                      <span className="text-sm text-gray-800">{selectedRegion}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Weight:</span>
                      <span className="text-sm text-gray-800">1 kg</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-lg font-medium text-gray-700">Shipping Rate:</span>
                      <span className="text-lg font-bold text-blue-600">
                        NPR {getShippingRate()?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardContent className="pt-6 space-y-2 text-sm text-gray-600">
                <p>• Rates shown are for Economy Service</p>
                <p>• Custom charge of NPR 750 per box applies for packages over 10kg</p>
                <p>• TIA charge of NPR 7 per kg applies for packages over 10kg</p>
                <p>• Delivery Time: 3-7 working days</p>
                <p>• Remote area charges may apply (FNCM: 3500/-, DNCM: 4500/-, SNCM: 3000/-)</p>
                <p>• Address correction charge: NPR 3500 per packet</p>
                <p>• These rates are subject to change without prior notice</p>
                <p>• For support: 9801472161, 015199684, 015199595 (intl.bd@nepalcanmove.com)</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default ShippingRates;