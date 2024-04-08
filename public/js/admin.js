"use strict";
const deleteProduct = async (btn) => {
  try {
    const prodId = btn.parentNode.querySelector("[name=productId]").value;
    const csrf = btn.parentNode.querySelector("[name=_csrf]").value;
    const result = await fetch(`/admin/product/${prodId}`, {
      method: "DELETE",
      headers: {
        "csrf-token": csrf,
      },
    });
    const productElement = btn.closest("article");
    productElement.parentNode.removeChild(productElement);
    return result.json();
  } catch (err) {
    console.log(err);
  }
};
