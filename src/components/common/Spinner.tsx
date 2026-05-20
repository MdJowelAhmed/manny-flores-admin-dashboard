const Spinner = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen  gap-4 w-full bg-transparent rounded-xl">
            {/* Logo with scale animation */}
            <div className="scale-pulse p-2 rounded-2xl  ">
                {/* Logo */}
                <div className="flex items-center w-full ">
                    <img src={'/image3.svg'} alt="logo" className="w-20 h-fit object-contain" />
                </div>
            </div>

            {/* Custom animation style */}
            <style>{`
                @keyframes scalePulse {
                    0%,
                    100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.2);
                    }
                }

                .scale-pulse {
                    animation: scalePulse 1.5s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default Spinner;