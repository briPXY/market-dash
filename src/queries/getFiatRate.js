export async function getFiatRate(symbol) {
	if (!symbol) return;
	
	symbol = symbol.toLowerCase();
	const geckoSym = {
		eth: 'ethereum',
		weth: 'wth',
		usdt: 'tether',
		wbtc: 'wrapped-bitcoin',
		btc: 'bitcon',
		usdc: 'usd-coin',
		dai: 'dai',
	}; 

	if (!geckoSym[symbol]) {
		return null;
	}

	const priceApis = [
		async () => {
			const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${geckoSym[symbol]}&vs_currencies=usd`);
			const data = await res.json();
			return data[geckoSym[symbol]].usd;
		},
		async () => {
			const res = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${symbol.toUpperCase()}&tsyms=USD`);
			const data = await res.json();
			return data.USD;
		}
	];

	let price = null;
	for (const api of priceApis) {
		try {
			price = await api();
			if (price) break;
		} catch (e) {
			console.warn('fiat API failed:', e);
			return null;
		}
	}

	if (!price) throw new Error('Failed to get fiat price');

	return parseFloat(price);
}