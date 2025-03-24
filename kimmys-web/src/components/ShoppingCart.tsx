'use client';

import { useShoppingCart } from '@/context/ShoppingCartContext';
import styles from './ShoppingCart.module.css';

export default function ShoppingCart() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getCartTotal,
    closeCart
  } = useShoppingCart();

  return (
    <div className={styles.cartContainer}>
      <div className={styles.cartHeader}>
        <h2>Your Cart ({getTotalItems()})</h2>
        <button 
          className={styles.closeButton}
          onClick={closeCart}
          aria-label="Close cart"
        >
          ×
        </button>
      </div>
      
      {cartItems.length === 0 ? (
        <div className={styles.emptyCart}>
          <p>Your cart is empty</p>
        </div>
      ) : (
        <>
          <ul className={styles.cartItems}>
            {cartItems.map((item) => (
              <li key={item._id} className={styles.cartItem}>
                <div className={styles.itemImage}>
                  {item.image?.asset?.url ? (
                    <img 
                      src={item.image.asset.url} 
                      alt={item.name}
                      width={80}
                      height={80}
                    />
                  ) : (
                    <div className={styles.imagePlaceholder} />
                  )}
                </div>
                <div className={styles.itemDetails}>
                  <h3>{item.name}</h3>
                  <p>R{item.price.toFixed(2)}</p>
                  <div className={styles.quantityControls}>
                    <button 
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button 
                  className={styles.removeButton}
                  onClick={() => removeFromCart(item._id)}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          
          <div className={styles.cartFooter}>
            <div className={styles.total}>
              <span>Total:</span>
              <span>R{getCartTotal().toFixed(2)}</span>
            </div>
            <div className={styles.actions}>
              <button 
                className={styles.clearButton}
                onClick={clearCart}
              >
                Clear Cart
              </button>
              <button 
                className={styles.checkoutButton}
                onClick={() => alert('Proceeding to checkout')}
              >
                Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}