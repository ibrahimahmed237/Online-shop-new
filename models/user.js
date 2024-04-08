const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  resetToken: String,
  resetTokenExpiration:Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});
userSchema.methods.addToCart = async function (product) {
  const productIndex = this.cart.items.findIndex(
    (p) => p.productId.toString() === product._id.toString()
  );
  if (productIndex >= 0) {
    this.cart.items[productIndex].quantity += 1;
  } else {
    this.cart.items.push({
      productId: product._id,
      quantity: 1,
    });
  }
  return await this.save();
};
userSchema.methods.getCart = async function () {
  try {
    await this.populate({
      path: "cart.items.productId",
    });
    this.cart.items = this.cart.items.filter((item) => item.productId !== null);
      await this.save();
    return this.cart.items;
  } catch (err) {
    throw err;
  }
};
userSchema.methods.removeFromCart = async function (prodId)
{
    try
    {
        this.cart.items = this.cart.items.filter(
            (item) => item.productId.toString() !== prodId
        );
        await this.save();
    } catch (err)
    {
        throw err;
    }
};
userSchema.methods.clearCart = async function ()
{
    this.cart.items = [];
    return await this.save();
}
module.exports = mongoose.model("User", userSchema);
