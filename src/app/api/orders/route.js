import { supabase } from '../../../../supabase';

// Box sizes in descending order for greedy packing
const BOX_SIZES_ORDER = [40, 16, 9, 4];

async function getBoxPrices() {
  const { data, error } = await supabase
    .from('box_prices')
    .select('*');

  if (error || !data) {
    // Fallback defaults
    return { '4-piece': 800, '9-piece': 1600, '16-piece': 2400, '40-piece': 5600 };
  }

  const prices = {};
  for (const row of data) {
    prices[row.box_size] = row.price;
  }
  return prices;
}

function packIntoBoxes(totalPieces) {
  const boxes = { '40-piece': 0, '16-piece': 0, '9-piece': 0, '4-piece': 0, 'free-choice': 0 };
  let remaining = totalPieces;

  for (const size of BOX_SIZES_ORDER) {
    if (remaining >= size) {
      boxes[`${size}-piece`] = Math.floor(remaining / size);
      remaining = remaining % size;
    }
  }

  boxes['free-choice'] = remaining;
  return boxes;
}

function calculateAmount(boxes, boxPrices) {
  let total = 0;
  for (const [size, count] of Object.entries(boxes)) {
    if (count > 0 && boxPrices[size]) {
      total += boxPrices[size] * count;
    }
  }
  // Free-choice pieces: price individually (per-piece from 4-piece box / 4)
  if (boxes['free-choice'] > 0) {
    const perPiece = (boxPrices['4-piece'] || 800) / 4;
    total += perPiece * boxes['free-choice'];
  }
  return total;
}

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('Order received', body);

    const { customerName, pickUpType, userEmail, phoneNumber, orderType, preferredContact } = body;

    if (!customerName || !pickUpType || !userEmail || !phoneNumber || !orderType) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing a required field" }),
        { status: 400 }
      );
    }

    const boxPrices = await getBoxPrices();

    let boxes, amount, orderItems;

    if (orderType === 'bestSeller') {
      // Best seller: user selects a box size + quantity
      const { boxSize, quantity } = body;
      if (!boxSize || !quantity || quantity < 1) {
        return new Response(
          JSON.stringify({ success: false, error: "Missing boxSize or quantity for best seller order" }),
          { status: 400 }
        );
      }

      if (!boxPrices[boxSize]) {
        return new Response(
          JSON.stringify({ success: false, error: `Invalid box size: ${boxSize}` }),
          { status: 400 }
        );
      }

      boxes = { '40-piece': 0, '16-piece': 0, '9-piece': 0, '4-piece': 0, 'free-choice': 0 };
      boxes[boxSize] = quantity;
      amount = boxPrices[boxSize] * quantity;
      orderItems = null; // Best seller — no individual bonbon selection

    } else if (orderType === 'custom') {
      // Custom: user picks individual bonbons
      const { items } = body; // Array of { bonbonId, bonbonName, quantity, imageUrl }
      if (!items || !Array.isArray(items) || items.length === 0) {
        return new Response(
          JSON.stringify({ success: false, error: "No items provided for custom order" }),
          { status: 400 }
        );
      }

      const totalPieces = items.reduce((sum, item) => sum + item.quantity, 0);

      if (totalPieces > 40) {
        return new Response(
          JSON.stringify({ success: false, error: "Maximum 40 bonbons per custom order" }),
          { status: 400 }
        );
      }

      // Calculate amount per-piece for custom orders (as requested by user previously)
      // We'll use the bonbon prices from the database for accuracy
      const { data: bonbons } = await supabase.from('bonbons').select('id, price');
      amount = 0;
      
      // Preserve imageUrl while calculating amount
      const enrichedItems = items.map(item => {
        const b = bonbons?.find(x => x.id === item.bonbonId);
        if (b) amount += b.price * item.quantity;
        return {
          ...item,
          imageUrl: item.imageUrl // Ensure imageUrl is kept
        };
      });

      boxes = packIntoBoxes(totalPieces);
      orderItems = enrichedItems;

    } else {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid orderType. Use 'custom' or 'bestSeller'" }),
        { status: 400 }
      );
    }

    console.log("boxes:", boxes, "amount:", amount, "orderItems with images?", !!orderItems?.[0]?.imageUrl);

    // Insert into Supabase
    const { data, error } = await supabase.from('orders').insert([{
      customer_name: customerName,
      user_email: userEmail,
      phone_number: phoneNumber,
      pick_up_type: pickUpType,
      amount,
      composition: boxes,
      order_type: orderType,
      order_items: orderItems,
      preferred_contact: preferredContact || 'whatsapp',
      status: 'received'
    }]);

    if (error) {
      console.error('Supabase insert error', error);
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }

    // Decrement stock for custom orders
    if (orderType === 'custom' && orderItems) {
      for (const item of orderItems) {
        // Fetch current stock, then update
        const { data: bonbon } = await supabase
          .from('bonbons')
          .select('stock')
          .eq('id', item.bonbonId)
          .single();

        if (bonbon && bonbon.stock !== null) {
          const newStock = Math.max(0, bonbon.stock - item.quantity);
          await supabase
            .from('bonbons')
            .update({ stock: newStock })
            .eq('id', item.bonbonId);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, order: { boxes, amount, orderType } }), { status: 200 });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}
