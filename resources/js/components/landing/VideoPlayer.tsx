import { FeaturesBoxes } from "./FeaturesBoxes";
import FuzzyText from "./FuzzyText";
import { useGlobalContext } from "@/components/landing/GlobalContext";

export const VideoPlayer = () => {

    const { mousePos, links } = useGlobalContext();

    return (
        <section className="min-h-screen overflow-hidden relative">


            <div className="absolute top-0 left-0 right-0 h-42 z-50 bg-gradient-to-b from-black to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-42 z-50 bg-gradient-to-t from-black to-transparent"></div>
            
            <div className="absolute top-0 bottom-0 left-0 w-40 ml-20 z-50 bg-gradient-to-r from-black to-transparent"></div>
            <div className="absolute top-0 bottom-0 right-0 w-40 mr-20 z-50 bg-gradient-to-l from-black to-transparent"></div>


            <iframe className="absolute left-0 top-0 w-full h-full"
                src={links.youtube}
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen>
            </iframe>



        </section>
    );

}