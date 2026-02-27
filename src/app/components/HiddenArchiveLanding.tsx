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
      <header className="bg-walnut text-parchment shadow-2xl sticky top-0 z-50 border-b-2 border-candlelight/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Wax Seal Logo */}
              <div className="relative w-12 h-12 bg-oxblood rounded-full flex items-center justify-center border-2 border-candlelight/50 shadow-lg">
                <BookOpen className="w-6 h-6 text-candlelight" />
              </div>
              <div>
                <h1 className="text-2xl text-candlelight tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>
                  &lt;Space.h&gt;
                </h1>
                <p className="text-xs text-parchment/60 italic" style={{ fontFamily: 'var(--font-script)' }}>
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
                  className="border-parchment/30 text-parchment hover:bg-parchment/10 hover:text-candlelight border-2"
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
      <div className="bg-walnut/50 backdrop-blur-sm border-y border-parchment/20 py-3">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/student">
              <Button
                size="sm"
                variant="ghost"
                className="text-parchment hover:text-candlelight hover:bg-parchment/10 border border-parchment/20"
              >
                <Feather className="mr-2 h-3 w-3" />
                Scholar's Desk
              </Button>
            </Link>
            <Link to="/faculty">
              <Button
                size="sm"
                variant="ghost"
                className="text-parchment hover:text-candlelight hover:bg-parchment/10 border border-parchment/20"
              >
                Curator's Chamber
              </Button>
            </Link>
            <Link to="/admin">
              <Button
                size="sm"
                variant="ghost"
                className="text-parchment hover:text-candlelight hover:bg-parchment/10 border border-parchment/20"
              >
                The Archive Master
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section - The Reading Nook */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-b from-walnut via-walnut/95 to-walnut/90">
        {/* Atmospheric overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(232,195,94,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(122,29,29,0.1),transparent_50%)]" />

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-6xl md:text-7xl mb-6 text-parchment leading-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Lost in the <span className="text-candlelight">Ink</span>.
            </h2>
            <p className="text-xl text-parchment/80 mb-8 leading-relaxed max-w-2xl mx-auto">
              In the quiet corners of learning, where dust motes dance in candlelight,
              we curate spaces for those who seek knowledge in solitude.
            </p>
            <Link to="/student">
              <Button
                size="lg"
                className="bg-oxblood hover:bg-oxblood/90 text-parchment border-2 border-candlelight/30 shadow-xl hover:shadow-2xl px-8 py-6 text-lg relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-candlelight/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                <span className="relative flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Reserve Your Sanctuary
                </span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative ink spots */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-walnut/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-oxblood/20 rounded-full blur-3xl" />
      </section>

      {/* The Latest Entry - Open Book Style */}
      <section className="py-16 bg-gradient-to-b from-walnut/90 to-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl text-walnut mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              The Archive's Chambers
            </h2>
            <p className="text-lg text-walnut/70 italic" style={{ fontFamily: 'var(--font-script)', fontSize: '1.5rem' }}>
              A glimpse into our hallowed halls
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {floorData.map((floor) => (
              <Card
                key={floor.floor}
                className="border-2 bg-parchment/95 backdrop-blur-sm relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                style={{
                  borderColor: floor.color === 'green' ? '#3D4F3D' : floor.color === 'yellow' ? '#E8C35E' : '#7A1D1D',
                }}
              >
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-candlelight/10 transform rotate-45 translate-x-8 -translate-y-8" />

                <CardContent className="p-6 relative">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <MapPin className="h-5 w-5 text-walnut" />
                      <h3 className="text-2xl text-walnut" style={{ fontFamily: 'var(--font-heading)' }}>
                        Level {floor.floor}
                      </h3>
                    </div>
                    <Badge
                      className={`${floor.color === 'green'
                        ? 'bg-moss text-parchment'
                        : floor.color === 'yellow'
                          ? 'bg-candlelight text-walnut'
                          : 'bg-oxblood text-parchment'
                        } border-none font-medium px-4 py-1`}
                    >
                      {floor.status}
                    </Badge>
                  </div>

                  {/* Occupancy percentage */}
                  <div className="text-center mb-6">
                    <div className="text-5xl mb-2 text-walnut" style={{ fontFamily: 'var(--font-heading)' }}>
                      {floor.occupancyRate.toFixed(0)}%
                    </div>
                    <p className="text-sm text-walnut/60 uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono)' }}>
                      Occupied
                    </p>
                  </div>

                  {/* Decorative divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-walnut/30 to-transparent mb-6" />

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-moss/10 rounded border border-moss/20">
                      <p className="text-xs text-walnut/60 mb-1">Available</p>
                      <p className="text-2xl font-medium text-moss">{floor.available}</p>
                    </div>
                    <div className="text-center p-3 bg-oxblood/10 rounded border border-oxblood/20">
                      <p className="text-xs text-walnut/60 mb-1">In Use</p>
                      <p className="text-2xl font-medium text-oxblood">{floor.occupied}</p>
                    </div>
                  </div>

                  {/* Vintage ornament */}
                  <div className="mt-4 text-center text-candlelight/40 text-2xl">❦</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-walnut/70 mb-4 italic">Seek your corner of quietude?</p>
            <Link to="/student">
              <Button
                size="lg"
                className="bg-moss hover:bg-moss/90 text-parchment border border-candlelight/30"
              >
                <Key className="mr-2 h-4 w-4" />
                Claim Your Desk
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* The Curator's Choice */}
      <section className="py-16 bg-walnut/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl text-walnut mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              The Curator's Selections
            </h2>
            <p className="text-walnut/60">Curating spaces for the forgotten and curious</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="bg-parchment/90 border-2 border-walnut/20 hover:border-candlelight/50 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-moss/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-moss/30">
                  <MapPin className="w-8 h-8 text-moss" />
                </div>
                <h3 className="text-xl mb-3 text-walnut" style={{ fontFamily: 'var(--font-heading)' }}>
                  Real-Time Cartography
                </h3>
                <p className="text-walnut/70 leading-relaxed text-sm">
                  Navigate our halls through living maps. Each chamber's availability revealed in the glow of candlelight.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-parchment/90 border-2 border-walnut/20 hover:border-candlelight/50 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-oxblood/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-oxblood/30">
                  <Clock className="w-8 h-8 text-oxblood" />
                </div>
                <h3 className="text-xl mb-3 text-walnut" style={{ fontFamily: 'var(--font-heading)' }}>
                  Reserve Your Hours
                </h3>
                <p className="text-walnut/70 leading-relaxed text-sm">
                  Secure your sanctuary before the rush. Book your preferred desk as dawn breaks or twilight falls.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-parchment/90 border-2 border-walnut/20 hover:border-candlelight/50 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-candlelight/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-candlelight/40">
                  <BookOpen className="w-8 h-8 text-candlelight" />
                </div>
                <h3 className="text-xl mb-3 text-walnut" style={{ fontFamily: 'var(--font-heading)' }}>
                  Private Chambers
                </h3>
                <p className="text-walnut/70 leading-relaxed text-sm">
                  Gather your fellowship in study rooms designed for collaboration among the leather-bound tomes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer - The Secret Key */}
      <footer className="bg-walnut text-parchment py-12 border-t-2 border-candlelight/20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-oxblood rounded-full flex items-center justify-center border border-candlelight/50">
                  <BookOpen className="w-4 h-4 text-candlelight" />
                </div>
                <span className="text-xl text-candlelight" style={{ fontFamily: 'var(--font-heading)' }}>
                  &lt;Space.h&gt;
                </span>
              </div>
              <p className="text-parchment/60 text-sm leading-relaxed mb-3">
                A Real-Time Seat & Room Reservation App
              </p>
              <Link to="/about" className="text-candlelight hover:text-candlelight/80 text-sm flex items-center gap-2 group">
                <Key className="h-3 w-3 group-hover:rotate-12 transition-transform" />
                Discover our chronicle →
              </Link>
            </div>

            <div>
              <h3 className="font-medium mb-4 text-candlelight" style={{ fontFamily: 'var(--font-heading)' }}>
                Hours of Operation
              </h3>
              <p className="text-parchment/70 text-sm flex items-start gap-2">
                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Mon-Fri: 7:00 AM - 11:00 PM<br />
                  Sat-Sun: 9:00 AM - 9:00 PM
                </span>
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-4 text-candlelight" style={{ fontFamily: 'var(--font-heading)' }}>
                Correspondence
              </h3>
              <p className="text-parchment/70 text-sm">University Library</p>
              <p className="text-parchment/70 text-sm">archive@university.edu</p>
              <p className="text-parchment/70 text-sm">(555) 123-4567</p>
            </div>
          </div>

          <div className="pt-8 border-t border-parchment/20 text-center">
            <p className="text-parchment/50 text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
              © MMXXVI &lt;Space.h&gt;. All tomes preserved.
            </p>
            {/* The Hidden Shelf - Easter Egg */}
            <Link to="/about" className="inline-block mt-4 opacity-30 hover:opacity-100 transition-opacity">
              <Key className="h-4 w-4 text-candlelight" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}