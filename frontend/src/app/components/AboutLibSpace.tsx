import { Link } from "react-router";
import { ArrowLeft, BookOpen, Users, Zap, Shield, Calendar, BarChart3 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import BusinessRulesInfo from "./BusinessRulesInfo";
import { ThemeToggle } from "./ui/ThemeToggle";

export default function AboutLibSpace() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-primary shadow-sm" />
              <h1 className="text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>About &lt;Space.h&gt;</h1>
            </div>
            <div className="flex-1 flex justify-end">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-5xl px-6 py-12">
        {/* Introduction */}
        <section className="mb-12">
          <h2 className="text-4xl mb-6 text-primary" style={{ fontFamily: 'var(--font-heading)' }}>The Pain Point</h2>
          <Card className="academic-border bg-card shadow-sm">
            <CardContent className="pt-8">
              <h3 className="text-2xl font-medium mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Inefficient Library Space Utilization</h3>
              <p className="text-muted-foreground leading-relaxed">
                During peak periods (midterms and finals), students spend significant time wandering through different
                floors of the library to find an available seat or a vacant group study room. This results in wasted
                study time, overcrowding in certain zones while others remain underutilized, and frequent conflicts over
                "saved" seats (leaving a bag to claim a desk for hours).
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Solution */}
        <section className="mb-16">
          <h2 className="text-4xl mb-6 text-primary" style={{ fontFamily: 'var(--font-heading)' }}>The Solution</h2>
          <Card className="academic-border bg-card shadow-sm">
            <CardContent className="pt-8">
              <h3 className="text-3xl font-medium mb-4 text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                &lt;Space.h&gt;: A Real-Time Seat & Room Reservation App
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                A web-based platform that allows students to view a live map of the library, check real-time availability
                of individual desks and group study rooms, and reserve them in advance. The system uses a Check-in/Check-out
                mechanism to ensure that "ghost bookings" (reserved but empty seats) are automatically released for others to use.
              </p>
              <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-6">
                <p className="text-sm leading-relaxed italic">
                  <span className="font-bold text-primary mr-1">The Name:</span> In C programming, header files (libraries) end with ".h";
                  so &lt;Space.h&gt; is both a library space and a programming library. A clever nod to the fusion of code and knowledge.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Target Users */}
        <section className="mb-16">
          <h2 className="text-4xl mb-6 text-primary" style={{ fontFamily: 'var(--font-heading)' }}>Target Users</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="academic-border bg-card shadow-sm transition-colors hover:bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-3" style={{ fontFamily: 'var(--font-heading)' }}>
                  <Users className="h-6 w-6 text-muted-foreground" />
                  Guest User
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Can view the real-time occupancy "Heatmap" of the library but cannot make reservations.
                </p>
              </CardContent>
            </Card>

            <Card className="academic-border bg-card shadow-sm transition-colors hover:bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-3" style={{ fontFamily: 'var(--font-heading)' }}>
                  <BookOpen className="h-6 w-6 text-primary" />
                  Student User
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Can search for available seats, book a slot, and check in/out to track their usage.
                </p>
              </CardContent>
            </Card>

            <Card className="academic-border bg-card shadow-sm transition-colors hover:bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-3" style={{ fontFamily: 'var(--font-heading)' }}>
                  <Shield className="h-6 w-6 text-accent" />
                  Faculty User
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Has priority access to reserve large Group Study Rooms for department meetings or consultations.
                </p>
              </CardContent>
            </Card>

            <Card className="academic-border bg-card shadow-sm transition-colors hover:bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-3" style={{ fontFamily: 'var(--font-heading)' }}>
                  <BarChart3 className="h-6 w-6 text-primary" />
                  Admin (Library Staff)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
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
                <p className="text-muted-foreground">
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
                <p className="text-muted-foreground">
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
                <p className="text-muted-foreground">
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
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• React 18 with TypeScript</li>
                    <li>• React Router for navigation</li>
                    <li>• Tailwind CSS v4 for styling</li>
                    <li>• Recharts for data visualization</li>
                    <li>• Radix UI components</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Features</h3>
                  <ul className="space-y-1 text-muted-foreground">
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
        <section className="mb-24">
          <h2 className="text-4xl mb-8 text-center text-primary" style={{ fontFamily: 'var(--font-heading)' }}>Explore the Portals</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link to="/student" className="group">
              <Card className="academic-border h-full bg-card shadow-sm transition-colors duration-200 hover:border-primary/40 hover:bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                    <BookOpen className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    Student Portal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">Browse resources, make bookings, and manage your private study sessions</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/faculty" className="group">
              <Card className="academic-border h-full bg-card shadow-sm transition-colors duration-200 hover:border-accent/40 hover:bg-accent/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-accent" style={{ fontFamily: 'var(--font-heading)' }}>
                    <Shield className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    Faculty Portal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">Priority access to meeting rooms and exclusive academic chambers</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin" className="group">
              <Card className="academic-border h-full bg-card shadow-sm transition-colors duration-200 hover:border-primary/40 hover:bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                    <BarChart3 className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    Admin Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">Total oversight: manage resources, view analytics, and curator controls</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
