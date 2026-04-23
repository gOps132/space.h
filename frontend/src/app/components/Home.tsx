import { Link } from "react-router";
import { BookOpen, LayoutDashboard, Calendar, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-5xl mb-6">Library Resource Booking System</h1>
            <p className="text-xl mb-8 text-blue-100">
              Reserve your study space, track usage, and manage library resources efficiently
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/student">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  <Calendar className="mr-2 h-5 w-5" />
                  Student Portal
                </Button>
              </Link>
              <Link to="/admin">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-700">
                  <LayoutDashboard className="mr-2 h-5 w-5" />
                  Admin Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl mb-12">System Features</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <Calendar className="w-10 h-10 text-blue-600 mb-2" />
                <CardTitle>Easy Booking</CardTitle>
                <CardDescription>
                  Reserve library seats and study rooms with real-time availability checking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Browse available resources</li>
                  <li>• Select time slots</li>
                  <li>• Instant confirmation</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="w-10 h-10 text-blue-600 mb-2" />
                <CardTitle>Check-in/Check-out</CardTitle>
                <CardDescription>
                  Track your usage with simple check-in and check-out functionality
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Quick QR code check-in</li>
                  <li>• Automated time logging</li>
                  <li>• Usage history tracking</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <LayoutDashboard className="w-10 h-10 text-blue-600 mb-2" />
                <CardTitle>Admin Analytics</CardTitle>
                <CardDescription>
                  Comprehensive dashboard for monitoring occupancy and usage patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Real-time occupancy rates</li>
                  <li>• Peak usage analysis</li>
                  <li>• Zone utilization heatmaps</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl mb-12">How It Works</h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  1
                </div>
                <div>
                  <h3 className="text-xl mb-2">Browse & Reserve</h3>
                  <p className="text-gray-600">
                    Select your preferred study zone and time slot. The system checks availability in real-time and confirms your booking instantly.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  2
                </div>
                <div>
                  <h3 className="text-xl mb-2">Check-in on Arrival</h3>
                  <p className="text-gray-600">
                    When you arrive at the library, check in to activate your reservation. The system logs your arrival time automatically.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center">
                  3
                </div>
                <div>
                  <h3 className="text-xl mb-2">Study & Check-out</h3>
                  <p className="text-gray-600">
                    When you're done, simply check out. The resource becomes available for other students, and your usage is recorded.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Choose your portal to begin using the system
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/student">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                Student Portal
              </Button>
            </Link>
            <Link to="/admin">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-blue-700">
                Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
