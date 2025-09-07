import { BadgeCheck, CircleCheck, CreditCard } from "lucide-react"
import { MagicCard } from "./MagicCard"

export const BuyCard = ({ title = "", price = "", features = [], btnText = "", className = "", isSpecial = false, onClick = () => { } }) => {

    return (
        <MagicCard
            className={`card_box aspect-[1/1.7] flex flex-col bg-zinc-900/35 backdrop-blur-lg border border-red-500/50 shadow-2xl rounded-xl ${className}`}
            gradientSize={400}
            gradientColor="#7f1d1d"
            gradientOpacity={0.5}
        >
            <div className="p-6 flex flex-col gap-8 flex-1">

                {isSpecial &&
                    <div class="tag drop-shadow-xl">
                        <span></span>
                        <span></span>
                        <BadgeCheck className="text-white z-10 -translate-x-[1.6rem] -translate-y-[3.3rem] rotate-45 size-[1.40rem]" />
                    </div>
                }


                <div className="border-b border-red-500/50 pb-6">
                    <h1 className="lato-regular text-4xl text-white">{title}</h1>
                    <h2 className="lato-black text-5xl text-red-500 drop-shadow-xl">${" "}{price}</h2>
                </div>
                <div className="flex flex-col gap-3">
                    {features.map((text, idx) => (
                        <label key={idx} className="text-white lato-bold text-base">
                            <CircleCheck className="inline mb-1 mr-1 text-red-500" size={20} />{text}
                        </label>
                    ))}
                </div>
            </div>

            <button
                className="btn rounded-b-xl overflow-hidden button button-secondary relative z-10 inline-flex w-full items-center justify-center bg-red-500 hover:bg-red-800 transition-colors duration-200 ease-in-out text-white text-xl h-12"
                type="button"
            >
                <span className="lato-black" onClick={onClick}>
                    <CreditCard className="inline mb-1 mr-1" />{btnText}
                </span>
            </button>

        </MagicCard>
    );
}