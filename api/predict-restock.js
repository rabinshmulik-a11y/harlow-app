import { supabaseFetch } from './supabase.js';

export default async function handler(req, res) {
  try {
    const response = await supabaseFetch(
      'purchase_history?select=*&order=purchased_at.desc'
    );

    const purchases = await response.json();

    const predictions = purchases.map(p => {
      const item = p.item_name.toLowerCase();

      let estimatedDays = 14;

      if (item.includes('milk')) estimatedDays = 7;
      if (item.includes('eggs')) estimatedDays = 10;
      if (item.includes('bread')) estimatedDays = 5;
      if (item.includes('chicken')) estimatedDays = 4;
      if (item.includes('toilet paper')) estimatedDays = 30;
      if (item.includes('paper towel')) estimatedDays = 21;
      if (item.includes('detergent')) estimatedDays = 45;

      const boughtDate = new Date(p.purchased_at);
      const restockDate = new Date(boughtDate);
      restockDate.setDate(restockDate.getDate() + estimatedDays);

      return {
        item_name: p.item_name,
        store: p.store,
        last_price: p.price,
        last_purchased: p.purchased_at,
        estimated_days_until_needed: estimatedDays,
        estimated_restock_date: restockDate.toISOString()
      };
    });

    return res.status(200).json(predictions);

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
