
import { useChartQuery } from "../queries/chartquery";
import * as transform from "../queries/transforms";
import { useState } from "react";

import LiveLineChart from "./Line";
import { timeInterval } from "../constants/intervals";
import { Box, Flex, PopoverButton } from "../Layout/Layout";
import { IndicatorList, RangeSelector } from "./Components/ChartBarMenu";
import { Yscale } from "./Components/Yscale";
import { API_DOMAIN, formatAPI } from "../queries/api_formatter";

function Chart({ symbol }) {
 
    const [range, setRange] = useState("1h");
    const [indicator, setIndicator] = useState(["SMA", "SMA5"]);
    const [yscale, setYscale] = useState("LOG");
 
    const { data: historicalData, isLoading } = useChartQuery({ 
        dataUrl: formatAPI[API_DOMAIN](symbol, range).historical, 
        transformFn: transform[API_DOMAIN].linear, 
        refetchInterval: timeInterval[range],
    }); 

    if (isLoading) return <p>Loading...</p>;

    return (
        <Box className="overflow-visible">
            <Flex column className="overflow-visible">
                <Flex>
                    <PopoverButton>
                        <button>{indicator[0]}</button>
                        <IndicatorList setIndicator={setIndicator} />
                    </PopoverButton>
                    <RangeSelector setRange={setRange} selected={range}/>
                </Flex>
                <LiveLineChart isLogScale={yscale == "LOG"} indicatorType={indicator[0]}
                    indicatorMethod={indicator[1]} width={1200} height={500} historicalData={historicalData}/>
                <Flex className="overflow-visible">
                    <PopoverButton>
                        <button>{yscale}</button>
                        <Yscale setYscale={setYscale}></Yscale>
                    </PopoverButton>
                </Flex>
            </Flex>
        </Box>
    );
}


export default Chart;