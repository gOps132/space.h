import { Link } from "react-router";
import { BookOpen, Flame, Key, Feather, Clock, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { getFloorHeatmap } from "../data/enhancedMockData";
import { useState, useEffect } from "react";
import { ThemeToggle } from "./ui/ThemeToggle";
import { useTheme } from "next-themes";

export default function HiddenArchiveLanding() {
  const floorData = getFloorHeatmap();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="h-screen overflow-y-auto snap-y snap-mandatory scroll-smooth relative">
      {/* Global Grain/Noise Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] z-[100] bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />

      {/* Hero Section & Header - The Entryway */}
      <div className="h-screen flex flex-col snap-start shrink-0">
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
                <ThemeToggle />

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

        {/* Hero Content */}
        <section className="relative flex-1 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background/95 to-background/90 text-foreground">
          <div className="container mx-auto px-6 text-center relative z-10">
            <div className="max-w-4xl mx-auto">
              <h2
                className="text-7xl md:text-9xl mb-8 text-foreground leading-tight"
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
                  className="bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-ring/30 shadow-xl hover:shadow-2xl px-12 py-8 text-xl relative overflow-hidden group"
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

          <div className="absolute top-10 left-10 w-32 h-32 bg-foreground/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
        </section>
      </div>

      {/* The Latest Entry - Archive Chambers */}
      <section className="h-screen snap-start shrink-0 flex flex-col justify-center py-12 bg-gradient-to-b from-background via-background/95 to-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper.png')]" />

        <div className="absolute top-[15%] left-[-10%] w-[600px] h-[600px] bg-moss/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[25%] right-[-10%] w-[500px] h-[500px] bg-oxblood/10 rounded-full blur-[110px] pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-[50%] left-[20%] w-[300px] h-[300px] bg-candlelight/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10 overflow-y-auto max-h-full py-8 custom-scrollbar">
          <div className="text-center mb-10">
            <h2 className="text-5xl md:text-6xl text-foreground mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              The Archive's Chambers
            </h2>
            <div className="w-24 h-1 bg-primary/30 mx-auto mb-4 rounded-full" />
            <p className="text-xl text-muted-foreground italic" style={{ fontFamily: 'var(--font-script)', fontSize: '2rem' }}>
              A glimpse into our hallowed halls
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto pb-4">
            {floorData.map((floor) => (
              <Card
                key={floor.floor}
                className={`border-border/30 bg-gradient-to-br from-card/60 to-card/20 backdrop-blur-md relative overflow-hidden group hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-300 hover:-translate-y-2 ${floor.color === 'green' ? 'hover:border-moss/40 shadow-moss/5' :
                  floor.color === 'yellow' ? 'hover:border-candlelight/40 shadow-candlelight/5' :
                    'hover:border-destructive/40 shadow-destructive/5'
                  }`}
              >
                <div className={`absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${floor.color === 'green' ? 'bg-moss' : floor.color === 'yellow' ? 'bg-candlelight' : 'bg-destructive'
                  }`} />

                <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 transform rotate-45 translate-x-10 -translate-y-10 border-b border-l border-primary/20" />

                <CardContent className="p-8 relative">
                  <div className="text-center mb-6 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                    <div className="flex items-center justify-center gap-3 mb-4 relative z-10">
                      <div className={`p-3 rounded-2xl shadow-inner ${floor.color === 'green' ? 'bg-moss/10' : floor.color === 'yellow' ? 'bg-candlelight/10' : 'bg-destructive/10'
                        }`}>
                        <MapPin className={`h-6 w-6 ${floor.color === 'green' ? 'text-moss' : floor.color === 'yellow' ? 'text-candlelight' : 'text-destructive'
                          }`} />
                      </div>
                      <h3 className="text-3xl text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                        Level {floor.floor}
                      </h3>
                    </div>
                    <Badge
                      className={`${floor.color === 'green'
                        ? 'bg-moss/90 text-primary-foreground'
                        : floor.color === 'yellow'
                          ? 'bg-candlelight/90 text-walnut'
                          : 'bg-destructive/90 text-primary-foreground'
                        } border-none font-medium px-5 py-1.5 backdrop-blur-sm shadow-md flex-inline items-center gap-2`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current" />
                      {floor.status}
                    </Badge>
                  </div>

                  <div className="text-center mb-6 relative py-2">
                    <div className="text-5xl font-bold mb-2 tracking-tighter text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
                      {floor.occupancyRate.toFixed(0)}%
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
                      Archive Capacity
                    </p>
                    <div className="mt-4 w-full h-1 bg-border/20 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${floor.color === 'green' ? 'bg-moss' : floor.color === 'yellow' ? 'bg-candlelight' : 'bg-destructive'
                          }`}
                        style={{ width: `${floor.occupancyRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-border/40" />
                    <span className="text-border/60 text-lg">⚜</span>
                    <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-border/40" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 group-hover:border-moss/30 transition-colors">
                      <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest">Available</p>
                      <p className="text-3xl font-semibold text-moss">{floor.available}</p>
                    </div>
                    <div className="text-center p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 group-hover:border-destructive/30 transition-colors">
                      <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest">In Use</p>
                      <p className="text-3xl font-semibold text-destructive">{floor.occupied}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* The Curator's Choice */}
      <section className="h-screen snap-start shrink-0 flex flex-col justify-center py-24 bg-gradient-to-t from-background via-muted/10 to-background relative overflow-hidden">
        {/* Background Depth Layers */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute top-[10%] right-[5%] w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[5%] left-[-5%] w-[500px] h-[500px] bg-moss/5 rounded-full blur-[130px] pointer-events-none" />

        {/* Large Faint Watermark icon to fill center space */}
        {/* <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none">
          <Feather className="w-[600px] h-[600px] rotate-12" />
        </div> */}

        {/* Decorative Corner Ornaments */}
        <div className="absolute top-8 left-8 text-primary/20 text-4xl select-none">✥</div>
        <div className="absolute top-8 right-8 text-primary/20 text-4xl select-none">✥</div>
        <div className="absolute bottom-8 left-8 text-primary/20 text-4xl select-none">✥</div>
        <div className="absolute bottom-8 right-8 text-primary/20 text-4xl select-none">✥</div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-6xl md:text-7xl text-foreground mb-6" style={{ fontFamily: 'var(--font-heading)' }}>
              The Curator's Selections
            </h2>
            <div className="flex items-center gap-4 justify-center mb-6">
              <div className="h-px w-12 bg-primary/40" />
              <span className="text-primary/60">❦</span>
              <div className="h-px w-12 bg-primary/40" />
            </div>
            <p className="text-muted-foreground text-xl italic font-serif leading-relaxed" style={{ fontFamily: 'var(--font-script)', fontSize: '1.8rem' }}>
              Hand-picked sanctuaries for the forgotten, the brilliant, and the endlessly curious.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-7xl mx-auto">
            <Card className="bg-card/30 backdrop-blur-md border border-border/40 hover:border-primary/40 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] group relative overflow-hidden flex flex-col items-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
              <CardContent className="p-10 text-center relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-moss/20 rounded-2xl flex items-center justify-center mb-8 border border-moss/40 shadow-[0_0_30px_rgba(61,79,61,0.2)] group-hover:scale-105 transition-transform duration-300">
                  <MapPin className="w-10 h-10 text-moss drop-shadow-lg" />
                </div>
                <h3 className="text-3xl mb-4 text-foreground tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                  Real-Time Cartography
                </h3>
                <p className="text-muted-foreground leading-relaxed text-base">
                  Navigate our vast halls through living projections. Every desk's availability is revealed in the amber glow of the digital archive.
                </p>
                <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-primary text-sm font-mono tracking-widest">
                  EXPLORE ARCHIVE // 01
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/30 backdrop-blur-md border border-border/40 hover:border-primary/40 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] group relative overflow-hidden flex flex-col items-center">
              <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-transparent to-transparent pointer-events-none" />
              <CardContent className="p-10 text-center relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-destructive/20 rounded-2xl flex items-center justify-center mb-8 border border-destructive/40 shadow-[0_0_30px_rgba(139,30,30,0.2)] group-hover:scale-105 transition-transform duration-300">
                  <Clock className="w-10 h-10 text-destructive drop-shadow-lg" />
                </div>
                <h3 className="text-3xl mb-4 text-foreground tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                  Reserve Your Hours
                </h3>
                <p className="text-muted-foreground leading-relaxed text-base">
                  Secure your sanctuary before the rush. Book your preferred desk as the first dawn breaks or when the twilight falls.
                </p>
                <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-primary text-sm font-mono tracking-widest">
                  TIMEKEEPING // 02
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/30 backdrop-blur-md border border-border/40 hover:border-primary/40 transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] group relative overflow-hidden flex flex-col items-center">
              <div className="absolute inset-0 bg-gradient-to-br from-candlelight/5 via-transparent to-transparent pointer-events-none" />
              <CardContent className="p-10 text-center relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-candlelight/20 rounded-2xl flex items-center justify-center mb-8 border border-candlelight/40 shadow-[0_0_30px_rgba(232,195,94,0.2)] group-hover:scale-105 transition-transform duration-300">
                  <BookOpen className="w-10 h-10 text-walnut drop-shadow-md" />
                </div>
                <h3 className="text-3xl mb-4 text-foreground tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                  Private Chambers
                </h3>
                <p className="text-muted-foreground leading-relaxed text-base">
                  Gather your fellowship in specialized study rooms designed for profound collaboration among the leather-bound tomes.
                </p>
                <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-primary text-sm font-mono tracking-widest">
                  SANCTUARY // 03
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer - The Secret Key */}
      <footer className="h-screen snap-start shrink-0 bg-background text-foreground flex flex-col justify-center border-t border-border">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-12 mb-16">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center border border-ring/50 shadow-lg">
                  <BookOpen className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-3xl text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                  &lt;Space.h&gt;
                </span>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                In the quiet corners of learning, where dust motes dance in candlelight, we curate spaces for solitude.
              </p>
              <Link to="/about" className="text-primary hover:text-primary/80 font-medium flex items-center gap-2 group text-lg">
                <Key className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                Discover our chronicle →
              </Link>
            </div>

            <div>
              <h3 className="text-2xl mb-6 text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                Hours of Operation
              </h3>
              <p className="text-muted-foreground text-lg flex items-start gap-3">
                <Clock className="w-6 h-6 mt-1 flex-shrink-0 text-primary/50" />
                <span>
                  Mon-Fri: 7:00 AM - 11:00 PM<br />
                  Sat-Sun: 9:00 AM - 9:00 PM
                </span>
              </p>
            </div>

            <div>
              <h3 className="text-2xl mb-6 text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                Correspondence
              </h3>
              <div className="space-y-3 text-lg text-muted-foreground">
                <p>University Library, Central Plaza</p>
                <p className="hover:text-primary transition-colors cursor-pointer">archive@university.edu</p>
                <p>(555) 123-4567</p>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-border/50 text-center">
            <p className="text-muted-foreground/60 text-base" style={{ fontFamily: 'var(--font-mono)' }}>
              © MMXXVI &lt;Space.h&gt;. All tomes preserved in the vault of time.
            </p>
            <Link to="/about" className="inline-block mt-8 opacity-20 hover:opacity-100 transition-all hover:scale-125">
              <Key className="h-6 w-6 text-accent" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}