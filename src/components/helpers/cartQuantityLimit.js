export const getMaxQuantityPerOrder = (item) => {
	const maxQuantity = parseInt(item && item.max_quantity_per_order, 10);

	if (isNaN(maxQuantity) || maxQuantity < 0) {
		return 0;
	}

	return maxQuantity;
};

export const getCartQuantityForItem = (cartProducts, itemId) => {
	if (!cartProducts || !cartProducts.length) {
		return 0;
	}

	return cartProducts.reduce((total, cartProduct) => {
		if (cartProduct.id === itemId) {
			const quantity = parseInt(cartProduct.quantity, 10);
			return total + (isNaN(quantity) ? 0 : quantity);
		}

		return total;
	}, 0);
};

export const getQuantityLimitMessage = (item, maxQuantity) => {
	const itemName = item && item.name ? item.name : "this item";
	return `You can only order up to ${maxQuantity} of ${itemName} in one order.`;
};
