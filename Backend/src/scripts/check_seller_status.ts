import dotenv from "dotenv";
dotenv.config();
import { query } from "../db/db";

async function checkSellers() {
  try {
    const res = await query(
      "SELECT user_id, store_name, verification_status FROM seller_profiles",
    );
    console.log("Seller Profiles:", res.rows);
  } catch (err) {
    console.error(err);
  }
}

checkSellers();
