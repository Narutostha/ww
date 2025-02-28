import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, Key, User, ShieldCheck } from "lucide-react";

export default function AdminGuide() {
  return (
    <div className="space-y-6">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Admin Access Guide</AlertTitle>
        <AlertDescription>
          Follow these steps to access the admin panel after deployment
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-500" />
            Admin Panel Access Instructions
          </CardTitle>
          <CardDescription>
            Complete guide to accessing and using the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" />
              Step 1: Access the Admin Login Page
            </h3>
            <p className="text-sm text-muted-foreground">
              Navigate to <code className="bg-muted px-1 py-0.5 rounded">/admin/login</code> in your browser after deployment.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium flex items-center gap-2">
              <Key className="h-4 w-4 text-blue-500" />
              Step 2: Login with Default Credentials
            </h3>
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm mb-1"><strong>Email:</strong> admin@example.com</p>
              <p className="text-sm"><strong>Password:</strong> admin123</p>
            </div>
            <p className="text-sm text-muted-foreground">
              These are the default credentials set up in the database migrations.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Step 3: Change Default Password</h3>
            <p className="text-sm text-muted-foreground">
              For security reasons, it's recommended to change the default password after your first login.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Admin Panel Features</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
              <li>Dashboard with sales analytics</li>
              <li>Product management (add, edit, delete)</li>
              <li>Order management and status updates</li>
              <li>Customer information</li>
              <li>Settings for shipping and returns</li>
            </ul>
          </div>

          <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> If you need to create additional admin users, you can use the "Create Admin" feature in the admin panel after logging in.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}