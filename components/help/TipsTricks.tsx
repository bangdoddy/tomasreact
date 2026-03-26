import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Lightbulb, Zap, TrendingUp, Shield, Download, Search } from 'lucide-react';

export default function TipsTricks() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#003366] flex items-center gap-2">
          <Lightbulb className="h-8 w-8 text-[#009999]" />
          Tips & Tricks
        </h1>
        <p className="text-gray-600 mt-1">Expert tips to maximize your productivity</p>
      </div>

      <Card className="border-l-4 border-l-[#009999]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#003366]">
            <Zap className="h-5 w-5 text-[#009999]" />
            Productivity Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-[#003366] mb-2">🎯 Use Keyboard Shortcuts</h4>
            <p className="text-gray-600 mb-2">Speed up your workflow with keyboard shortcuts:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
              <li><code className="bg-gray-200 px-2 py-1 rounded">Ctrl + S</code> - Quick save in forms</li>
              <li><code className="bg-gray-200 px-2 py-1 rounded">Ctrl + F</code> - Search within tables</li>
              <li><code className="bg-gray-200 px-2 py-1 rounded">Esc</code> - Close dialogs quickly</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-[#003366] mb-2">📊 Bulk Operations</h4>
            <p className="text-gray-600">
              Save time by using Excel import for adding multiple tools or users at once. Prepare your data in Excel format and import it all in one go instead of adding items one by one.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-[#003366] mb-2">🔄 Regular Data Exports</h4>
            <p className="text-gray-600">
              Export your data weekly as a backup. This not only protects your data but also allows you to analyze trends in external tools like Excel or Google Sheets.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-[#003366] mb-2">🎨 Sidebar Collapse</h4>
            <p className="text-gray-600">
              Working on a smaller screen? Click the menu icon to collapse the sidebar and get more screen space for your data tables.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#003366]">
            <Search className="h-5 w-5 text-[#009999]" />
            Search & Filter Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-[#003366] mb-2">🔍 Smart Searching</h4>
            <p className="text-gray-600 mb-2">Use the search box to quickly find tools or users:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
              <li>Search by any field - ID, name, type, jobsite, etc.</li>
              <li>Use partial text - typing "weld" will find "Welding Machine"</li>
              <li>Search is case-insensitive for easier finding</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-[#003366] mb-2">📋 Table Sorting</h4>
            <p className="text-gray-600">
              Click on column headers to sort data. Click again to reverse the sort order. This helps you quickly identify patterns like oldest tools, most damaged items, etc.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#003366]">
            <Download className="h-5 w-5 text-[#009999]" />
            Excel Import/Export Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-[#003366] mb-2">📥 Before Importing</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
              <li>Export a sample file first to see the correct format</li>
              <li>Ensure all required fields are filled</li>
              <li>Check for duplicate IDs or entries</li>
              <li>Validate date formats (YYYY-MM-DD)</li>
              <li>Double-check condition values (BAIK, RUSAK, HILANG)</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-[#003366] mb-2">📤 Export Strategies</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
              <li>Use exports for monthly reports and archives</li>
              <li>Share exported data with stakeholders who don't have system access</li>
              <li>Analyze data in Excel for custom charts and pivot tables</li>
              <li>Keep exported files organized with clear naming (e.g., Tools_HAJU_2025-11.xlsx)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#003366]">
            <TrendingUp className="h-5 w-5 text-[#009999]" />
            Data Management Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-[#003366] mb-2">✅ Keep Data Current</h4>
            <p className="text-gray-600">
              Update tool conditions regularly. Set a schedule (e.g., weekly inspections) to review and update the status of all tools to maintain accurate inventory.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-[#003366] mb-2">🏷️ Consistent Naming</h4>
            <p className="text-gray-600">
              Use consistent naming conventions for tool types, categories, and locations. This makes searching and filtering much more effective.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-[#003366] mb-2">📈 Monitor Standard Quantities</h4>
            <p className="text-gray-600">
              Review the Standard Quantity page regularly to identify tools that need replenishment. Act on "Below Standard" items to maintain operational readiness.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-[#003366] mb-2">🔒 Data Validation</h4>
            <p className="text-gray-600">
              Before submitting large imports, validate a small sample first. This prevents errors in bulk data entry and saves time on corrections.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#003366]">
            <Shield className="h-5 w-5 text-[#009999]" />
            Security Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-[#003366] mb-2">🔐 Account Security</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
              <li>Always log out when leaving your workstation</li>
              <li>Don't share your credentials with others</li>
              <li>Use a strong, unique password</li>
              <li>Report suspicious activity immediately</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-[#003366] mb-2">👥 Permission Management</h4>
            <p className="text-gray-600">
              If you're a PIC Tools, regularly review user permissions. Remove access for users who no longer need it and ensure each user has only the permissions they require.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-[#009999]/10 to-[#003366]/10 border-[#009999]">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Lightbulb className="h-12 w-12 text-[#009999] flex-shrink-0" />
            <div>
              <h3 className="text-[#003366] mb-2">Pro Tip!</h3>
              <p className="text-gray-600">
                Check the Dashboard regularly to get a quick overview of your tools inventory status. The color-coded metrics help you instantly identify areas that need attention. Green means good, yellow means attention needed, and red means immediate action required!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
