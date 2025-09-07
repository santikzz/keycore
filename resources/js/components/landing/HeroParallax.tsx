import FuzzyText from "./FuzzyText";
import { Header } from "./Header";
import { useGlobalContext } from "@/components/landing/GlobalContext";

export const HeroParallax = () => {

    const { time, mousePos } = useGlobalContext();

    return (
        <section className="min-h-screen relative overflow-hidden bg-black" id="hero">

            <Header />

            <div className="absolute top-0 bottom-0 left-0 right-0 z-40 px-24">
                <div className="flex flex-col md:flex-row md:justify-between justify-center items-center h-full md:px-24">
                    <div className="flex flex-col gap-2 text-center md:text-left">
                        <div className="md:-translate-x-14">
                            <FuzzyText
                                baseIntensity={0.2}
                                hoverIntensity={0.3}
                                enableHover={true}
                                fontSize="clamp(30px, 4vw, 60px)"
                                fontFamily="'Grotesque Display', Arial, sans-serif"
                            >
                                SKYNET AIM
                            </FuzzyText>
                        </div>
                        <p className="text-white lato-light text-xl md:max-w-[35vw] opacity-75">
                            Unleash the power of our cutting-edge platform, offering seamless integration, real-time analytics, and unparalleled performance to elevate your business to new heights.
                        </p>
                    </div>
                    <div className="flex-1 flex justify-end">
                        {/* <img src="/assets/menu.png" className="md:h-[40vw]" alt="Hero Menu" /> */}
                        <video
                            src="/SKYNET.mp4"
                            autoPlay loop muted
                            className="md:h-[25vw] rounded-lg shadow-2xl"
                            style={{ transform: 'skew(-5deg, 0deg)' }}


                        />
                    </div>
                </div>
            </div>

            <div id="foglayer_01" className="fog">
                <div className="image01"></div>
                <div className="image02"></div>
            </div>
            {/* <div id="foglayer_02" className="fog">
                <div className="image01"></div>
                <div className="image02"></div>
            </div> */}
            <div id="foglayer_03" className="fog">
                <div className="image01"></div>
                <div className="image02"></div>
            </div>

            <img
                src="/assets/parallax_front.png"
                className="absolute z-30 transition-transform duration-100 ease-linear min-h-screen object-cover"
                style={{
                    // transform: `translate(${Math.sin(time) * 5}px, ${Math.cos(time) * 5}px)`,
                    transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 10}px)`, scale: 1.1
                }}
                alt="Parallax Front"
            />

            <img
                src="/assets/parallax_back.png"
                className="absolute z-20 transition-transform duration-200 ease-linear opacity-75 min-h-screen object-cover"
                style={{
                    transform: `translate(${Math.sin(time + 1) * -15}px, ${Math.cos(time + 1) * -10}px)`, scale: 1.1
                }}
                alt="Parallax Back"
            />

            <div className="linear-gradient absolute bottom-0 left-0 right-0 h-44 z-50"></div>
        </section>
    );
}