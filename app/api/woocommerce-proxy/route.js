import { NextResponse } from 'next/server';
import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

const api = new WooCommerceRestApi({
  url: "https://outdated.digital/articles",
  consumerKey: "ck_e7c646f3a0dc22519879df24c65b539267792b16",
  consumerSecret: "cs_d100d4257b5cf8449bbee01ea3b7172813cb75a5",
  version: "wc/v3",
  axiosConfig: {
    headers:{}
  }
});

export async function GET() {
  try {
    const response = await api.get("products");
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching data from WooCommerce' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const orderData = await request.json();
    const response = await api.post("orders", orderData);
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json({ error: 'Error creating order in WooCommerce' }, { status: 500 });
  }
}