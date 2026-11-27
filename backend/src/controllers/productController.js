const path = require('path');
const fs = require('fs');
const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Helper untuk memformat objek produk dengan URL gambar lengkap
 */
const formatProduct = (product, req) => {
  const host = req ? `${req.protocol}://${req.get('host')}` : (process.env.BASE_URL || 'http://localhost:5000');
  return {
    ...product,
    price: parseFloat(product.price),
    stock: parseInt(product.stock, 10),
    image_full_url: product.image_url ? `${host}/uploads/${product.image_url}` : null,
  };
};

/**
 * Controller: Mengambil semua produk (Filter Kategori & Pencarian)
 */
const getAllProducts = async (req, res) => {
  try {
    const { category_id, search } = req.query;
    let query = `
      SELECT p.id, p.category_id, p.name, p.description, p.price, p.stock, p.image_url, 
             p.created_at, p.updated_at, c.name AS category_name
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (category_id) {
      query += ` AND p.category_id = ?`;
      params.push(category_id);
    }

    if (search) {
      query += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY p.created_at DESC`;

    const [products] = await db.query(query, params);
    const formatted = products.map((item) => formatProduct(item, req));

    return successResponse(res, 200, 'Daftar produk berhasil diambil.', formatted);
  } catch (error) {
    console.error('Get All Products Error:', error);
    return errorResponse(res, 500, 'Gagal mengambil daftar produk.', error.message);
  }
};

/**
 * Controller: Mengambil detail satu produk berdasarkan ID
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT p.id, p.category_id, p.name, p.description, p.price, p.stock, p.image_url, 
             p.created_at, p.updated_at, c.name AS category_name
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `;

    const [products] = await db.query(query, [id]);
    if (products.length === 0) {
      return errorResponse(res, 404, `Produk dengan ID ${id} tidak ditemukan.`);
    }

    return successResponse(res, 200, 'Detail produk berhasil diambil.', formatProduct(products[0], req));
  } catch (error) {
    console.error('Get Product By ID Error:', error);
    return errorResponse(res, 500, 'Gagal mengambil detail produk.', error.message);
  }
};

/**
 * Controller: Menambah produk baru dengan upload gambar (Khusus Role Admin)
 */
const createProduct = async (req, res) => {
  try {
    const { category_id, name, description, price, stock } = req.body;

    // Validasi input wajib
    if (!category_id || !name || price === undefined) {
      // Jika ada file yang terlanjur terupload saat validasi gagal, hapus file
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return errorResponse(res, 400, 'Kategori, nama produk, dan harga wajib diisi.');
    }

    // Periksa apakah category_id valid
    const [categories] = await db.query('SELECT id, name FROM categories WHERE id = ?', [category_id]);
    if (categories.length === 0) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return errorResponse(res, 400, `Kategori dengan ID ${category_id} tidak valid.`);
    }

    const imageName = req.file ? req.file.filename : null;
    const productPrice = parseFloat(price) || 0;
    const productStock = parseInt(stock, 10) || 0;

    const [result] = await db.query(
      `INSERT INTO products (category_id, name, description, price, stock, image_url)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [category_id, name.trim(), description ? description.trim() : null, productPrice, productStock, imageName]
    );

    const newProductId = result.insertId;
    const [newProducts] = await db.query(
      `SELECT p.*, c.name AS category_name 
       FROM products p 
       INNER JOIN categories c ON p.category_id = c.id 
       WHERE p.id = ?`,
      [newProductId]
    );

    return successResponse(
      res,
      201,
      'Produk baru berhasil ditambahkan.',
      formatProduct(newProducts[0], req)
    );
  } catch (error) {
    console.error('Create Product Error:', error);
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {}
    }
    return errorResponse(res, 500, 'Gagal menambahkan produk.', error.message);
  }
};

/**
 * Controller: Memperbarui produk & opsi update gambar (Khusus Role Admin)
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, name, description, price, stock } = req.body;

    // Cek keberadaan produk
    const [existing] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return errorResponse(res, 404, `Produk dengan ID ${id} tidak ditemukan.`);
    }

    const currentProduct = existing[0];

    // Jika category_id dikirim, pastikan ada di database
    let targetCategoryId = currentProduct.category_id;
    if (category_id) {
      const [categories] = await db.query('SELECT id FROM categories WHERE id = ?', [category_id]);
      if (categories.length === 0) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return errorResponse(res, 400, `Kategori dengan ID ${category_id} tidak valid.`);
      }
      targetCategoryId = category_id;
    }

    let imageName = currentProduct.image_url;
    // Jika ada file gambar baru yang diunggah
    if (req.file) {
      imageName = req.file.filename;

      // Hapus gambar lama jika ada dan file-nya eksis
      if (currentProduct.image_url) {
        const oldPath = path.join(__dirname, '../../uploads', currentProduct.image_url);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    const updatedName = name !== undefined ? name.trim() : currentProduct.name;
    const updatedDesc = description !== undefined ? description : currentProduct.description;
    const updatedPrice = price !== undefined ? parseFloat(price) : currentProduct.price;
    const updatedStock = stock !== undefined ? parseInt(stock, 10) : currentProduct.stock;

    await db.query(
      `UPDATE products 
       SET category_id = ?, name = ?, description = ?, price = ?, stock = ?, image_url = ? 
       WHERE id = ?`,
      [targetCategoryId, updatedName, updatedDesc, updatedPrice, updatedStock, imageName, id]
    );

    const [updatedRows] = await db.query(
      `SELECT p.*, c.name AS category_name 
       FROM products p 
       INNER JOIN categories c ON p.category_id = c.id 
       WHERE p.id = ?`,
      [id]
    );

    return successResponse(res, 200, 'Produk berhasil diperbarui.', formatProduct(updatedRows[0], req));
  } catch (error) {
    console.error('Update Product Error:', error);
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {}
    }
    return errorResponse(res, 500, 'Gagal memperbarui produk.', error.message);
  }
};

/**
 * Controller: Menghapus produk dan file gambarnya (Khusus Role Admin)
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 404, `Produk dengan ID ${id} tidak ditemukan.`);
    }

    const product = existing[0];

    // Hapus file gambar jika ada
    if (product.image_url) {
      const filePath = path.join(__dirname, '../../uploads', product.image_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await db.query('DELETE FROM products WHERE id = ?', [id]);

    return successResponse(res, 200, 'Produk berhasil dihapus.', { id: parseInt(id, 10) });
  } catch (error) {
    console.error('Delete Product Error:', error);
    return errorResponse(res, 500, 'Gagal menghapus produk.', error.message);
  }
};

/**
 * Controller: Pembelian Produk (Otomatis Mengurangi Stok & Catat Transaksi Pembayaran)
 * Dapat diakses oleh Pelanggan, Kasir, atau Admin
 */
const buyProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const quantity = parseInt(req.body.quantity || 1, 10);
    const payment_method = req.body.payment_method || 'Tunai';
    const notes = req.body.notes || '';

    if (isNaN(quantity) || quantity <= 0) {
      return errorResponse(res, 400, 'Jumlah pembelian minimal 1 item.');
    }

    // Ambil produk saat ini
    const [products] = await db.query(
      `SELECT p.id, p.category_id, p.name, p.description, p.price, p.stock, p.image_url, 
              p.created_at, p.updated_at, c.name AS category_name
       FROM products p
       INNER JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );

    if (products.length === 0) {
      return errorResponse(res, 404, `Produk dengan ID ${id} tidak ditemukan.`);
    }

    const product = products[0];
    const currentStock = parseInt(product.stock, 10);

    if (currentStock < quantity) {
      return errorResponse(
        res,
        400,
        `Stok tidak mencukupi! Sisa stok "${product.name}" hanya ${currentStock} item.`
      );
    }

    // Kurangi stok barang secara otomatis
    const newStock = currentStock - quantity;
    await db.query('UPDATE products SET stock = ? WHERE id = ?', [newStock, id]);

    const updatedProduct = {
      ...product,
      stock: newStock,
      price: parseFloat(product.price),
    };

    const totalPrice = parseFloat(product.price) * quantity;
    const orderNumber = 'DB-' + Date.now().toString().slice(-6);

    // Catat data transaksi & pesanan
    let orderId = null;
    try {
      const [resOrder] = await db.query(
        `INSERT INTO orders (order_number, user_id, buyer_name, product_id, product_name, quantity, price_per_item, total_price, payment_method, status, estimated_minutes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Sedang Dimasak', 3)`,
        [
          orderNumber,
          req.user ? req.user.id : null,
          req.user ? req.user.name : 'Pelanggan',
          product.id,
          product.name,
          quantity,
          parseFloat(product.price),
          totalPrice,
          payment_method,
        ]
      );
      orderId = resOrder.insertId;
    } catch (dbErr) {
      if (dbErr.code === 'ER_NO_SUCH_TABLE') {
        await db.query(`
          CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_number VARCHAR(50) NOT NULL,
            user_id INT NULL,
            buyer_name VARCHAR(100) NOT NULL,
            product_id INT NOT NULL,
            product_name VARCHAR(150) NOT NULL,
            quantity INT NOT NULL DEFAULT 1,
            price_per_item DECIMAL(12, 2) NOT NULL,
            total_price DECIMAL(12, 2) NOT NULL,
            payment_method VARCHAR(50) NOT NULL DEFAULT 'Tunai',
            status VARCHAR(50) NOT NULL DEFAULT 'Sedang Dimasak',
            estimated_minutes INT NOT NULL DEFAULT 3,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        const [resRetry] = await db.query(
          `INSERT INTO orders (order_number, user_id, buyer_name, product_id, product_name, quantity, price_per_item, total_price, payment_method, status, estimated_minutes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Sedang Dimasak', 3)`,
          [
            orderNumber,
            req.user ? req.user.id : null,
            req.user ? req.user.name : 'Pelanggan',
            product.id,
            product.name,
            quantity,
            parseFloat(product.price),
            totalPrice,
            payment_method,
          ]
        );
        orderId = resRetry.insertId;
      }
    }

    return successResponse(res, 200, `Pembelian ${quantity}x "${product.name}" berhasil! Stok otomatis berkurang.`, {
      product: formatProduct(updatedProduct, req),
      transaction: {
        order_id: orderId,
        order_number: orderNumber,
        product_id: product.id,
        product_name: product.name,
        quantity,
        price_per_item: parseFloat(product.price),
        total_price: totalPrice,
        payment_method: payment_method,
        status: 'Sedang Dimasak',
        estimated_minutes: 3,
        notes: notes,
        previous_stock: currentStock,
        remaining_stock: newStock,
        buyer_id: req.user ? req.user.id : null,
        buyer_name: req.user ? req.user.name : 'Pelanggan',
        buyer_role: req.user ? req.user.role : 'pelanggan',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Buy Product Error:', error);
    return errorResponse(res, 500, 'Gagal memproses pembelian produk.', error.message);
  }
};

/**
 * Controller: Mengambil daftar riwayat pesanan (Orders)
 */
const getOrders = async (req, res) => {
  try {
    let query = `SELECT * FROM orders`;
    const params = [];

    // Jika parameter my_orders=true dan user role pelanggan
    if (req.query.my_orders === 'true' && req.user && req.user.role === 'pelanggan') {
      query += ` WHERE user_id = ? OR buyer_name = ?`;
      params.push(req.user.id, req.user.name);
    }

    query += ` ORDER BY created_at DESC LIMIT 50`;
    let [orders] = await db.query(query, params).catch(async (err) => {
      if (err.code === 'ER_NO_SUCH_TABLE') return [[]];
      throw err;
    });

    return successResponse(res, 200, 'Daftar riwayat pesanan berhasil diambil.', orders);
  } catch (error) {
    console.error('Get Orders Error:', error);
    return errorResponse(res, 500, 'Gagal mengambil riwayat pesanan.', error.message);
  }
};

/**
 * Controller: Mengubah status pesanan (Sedang Dimasak / Siap Dihidangkan / Selesai)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return errorResponse(res, 400, 'Status pesanan wajib disertakan.');
    }
    await db.query(`UPDATE orders SET status = ? WHERE id = ? OR order_number = ?`, [status, id, id]);
    return successResponse(res, 200, `Status pesanan #${id} berhasil diubah menjadi: ${status}`);
  } catch (error) {
    console.error('Update Order Status Error:', error);
    return errorResponse(res, 500, 'Gagal memperbarui status pesanan.', error.message);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  buyProduct,
  getOrders,
  updateOrderStatus,
};

