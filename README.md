```ts
import type { ApisauceInstance } from "apisauce";

import type { HandleErrorFn, SuccessResponse } from "../api";
import { createApiCallWithHandleError, defaultResultConverter } from "../api";

export const createFaucetDeposit = (api: ApisauceInstance, handleErrorFn: HandleErrorFn) =>
  createApiCallWithHandleError<FaucetDepositBody, SuccessResponse>(
    api.post,
    "/faucet",
    defaultResultConverter,
    handleErrorFn
  );

export interface FaucetDepositBody {
  user_address: string;
  asset: string;
  amount: string;
}
```

```ts
import type { ApisauceInstance } from "apisauce";

import type { HandleErrorFn } from "../../api";
import { createApiCallWithHandleError, defaultResultConverter } from "../../api";

export const createGetOrderBook = (api: ApisauceInstance, handleErrorFn: HandleErrorFn) =>
  createApiCallWithHandleError<undefined, GetOrderBookResult, { product_id: string }>(
    api.get,
    (pathParams) => `/products/${pathParams?.product_id}/orderbook`,
    defaultResultConverter,
    handleErrorFn
  );

export interface GetOrderBookResult {
  product_id: string;
  book: {
    asks: BookItem[];
    bids: BookItem[];
  };
  timestamp: string;
  gsn: string;
}

export interface BookItem {
  price: string;
  size: string;
}
```
