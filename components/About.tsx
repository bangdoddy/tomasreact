import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Info, Code, Users, Award, Github, Mail } from 'lucide-react';

export default function About() {
  const developers = [
    { name: 'Dahilin', role: 'Senior Engineer' },
    { name: 'Imaniar Rusydiawan', role: 'Section Head ERP & Integration' },
    { name: 'Yudi Kristanto', role: 'Department Head - Plant Support EQPT - Plant Support Equipment Department' },
    { name: 'Firmansyah', role: 'Section Head - Facility & Tools - Plant Support Equipment Department' },
    { name: 'Alfian Novialdi Laksono', role: 'Officer - Tools & Facility - Plant Support Equipment Department' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#003366] flex items-center gap-2">
          <Info className="h-8 w-8 text-[#009999]" />
          About Smart Tomas
        </h1>
        <p className="text-gray-600 mt-1">Information about the application and development team</p>
      </div>

      <Card className="border-l-4 border-l-[#009999]">
        <CardHeader>
          <CardTitle className="text-[#003366] flex items-center justify-between">
            <span>Application Information</span>
            <span className="text-2xl text-[#009999]">v3.0</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-[#003366] mb-2">Smart Tomas - Tools Management System</h3>
            <p className="text-gray-600">
              Smart Tomas is a comprehensive web application designed for efficient tools inventory management. 
              It provides powerful features for tracking, monitoring, and managing tools across multiple jobsites 
              and workgroups with an intuitive and modern interface.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mt-6">
            <div className="p-4 bg-gradient-to-br from-[#009999]/10 to-[#009999]/5 rounded-lg border border-[#009999]/20">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5 text-[#009999]" />
                <h4 className="text-[#003366]">Version</h4>
              </div>
              <p className="text-2xl text-[#009999]">3.0</p>
              <p className="text-sm text-gray-600 mt-1">Latest Release</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-[#003366]/10 to-[#003366]/5 rounded-lg border border-[#003366]/20">
              <div className="flex items-center gap-2 mb-2">
                <Code className="h-5 w-5 text-[#003366]" />
                <h4 className="text-[#003366]">Technology</h4>
              </div>
              <p className="text-sm text-gray-600">React, TypeScript</p>
              <p className="text-sm text-gray-600">Tailwind CSS</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-green-600" />
                <h4 className="text-[#003366]">Status</h4>
              </div>
              <p className="text-sm text-green-600">Active Development</p>
              <p className="text-sm text-gray-600 mt-1">Regular Updates</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#003366] flex items-center gap-2">
            <Users className="h-5 w-5 text-[#009999]" />
            Development Team
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            Smart Tomas is developed and maintained by a dedicated team of professionals committed to 
            delivering the best tools management experience.
          </p>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {developers.map((dev, index) => (
              <Card key={index} className="bg-gradient-to-br from-gray-50 to-white">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#009999] to-[#003366] flex items-center justify-center text-white flex-shrink-0">
                      {dev.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-[#003366]">{dev.name}</h4>
                      <p className="text-sm text-gray-600">{dev.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#003366]">Key Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="text-[#003366]">User Management</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm ml-4">
                <li>Complete user CRUD operations</li>
                <li>Role-based access control</li>
                <li>Permission matrix management</li>
                <li>Excel import/export</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-[#003366]">Tools Management</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm ml-4">
                <li>Full inventory tracking</li>
                <li>Condition monitoring (BAIK/RUSAK/HILANG)</li>
                <li>Standard quantity management</li>
                <li>Bulk import/export capabilities</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-[#003366]">Dashboard & Analytics</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm ml-4">
                <li>Real-time inventory overview</li>
                <li>Color-coded status indicators</li>
                <li>Percentage calculations</li>
                <li>Quick insights and metrics</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-[#003366]">Modern Interface</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm ml-4">
                <li>Responsive design</li>
                <li>Collapsible sidebar</li>
                <li>Intuitive navigation</li>
                <li>Brand-aligned colors</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#003366]">Version History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-[#009999] pl-4">
              <h4 className="text-[#003366]">Version 3.0 - Current</h4>
              <p className="text-sm text-gray-600 mb-2">November 2025</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
                <li>Added Roles management</li>
                <li>Implemented Permission matrix</li>
                <li>Added Standard Quantity module</li>
                <li>Comprehensive Help section with guides and tutorials</li>
                <li>Enhanced UI/UX with brand colors</li>
              </ul>
            </div>

            <div className="border-l-4 border-gray-300 pl-4">
              <h4 className="text-[#003366]">Version 2.0</h4>
              <p className="text-sm text-gray-600 mb-2">October 2025</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
                <li>Tools management with Excel import/export</li>
                <li>Dashboard with tools condition summary</li>
                <li>Enhanced user management</li>
              </ul>
            </div>

            <div className="border-l-4 border-gray-300 pl-4">
              <h4 className="text-[#003366]">Version 1.0</h4>
              <p className="text-sm text-gray-600 mb-2">September 2025</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
                <li>Initial release</li>
                <li>Basic user authentication</li>
                <li>User management module</li>
                <li>Dashboard framework</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-[#009999]/10 to-[#003366]/10 border-[#009999]">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Mail className="h-12 w-12 text-[#009999] flex-shrink-0" />
            <div>
              <h3 className="text-[#003366] mb-2">Contact & Support</h3>
              <p className="text-gray-600 mb-3">
                For questions, feedback, or support, please visit the Help → Contact Us section or reach out to our development team.
              </p>
              <p className="text-sm text-gray-500">
                © 2025 Smart Tomas. All rights reserved.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}