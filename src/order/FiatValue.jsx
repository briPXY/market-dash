import { useCallback } from 'react';
import usePriceStore from '../stores/stores';
import { FiatSymbol } from '../constants/constants';

function FiatValue({ fiatRateSymbol, value }) {
    const selector = useCallback((state) => state[fiatRateSymbol], [fiatRateSymbol]);
    const rate = usePriceStore(selector);

    return (<div className="text-xs text-washed"><span className='mr-0.5'>{FiatSymbol[usePriceStore.getState().fiatSymbol]}</span>{rate && value ? (rate * value).toFixed(2) : "?"}</div>);
}

export default FiatValue;

