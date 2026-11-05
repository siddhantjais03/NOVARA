import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { memoryData } from '../config/memoryStore.js';

// @desc    Get comprehensive Admin Dashboard metrics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const totalProducts = await Product.countDocuments();
      const totalOrders = await Order.countDocuments();
      const totalUsers = await User.countDocuments({ role: 'user' });

      // Accounting Rule for Order Inclusion:
      // An order is recognized in revenue metrics if and only if orderStatus is not 'Cancelled'
      // and the order has not been marked as refunded.
      const validOrderMatch = {
        orderStatus: { $ne: 'Cancelled' },
        $or: [{ isRefunded: { $ne: true } }, { isRefunded: { $exists: false } }]
      };

      // 1. Total Revenue, Net Merchandise Revenue, Discounts, and Shipping Fees
      const revenueAgg = await Order.aggregate([
        { $match: validOrderMatch },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalPrice' },
            merchandiseRevenue: {
              $sum: {
                $subtract: [
                  { $ifNull: ['$itemsPrice', 0] },
                  { $ifNull: ['$discountPrice', 0] }
                ]
              }
            },
            grossMerchandiseValue: { $sum: { $ifNull: ['$itemsPrice', 0] } },
            totalDiscounts: { $sum: { $ifNull: ['$discountPrice', 0] } },
            shippingRevenue: { $sum: { $ifNull: ['$shippingPrice', 0] } }
          }
        }
      ]);

      const revenue =
        revenueAgg.length > 0 ? Math.round(revenueAgg[0].totalRevenue * 100) / 100 : 0;
      const merchandiseRevenue =
        revenueAgg.length > 0 ? Math.round(revenueAgg[0].merchandiseRevenue * 100) / 100 : 0;
      const grossMerchandiseValue =
        revenueAgg.length > 0 ? Math.round(revenueAgg[0].grossMerchandiseValue * 100) / 100 : 0;
      const totalDiscounts =
        revenueAgg.length > 0 ? Math.round(revenueAgg[0].totalDiscounts * 100) / 100 : 0;
      const shippingRevenue =
        revenueAgg.length > 0 ? Math.round(revenueAgg[0].shippingRevenue * 100) / 100 : 0;

      // 2. Paid / Settled Revenue
      const paidRevenueAgg = await Order.aggregate([
        { $match: { ...validOrderMatch, isPaid: true } },
        { $group: { _id: null, totalPaid: { $sum: '$totalPrice' } } }
      ]);
      const paidRevenue =
        paidRevenueAgg.length > 0 ? Math.round(paidRevenueAgg[0].totalPaid * 100) / 100 : 0;

      // 3. Average Order Value (AOV) = Total Valid Revenue / Valid Orders Count
      const validOrdersCount = await Order.countDocuments(validOrderMatch);
      const averageOrderValue =
        validOrdersCount > 0 ? Math.round((revenue / validOrdersCount) * 100) / 100 : 0;

      // 4. Real Checkout & Order Settlement Rate = Settled (Paid) Orders / Total Orders
      const paidOrdersCount = await Order.countDocuments({
        ...validOrderMatch,
        isPaid: true
      });
      const checkoutConversionRate =
        totalOrders > 0 ? Math.round((paidOrdersCount / totalOrders) * 1000) / 10 : 0;

      // 5. Real Inventory Health Index from actual product stock
      const inStockCount = await Product.countDocuments({ stock: { $gt: 5 } });
      const lowStockProducts = await Product.find({ stock: { $lte: 5 } })
        .select('name category stock price image')
        .limit(10);
      const criticalStockCount = await Product.countDocuments({ stock: { $gt: 0, $lte: 5 } });
      const outOfStockCount = await Product.countDocuments({ stock: { $lte: 0 } });
      const inventoryHealth =
        totalProducts > 0 ? Math.round((inStockCount / totalProducts) * 1000) / 10 : 100;

      const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .select('customerInfo totalPrice orderStatus paymentMethod isPaid createdAt orderItems');

      const categoryStats = await Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);

      // 6. Category Revenue Share with Proportional Order Discount Allocation
      // Accounting Rule:
      // Line items within an order absorb order-level promotional/coupon discounts
      // proportionally to their gross contribution to that order's items total.
      // Net Line Revenue = lineGross - (orderDiscount * (lineGross / orderItemsGross))
      const categoryRevenueAgg = await Order.aggregate([
        { $match: validOrderMatch },
        // Step A: Calculate order-level gross items total for accurate discount proportioning
        {
          $addFields: {
            computedItemsGross: {
              $sum: {
                $map: {
                  input: '$orderItems',
                  as: 'it',
                  in: {
                    $multiply: [
                      { $ifNull: ['$$it.price', 0] },
                      { $ifNull: ['$$it.quantity', 1] }
                    ]
                  }
                }
              }
            }
          }
        },
        // Step B: Unwind line items
        { $unwind: '$orderItems' },
        // Step C: Lookup Product document to retrieve authentic category
        {
          $lookup: {
            from: 'products',
            localField: 'orderItems.product',
            foreignField: '_id',
            as: 'productDoc'
          }
        },
        { $unwind: { path: '$productDoc', preserveNullAndEmptyArrays: true } },
        // Step D: Project line item gross, order-level discount, and quantity
        {
          $project: {
            category: { $ifNull: ['$productDoc.category', 'Accessories'] },
            quantity: { $ifNull: ['$orderItems.quantity', 1] },
            itemGross: {
              $multiply: [
                { $ifNull: ['$orderItems.price', 0] },
                { $ifNull: ['$orderItems.quantity', 1] }
              ]
            },
            computedItemsGross: 1,
            discountPrice: { $ifNull: ['$discountPrice', 0] }
          }
        },
        // Step E: Compute net revenue per line item after proportional discount allocation
        {
          $project: {
            category: 1,
            quantity: 1,
            itemNet: {
              $cond: {
                if: {
                  $and: [
                    { $gt: ['$computedItemsGross', 0] },
                    { $gt: ['$discountPrice', 0] }
                  ]
                },
                then: {
                  $subtract: [
                    '$itemGross',
                    {
                      $multiply: [
                        '$discountPrice',
                        { $divide: ['$itemGross', '$computedItemsGross'] }
                      ]
                    }
                  ]
                },
                else: '$itemGross'
              }
            }
          }
        },
        // Step F: Group by category to sum net revenue and total units sold
        {
          $group: {
            _id: '$category',
            revenue: { $sum: '$itemNet' },
            unitsSold: { $sum: '$quantity' }
          }
        },
        { $sort: { revenue: -1 } }
      ]);

      const totalItemRevenue = categoryRevenueAgg.reduce((sum, c) => sum + c.revenue, 0);
      const categoryRevenueShare = categoryRevenueAgg.map((c) => ({
        category: c._id,
        revenue: Math.round(c.revenue * 100) / 100,
        percentage:
          totalItemRevenue > 0 ? Math.round((c.revenue / totalItemRevenue) * 1000) / 10 : 0,
        unitsSold: c.unitsSold
      }));

      // 7. Payment Method Breakdown from valid non-cancelled orders
      const paymentMethodStats = await Order.aggregate([
        { $match: validOrderMatch },
        {
          $group: {
            _id: '$paymentMethod',
            count: { $sum: 1 },
            volume: { $sum: '$totalPrice' }
          }
        },
        { $sort: { volume: -1 } }
      ]);

      // 8. Order Status Breakdown
      const orderStatusStats = await Order.aggregate([
        {
          $group: {
            _id: '$orderStatus',
            count: { $sum: 1 }
          }
        }
      ]);

      return res.json({
        success: true,
        stats: {
          totalProducts,
          totalOrders,
          validOrdersCount,
          totalUsers,
          revenue,
          merchandiseRevenue,
          grossMerchandiseValue,
          totalDiscounts,
          shippingRevenue,
          paidRevenue,
          averageOrderValue,
          checkoutConversionRate,
          paidOrdersCount,
          inventoryHealth,
          inStockCount,
          criticalStockCount,
          outOfStockCount,
          lowStockCount: lowStockProducts.length,
          lowStockProducts,
          recentOrders,
          categoryStats,
          categoryRevenueShare,
          paymentMethodStats,
          orderStatusStats
        }
      });
    }

    // In-memory Fallback
    const totalProducts = memoryData.products.length;
    const totalOrders = memoryData.orders.length;
    const totalUsers = memoryData.users.filter((u) => u.role === 'user').length;

    // Filter valid orders according to the same accounting rule
    const validOrders = memoryData.orders.filter(
      (o) => o.orderStatus !== 'Cancelled' && o.isRefunded !== true
    );
    const validOrdersCount = validOrders.length;
    const revenue = validOrders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);
    const merchandiseRevenue = validOrders.reduce(
      (acc, o) => acc + Math.max(0, (o.itemsPrice || 0) - (o.discountPrice || 0)),
      0
    );
    const grossMerchandiseValue = validOrders.reduce(
      (acc, o) => acc + (o.itemsPrice || 0),
      0
    );
    const totalDiscounts = validOrders.reduce(
      (acc, o) => acc + (o.discountPrice || 0),
      0
    );
    const shippingRevenue = validOrders.reduce(
      (acc, o) => acc + (o.shippingPrice || 0),
      0
    );
    const paidOrders = validOrders.filter((o) => o.isPaid);
    const paidRevenue = paidOrders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);
    const averageOrderValue =
      validOrdersCount > 0 ? Math.round((revenue / validOrdersCount) * 100) / 100 : 0;
    const paidOrdersCount = paidOrders.length;
    const checkoutConversionRate =
      totalOrders > 0 ? Math.round((paidOrdersCount / totalOrders) * 1000) / 10 : 0;

    const inStockCount = memoryData.products.filter((p) => p.stock > 5).length;
    const lowStockProducts = memoryData.products.filter((p) => p.stock <= 5);
    const criticalStockCount = memoryData.products.filter((p) => p.stock > 0 && p.stock <= 5).length;
    const outOfStockCount = memoryData.products.filter((p) => p.stock <= 0).length;
    const inventoryHealth =
      totalProducts > 0 ? Math.round((inStockCount / totalProducts) * 1000) / 10 : 100;

    const recentOrders = memoryData.orders.slice(0, 8);

    const categoryMap = {};
    memoryData.products.forEach((p) => {
      categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
    });
    const categoryStats = Object.keys(categoryMap).map((k) => ({
      _id: k,
      count: categoryMap[k]
    }));

    // In-memory Category Revenue Share with Proportional Discount Allocation
    const catRevMap = {};
    const catUnitsMap = {};
    const prodMap = {};
    memoryData.products.forEach((p) => {
      prodMap[p._id] = p.category;
    });

    validOrders.forEach((o) => {
      const items = o.orderItems || [];
      const orderItemsGross = items.reduce(
        (sum, it) => sum + (it.price || 0) * (it.quantity || 1),
        0
      );
      const discount = o.discountPrice || 0;

      items.forEach((item) => {
        const cat = prodMap[item.product] || 'Accessories';
        const itemGross = (item.price || 0) * (item.quantity || 1);
        const itemDiscount =
          orderItemsGross > 0 && discount > 0
            ? discount * (itemGross / orderItemsGross)
            : 0;
        const itemNet = Math.max(0, itemGross - itemDiscount);

        catRevMap[cat] = (catRevMap[cat] || 0) + itemNet;
        catUnitsMap[cat] = (catUnitsMap[cat] || 0) + (item.quantity || 1);
      });
    });

    const totalItemRevenue = Object.values(catRevMap).reduce((a, b) => a + b, 0);
    const categoryRevenueShare = Object.keys(catRevMap)
      .map((cat) => ({
        category: cat,
        revenue: Math.round(catRevMap[cat] * 100) / 100,
        percentage:
          totalItemRevenue > 0 ? Math.round((catRevMap[cat] / totalItemRevenue) * 1000) / 10 : 0,
        unitsSold: catUnitsMap[cat] || 0
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return res.json({
      success: true,
      stats: {
        totalProducts,
        totalOrders,
        validOrdersCount,
        totalUsers,
        revenue: Math.round(revenue * 100) / 100,
        merchandiseRevenue: Math.round(merchandiseRevenue * 100) / 100,
        grossMerchandiseValue: Math.round(grossMerchandiseValue * 100) / 100,
        totalDiscounts: Math.round(totalDiscounts * 100) / 100,
        shippingRevenue: Math.round(shippingRevenue * 100) / 100,
        paidRevenue: Math.round(paidRevenue * 100) / 100,
        averageOrderValue,
        checkoutConversionRate,
        paidOrdersCount,
        inventoryHealth,
        inStockCount,
        criticalStockCount,
        outOfStockCount,
        lowStockCount: lowStockProducts.length,
        lowStockProducts,
        recentOrders,
        categoryStats,
        categoryRevenueShare
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all customers list
// @route   GET /api/admin/users
// @access  Private/Admin
export const getCustomers = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const users = await User.find({ role: 'user' })
        .select('-password')
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        count: users.length,
        users,
        customers: users
      });
    }

    const users = memoryData.users
      .filter((u) => u.role === 'user')
      .map(({ passwordHash, ...rest }) => rest);

    return res.json({
      success: true,
      count: users.length,
      users,
      customers: users
    });
  } catch (error) {
    next(error);
  }
};
