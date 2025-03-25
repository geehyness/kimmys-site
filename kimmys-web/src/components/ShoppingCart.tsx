// components/ShoppingCart.tsx
'use client';

import { useState, ChangeEvent } from 'react';
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
    closeCart,
    isCartOpen
  } = useShoppingCart();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [checkoutError, setCheckoutError] = useState('');
  const [customerPhoneNumber, setCustomerPhoneNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // To disable button during submission
  const [customerName, setCustomerName] = useState(''); // Add state for customer name
  const [customerEmail, setCustomerEmail] = useState(''); // Add state for customer email

  const handlePaymentMethodChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedPaymentMethod(event.target.value);
    setPaymentProof(null); // Reset proof on payment method change
    setCheckoutError('');
  };

  const handlePaymentProofChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setPaymentProof(event.target.files[0]);
      setCheckoutError('');
    } else {
      setPaymentProof(null);
    }
  };

  const handlePhoneNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCustomerPhoneNumber(event.target.value);
    setPhoneNumberError('');
  };

  const handleWhatsappNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    setWhatsappNumber(event.target.value);
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCustomerName(event.target.value);
  };

  const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCustomerEmail(event.target.value);
  };

  const validateSwaziPhoneNumber = (number: string) => {
    const swaziRegex = /^(76|78|79)\d{6}$/;
    return swaziRegex.test(number);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      setCheckoutError('Your cart is empty.');
      return;
    }

    if (!selectedPaymentMethod) {
      setCheckoutError('Please select a payment method.');
      return;
    }

    if (['eWallet', 'MoMo'].includes(selectedPaymentMethod) && !paymentProof) {
      setCheckoutError('Please upload proof of payment for eWallet or MoMo.');
      return;
    }

    if (!customerPhoneNumber) {
      setPhoneNumberError('Please enter your phone number.');
      return;
    }

    if (!validateSwaziPhoneNumber(customerPhoneNumber)) {
      setPhoneNumberError('Please enter a valid 8-digit Swazi phone number starting with 79, 78, or 76.');
      return;
    }

    setIsSubmitting(true);
    setCheckoutError(''); // Clear any previous errors

    const orderData = {
      cartItems,
      total: getCartTotal(),
      paymentMethod: selectedPaymentMethod,
      paymentProof: paymentProof ? paymentProof.name : null,
      customerPhoneNumber,
      whatsappNumber: whatsappNumber || null,
      orderDate: new Date().toISOString(),
      customerName: customerName, // Include customer name
      customerEmail: customerEmail, // Include customer email
    };

    console.log('Sending order data to backend:', orderData);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Order placed successfully:', data);
        alert(`Order placed successfully! Your Order Number is: ${data.orderNumber}`); // Display order number
        clearCart();
        closeCart();
        // Optionally redirect the user or show a thank you message
      } else {
        const errorData = await response.json();
        console.error('Error placing order:', errorData);
        setCheckoutError(errorData.error || 'Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('There was an error submitting the order:', error);
      setCheckoutError('Failed to connect to the server. Please try again later.');
    } finally {
      setIsSubmitting(false); // Re-enable the button
    }
  };

  if (!isCartOpen) return null;

  return (
    <>
      {isCartOpen && (
        <div className={`${styles.overlayBackdrop} ${isCartOpen ? styles.open : ''}`} onClick={closeCart} />
      )}
      <div className={`${styles.cartOverlay} ${isCartOpen ? styles.open : ''}`}>
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
                {cartItems.map((item) => (
                  <li key={item._id} className={styles.cartItem}>
                    <div className={styles.itemDetails}>
                      <h3>{item.name}</h3>
                      <p>${item.price.toFixed(2)}</p>
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
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>

                {/* Contact Information */}
                <div className={styles.contactInfo}>
                  <h3>Contact Information</h3>
                  <div className={styles.inputGroup}>
                    <label htmlFor="name">Full Name (Optional)</label>
                    <input
                      type="text"
                      id="name"
                      value={customerName}
                      onChange={handleNameChange}
                      placeholder="Your Full Name"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="phoneNumber">Phone Number (Swazi)</label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      value={customerPhoneNumber}
                      onChange={handlePhoneNumberChange}
                      placeholder="e.g., 76xxxxxx"
                    />
                    {phoneNumberError && <p className={styles.error}>{phoneNumberError}</p>}
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="whatsappNumber">WhatsApp Number (Optional)</label>
                    <input
                      type="tel"
                      id="whatsappNumber"
                      value={whatsappNumber}
                      onChange={handleWhatsappNumberChange}
                      placeholder="If different from Swazi number"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label htmlFor="email">Email Address (Optional)</label>
                    <input
                      type="email"
                      id="email"
                      value={customerEmail}
                      onChange={handleEmailChange}
                      placeholder="Your Email Address"
                    />
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className={styles.paymentOptions}>
                  <h3>Payment Method</h3>
                  <select value={selectedPaymentMethod} onChange={handlePaymentMethodChange}>
                    <option value="">Select Payment Method</option>
                    <option value="eWallet">eWallet</option>
                    <option value="MoMo">MoMo</option>
                    <option value="Cash on Collect">Cash on Collect</option>
                  </select>
                </div>

                {/* Proof of Payment Upload (Conditional) */}
                {['eWallet', 'MoMo'].includes(selectedPaymentMethod) && (
                  <div className={styles.paymentProof}>
                    <h3>Proof of Payment</h3>
                    <input type="file" accept="image/*" onChange={handlePaymentProofChange} />
                    {paymentProof && <p>Selected file: {paymentProof.name}</p>}
                  </div>
                )}

                {checkoutError && <p className={styles.error}>{checkoutError}</p>}

                <div className={styles.actions}>
                  <button onClick={clearCart} className={styles.clearButton}>
                    Clear Cart
                  </button>
                  <button onClick={handleCheckout} className={styles.checkoutButton} disabled={isSubmitting}>
                    {isSubmitting ? 'Processing...' : 'Checkout'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}