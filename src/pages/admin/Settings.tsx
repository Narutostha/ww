import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getShippingInfo, getReturnPolicy, updateShippingInfo, updateReturnPolicy, createShippingInfo, createReturnPolicy } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Plus, X } from "lucide-react";
import { motion } from "framer-motion";

export default function Settings() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Fetch shipping info and return policy
  const { data: shippingInfo = [] } = useQuery({
    queryKey: ['shipping-info'],
    queryFn: getShippingInfo
  });

  const { data: returnPolicies = [] } = useQuery({
    queryKey: ['return-policy'],
    queryFn: getReturnPolicy
  });

  // Mutations for shipping info
  const shippingMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      updateShippingInfo(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['shipping-info']);
    }
  });

  const createShippingMutation = useMutation({
    mutationFn: (info: any) => createShippingInfo(info),
    onSuccess: () => {
      queryClient.invalidateQueries(['shipping-info']);
    }
  });

  // Mutations for return policy
  const returnPolicyMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      updateReturnPolicy(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['return-policy']);
    }
  });

  const createReturnPolicyMutation = useMutation({
    mutationFn: (policy: any) => createReturnPolicy(policy),
    onSuccess: () => {
      queryClient.invalidateQueries(['return-policy']);
    }
  });

  const handleAddShippingZone = () => {
    createShippingMutation.mutate({
      region: "New Region",
      delivery_time: "3-5 days",
      cost: 0,
      free_shipping_threshold: 10000
    });
  };

  const handleUpdateShipping = (id: string, updates: any) => {
    shippingMutation.mutate({ id, updates });
  };

  const handleAddReturnPolicy = () => {
    createReturnPolicyMutation.mutate({
      title: "New Return Policy",
      description: "Enter policy description",
      duration_days: 30,
      conditions: ["Item must be unused and in original packaging"]
    });
  };

  const handleUpdateReturnPolicy = (id: string, updates: any) => {
    returnPolicyMutation.mutate({ id, updates });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      <Tabs defaultValue="shipping" className="space-y-4">
        <TabsList>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="returns">Returns</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="shipping" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Shipping Zones</CardTitle>
                <CardDescription>
                  Configure shipping costs and delivery times for different regions
                </CardDescription>
              </div>
              <Button onClick={handleAddShippingZone}>
                <Plus className="h-4 w-4 mr-2" />
                Add Zone
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shippingInfo.map((zone) => (
                  <motion.div
                    key={zone.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Region Name</Label>
                        <Input
                          value={zone.region}
                          onChange={(e) => handleUpdateShipping(zone.id, { region: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Delivery Time</Label>
                        <Input
                          value={zone.delivery_time}
                          onChange={(e) => handleUpdateShipping(zone.id, { delivery_time: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Shipping Cost (NPR)</Label>
                        <Input
                          type="number"
                          value={zone.cost}
                          onChange={(e) => handleUpdateShipping(zone.id, { cost: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Free Shipping Threshold (NPR)</Label>
                        <Input
                          type="number"
                          value={zone.free_shipping_threshold}
                          onChange={(e) => handleUpdateShipping(zone.id, { free_shipping_threshold: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="returns" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Return Policies</CardTitle>
                <CardDescription>
                  Configure return and refund policies
                </CardDescription>
              </div>
              <Button onClick={handleAddReturnPolicy}>
                <Plus className="h-4 w-4 mr-2" />
                Add Policy
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {returnPolicies.map((policy) => (
                  <motion.div
                    key={policy.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 space-y-4"
                  >
                    <div>
                      <Label>Policy Title</Label>
                      <Input
                        value={policy.title}
                        onChange={(e) => handleUpdateReturnPolicy(policy.id, { title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={policy.description}
                        onChange={(e) => handleUpdateReturnPolicy(policy.id, { description: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Return Window (Days)</Label>
                      <Input
                        type="number"
                        value={policy.duration_days}
                        onChange={(e) => handleUpdateReturnPolicy(policy.id, { duration_days: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Conditions</Label>
                      <div className="space-y-2">
                        {policy.conditions.map((condition, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={condition}
                              onChange={(e) => {
                                const newConditions = [...policy.conditions];
                                newConditions[index] = e.target.value;
                                handleUpdateReturnPolicy(policy.id, { conditions: newConditions });
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const newConditions = policy.conditions.filter((_, i) => i !== index);
                                handleUpdateReturnPolicy(policy.id, { conditions: newConditions });
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={() => {
                            const newConditions = [...policy.conditions, "New condition"];
                            handleUpdateReturnPolicy(policy.id, { conditions: newConditions });
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Condition
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account's security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account.
                  </p>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
                <div className="space-y-2">
                  <Label>Change Password</Label>
                  <p className="text-sm text-muted-foreground">
                    Update your account password.
                  </p>
                  <Button variant="outline">Change Password</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}