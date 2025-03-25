// src/app/cart/page.tsx
import Layout from '@/components/Layout';
import ShoppingCart from '@/components/ShoppingCart';

export default function CartPage() {
  return (
    <Layout>
      <div className="container">
        <ShoppingCart/>
      </div>
    </Layout>
  );
}