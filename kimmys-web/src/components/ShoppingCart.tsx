// components/ShoppingCart.tsx
'use client';

import { useShoppingCart } from '@/context/ShoppingCartContext';
import { urlFor } from '@/lib/sanity';
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
        <h2>Your Order ({getTotalItems()})</h2>
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
          <button 
            className={styles.continueShopping}
            onClick={closeCart}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          <ul className={styles.cartItems}>
            {cartItems.map((item) => {
              const imageUrl = item.image?.asset?.url 
                ? item.image.asset.url 
                : item.image?.asset?._ref 
                  ? urlFor(item.image).width(100).url() 
                  : null;

              return (
                <li key={item._id} className={styles.cartItem}>
                  {imageUrl && (
                    <div className={styles.itemImage}>
                      <img 
                        src={imageUrl} 
                        alt={item.name}
                        width={80}
                        height={80}
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className={styles.itemDetails}>
                    <h3>{item.name}</h3>
                    <p>R{item.price.toFixed(2)}</p>
                    <div className={styles.quantityControls}>
                      <button 
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button 
                    className={styles.removeButton}
                    onClick={() => removeFromCart(item._id)}
                    aria-label="Remove item"
                  >
                    ×
                  </button>
                </li>
              );
            })}
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
                Clear Order
              </button>
              <button 
                className={styles.checkoutButton}
                onClick={() => {
                  alert('Proceeding to checkout');
                  closeCart();
                }}
              >
                Checkout (R{getCartTotal().toFixed(2)})
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}