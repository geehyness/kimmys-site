'use client';

import { useState, ChangeEvent } from 'react';
import { useShoppingCart } from '@/context/ShoppingCartContext';
import styles from './ShoppingCart.module.css';
import Image from 'next/image';
import { urlFor } from '@/lib/sanity';
//import { Meal } from '@/types/meal';

export default function ShoppingCart() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getCartTotal,
    closeCart,
    isCartOpen,
  } = useShoppingCart();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [checkoutError, setCheckoutError] = useState('');
  const [customerPhoneNumber, setCustomerPhoneNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isContactCollapsed, setIsContactCollapsed] = useState(true);

  const handlePaymentMethodChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedPaymentMethod(event.target.value);
    setPaymentProof(null);
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
    // Remove empty spaces from the input value
    const valueWithoutSpaces = event.target.value.replace(/\s/g, '');
    setCustomerPhoneNumber(valueWithoutSpaces);
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

  const toggleContactSection = () => {
    setIsContactCollapsed(!isContactCollapsed);
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
    setCheckoutError('');

    const formData = new FormData();
    formData.append('orderData', JSON.stringify({
      cartItems,
      total: getCartTotal(),
      paymentMethod: selectedPaymentMethod,
      customerPhoneNumber,
      whatsappNumber: whatsappNumber || null,
      orderDate: new Date().toISOString(),
      customerName,
      customerEmail,
    }));

    if (paymentProof) {
      formData.append('paymentProof', paymentProof);
    }

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Order placed successfully! Your Order Number is: ${data.orderNumber}`);
        clearCart();
        closeCart();
      } else {
        const errorData = await response.json();
        setCheckoutError(errorData.error || 'Failed to place order. Please try again.');
      }
    } catch (error) {
      setCheckoutError('Failed to connect to the server. Please try again later.');
      console.log("error", error)
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <>
      <div className={`${styles.overlayBackdrop} ${isCartOpen ? styles.open : ''}`} onClick={closeCart} />
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
                    <div className={styles.itemImage}>
                      {item.image?.asset?.url && (
                        <Image
                          src={urlFor(item.image).url()}
                          alt={item.name}
                          width={80}
                          height={80}
                          className={styles.cartImage}
                        />
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

                <div className={styles.formSection}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="phoneNumber">Phone Number*</label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      value={customerPhoneNumber}
                      onChange={handlePhoneNumberChange}
                      placeholder="e.g., 76xxxxxx or 78xxxxxx"
                      required
                    />
                    {phoneNumberError && <p className={styles.error}>{phoneNumberError}</p>}
                  </div>
                </div>

                <div className={`${styles.formSection} ${styles.collapsible} ${!isContactCollapsed ? styles.open : ''}`}>
                  <div className={styles.sectionHeader} onClick={toggleContactSection}>
                    <h3>Additional Information</h3>
                    <svg
                      className={styles.chevron}
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                  <div className={styles.sectionContent}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="name">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        value={customerName}
                        onChange={handleNameChange}
                        placeholder="Your full name"
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label htmlFor="whatsappNumber">WhatsApp Number</label>
                      <input
                        type="tel"
                        id="whatsappNumber"
                        value={whatsappNumber}
                        onChange={handleWhatsappNumberChange}
                        placeholder="If different from phone number"
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        value={customerEmail}
                        onChange={handleEmailChange}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h3>Payment Method</h3>
                  <div className={styles.inputGroup}>
                    <select
                      value={selectedPaymentMethod}
                      onChange={handlePaymentMethodChange}
                    >
                      <option value="">Select Payment Method</option>
                      <option value="eWallet">eWallet</option>
                      <option value="MoMo">MoMo</option>
                      <option value="Cash on Collect">Cash on Collect</option>
                    </select>
                  </div>

                  {['eWallet', 'MoMo'].includes(selectedPaymentMethod) && (
                    <div className={styles.inputGroup}>
                      <label htmlFor="paymentProof" className={styles.fileInputLabel}>
                        Upload Proof of Payment
                        <input
                          type="file"
                          id="paymentProof"
                          className={styles.fileInput}
                          accept="image/*"
                          onChange={handlePaymentProofChange}
                        />
                      </label>
                      {paymentProof && (
                        <p className={styles.fileName}>{paymentProof.name}</p>
                      )}
                    </div>
                  )}
                </div>

                {checkoutError && (
                  <div className={styles.error} style={{ margin: '1rem 0' }}>
                    {checkoutError}
                  </div>
                )}

                <div className={styles.actions}>
                  <button
                    onClick={clearCart}
                    className={styles.clearButton}
                  >
                    Clear Cart
                  </button>
                  <button
                    onClick={handleCheckout}
                    className={styles.checkoutButton}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : 'Place Order'}
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