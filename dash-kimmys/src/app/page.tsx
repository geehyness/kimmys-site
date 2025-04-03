'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { client, writeClient } from '@/lib/sanityClient';
import { urlFor } from '@/lib/sanityClient';
import { toast, Toaster } from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Image from 'next/image';

interface PaymentProof {
  _type: 'image';
  asset: {
    _type: 'reference';
    _ref: string;
  };
}

interface Order {
  _id: string;
  orderNumber?: string;
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
    whatsapp?: string;
  };
  items?: {
    _key?: string;
    product?: {
      _ref?: string;
      _type?: string;
    };
    quantity?: number;
    priceAtPurchase?: number;
    nameAtPurchase?: string;
    selectedExtras?: {
      _key?: string;
      extra?: {
        _ref?: string;
        _type?: string;
      };
      name?: string;
      price?: number;
      quantityIndex?: number;
    }[];
    image?: {
      _type: 'image';
      asset: {
        _ref: string;
        _type: 'reference';
      };
    };
  }[];
  status?: 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  paymentMethod?: 'ewallet' | 'momo' | 'cash';
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  totalAmount?: number;
  notes?: string;
  orderDate?: string;
  estimatedReady?: string;
  paymentProof?: PaymentProof;
}

type ActiveTab = 'received' | 'preparing' | 'ready' | 'completed';

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelledPopupOpen, setIsCancelledPopupOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('received');

  // Safely filter orders with fallbacks for missing status
  const receivedOrders = useMemo(() =>
    orders.filter(order => order?.status === 'received'), [orders]);
  const preparingOrders = useMemo(() =>
    orders.filter(order => order?.status === 'preparing'), [orders]);
  const readyOrders = useMemo(() =>
    orders.filter(order => order?.status === 'ready'), [orders]);
  const completedOrders = useMemo(() =>
    orders.filter(order => order?.status === 'completed'), [orders]);
  const cancelledOrders = useMemo(() =>
    orders.filter(order => order?.status === 'cancelled'), [orders]);

  const filteredOrders = useMemo(() => {
    switch (activeTab) {
      case 'received': return receivedOrders;
      case 'preparing': return preparingOrders;
      case 'ready': return readyOrders;
      case 'completed': return completedOrders;
      default: return receivedOrders;
    }
  }, [activeTab, completedOrders, preparingOrders, readyOrders, receivedOrders]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const query = `
        *[_type == "order"] | order(_createdAt asc) {
          _id,
          orderNumber,
          customer {
            name,
            phone,
            email,
            whatsapp
          },
          items[] {
            _key,
            product->{
              _id,
              name
            },
            quantity,
            priceAtPurchase,
            nameAtPurchase,
            selectedExtras[] {
              _key,
              extra->{
                _id,
                name
              },
              name,
              price,
              quantityIndex
            },
            image {
              _type,
              asset->{
                _ref
              }
            }
          },
          status,
          paymentMethod,
          paymentStatus,
          totalAmount,
          notes,
          orderDate,
          estimatedReady,
          paymentProof
        }
      `;

      const data = await client.fetch<Order[]>(query);
      if (!data) throw new Error('No data returned from Sanity');

      // Validate and clean data
      const validatedData = data.map(order => ({
        ...order,
        orderNumber: order.orderNumber || `UNKNOWN-${order._id.slice(0, 5)}`,
        customer: order.customer || { name: 'Unknown Customer', phone: 'N/A' },
        items: order.items?.map(item => ({
          ...item,
          quantity: item.quantity || 1,
          priceAtPurchase: item.priceAtPurchase || 0,
          nameAtPurchase: item.nameAtPurchase || 'Unknown Item',
          selectedExtras: item.selectedExtras || []
        })) || [],
        status: order.status || 'received',
        paymentMethod: order.paymentMethod || 'cash',
        paymentStatus: order.paymentStatus || 'pending',
        totalAmount: order.totalAmount || 0,
        orderDate: order.orderDate || new Date().toISOString()
      }));

      setOrders(validatedData);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const toggleCancelledPopup = () => {
    setIsCancelledPopupOpen(!isCancelledPopupOpen);
  };

  const handleMoveOrder = useCallback(async (orderId: string, newStatus: Order['status']) => {
    if (!newStatus) {
      toast.error('Invalid status provided');
      return;
    }

    const originalOrder = orders.find(order => order._id === orderId);
    if (!originalOrder) {
      toast.error('Order not found');
      return;
    }

    if (originalOrder.status === newStatus) return;

    try {
      const result = await writeClient
        .patch(orderId)
        .set({ status: newStatus })
        .commit();

      if (!result) throw new Error('No result returned from Sanity');

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast.success(`Order ${originalOrder.orderNumber || originalOrder._id} moved to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(
        `Failed to move order ${originalOrder.orderNumber || originalOrder._id}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }, [orders]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const renderOrderCard = (order: Order, status: Order['status']) => {
    const orderNumber = order.orderNumber || `UNKNOWN-${order._id.slice(0, 5)}`;
    const customerName = order.customer?.name || 'Unknown Customer';
    const customerPhone = order.customer?.phone || 'N/A';
    const orderDate = formatDate(order.orderDate);
    const paymentMethodText = order.paymentMethod === 'momo' ? 'MoMo' :
                            order.paymentMethod === 'ewallet' ? 'E-Wallet' :
                            order.paymentMethod === 'cash' ? 'Cash' : 'Unknown';

    return (
      <li key={order._id} className="border border-gray-200 rounded-md p-3 mb-3 shadow-sm hover:shadow-md transition-shadow bg-white text-sm">
        {/* Order Header */}
        <div className="flex justify-between items-start mb-2 pb-1 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-800 text-base">Order #{orderNumber}</h3>
            <p className="text-xs text-gray-500">{orderDate}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`px-1 py-0.5 rounded text-xs font-medium ${
              status === 'received' ? 'bg-blue-100 text-blue-800' :
              status === 'preparing' ? 'bg-amber-100 text-amber-800' :
              status === 'ready' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {status?.toUpperCase() || 'UNKNOWN'}
            </span>
            <span className={`px-1 py-0.5 rounded text-xs font-medium ${
              !order.paymentStatus ? 'bg-gray-100 text-gray-800' :
              order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
              order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {order.paymentStatus ? order.paymentStatus.toUpperCase() : 'UNKNOWN'}
            </span>
          </div>
        </div>

        {/* Payment Info - Shown for received, preparing, and ready orders */}
        {(status === 'received' || status === 'preparing' || status === 'ready') && (
          <div className="mb-2 grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-gray-500 text-xxs">Payment Method</p>
              <p className="font-medium text-gray-800">{paymentMethodText}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xxs">Payment Status</p>
              <p className={`font-medium ${
                order.paymentStatus === 'paid' ? 'text-green-600' :
                order.paymentStatus === 'pending' ? 'text-amber-600' :
                'text-gray-800'
              }`}>
                {order.paymentStatus?.toUpperCase() || 'UNKNOWN'}
              </p>
            </div>
          </div>
        )}

        {(status === 'received' || status === 'preparing') && (
          <div className="mb-2">
            <h4 className="text-xs font-medium text-gray-700 mb-1 pb-0.5 border-b border-gray-100">Order Items</h4>
            <ul className="space-y-2">
              {order.items?.length ? (
                order.items.filter(item => item._key).map((item, index) => {
                  const itemName = item.nameAtPurchase || 'Unknown Item';
                  const itemPrice = item.priceAtPurchase || 0;
                  const itemQuantity = item.quantity || 1;
                  const itemTotal = itemPrice * itemQuantity;

                  return (
                    <React.Fragment key={item._key || index}>
                      {index > 0 && <div className="border-t my-2 border-gray-200"></div>}
                      <li className="group">
                        <div className="flex gap-2">
                          {item.image?.asset?._ref ? (
                            <div className="flex-shrink-0">
                              <Image
                                src={urlFor(item.image).width(60).height(60).url()}
                                alt={itemName}
                                width={60}
                                height={60}
                                className="rounded border border-gray-200 object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder-image.png';
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-[60px] h-[60px] rounded border border-gray-200 flex items-center justify-center bg-gray-100">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}

                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-800 text-sm">
                                  <span className="font-semibold">{itemName}</span>
                                </h4>
                                <p className="text-xs text-gray-500">
                                  R{itemPrice.toFixed(2)} × {itemQuantity} = <span className="font-medium">R{itemTotal.toFixed(2)}</span>
                                </p>
                              </div>
                            </div>

                            {item.selectedExtras?.length ? (
                              <div className="mt-1 pt-1 border-t border-gray-200 text-xs">
                                <h5 className="font-semibold text-gray-600 mb-0.5 text-xs">Extras</h5>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full text-xs border-collapse">
                                    <thead>
                                      <tr>
                                        <th className="text-left py-1 pr-2 font-medium text-gray-500 border border-gray-300">Extra</th>
                                        {Array.from({ length: itemQuantity }).map((_, idx) => (
                                          <th key={idx} className="text-center py-1 px-1 font-medium text-gray-500 border border-gray-300">#{idx + 1}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {item.selectedExtras
                                        .filter(extra => extra._key)
                                        .map((extra) => (
                                          <tr key={extra._key!}>
                                            <td className="py-1 pr-2 text-gray-700 border border-gray-300">
                                              {extra.name || 'Unknown Extra'} <span className="text-gray-500 text-xxs">(+R{(extra.price || 0).toFixed(2)})</span>
                                            </td>
                                            {Array.from({ length: itemQuantity }).map((_, idx) => {
                                              const isSelected = extra.quantityIndex === idx + 1;
                                              return (
                                                <td key={`${extra._key}-${idx}`} className="text-center py-1 px-1 border border-gray-300">
                                                  {isSelected ? <span className="text-green-600">✓</span> : ''}
                                                </td>
                                              );
                                            })}
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </li>
                    </React.Fragment>
                  );
                })
              ) : (
                <p className="text-gray-500 text-sm">No items in this order.</p>
              )}
            </ul>
          </div>
        )}

        {status === 'ready' && (
          <div className="mb-2 grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-gray-500 text-xxs">Customer</p>
              <p className="font-medium text-gray-800">{customerName}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xxs">Contact</p>
              <p className="font-medium text-gray-800">{customerPhone}</p>
            </div>
          </div>
        )}

        {status === 'completed' && (
          <div className="mt-2 pt-2 border-t border-gray-100 text-xs">
            <h4 className="font-medium text-gray-700 mb-1 pb-0.5 border-b border-gray-100">Order Details</h4>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-gray-600 text-xxs">Order No</span>
              <span className="text-gray-700">{orderNumber}</span>
            </div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-gray-600 text-xxs">Items</span>
              <span className="text-gray-700">{order.items?.length || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-600 text-xxs">Total</span>
              <span className="font-bold text-gray-900">R{(order.totalAmount || 0).toFixed(2)}</span>
            </div>
          </div>
        )}

        {order.notes && (
          <div className="mt-2 pt-2 border-t border-gray-100 text-xs">
            <h4 className="font-medium text-gray-600 mb-1">Notes</h4>
            <p className="text-gray-700 italic">{order.notes}</p>
          </div>
        )}

        {order.estimatedReady && (
          <div className="mt-1 text-xs text-gray-500">
            <span className="font-medium">Ready by:</span> {formatDate(order.estimatedReady)}
          </div>
        )}

        <div className="mt-2 pt-2 border-t border-gray-100">
          {status === 'received' && (
            <button
              onClick={() => handleMoveOrder(order._id, 'preparing')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-2 rounded text-xs transition-colors"
            >
              Start Preparation
            </button>
          )}
          {status === 'preparing' && (
            <button
              onClick={() => handleMoveOrder(order._id, 'ready')}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-1 px-2 rounded text-xs transition-colors"
            >
              Mark as Ready
            </button>
          )}
          {status === 'ready' && (
            <button
              onClick={() => handleMoveOrder(order._id, 'completed')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-2 rounded text-xs transition-colors"
            >
              Complete Order
            </button>
          )}
        </div>
      </li>
    );
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Skeleton width={200} height={32} />
            <Skeleton width={150} height={40} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow">
                <Skeleton height={48} className="mb-4" />
                <div className="p-4 space-y-4">
                  {[...Array(3)].map((_, j) => (
                    <Skeleton key={j} height={120} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="max-w-md bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Orders</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Orders Dashboard</h1>
          <button
            onClick={toggleCancelledPopup}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Cancelled Orders ({cancelledOrders.length})
          </button>
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden mb-4 sticky top-0 z-10 bg-gray-50">
          <div className="flex overflow-x-auto pb-2">
            {[
              { id: 'received', label: 'Received', count: receivedOrders.length },
              { id: 'preparing', label: 'Preparing', count: preparingOrders.length },
              { id: 'ready', label: 'Ready', count: readyOrders.length },
              { id: 'completed', label: 'Completed', count: completedOrders.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg mr-2 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow">
            <h2 className="font-semibold text-lg py-2 px-4 bg-gray-100 sticky top-0 z-10">Received ({receivedOrders.length})</h2>
            <ul className="space-y-2 p-4 pt-2 max-h-[calc(100vh - 180px)] overflow-y-auto">
              {receivedOrders.length > 0 ? (
                receivedOrders.map(order => renderOrderCard(order, 'received'))
              ) : (
                <p className="text-gray-500 text-center py-4">No received orders</p>
              )}
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow">
            <h2 className="font-semibold text-lg py-2 px-4 bg-gray-100 sticky top-0 z-10">Preparing ({preparingOrders.length})</h2>
            <ul className="space-y-2 p-4 pt-2 max-h-[calc(100vh - 180px)] overflow-y-auto">
              {preparingOrders.length > 0 ? (
                preparingOrders.map(order => renderOrderCard(order, 'preparing'))
              ) : (
                <p className="text-gray-500 text-center py-4">No orders in preparation</p>
              )}
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow">
            <h2 className="font-semibold text-lg py-2 px-4 bg-gray-100 sticky top-0 z-10">Ready ({readyOrders.length})</h2>
            <ul className="space-y-2 p-4 pt-2 max-h-[calc(100vh - 180px)] overflow-y-auto">
              {readyOrders.length > 0 ? (
                readyOrders.map(order => renderOrderCard(order, 'ready'))
              ) : (
                <p className="text-gray-500 text-center py-4">No orders ready</p>
              )}
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow">
            <h2 className="font-semibold text-lg py-2 px-4 bg-gray-100 sticky top-0 z-10">Completed ({completedOrders.length})</h2>
            <ul className="space-y-2 p-4 pt-2 max-h-[calc(100vh - 180px)] overflow-y-auto">
              {completedOrders.length > 0 ? (
                completedOrders.map(order => renderOrderCard(order, 'completed'))
              ) : (
                <p className="text-gray-500 text-center py-4">No completed orders</p>
              )}
            </ul>
          </div>
        </div>

        {/* Mobile Tab Content */}
        <div className="md:hidden">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold text-lg mb-4 text-gray-700 border-b pb-2 capitalize">
              {activeTab} ({filteredOrders.length})
            </h2>
            <ul className="space-y-2">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => renderOrderCard(order, activeTab))
              ) : (
                <p className="text-gray-500 text-center py-4">No orders in this category</p>
              )}
            </ul>
          </div>
        </div>

        {/* Cancelled Orders Popup */}
        {isCancelledPopupOpen && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-md shadow-md w-full max-w-md max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Cancelled Orders</h2>
                <button
                  onClick={toggleCancelledPopup}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              {cancelledOrders.length > 0 ? (
                <ul className="space-y-2">
                  {cancelledOrders.map(order => renderOrderCard(order, 'cancelled'))}
                </ul>
              ) : (
                <p className="text-gray-500">No cancelled orders.</p>
              )}
            </div>
          </div>
        )}

        <Toaster position="top-right" />
      </div>
    </div>
  );
}