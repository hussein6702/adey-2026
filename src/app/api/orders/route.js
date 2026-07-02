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

function generateOrderCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar looking chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
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

    const orderCode = generateOrderCode();
    const { customerName, pickUpType, pickupDate, pickupTime, userEmail, phoneNumber, orderType, preferredContact, wantsBox, orderSource, selectedBoxSize, customBoxQuantity = 1, customBoxes = [] } = body;

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

      if (totalPieces > 40 && orderSource !== 'walk-in') {
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

      if (wantsBox && customBoxes.length > 0) {
        // Boxes selected: sum up prices for each box
        let totalBoxCapacity = 0;
        for (const boxSize of customBoxes) {
            amount += boxPrices[boxSize] || 0;
            boxes[boxSize] = (boxes[boxSize] || 0) + 1;
            totalBoxCapacity += parseInt(boxSize) || 0;
        }
        
        // Calculate loose bonbons if any
        if (totalPieces > totalBoxCapacity) {
          let piecesCounted = 0;
          enrichedItems.forEach(item => {
            const b = bonbons?.find(x => x.id === item.bonbonId);
            if (b) {
                for (let i = 0; i < item.quantity; i++) {
                    piecesCounted++;
                    if (piecesCounted > totalBoxCapacity) {
                        amount += b.price;
                    }
                }
            }
          });
        }
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
    const payload = {
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
      pickup_date: pickupDate || null,
      pickup_time: pickupTime || 'morning',
      selected_box_size: selectedBoxSize || null,
      custom_box_quantity: customBoxQuantity || 1,
      order_code: orderCode,
    };

    let { data, error } = await supabase.from('orders').insert([payload]).select();

    // Fallback: If insertion fails because order_code or pickup_time column does not exist in the database yet
    if (error && (error.message.includes('order_code') || error.message.includes('pickup_time') || error.message.includes('schema cache'))) {
      console.warn('Supabase DB missing column(s). Retrying order insertion without them...');
      const fallbackPayload = { ...payload };
      delete fallbackPayload.order_code;
      delete fallbackPayload.pickup_time;
      const fallbackResult = await supabase.from('orders').insert([fallbackPayload]).select();
      data = fallbackResult.data;
      error = fallbackResult.error;
    }

    if (error) {
      console.error('Supabase insert error', error);
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
    }

    // --- Send Telegram Notification ---
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      const telegramMessage = `${customerName} placed an order. Please check adeychocolatier.com/login to view the order. Their phone number is ${phoneNumber}.`;
      
      try {
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: telegramMessage
          })
        });
      } catch (telegramErr) {
        console.error('Failed to send telegram notification:', telegramErr);
      }
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

    return new Response(JSON.stringify({ success: true, order: { id: data?.[0]?.id, order_code: data?.[0]?.order_code || null, boxes, amount, orderType } }), { status: 200 });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}
