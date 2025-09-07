import { FeaturesBoxes } from "./FeaturesBoxes";
import FuzzyText from "./FuzzyText";
import { useGlobalContext } from "@/components/landing/GlobalContext";

export const AboutUs = () => {

    const { mousePos, links } = useGlobalContext();

    return (
        <section className="min-h-screen flex flex-col justify-center relative overflow-hidden">

            <div className="linear-gradient-top absolute top-0 left-0 right-0 h-44 z-50"></div>



                <div className="flex-1 relative aspect-video w-screen md:w-full h-full my-24 md:my-0">
                    <iframe className="absolute left-0 top-0 w-full h-full" src={links.youtube} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                </div>



            <div className="linear-gradient absolute bottom-0 left-0 right-0 h-44 z-50"></div>

        </section>
    );

}