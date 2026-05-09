import { Link } from "react-router";
import { ArrowLeft, BookOpen, Users, Zap, Shield, Calendar, BarChart3 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import BusinessRulesInfo from "./BusinessRulesInfo";

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
                Back Home
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-primary shadow-sm" />
              <h1 className="text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>About &lt;Space.h&gt;</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-5xl px-6 py-12">
        {/* Introduction */}
        <section className="mb-12">
          <h2 className="text-4xl mb-6 text-primary" style={{ fontFamily: 'var(--font-heading)' }}>Why Space.h Exists</h2>
          <Card className="academic-border bg-card shadow-sm">
            <CardContent className="pt-8">
              <h3 className="text-2xl font-medium mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Less searching, more studying</h3>
              <p className="text-muted-foreground leading-relaxed">
                During midterms and finals, open seats disappear quickly. Space.h shows which desks and rooms are
                available before students walk every floor of the library.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Solution */}
        <section className="mb-16">
          <h2 className="text-4xl mb-6 text-primary" style={{ fontFamily: 'var(--font-heading)' }}>How It Helps</h2>
          <Card className="academic-border bg-card shadow-sm">
            <CardContent className="pt-8">
              <h3 className="text-3xl font-medium mb-4 text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                Live reservations for seats and rooms
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Students can find open spaces, reserve a time, check in when they arrive, and check out when they leave.
                Unused reservations are released so the next person can use the space.
              </p>
              <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-6">
                <p className="text-sm leading-relaxed italic">
                  <span className="font-bold text-primary mr-1">About the name:</span> In C programming, library headers end in ".h".
                  Space.h points to both library space and a small library of rules that keep it fair.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Target Users */}
        <section className="mb-16">
          <h2 className="text-4xl mb-6 text-primary" style={{ fontFamily: 'var(--font-heading)' }}>Who Uses It</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="academic-border bg-card shadow-sm transition-colors hover:bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-3" style={{ fontFamily: 'var(--font-heading)' }}>
                  <Users className="h-6 w-6 text-muted-foreground" />
                  Guests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  View current availability before visiting the library.
                </p>
              </CardContent>
            </Card>

            <Card className="academic-border bg-card shadow-sm transition-colors hover:bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-3" style={{ fontFamily: 'var(--font-heading)' }}>
                  <BookOpen className="h-6 w-6 text-primary" />
                  Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Find seats, reserve rooms, check in, and check out.
                </p>
              </CardContent>
            </Card>

            <Card className="academic-border bg-card shadow-sm transition-colors hover:bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-3" style={{ fontFamily: 'var(--font-heading)' }}>
                  <Shield className="h-6 w-6 text-accent" />
                  Faculty
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Reserve consultation and research rooms for student meetings.
                </p>
              </CardContent>
            </Card>

            <Card className="academic-border bg-card shadow-sm transition-colors hover:bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-3" style={{ fontFamily: 'var(--font-heading)' }}>
                  <BarChart3 className="h-6 w-6 text-primary" />
                  Library Staff
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Monitor occupancy, update room status, and release unused bookings.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-12">
          <h2 className="text-3xl mb-4">What You Can Do</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Reserve a Space
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Choose an available seat or room, pick a time, and confirm the reservation before someone else takes it.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Check In and Out
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Check in when you arrive. Check out when you leave so the space can return to availability.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Staff Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Staff can see occupancy, peak hours, maintenance needs, and the current status of each space.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Business Rules */}
        <section className="mb-12">
          <BusinessRulesInfo />
        </section>

        {/* Support */}
        <section className="mb-12">
          <h2 className="text-3xl mb-4">Need Help?</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Students and Guests</h3>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Ask the library desk for account access.</li>
                    <li>• Report seats that look available but are occupied.</li>
                    <li>• Check out before leaving to avoid a booking hold.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Faculty and Staff</h3>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Contact the library desk for room setup needs.</li>
                    <li>• Mark rooms under maintenance when they are unavailable.</li>
                    <li>• Use occupancy reports to plan busy hours.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Portal Links */}
        <section className="mb-24">
          <h2 className="text-4xl mb-8 text-center text-primary" style={{ fontFamily: 'var(--font-heading)' }}>Open a Workspace</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link to="/student" className="group">
              <Card className="academic-border h-full bg-card shadow-sm transition-colors duration-200 hover:border-primary/40 hover:bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                    <BookOpen className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    Student Reservations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">Find a seat, reserve a room, and manage your check-ins.</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/faculty" className="group">
              <Card className="academic-border h-full bg-card shadow-sm transition-colors duration-200 hover:border-accent/40 hover:bg-accent/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-accent" style={{ fontFamily: 'var(--font-heading)' }}>
                    <Shield className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    Faculty Rooms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">Reserve rooms for consultations, meetings, and research work.</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin" className="group">
              <Card className="academic-border h-full bg-card shadow-sm transition-colors duration-200 hover:border-primary/40 hover:bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                    <BarChart3 className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    Library Operations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">Manage spaces, view occupancy, and update maintenance status.</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
