import { useGlobalContext } from "@/components/landing/GlobalContext";
import { BuyCard } from "./BuyCard";
import FuzzyText from "./FuzzyText";
// import { m } from "framer-motion";

export const FeaturedProducts = () => {

    const { mousePos } = useGlobalContext();

    const features = [
        "Undetectable",
        "Aimbot",
        "Wallhack / ESP",
        "Triggerbot",
        "Joystick Support",
        "Kernel Driver",
        "Unique Exploits",
        "Chiaki Support",
        "PSRemote Support",
    ]

    return (
        <section className="min-h-screen flex flex-col justify-center relative overflow-hidden  gap-8">

            <img src="/assets/featured_back.png" className="absolute top-0 left-0 right-0 bottom-0 object-cover"
                style={{
                    transform: `translate(${mousePos.x * 15}px, ${mousePos.y * 12}px) scale(1.1)`,
                }}
                alt="Featured Back"
            />

            <img src="/assets/tree.png" className="absolute left-0 top-0 bottom-0 opacity-65 drop-shadow-2xl"
                style={{
                    transform: `translate(${mousePos.x * -8}px, ${mousePos.y * 12}px) scale(1.1)`,
                }}
                alt="Parallax Tree Left"
            />
            <img src="/assets/tree.png" className="absolute right-0 top-0 bottom-0 opacity-65 drop-shadow-2xl scale-x-[-1]"
                style={{
                    transform: `translate(${mousePos.x * -8}px, ${mousePos.y * 12}px) scaleX(-1.1)`,
                }}
                alt="Parallax Tree Right"
            />

            <div className="linear-gradient-top absolute top-0 left-0 right-0 h-44 z-40"></div>
            <div className="flex flex-col items-center z-50">
                <h2 className="flex md:hidden font-grotesque-display text-white text-2xl text-center md:text-5xl">Featured Products</h2>
                <div className="hidden md:flex">
                    <FuzzyText
                        baseIntensity={0.08}
                        hoverIntensity={0.2}
                        enableHover={true}
                        fontSize="3rem"
                        fontFamily="'Grotesque Display', Arial, sans-serif"
                    >
                        Featured Products
                    </FuzzyText>
                </div>
            </div>
            <div className="flex flex-col md:flex-row gap-8 justify-center items-center z-50">
                <BuyCard title="1 Day" price="5,00" features={features} btnText='BUY NOW' className="w-[22rem] z-50" />
                <BuyCard title="1 Week" price="11,00" features={features} btnText='BUY NOW' isSpecial={true} className="w-[22rem] md:w-[25rem] z-50" />
                <BuyCard title="1 Month" price="20,00" features={features} btnText='BUY NOW' className="w-[22rem] z-50" />
            </div>
            <div className="linear-gradient absolute bottom-0 left-0 right-0 h-44 z-40"></div>
        </section>
    );

}