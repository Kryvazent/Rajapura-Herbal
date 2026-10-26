import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";

const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI;

const legacyAddress = (address) => {
  if (typeof address === "string") return address;
  return [address?.street, address?.city, address?.district, address?.province]
    .filter(Boolean)
    .join(", ");
};

const mergeLegacyCart = async (oldCustomerId, customerId) => {
  const carts = Cart.collection;
  const oldCart = await carts.findOne({ customer: oldCustomerId });
  if (!oldCart || oldCustomerId.equals(customerId)) return;

  const customerCart = await carts.findOne({ customer: customerId });
  if (!customerCart) {
    await carts.updateOne({ _id: oldCart._id }, { $set: { customer: customerId } });
    return;
  }

  const quantities = new Map();
  for (const item of [...(customerCart.items ?? []), ...(oldCart.items ?? [])]) {
    const productId = item.product.toString();
    quantities.set(productId, (quantities.get(productId) ?? 0) + item.qty);
  }
  await carts.updateOne(
    { _id: customerCart._id },
    { $set: {
      items: [...quantities].map(([product, qty]) => ({
        product: new mongoose.Types.ObjectId(product),
        qty,
      })),
      updatedAt: new Date(),
    } },
  );
  await carts.deleteOne({ _id: oldCart._id });
};

const migrate = async () => {
  if (!mongoUrl) throw new Error("MONGO_URL or MONGODB_URI is required");
  await mongoose.connect(mongoUrl);

  const customers = Customer.collection;
  const customerIndexes = await customers.indexes();
  if (customerIndexes.some((index) => index.name === "user_1")) {
    await customers.dropIndex("user_1");
  }

  const legacyUsers = await User.find({ role: "USER" }).lean();
  let migrated = 0;

  for (const legacyUser of legacyUsers) {
    const email = legacyUser.email.trim().toLowerCase();
    const existingCustomer = await customers.findOne({
      $or: [{ user: legacyUser._id }, { email }],
    });
    const name = [legacyUser.firstName, legacyUser.lastName].filter(Boolean).join(" ")
      || existingCustomer?.name
      || email;
    const customerId = existingCustomer?._id ?? legacyUser._id;
    const profile = {
      name,
      email,
      password: legacyUser.password,
      status: legacyUser.status ?? "ACTIVE",
      mustChangePassword: legacyUser.flags?.mustChangePassword ?? false,
      contactNumber: existingCustomer?.contactNumber || legacyUser.phone || "",
      country: existingCustomer?.country || legacyUser.country || "",
      address: existingCustomer?.address || legacyAddress(legacyUser.address),
      updatedAt: new Date(),
    };

    if (existingCustomer) {
      await customers.updateOne(
        { _id: customerId },
        { $set: profile, $unset: { user: "" } },
      );
    } else {
      await customers.insertOne({
        _id: customerId,
        ...profile,
        createdAt: legacyUser.createdAt ?? new Date(),
      });
    }

    await mergeLegacyCart(legacyUser._id, customerId);
    if (!legacyUser._id.equals(customerId)) {
      await Order.collection.updateMany(
        { customer: legacyUser._id },
        { $set: { customer: customerId } },
      );
    }
    await User.deleteOne({ _id: legacyUser._id });
    migrated += 1;
  }

  await customers.createIndex(
    { email: 1 },
    { unique: true, partialFilterExpression: { email: { $type: "string" } } },
  );
  console.log(`Migrated ${migrated} legacy customer account(s) to the customers collection.`);
};

migrate()
  .catch((error) => {
    console.error("Customer authentication migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
