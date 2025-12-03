import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const SalesDashboard = ({ token }) => {
  const [stats, setStats] = useState({});
  const [salesByDay, setSalesByDay] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [dailyTrend, setDailyTrend] = useState([]);
  const [weeklyTrend, setWeeklyTrend] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [categoryPerformance, setCategoryPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [token]);

  const fetchAnalytics = async () => {
    try {
      const [
        statsRes,
        salesByDayRes,
        topProductsRes,
        dailyTrendRes,
        weeklyTrendRes,
        monthlyTrendRes,
        categoryRes
      ] = await Promise.all([
        axios.get('http://localhost:5000/api/analytics/stats', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/analytics/sales-by-day', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/analytics/top-products', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/analytics/daily-trend', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/analytics/weekly-trend', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/analytics/monthly-trend', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/analytics/category-performance', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setStats(statsRes.data);
      setSalesByDay(salesByDayRes.data);
      setTopProducts(topProductsRes.data);
      setDailyTrend(dailyTrendRes.data);
      setWeeklyTrend(weeklyTrendRes.data);
      setMonthlyTrend(monthlyTrendRes.data);
      setCategoryPerformance(categoryRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  // Chart configurations
  const salesByDayChart = {
    labels: salesByDay.map(d => d.day),
    datasets: [{
      label: 'Revenue (₹)',
      data: salesByDay.map(d => d.revenue),
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    }]
  };

  const dailyTrendChart = {
    labels: dailyTrend.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [{
      label: 'Daily Revenue (₹)',
      data: dailyTrend.map(d => d.revenue),
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.1
    }]
  };

  const categoryChart = {
    labels: categoryPerformance.map(c => c.category),
    datasets: [{
      data: categoryPerformance.map(c => c.total_revenue),
      backgroundColor: [
        'rgba(255, 99, 132, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(255, 205, 86, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(153, 102, 255, 0.8)',
      ],
    }]
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Sales Analytics Dashboard</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Orders</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600">₹{stats.totalRevenue?.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Avg Order Value</h3>
          <p className="text-3xl font-bold text-purple-600">₹{stats.avgOrderValue?.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">60-Day Orders</h3>
          <p className="text-3xl font-bold text-orange-600">{stats.recentOrders}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales by Day of Week */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Sales by Day of Week</h3>
          <Bar data={salesByDayChart} options={{ responsive: true }} />
        </div>

        {/* Category Performance */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Revenue by Category</h3>
          <Doughnut data={categoryChart} options={{ responsive: true }} />
        </div>
      </div>

      {/* Daily Trend */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-xl font-semibold mb-4">Daily Sales Trend (Last 60 Days)</h3>
        <Line data={dailyTrendChart} options={{ responsive: true }} />
      </div>

      {/* Top Products */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-xl font-semibold mb-4">Top 10 Selling Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Product</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-right">Quantity Sold</th>
                <th className="px-4 py-2 text-right">Revenue (₹)</th>
                <th className="px-4 py-2 text-right">Orders</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr key={product.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="px-4 py-2">{product.name}</td>
                  <td className="px-4 py-2">{product.category}</td>
                  <td className="px-4 py-2 text-right">{product.total_quantity}</td>
                  <td className="px-4 py-2 text-right">₹{parseFloat(product.total_revenue).toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">{product.order_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekly and Monthly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Weekly Sales Trend</h3>
          <div className="space-y-2">
            {weeklyTrend.map((week, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>{new Date(week.week_start).toLocaleDateString()}</span>
                <div className="text-right">
                  <div className="font-semibold">{week.orders} orders</div>
                  <div className="text-green-600">₹{parseFloat(week.revenue).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Monthly Sales Trend</h3>
          <div className="space-y-2">
            {monthlyTrend.map((month, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>{new Date(month.month_start).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
                <div className="text-right">
                  <div className="font-semibold">{month.orders} orders</div>
                  <div className="text-green-600">₹{parseFloat(month.revenue).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;