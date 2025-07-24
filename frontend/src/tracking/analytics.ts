// analytics.ts

export const trackConversion = (
  eventName: string,
  transactionId?: string
): void => {
  if (typeof window.gtag === "function") {
    const txnId =
      transactionId || `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    window.gtag("event", "conversion", {
      send_to: "AW-11476860308/LlCcCP7F1pUZEJT7y-Aq",
      transaction_id: txnId,
      event_callback: () => {
        console.log("Google Ads received: OK");
      },
    });

    console.log(
      `Conversion event sent: ${eventName}, transaction_id: ${txnId}`
    );
  } else {
    console.warn("gtag not ready");
  }
};

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
