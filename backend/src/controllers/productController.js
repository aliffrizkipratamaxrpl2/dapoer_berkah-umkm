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

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};

