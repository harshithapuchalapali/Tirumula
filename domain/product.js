class Product {
  constructor({ id, name, price, stock, category, image, product_id, created_at }) {
    this.id = id;
    this.name = name;
    this.price = Number(price);
    this.stock = Number(stock);
    this.category = category;
    this.image = image;
    this.productId = product_id;
    this.createdAt = created_at;
  }

  get stockStatus() {
    if (this.stock === 0) return 'red';
    if (this.stock <= 5) return 'orange';
    return 'green';
  }

  get stockLabel() {
    return { green: 'In stock', orange: 'Low stock', red: 'Out of stock' }[this.stockStatus];
  }

  static fromSupabase(row) {
    return new Product(row);
  }

  toSupabase() {
    return {
      name: this.name,
      price: this.price,
      stock: this.stock,
      category: this.category,
      image: this.image,
      product_id: this.productId
    };
  }
}
