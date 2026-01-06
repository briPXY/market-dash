import { usePriceStore } from '../stores/stores';
import { FiatSymbol } from "../constants/constants";

export const CurrentRateFiatView = ({ className }) => {
    const fiatRateSymbol0 = usePriceStore(state => state.fiatRateSymbol0);
    // const fiatRateSymbol1 = usePriceStore(state => state.fiatRateSymbol1);

    return (
        <div className={className}>
            <div className='mr-0.5'>{FiatSymbol[usePriceStore.getState().fiatSymbol]}</div>
            <div >{fiatRateSymbol0.toFixed(usePriceStore.getState().decimalCount)}</div>
        </div>
    );
};