import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Video, PlayCircle, Clock } from 'lucide-react';
import { Badge } from '../ui/badge';

interface Tutorial {
  id: number;
  title: string;
  description: string;
  duration: string;
  category: string;
  thumbnail: string;
}

const tutorials: Tutorial[] = [
  {
    id: 1,
    title: 'Getting Started with Smart Tomas',
    description: 'Learn the basics of navigating the Smart Tomas application',
    duration: '5:30',
    category: 'Basics',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop',
  },
  {
    id: 2,
    title: 'User Management Tutorial',
    description: 'How to add, edit, and manage users in the system',
    duration: '8:15',
    category: 'User Management',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop',
  },
  {
    id: 3,
    title: 'Tools Inventory Management',
    description: 'Complete guide to managing your tools inventory',
    duration: '12:45',
    category: 'Data Management',
    thumbnail: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400&h=225&fit=crop',
  },
  {
    id: 4,
    title: 'Excel Import & Export',
    description: 'Learn how to import and export data using Excel files',
    duration: '6:20',
    category: 'Data Management',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop',
  },
  {
    id: 5,
    title: 'Setting Standard Quantities',
    description: 'How to configure and monitor standard quantity requirements',
    duration: '7:00',
    category: 'Data Management',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=225&fit=crop',
  },
  {
    id: 6,
    title: 'Roles and Permissions',
    description: 'Configure role-based access control for your team',
    duration: '10:30',
    category: 'User Management',
    thumbnail: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=225&fit=crop',
  },
  {
    id: 7,
    title: 'Generating Reports',
    description: 'Create and export comprehensive reports',
    duration: '9:15',
    category: 'Reports',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop',
  },
  {
    id: 8,
    title: 'Dashboard Analytics',
    description: 'Understanding your dashboard metrics and analytics',
    duration: '6:45',
    category: 'Analytics',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop',
  },
];

export default function VideoTutorial() {
  const categories = Array.from(new Set(tutorials.map(t => t.category)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#003366] flex items-center gap-2">
          <Video className="h-8 w-8 text-[#009999]" />
          Video Tutorials
        </h1>
        <p className="text-gray-600 mt-1">Watch step-by-step video guides</p>
      </div>

      <Card className="border-l-4 border-l-[#009999]">
        <CardHeader>
          <CardTitle className="text-[#003366]">Tutorial Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {categories.map((category) => (
              <div key={category}>
                <h3 className="text-[#003366] mb-4">{category}</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {tutorials
                    .filter((tutorial) => tutorial.category === category)
                    .map((tutorial) => (
                      <Card
                        key={tutorial.id}
                        className="group cursor-pointer hover:shadow-lg transition-shadow"
                      >
                        <div className="relative">
                          <img
                            src={tutorial.thumbnail}
                            alt={tutorial.title}
                            className="w-full h-40 object-cover rounded-t-lg"
                          />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg">
                            <PlayCircle className="h-16 w-16 text-white" />
                          </div>
                          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {tutorial.duration}
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h4 className="text-[#003366] mb-2">{tutorial.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{tutorial.description}</p>
                          <Badge className="bg-[#009999]/10 text-[#009999] hover:bg-[#009999]/20">
                            {tutorial.category}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#003366]">Coming Soon</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-600">
          <p>More video tutorials are being prepared to help you make the most of Smart Tomas:</p>
          <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
            <li>Advanced filtering and search techniques</li>
            <li>Custom report creation</li>
            <li>Mobile app usage guide</li>
            <li>Best practices for data management</li>
            <li>System administration deep dive</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="bg-[#009999]/5 border-[#009999]">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Video className="h-12 w-12 text-[#009999] flex-shrink-0" />
            <div>
              <h3 className="text-[#003366] mb-2">Need a Specific Tutorial?</h3>
              <p className="text-gray-600 mb-3">
                If you need a tutorial on a specific topic that's not covered here, please contact our support team. We're constantly adding new content based on user feedback.
              </p>
              <p className="text-sm text-gray-500">
                Note: These are placeholder video tutorials. In production, these would link to actual video content.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
