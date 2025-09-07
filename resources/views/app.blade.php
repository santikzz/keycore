<!DOCTYPE html>
{{-- <html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])> --}}
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">



        <meta name="robots" content="index, follow" />
        <meta name="author" content="SKYNETAIM" />
        <meta name="description" content="SKYNETAIM - Premium gaming enhancement software with advanced aimbot, wallhack, ESP features. Starting at $5 with joystick support, MAKCU compatibility, kernel drivers, and unique exploits. Zero historical bans, 1PC/2PC compatible." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://skynetaim.pro/" />
        <meta property="og:title" content="SKYNETAIM - Premium Gaming Enhancement | Aimbot, Wallhack & ESP from $5" />
        <meta property="og:description" content="SKYNETAIM offers premium gaming enhancement software with advanced aimbot, wallhack, ESP. Basic edition from $5, Pro from $6, Elite with unique builds. Joystick & MAKCU support, kernel drivers, zero bans." />
        <meta property="og:image" content="https://skynetaim.pro/assets/skynetaim-banner.jpg" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://skynetaim.pro/" />
        <meta property="twitter:title" content="SKYNETAIM - Premium Gaming Enhancement | Aimbot, Wallhack & ESP from $5" />
        <meta property="twitter:description" content="SKYNETAIM offers premium gaming enhancement software with advanced aimbot, wallhack, ESP. Basic edition from $5, Pro from $6, Elite with unique builds. Joystick & MAKCU support, kernel drivers, zero bans." />
        <meta property="twitter:image" content="https://skynetaim.pro/assets/skynetaim-banner.jpg" />
        <meta name="keywords" content="hack, cheat, aimbot, wallhack, ESP, gaming enhancement, joystick support, MAKCU, kernel drivers, exploits, Chiaki, PSRemote, undetected, premium software, gaming tools" />
        <link rel="canonical" href="https://skynetaim.pro" />



        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        {{-- <link rel="icon" href="/favicon.ico" sizes="any"> --}}
         <link rel="icon" type="image/png" href="/skynet.png" />
        {{-- <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png"> --}}

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
