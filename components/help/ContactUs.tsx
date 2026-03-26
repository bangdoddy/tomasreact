import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Mail, Phone, MapPin, MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useState } from 'react';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }

    // In production, this would send the message to the support team
    toast.success('Message sent successfully! Our team will contact you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[#003366] flex items-center gap-2">
          <MessageSquare className="h-8 w-8 text-[#009999]" />
          Contact Us
        </h1>
        <p className="text-gray-600 mt-1">Get in touch with our support team</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-l-4 border-l-[#009999]">
          <CardHeader>
            <CardTitle className="text-[#003366]">Send us a Message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="What is this regarding?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Please describe your question or issue..."
                  rows={6}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#009999] hover:bg-[#007777] text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#003366]">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-[#009999] mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-[#003366] mb-1">Email</h4>
                  <p className="text-gray-600">support@smarttomas.com</p>
                  <p className="text-gray-600">admin@smarttomas.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-[#009999] mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-[#003366] mb-1">Phone</h4>
                  <p className="text-gray-600">+62 21 1234 5678</p>
                  <p className="text-gray-600">+62 812 3456 7890 (WhatsApp)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#009999] mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-[#003366] mb-1">Office Location</h4>
                  <p className="text-gray-600">
                    Smart Tomas Headquarters<br />
                    Jakarta, Indonesia
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[#003366]">Support Hours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-gray-600">
              <div className="flex justify-between">
                <span>Monday - Friday:</span>
                <span>8:00 AM - 5:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday:</span>
                <span>9:00 AM - 1:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday:</span>
                <span>Closed</span>
              </div>
              <p className="text-sm mt-4 pt-4 border-t">
                For urgent issues outside business hours, please send an email and we'll respond as soon as possible.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-[#009999]/5 border-[#009999]">
            <CardContent className="p-6">
              <h3 className="text-[#003366] mb-2">Development Team</h3>
              <p className="text-gray-600 mb-3">
                Smart Tomas is developed and maintained by our dedicated team:
              </p>
              <ul className="space-y-1 text-gray-600">
                <li>• Dahilin</li>
                <li>• Imaniar Rusydiawan</li>
                <li>• Firmansyah</li>
                <li>• Yudi Kristanto</li>
                <li>• Alfian Novialdi Laksono</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#003366]">Frequently Contacted For</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-[#003366] mb-1">Technical Support</h4>
              <p className="text-sm text-gray-600">Login issues, system errors, performance problems</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-[#003366] mb-1">Account Management</h4>
              <p className="text-sm text-gray-600">User access, password resets, role changes</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-[#003366] mb-1">Feature Requests</h4>
              <p className="text-sm text-gray-600">New features, improvements, customizations</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-[#003366] mb-1">Training</h4>
              <p className="text-sm text-gray-600">User training sessions, documentation requests</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-[#003366] mb-1">Data Issues</h4>
              <p className="text-sm text-gray-600">Import/export problems, data corrections</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-[#003366] mb-1">General Inquiries</h4>
              <p className="text-sm text-gray-600">Questions about the system, feedback, suggestions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
