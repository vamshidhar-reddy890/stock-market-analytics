import { useEffect, useState } from "react";

function useLiveStock(
  symbol,
  initialPrice = 3695
) {

  const [price, setPrice] = useState(initialPrice);

  const [connected, setConnected] =
    useState(false);

  useEffect(() => {

    setConnected(true);

    const interval = setInterval(() => {

      setPrice((previous) => {

        const movement =
          (Math.random() - 0.5) * 8;

        return Number(
          (previous + movement).toFixed(2)
        );

      });

    }, 3000);

    return () => {

      clearInterval(interval);
      setConnected(false);

    };

  }, [symbol]);

  return {
    symbol,
    price,
    connected
  };
}

export default useLiveStock;