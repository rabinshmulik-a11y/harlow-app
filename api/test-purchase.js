import { supabaseFetch } from './supabase.js';

export default async function handler(req, res) {
  try {
    const response = await supabaseFetch('purchase_history', {
      method: 'POST',
      headers: {
        Prefer: 'return=representation'
      },
      body: JSON.stringify({
        user_id: 3,
        item_name: 'Milk',
        store: 'Walmart',
        price: 4.29,
        quantity: 1,
        unit: 'gallon'
      })
    });

    const data = await response.json();

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
