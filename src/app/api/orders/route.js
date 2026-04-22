import { supabase } from '../../../../supabase';

// Box sizes in descending order for greedy packing
const BOX_SIZES_ORDER = [40, 16, 9, 4];

async function getBoxPrices() {
  const { data, error } = await supabase
    .from('box_prices')
    .select('*');

  if (error || !data) {
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

    const { customerName, pickUpType, userEmail, phoneNumber, orderType, preferredContact, wantsBox, orderSource, selectedBoxSize } = body;

    if (!customerName || !pickUpType || !userEmail || !phoneNumber || !orderType) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing a required field" }),
        { status: 400 }
      );
    }

    const boxPrices = await getBoxPrices();

    let boxes = { '40-piece': 0, '16-piece': 0, '9-piece': 0, '4-piece': 0, 'free-choice': 0 };
    let amount = 0;
    let orderItems = null;

    // --- Handle custom bonbon items ---
    const { items, bestSellerItems } = body;

    if (items && Array.isArray(items) && items.length > 0) {
      const totalPieces = items.reduce((sum, item) => sum + item.quantity, 0);

      if (totalPieces > 40) {
        return new Response(
          JSON.stringify({ success: false, error: "Maximum 40 bonbons per custom order" }),
          { status: 400 }
        );
      }

      const { data: bonbons } = await supabase.from('bonbons').select('id, price');
      
      const enrichedItems = items.map(item => ({
        ...item,
        imageUrl: item.imageUrl
      }));

      if (wantsBox && selectedBoxSize && boxPrices[selectedBoxSize]) {
        // Box selected: use the fixed box price
        amount += boxPrices[selectedBoxSize];
        boxes[selectedBoxSize] = (boxes[selectedBoxSize] || 0) + 1;
      } else if (wantsBox) {
        // Box but no specific size: pack into boxes
        const packed = packIntoBoxes(totalPieces);
        for (const [k, v] of Object.entries(packed)) {
          boxes[k] = (boxes[k] || 0) + v;
        }
        amount += calculateAmount(packed, boxPrices);
      } else {
        // No box: use individual bonbon prices
        enrichedItems.forEach(item => {
          const b = bonbons?.find(x => x.id === item.bonbonId);
          if (b) amount += b.price * item.quantity;
        });
      }

      orderItems = enrichedItems;
    }

    // --- Handle best seller items ---
    if (bestSellerItems && Array.isArray(bestSellerItems) && bestSellerItems.length > 0) {
      // Initialize orderItems if null
      if (!orderItems) orderItems = [];

      for (const bsItem of bestSellerItems) {
        const { boxSize, qty } = bsItem;
        if (boxSize && qty > 0 && boxPrices[boxSize]) {
          boxes[boxSize] = (boxes[boxSize] || 0) + qty;
          amount += boxPrices[boxSize] * qty;

          // Add to order_items so it shows in admin
          orderItems.push({
            type: 'bestSeller',
            boxSize,
            quantity: qty,
            bonbonName: `Best Seller ${boxSize.replace('-', ' ').replace('piece', 'Piece')} Box`,
            price: boxPrices[boxSize],
          });
        }
      }
    }

    // --- Handle legacy bestSeller-only order type ---
    if (orderType === 'bestSeller' && !bestSellerItems) {
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
      boxes[boxSize] = quantity;
      amount = boxPrices[boxSize] * quantity;
      orderItems = [{
        type: 'bestSeller',
        boxSize,
        quantity,
        bonbonName: `Best Seller ${boxSize.replace('-', ' ').replace('piece', 'Piece')} Box`,
        price: boxPrices[boxSize],
      }];
    }

    if (amount === 0 && !orderItems && !bestSellerItems) {
      return new Response(
        JSON.stringify({ success: false, error: "No items in order" }),
        { status: 400 }
      );
    }

    console.log("boxes:", boxes, "amount:", amount, "orderType:", orderType, "wantsBox:", wantsBox);

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
      status: 'received',
      wants_box: wantsBox !== undefined ? wantsBox : true,
      order_source: orderSource || 'online',
    }]);

    if (error) {
      console.error('Supabase insert error', error);
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }

    // Decrement stock for custom orders
    if (orderItems) {
      for (const item of orderItems) {
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
