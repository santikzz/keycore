import '../../../css/landing.css';

import { HeroParallax } from '@/components/landing/HeroParallax'
import { AboutUs } from '@/components/landing/AboutUs'
import { FeaturedProducts } from '@/components/landing/FeaturedProducts'
import { Footer } from '@/components/landing/Footer'
import { GlobalProvider } from '@/components/landing/GlobalContext'
import { VideoPlayer } from '@/components/landing/VideoPlayer';
import { Head } from '@inertiajs/react';

export default function Index() {

    return (
        <>
            <Head title="SKYNET AIM"/>
            
            <GlobalProvider>
                <main>
                    <HeroParallax />
                    {/* <AboutUs /> */}
                    <VideoPlayer />
                    <FeaturedProducts />
                    <Footer />
                </main>
            </GlobalProvider>
        </>
    )

}