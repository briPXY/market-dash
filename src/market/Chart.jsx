

import { useState, useEffect, useRef } from "react"; 
import LiveLineChart from "./Line";
import { Flex, PopoverButton } from "../Layout/Layout";
import { IndicatorList, RangeSelector } from "./Components/ChartBarMenu";
import { Yscale } from "./Components/Yscale";

function Chart({ historicalData, isLoading, setRange, setIndicator, indicator, range }) { 
    const [yscale, setYscale] = useState("LOG"); 
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth * 0.96,
                height: window.innerHeight * 0.5 // Keep height dynamic if needed
            });
        };
    
        handleResize(); // Set initial dimensions
    
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    if (isLoading || dimensions.width === 0) {
        return (
            <div style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }} >
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <div ref={containerRef} className="overflow-visible h-full w-full" > 
            <Flex className="flex-col overflow-visible h-full w-full">
                <Flex className="pb-4 pt-4 items-center">
                    <PopoverButton>
                        <button>{indicator[1]}</button>
                        <IndicatorList setIndicator={setIndicator} />
                    </PopoverButton>
                    <RangeSelector setRange={setRange} selected={range} />
                </Flex>
                <LiveLineChart isLogScale={yscale == "LOG"} indicatorType={indicator[0]}
                    indicatorMethod={indicator[1]} historicalData={historicalData}
                    width={dimensions.width} height={dimensions.height} />
                <Flex className="overflow-visible">
                    <PopoverButton>
                        <button>{yscale}</button>
                        <Yscale setYscale={setYscale}></Yscale>
                    </PopoverButton>
                </Flex>
            </Flex>
        </div>
    );
}


export default Chart;