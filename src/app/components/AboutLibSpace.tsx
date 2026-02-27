import { Link } from "react-router";
import { ArrowLeft, BookOpen, Users, Zap, Shield, Calendar, BarChart3 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import BusinessRulesInfo from "./BusinessRulesInfo";

export default function AboutLibSpace() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl">About &lt;Space.h&gt;</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Introduction */}
        <section className="mb-12">
          <h2 className="text-3xl mb-4">The Pain Point</h2>
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-xl font-medium mb-3">Inefficient Library Space Utilization</h3>
              <p className="text-gray-700 leading-relaxed">
                During peak periods (midterms and finals), students spend significant time wandering through different 
                floors of the library to find an available seat or a vacant group study room. This results in wasted 
                study time, overcrowding in certain zones while others remain underutilized, and frequent conflicts over 
                "saved" seats (leaving a bag to claim a desk for hours).
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Solution */}
        <section className="mb-12">
          <h2 className="text-3xl mb-4">The Solution</h2>
          <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-medium mb-3 text-blue-900">
                &lt;Space.h&gt; – A Real-Time Seat & Room Reservation App
              </h3>
              <p className="text-gray-700 leading-relaxed">
                A web-based platform that allows students to view a live map of the library, check real-time availability 
                of individual desks and group study rooms, and reserve them in advance. The system uses a Check-in/Check-out 
                mechanism to ensure that "ghost bookings" (reserved but empty seats) are automatically released for others to use.
              </p>
              <div className="mt-4 p-4 bg-walnut/5 rounded border border-walnut/20">
                <p className="text-sm text-walnut/80 italic">
                  <strong>💡 The Name:</strong> In C programming, header files (libraries) end with ".h" — 
                  so &lt;Space.h&gt; is both a library space and a programming library. A clever nod to the fusion of code and knowledge.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Target Users */}
        <section className="mb-12">
          <h2 className="text-3xl mb-4">Target Users</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-600" />
                  Guest User
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Can view the real-time occupancy "Heatmap" of the library but cannot make reservations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Student User
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Can search for available seats, book a slot, and check in/out to track their usage.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Faculty User
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Has priority access to reserve large Group Study Rooms for department meetings or consultations.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Admin (Library Staff)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Manages the physical layout (CRUD resources), monitors usage, and handles reports of "occupied but empty" seats.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-12">
          <h2 className="text-3xl mb-4">Key Features</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Transaction 1: Booking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  A Student creates a RESERVATION_TRANSACTION record, which updates the STUDY_RESOURCE status to "Reserved." 
                  The system validates availability, prevents overlaps, enforces time limits, and manages group bookings.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Transaction 2: Check-in/Check-out
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  The system updates the RESERVATION_TRANSACTION to "Active" and creates an ATTENDANCE_LOG_TRANSACTION entry 
                  to record the exact usage time. Check-out releases the resource and prevents penalties.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Admin Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  The Admin landing page pulls data from all entities to calculate the occupancy rate, peak hours, 
                  zone performance, and system health. Includes CRUD operations for managing library resources.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Business Rules */}
        <section className="mb-12">
          <BusinessRulesInfo />
        </section>

        {/* Technology Stack */}
        <section className="mb-12">
          <h2 className="text-3xl mb-4">Technology Stack</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Frontend</h3>
                  <ul className="space-y-1 text-gray-600">
                    <li>• React 18 with TypeScript</li>
                    <li>• React Router for navigation</li>
                    <li>• Tailwind CSS v4 for styling</li>
                    <li>• Recharts for data visualization</li>
                    <li>• Radix UI components</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Features</h3>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Real-time heatmap visualization</li>
                    <li>• Complete CRUD operations</li>
                    <li>• Business rule validation</li>
                    <li>• Transaction management</li>
                    <li>• Analytics dashboard</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Portal Links */}
        <section className="mb-12">
          <h2 className="text-3xl mb-4">Explore the Portals</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link to="/student">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <BookOpen className="h-5 w-5" />
                    Student Portal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Browse resources, make bookings, and manage your reservations</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/faculty">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-600">
                    <Shield className="h-5 w-5" />
                    Faculty Portal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Priority access to meeting rooms and consultation spaces</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <BarChart3 className="h-5 w-5" />
                    Admin Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Manage resources, view analytics, and monitor system health</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}