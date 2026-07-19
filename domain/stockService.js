const StockService = {
  getStatus(stock) {
    if (stock === 0) return 'red';
    if (stock <= 5) return 'orange';
    return 'green';
  },

  getLabel(status) {
    return { green: 'In stock', orange: 'Low stock', red: 'Out of stock' }[status] || 'Unknown';
  },

  filterByCategory(products, category) {
    if (!category || category === 'all') return products;
    return products.filter(p => p.category.toLowerCase().trim() === category.toLowerCase());
  },

  sort(products, key) {
    const sorted = [...products];
    switch (key) {
      case 'price-asc': return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc': return sorted.sort((a, b) => b.price - a.price);
      case 'stock': return sorted.sort((a, b) => b.stock - a.stock);
      case 'name': return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default: return sorted;
    }
  },

  search(products, query) {
    if (!query) return products;
    const q = query.toLowerCase().trim();
    return products.filter(p =>
      (p.name + ' ' + p.productId + ' ' + p.category).toLowerCase().includes(q)
    );
  }
};
