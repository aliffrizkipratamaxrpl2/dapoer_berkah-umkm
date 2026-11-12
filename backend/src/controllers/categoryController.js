const db = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Controller: Mengambil semua kategori (termasuk jumlah produk terkait)
 */
const getAllCategories = async (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT c.id, c.name, c.description, c.created_at, c.updated_at,
             COUNT(p.id) AS total_products
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
    `;
    const params = [];

    if (search) {
      query += ` WHERE c.name LIKE ? OR c.description LIKE ?`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` GROUP BY c.id ORDER BY c.name ASC`;

    const [categories] = await db.query(query, params);
    return successResponse(res, 200, 'Daftar kategori berhasil diambil.', categories);
  } catch (error) {
    console.error('Get All Categories Error:', error);
    return errorResponse(res, 500, 'Gagal mengambil daftar kategori.', error.message);
  }
};

/**
 * Controller: Mengambil detail satu kategori berdasarkan ID
 */
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const [categories] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);

    if (categories.length === 0) {
      return errorResponse(res, 404, `Kategori dengan ID ${id} tidak ditemukan.`);
    }

    return successResponse(res, 200, 'Detail kategori berhasil diambil.', categories[0]);
  } catch (error) {
    console.error('Get Category By ID Error:', error);
    return errorResponse(res, 500, 'Gagal mengambil detail kategori.', error.message);
  }
};

/**
 * Controller: Menambah kategori baru (Khusus Role Admin)
 */
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
      return errorResponse(res, 400, 'Nama kategori wajib diisi.');
    }

    const [result] = await db.query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name.trim(), description ? description.trim() : null]
    );

    const newCategory = {
      id: result.insertId,
      name: name.trim(),
      description: description ? description.trim() : null,
    };

    return successResponse(res, 201, 'Kategori baru berhasil ditambahkan.', newCategory);
  } catch (error) {
    console.error('Create Category Error:', error);
    return errorResponse(res, 500, 'Gagal menambahkan kategori.', error.message);
  }
};

/**
 * Controller: Memperbarui kategori (Khusus Role Admin)
 */
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
      return errorResponse(res, 400, 'Nama kategori wajib diisi.');
    }

    const [existing] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 404, `Kategori dengan ID ${id} tidak ditemukan.`);
    }

    await db.query(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name.trim(), description !== undefined ? description : existing[0].description, id]
    );

    const [updated] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    return successResponse(res, 200, 'Kategori berhasil diperbarui.', updated[0]);
  } catch (error) {
    console.error('Update Category Error:', error);
    return errorResponse(res, 500, 'Gagal memperbarui kategori.', error.message);
  }
};

/**
 * Controller: Menghapus kategori (Khusus Role Admin)
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 404, `Kategori dengan ID ${id} tidak ditemukan.`);
    }

    await db.query('DELETE FROM categories WHERE id = ?', [id]);

    return successResponse(res, 200, 'Kategori berhasil dihapus.', { id: parseInt(id, 10) });
  } catch (error) {
    console.error('Delete Category Error:', error);
    return errorResponse(res, 500, 'Gagal menghapus kategori.', error.message);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};

