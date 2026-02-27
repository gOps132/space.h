import { Link } from "react-router";
import { BookOpen, LogIn, UserPlus, MapPin, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { getFloorHeatmap } from "../data/enhancedMockData";

export default function GuestLanding() {
  const floorData = getFloorHeatmap();
  const libraryHours = "Mon-Fri: 7:00 AM - 11:00 PM | Sat-Sun: 9:00 AM - 9:00 PM";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl">LibSpace</h1>
            </div>
            <div className="flex gap-3">
              <Link to="/login">
                <Button variant="outline">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Portal Access (Demo) */}
      <div className="bg-blue-50 border-b border-blue-200 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className="text-sm text-gray-600">Quick Access (Demo):</span>
            <Link to="/student">
              <Button size="sm" variant="outline">Student Portal</Button>
            </Link>
            <Link to="/faculty">
              <Button size="sm" variant="outline">Faculty Portal</Button>
            </Link>
            <Link to="/admin">
              <Button size="sm" variant="outline">Admin Portal</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl mb-4">Welcome to LibSpace</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Real-time library space management. Find your perfect study spot in seconds.
          </p>
          <Link to="/login">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              Want to study here? Log in to reserve your spot
            </Button>
          </Link>
        </div>
      </section>

      {/* Live Heatmap Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl mb-3">Live Library Heatmap</h2>
            <p className="text-gray-600">Real-time availability across all floors</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {floorData.map((floor) => (
              <Card
                key={floor.floor}
                className={`border-2 ${
                  floor.color === 'green'
                    ? 'border-green-500 bg-green-50'
                    : floor.color === 'yellow'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-red-500 bg-red-50'
                }`}
              >
                <CardHeader className="text-center pb-3">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <MapPin className="h-5 w-5" />
                    <CardTitle className="text-2xl">Floor {floor.floor}</CardTitle>
                  </div>
                  <Badge
                    className={`${
                      floor.color === 'green'
                        ? 'bg-green-600'
                        : floor.color === 'yellow'
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    } text-white`}
                  >
                    {floor.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">{floor.occupancyRate.toFixed(0)}%</div>
                    <p className="text-sm text-gray-600">Occupancy Rate</p>
                  </div>

                  {/* Visual Bar */}
                  <div className="h-8 bg-gray-200 rounded-full overflow-hidden mb-4">
                    <div
                      className={`h-full transition-all ${
                        floor.color === 'green'
                          ? 'bg-green-600'
                          : floor.color === 'yellow'
                          ? 'bg-yellow-600'
                          : 'bg-red-600'
                      }`}
                      style={{ width: `${floor.occupancyRate}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Available</p>
                      <p className="text-xl font-medium text-green-700">{floor.available}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Occupied</p>
                      <p className="text-xl font-medium text-red-700">{floor.occupied}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Want to reserve a seat?</p>
            <Link to="/login">
              <Button size="lg">
                Login to Book Your Spot
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl mb-12">Why Choose LibSpace?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Real-Time Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  See exactly which seats are available right now. No more wandering through floors.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Reserve in Advance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Book your favorite study spot up to 24 hours in advance. Never miss out during peak times.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Group Study Rooms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Coordinate with your study group and reserve private rooms for collaborative work.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-6 h-6" />
                <span className="text-xl">LibSpace</span>
              </div>
              <p className="text-gray-400 text-sm">
                Making library spaces accessible and efficient for everyone.
              </p>
              <Link to="/about" className="text-blue-400 hover:text-blue-300 text-sm block mt-2">
                Learn more about LibSpace →
              </Link>
            </div>
            <div>
              <h3 className="font-medium mb-4">Library Hours</h3>
              <p className="text-gray-400 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {libraryHours}
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-4">Contact</h3>
              <p className="text-gray-400 text-sm">University Library</p>
              <p className="text-gray-400 text-sm">library@university.edu</p>
              <p className="text-gray-400 text-sm">(555) 123-4567</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            <p>&copy; 2026 LibSpace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}