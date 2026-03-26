import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { HelpCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

export default function FAQ() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#003366] flex items-center gap-2">
          <HelpCircle className="h-8 w-8 text-[#009999]" />
          Frequently Asked Questions
        </h1>
        <p className="text-gray-600 mt-1">Find answers to common questions</p>
      </div>

      <Card className="border-l-4 border-l-[#009999]">
        <CardHeader>
          <CardTitle className="text-[#003366]">General Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="q1">
              <AccordionTrigger className="text-[#003366]">
                What is Smart Tomas?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Smart Tomas is a comprehensive tools management system designed to help you track, manage, and monitor your tools inventory. It provides features for user management, tools tracking, condition monitoring, and reporting.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q2">
              <AccordionTrigger className="text-[#003366]">
                How do I reset my password?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Please contact your system administrator to reset your password. For security reasons, password resets must be done by authorized personnel.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q3">
              <AccordionTrigger className="text-[#003366]">
                Who can access the system?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Only authorized users with valid credentials can access the system. Your access level depends on your assigned role (PIC Tools, Supervisor, Walder, Tool Keeper, or Mechanic).
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="q4">
              <AccordionTrigger className="text-[#003366]">
                What browsers are supported?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Smart Tomas works best on modern browsers including Google Chrome, Mozilla Firefox, Microsoft Edge, and Safari. We recommend using the latest version of your browser for optimal performance.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#003366]">Tools Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="t1">
              <AccordionTrigger className="text-[#003366]">
                How do I add a new tool to the inventory?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Navigate to Data Management &gt; Data Master Tools, then click the "Add Tool" button. Fill in all required fields including Tools ID, Name, Type, Condition, and other details, then click Save.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="t2">
              <AccordionTrigger className="text-[#003366]">
                What do the tool conditions mean?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>BAIK:</strong> Tool is in good condition and ready to use</li>
                  <li><strong>RUSAK:</strong> Tool is damaged and needs repair</li>
                  <li><strong>HILANG:</strong> Tool is missing or lost</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="t3">
              <AccordionTrigger className="text-[#003366]">
                Can I import tools from an Excel file?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Yes! Click the "Import" button in the Data Master Tools page and select your Excel file. Make sure your Excel file has the correct column headers matching the system's format.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="t4">
              <AccordionTrigger className="text-[#003366]">
                How do I export tools data?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Click the "Export to Excel" button in the Data Master Tools page. The system will download an Excel file containing all your tools data with complete information.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="t5">
              <AccordionTrigger className="text-[#003366]">
                What is Standard Quantity?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Standard Quantity defines the minimum required quantity for each tool type. The system helps you monitor whether your current inventory meets these standards and alerts you when quantities fall below the standard level.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#003366]">User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="u1">
              <AccordionTrigger className="text-[#003366]">
                Who can add or edit users?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Only users with PIC Tools role have permission to add, edit, or delete user accounts. This ensures proper access control and system security.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="u2">
              <AccordionTrigger className="text-[#003366]">
                What are the available user roles?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                The system supports five roles:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>PIC Tools:</strong> Full system access and management</li>
                  <li><strong>Supervisor:</strong> View and limited editing capabilities</li>
                  <li><strong>Walder:</strong> View-only access to relevant data</li>
                  <li><strong>Tool Keeper:</strong> Tools management with edit rights</li>
                  <li><strong>Mechanic:</strong> View-only access to tools data</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="u3">
              <AccordionTrigger className="text-[#003366]">
                How do I change user permissions?
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Go to User Management &gt; Permissions. You'll see a matrix showing all roles and modules. Check or uncheck the permissions (View, Create, Edit, Delete) for each role and module, then click Save Changes.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#003366]">Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="ts1">
              <AccordionTrigger className="text-[#003366]">
                I can't log in to the system
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Check that you're using the correct username and password. If you've forgotten your password, contact your system administrator. Ensure you have a stable internet connection.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="ts2">
              <AccordionTrigger className="text-[#003366]">
                Excel import is not working
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Ensure your Excel file has the correct format with proper column headers. The file should be in .xlsx or .xls format. Check that all required fields are filled in and data types are correct (numbers for quantities, dates in proper format, etc.).
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="ts3">
              <AccordionTrigger className="text-[#003366]">
                I don't see certain menu options
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Menu visibility depends on your user role and permissions. If you need access to additional features, contact your administrator to review your role permissions.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="ts4">
              <AccordionTrigger className="text-[#003366]">
                The page is loading slowly
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                Slow loading can be caused by internet connection issues or large amounts of data. Try refreshing the page, clearing your browser cache, or checking your internet connection. If the problem persists, contact technical support.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}