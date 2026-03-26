import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Book, ChevronRight } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

export default function UserGuide() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#003366] flex items-center gap-2">
          <Book className="h-8 w-8 text-[#009999]" />
          User Guide
        </h1>
        <p className="text-gray-600 mt-1">Complete guide to using Smart Tomas application</p>
      </div>

      <Card className="border-l-4 border-l-[#009999]">
        <CardHeader>
          <CardTitle className="text-[#003366]">Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="flex items-center gap-2 text-[#003366] mb-2">
              <ChevronRight className="h-4 w-4 text-[#009999]" />
              System Requirements
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600 ml-6">
              <li>Modern web browser (Chrome, Firefox, Edge, Safari)</li>
              <li>Internet connection</li>
              <li>Valid user credentials</li>
            </ul>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-[#003366] mb-2">
              <ChevronRight className="h-4 w-4 text-[#009999]" />
              Login Process
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-600 ml-6">
              <li>Open the Smart Tomas application</li>
              <li>Enter your username and password</li>
              <li>Click "Login" button</li>
              <li>You will be redirected to the dashboard</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#003366]">Module Guides</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="dashboard">
              <AccordionTrigger className="text-[#003366]">Dashboard</AccordionTrigger>
              <AccordionContent className="text-gray-600 space-y-2">
                <p>The Dashboard provides an overview of your tools inventory:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Total tools count</li>
                  <li>Tools in good condition</li>
                  <li>Damaged tools</li>
                  <li>Missing tools</li>
                </ul>
                <p className="mt-2">Each metric is displayed with percentage calculations and color-coded indicators for easy monitoring.</p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="user-management">
              <AccordionTrigger className="text-[#003366]">User Management</AccordionTrigger>
              <AccordionContent className="text-gray-600 space-y-2">
                <p><strong>User Data:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Add new users with their details (NRP, Name, Position, etc.)</li>
                  <li>Edit existing user information</li>
                  <li>Delete users from the system</li>
                  <li>Export user data to Excel</li>
                  <li>Import users from Excel files</li>
                </ul>
                <p className="mt-2"><strong>Roles:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>View all available roles/positions</li>
                  <li>Add new roles</li>
                  <li>Edit role descriptions</li>
                  <li>Delete unused roles</li>
                </ul>
                <p className="mt-2"><strong>Permissions:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Configure access rights for each role</li>
                  <li>Set View, Create, Edit, and Delete permissions</li>
                  <li>Control module-level access</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="data-management">
              <AccordionTrigger className="text-[#003366]">Data Management</AccordionTrigger>
              <AccordionContent className="text-gray-600 space-y-2">
                <p><strong>Data Master Tools:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Add new tools with complete details</li>
                  <li>Update tool information and condition</li>
                  <li>Delete tools from inventory</li>
                  <li>Export tools data to Excel</li>
                  <li>Import tools from Excel files</li>
                  <li>Track tool condition (BAIK/RUSAK/HILANG)</li>
                </ul>
                <p className="mt-2"><strong>Standard Quantity:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Set standard quantity requirements for each tool type</li>
                  <li>Monitor current vs. standard quantities</li>
                  <li>Identify tools below standard levels</li>
                  <li>Export/Import standard quantity data</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="reports">
              <AccordionTrigger className="text-[#003366]">Reports</AccordionTrigger>
              <AccordionContent className="text-gray-600 space-y-2">
                <p>Generate comprehensive reports:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>User Reports - Overview of all users in the system</li>
                  <li>Activity Logs - Track user activities</li>
                  <li>Audit Trail - Monitor system changes</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="analytics">
              <AccordionTrigger className="text-[#003366]">Analytics</AccordionTrigger>
              <AccordionContent className="text-gray-600 space-y-2">
                <p>View detailed analytics:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Statistics - Key performance indicators</li>
                  <li>Trends - Historical data analysis</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#003366]">Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-600">
          <div>
            <h3 className="text-[#003366] mb-1">Regular Data Updates</h3>
            <p>Keep your tools inventory up-to-date by regularly updating tool conditions and quantities.</p>
          </div>
          <div>
            <h3 className="text-[#003366] mb-1">Excel Import/Export</h3>
            <p>Use Excel import/export features for bulk data operations. Ensure your Excel file follows the correct format.</p>
          </div>
          <div>
            <h3 className="text-[#003366] mb-1">Permission Management</h3>
            <p>Regularly review and update user permissions to maintain system security.</p>
          </div>
          <div>
            <h3 className="text-[#003366] mb-1">Data Backup</h3>
            <p>Export your data regularly as a backup measure.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
