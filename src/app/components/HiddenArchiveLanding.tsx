import { Link } from "react-router";
import { BookOpen, Flame, Key, Feather, Clock, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { getFloorHeatmap } from "../data/enhancedMockData";
import { useState } from "react";

export default function HiddenArchiveLanding() {
  const floorData = getFloorHeatmap();
  const [candleLit, setCandleLit] = useState(true);

  return (
    <div className={`min-h-screen ${candleLit ? '' : 'dark'}`}>
      {/* Header - The Entryway */}
      <header className="bg-background text-foreground shadow-sm sticky top-0 z-50 border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Wax Seal Logo */}
              <div className="relative w-12 h-12 bg-primary rounded-full flex items-center justify-center border-2 border-ring/50 shadow-sm">
                <BookOpen className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl text-primary tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>
                  &lt;Space.h&gt;
                </h1>
                <p className="text-xs text-muted-foreground italic" style={{ fontFamily: 'var(--font-script)' }}>
                  A sanctuary for the curious mind
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Candle Toggle */}
              <button
                onClick={() => setCandleLit(!candleLit)}
                className="p-2 hover:scale-110 transition-transform"
                title={candleLit ? "Dim the lights" : "Light the candle"}
              >
                <Flame className={`w-5 h-5 ${candleLit ? 'text-candlelight animate-pulse' : 'text-muted-foreground'}`} />
              </button>

              <Link to="/login">
                <Button
                  variant="outline"
                  className="border-border text-foreground hover:bg-muted hover:text-primary border"
                >
                  <Key className="mr-2 h-4 w-4" />
                  Enter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Portal Access - Styled as old catalog cards */}
      <div className="bg-background/80 backdrop-blur-md border-b border-border py-3">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/student">
              <Button
                size="sm"
                variant="ghost"
                className="text-foreground hover:text-primary hover:bg-muted border border-transparent hover:border-border transition-colors"
              >
                <Feather className="mr-2 h-3 w-3" />
                Scholar's Desk
              </Button>
            </Link>
            <Link to="/faculty">
              <Button
                size="sm"
                variant="ghost"
                className="text-foreground hover:text-primary hover:bg-muted border border-transparent hover:border-border transition-colors"
              >
                Curator's Chamber
              </Button>
            </Link>
            <Link to="/admin">
              <Button
                size="sm"
                variant="ghost"
                className="text-foreground hover:text-primary hover:bg-muted border border-transparent hover:border-border transition-colors"
              >
                The Archive Master
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section - The Reading Nook */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-b from-background via-background/95 to-background/90 text-foreground">
        {/* Atmospheric overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(232,195,94,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(122,29,29,0.1),transparent_50%)]" />

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-6xl md:text-7xl mb-6 text-foreground leading-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Lost in the <span className="text-primary">Ink</span>.
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
              In the quiet corners of learning, where dust motes dance in candlelight,
              we curate spaces for those who seek knowledge in solitude.
            </p>
            <Link to="/student">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-ring/30 shadow-xl hover:shadow-2xl px-8 py-6 text-lg relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-accent/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                <span className="relative flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Reserve Your Sanctuary
                </span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative ink spots */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-foreground/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
      </section>

      {/* The Latest Entry - Open Book Style */}
      <section className="py-16 bg-gradient-to-b from-background/90 to-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl text-foreground mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              The Archive's Chambers
            </h2>
            <p className="text-lg text-muted-foreground italic" style={{ fontFamily: 'var(--font-script)', fontSize: '1.5rem' }}>
              A glimpse into our hallowed halls
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {floorData.map((floor) => (
              <Card
                key={floor.floor}
                className={`border-2 bg-card backdrop-blur-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${floor.color === 'green' ? 'border-moss' : floor.color === 'yellow' ? 'border-candlelight' : 'border-destructive'
                  }`}
              >
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-accent/10 transform rotate-45 translate-x-8 -translate-y-8" />

                <CardContent className="p-6 relative">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <MapPin className="h-5 w-5 text-foreground" />
                      <h3 className="text-2xl text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                        Level {floor.floor}
                      </h3>
                    </div>
                    <Badge
                      className={`${floor.color === 'green'
                        ? 'bg-moss text-primary-foreground'
                        : floor.color === 'yellow'
                          ? 'bg-candlelight text-walnut'
                          : 'bg-destructive text-primary-foreground'
                        } border-none font-medium px-4 py-1`}
                    >
                      {floor.status}
                    </Badge>
                  </div>

                  {/* Occupancy percentage */}
                  <div className="text-center mb-6">
                    <div className="text-5xl mb-2 text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                      {floor.occupancyRate.toFixed(0)}%
                    </div>
                    <p className="text-sm text-foreground/60 uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono)' }}>
                      Occupied
                    </p>
                  </div>

                  {/* Decorative divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6" />

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Available</p>
                      <p className="text-2xl font-medium text-moss">{floor.available}</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded border border-border">
                      <p className="text-xs text-muted-foreground mb-1">In Use</p>
                      <p className="text-2xl font-medium text-destructive">{floor.occupied}</p>
                    </div>
                  </div>

                  {/* Vintage ornament */}
                  <div className="mt-4 text-center text-muted-foreground/40 text-2xl">❦</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-foreground/70 mb-4 italic">Seek your corner of quietude?</p>
            <Link to="/student">
              <Button
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground border border-ring/30"
              >
                <Key className="mr-2 h-4 w-4" />
                Claim Your Desk
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* The Curator's Choice */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl text-foreground mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              The Curator's Selections
            </h2>
            <p className="text-muted-foreground">Curating spaces for the forgotten and curious</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="bg-card border-2 border-border hover:border-ring/50 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-moss/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-moss/30">
                  <MapPin className="w-8 h-8 text-moss" />
                </div>
                <h3 className="text-xl mb-3 text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                  Real-Time Cartography
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  Navigate our halls through living maps. Each chamber's availability revealed in the glow of candlelight.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-2 border-border hover:border-ring/50 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-destructive/30">
                  <Clock className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="text-xl mb-3 text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                  Reserve Your Hours
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  Secure your sanctuary before the rush. Book your preferred desk as dawn breaks or twilight falls.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-2 border-border hover:border-ring/50 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-ring/40">
                  <BookOpen className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl mb-3 text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                  Private Chambers
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  Gather your fellowship in study rooms designed for collaboration among the leather-bound tomes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer - The Secret Key */}
      <footer className="bg-background text-foreground py-12 border-t border-border mt-auto">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center border border-ring/50">
                  <BookOpen className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-xl text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                  &lt;Space.h&gt;
                </span>
              </div>
              <p className="text-muted-foreground/80 text-sm leading-relaxed mb-3">
                A Real-Time Seat & Room Reservation App
              </p>
              <Link to="/about" className="text-primary hover:text-primary/80 text-sm flex items-center gap-2 group">
                <Key className="h-3 w-3 group-hover:rotate-12 transition-transform" />
                Discover our chronicle →
              </Link>
            </div>

            <div>
              <h3 className="font-medium mb-4 text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                Hours of Operation
              </h3>
              <p className="text-muted-foreground text-sm flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Mon-Fri: 7:00 AM - 11:00 PM<br />
                  Sat-Sun: 9:00 AM - 9:00 PM
                </span>
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-4 text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                Correspondence
              </h3>
              <p className="text-muted-foreground text-sm">University Library</p>
              <p className="text-muted-foreground text-sm">archive@university.edu</p>
              <p className="text-muted-foreground text-sm">(555) 123-4567</p>
            </div>
          </div>

          <div className="pt-8 border-t border-border text-center">
            <p className="text-muted-foreground/60 text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
              © MMXXVI &lt;Space.h&gt;. All tomes preserved.
            </p>
            {/* The Hidden Shelf - Easter Egg */}
            <Link to="/about" className="inline-block mt-4 opacity-30 hover:opacity-100 transition-opacity">
              <Key className="h-4 w-4 text-accent" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}