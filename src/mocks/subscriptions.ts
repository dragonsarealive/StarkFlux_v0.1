// Mock subscription data for development
export const mockMarketplaceSubscriptions = [
  {
    user: "0x0019CC7622177f02bA83D1D7E5bb835c0f461C87df8758c28ed756891c96D2CC",
    expiry: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
    price_paid: "20000000000000000000" // 20 STRK
  }
];

export const mockDevSubscriptions = [
  {
    user: "0x0019CC7622177f02bA83D1D7E5bb835c0f461C87df8758c28ed756891c96D2CC",
    developer_id: 2,
    expiry: Math.floor(Date.now() / 1000) + 60 * 24 * 60 * 60, // 60 days from now
    price_paid: "5000000000000000000" // 5 STRK
  }
];

export const mockPurchasedComponents = [
  {
    user: "0x0019CC7622177f02bA83D1D7E5bb835c0f461C87df8758c28ed756891c96D2CC",
    component_id: 1,
    purchase_timestamp: Math.floor(Date.now() / 1000) - 15 * 24 * 60 * 60 // 15 days ago
  }
]; 