import { createContext, useContext, useEffect, useState } from "react"

const GlobalContext = createContext(null);

export const GlobalProvider = ({ children }) => {

    const [time, setTime] = useState(0);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    
    const links = {
        discord: 'https://shorturl.at/49IlB',
        shop: 'https://shorturl.at/VJHxS',
        nimrod: 'https://nimrodcore.net',
        youtube: 'https://www.youtube.com/embed/bBBUF3ubfC4?si=gkUI3cBMAttbNd_W&autoplay=1&amp&start=20&mute=1',
    }

    useEffect(() => {
        const handleMouseMove = (e) => {
            const { innerWidth, innerHeight } = window;
            setMousePos({
                x: (e.clientX / innerWidth) * 2 - 1,
                y: (e.clientY / innerHeight) * 2 - 1,
            });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    useEffect(() => {
        let animationFrameId;
        const update = () => {
            setTime((prev) => prev + 0.005); // Adjust speed by modifying this value
            animationFrameId = requestAnimationFrame(update);
        };
        animationFrameId = requestAnimationFrame(update);
        return () => cancelAnimationFrame(animationFrameId);
    }, []);


    return (
        <GlobalContext.Provider value={{
            time,
            mousePos,
            links
        }}>
            {children}
        </GlobalContext.Provider>
    );

}

export const useGlobalContext = () => {
    const context = useContext(GlobalContext);
    if (context === undefined) {
        throw new Error("useContext must be used within a GlobalProvider");
    }
    return context;
}