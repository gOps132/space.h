"use client";

import { useTheme } from "next-themes";
import { Flame } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="p-2 w-9 h-9" />;
    }

    const isDark = theme === "dark";

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="p-2 hover:scale-110 transition-transform focus:outline-none"
            title={isDark ? "Light the candle" : "Dim the lights"}
            aria-label="Toggle theme"
        >
            <Flame
                className={`w-5 h-5 transition-colors ${isDark ? 'text-primary animate-pulse' : 'text-primary'
                    }`}
            />
        </button>
    );
}
