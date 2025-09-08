import { useGlobalContext } from "@/components/landing/GlobalContext";

export const Footer = () => {

    const { links } = useGlobalContext();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="md:h-[30vh] bg-black border-t border-red-800 flex flex-col md:flex-row items-center justify-between p-24 mt-24">

            <div className="flex flex-col md:flex-row items-center gap-8">
                <img src="/skynet.png" className="w-32" alt="diabolical" />
                <div className="flex flex-col text-center md:text-left">
                    <h1 className="font-grotesque-display text-white text-2xl md:text-4xl">SKYNET AIM</h1>
                    <h2 className="lato-light text-red-500 text-base md:text-lg">Powered by <a href={links.nimrod}>nimrodcore.net</a></h2>
                    <label className="text-zinc-400/50 text-sm lato-regular">Copyright © {currentYear} Skynet Aim.</label>
                </div>
            </div>

            <div className="grid grid-cols-2 md:flex flex-col md:flex-row gap-8 mt-24 md:mt-0">
                <a href="#hero" className="text-white text-lg lato-regular">Home</a>
                <a href={links.store} className="text-white text-lg lato-regular">Store</a>
                <a href={links.discord} className="text-white text-lg lato-regular">Discord</a>
                <a href={links.nimrod} className="text-white text-lg lato-regular">nimrodcore.net</a>
                <a href='https://www.elitepvpers.com/' className="text-white text-lg lato-regular">elitepvpers</a>
            </div>

        </footer>
    );

}