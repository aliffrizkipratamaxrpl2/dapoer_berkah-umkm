import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/product_provider.dart';
import '../../config/theme.dart';
import '../../models/product_model.dart';
import '../../services/api_service.dart';
import 'product_form_screen.dart';

class ProductDetailScreen extends StatefulWidget {
  final int productId;

  const ProductDetailScreen({super.key, required this.productId});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  ProductModel? _product;
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadProductDetail();
  }

  Future<void> _loadProductDetail() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final res = await ApiService.getProductById(widget.productId);
    if (!mounted) return;

    if (res.success && res.data != null) {
      setState(() {
        _product = ProductModel.fromJson(res.data!);
        _isLoading = false;
      });
    } else {
      setState(() {
        _errorMessage = res.message;
        _isLoading = false;
      });
    }
  }

  void _confirmDelete() {
    if (_product == null) return;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hapus Menu Produk?'),
        content: Text(
          'Apakah Anda yakin ingin menghapus "${_product!.name}" dari daftar menu UMKM?\nFile foto yang terlampir juga akan dihapus.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () async {
              Navigator.pop(ctx);
              final provider = Provider.of<ProductProvider>(context, listen: false);
              final success = await provider.deleteProduct(_product!.id);

              if (!mounted) return;
              if (success) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Menu produk berhasil dihapus.'),
                    backgroundColor: AppTheme.secondaryColor,
                  ),
                );
                Navigator.pop(context); // Kembali ke katalog produk
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(provider.errorMessage ?? 'Gagal menghapus produk.'),
                    backgroundColor: Colors.redAccent,
                  ),
                );
              }
            },
            child: const Text('Hapus'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final isAdmin = authProvider.isAdmin;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detail Produk Menu'),
        actions: [
          if (isAdmin && _product != null) ...[
            IconButton(
              icon: const Icon(Icons.edit),
              tooltip: 'Edit Menu',
              onPressed: () async {
                await Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => ProductFormScreen(product: _product),
                  ),
                );
                _loadProductDetail();
              },
            ),
            IconButton(
              icon: const Icon(Icons.delete),
              tooltip: 'Hapus Menu',
              onPressed: _confirmDelete,
            ),
          ],
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _errorMessage != null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline, size: 48, color: Colors.redAccent),
                        const SizedBox(height: 12),
                        Text(_errorMessage!, textAlign: TextAlign.center),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: _loadProductDetail,
                          child: const Text('Muat Ulang'),
                        ),
                      ],
                    ),
                  ),
                )
              : _product == null
                  ? const Center(child: Text('Data produk tidak ditemukan.'))
                  : SingleChildScrollView(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Tampilan Gambar Produk Utama (dari upload server)
                          Container(
                            height: 250,
                            width: double.infinity,
                            color: Colors.grey.shade100,
                            child: _product!.imageFullUrl != null
                                ? Image.network(
                                    _product!.imageFullUrl!,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, __, ___) => _buildPlaceholder(),
                                  )
                                : _buildPlaceholder(),
                          ),

                          Padding(
                            padding: const EdgeInsets.all(20.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Badge Kategori
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppTheme.primaryColor.withOpacity(0.12),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    _product!.categoryName,
                                    style: const TextStyle(
                                      color: AppTheme.primaryColor,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 10),

                                // Nama Produk
                                Text(
                                  _product!.name,
                                  style: const TextStyle(
                                    fontSize: 22,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.textDark,
                                  ),
                                ),
                                const SizedBox(height: 12),

                                // Harga & Stok
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      _product!.formattedPrice,
                                      style: const TextStyle(
                                        fontSize: 22,
                                        fontWeight: FontWeight.bold,
                                        color: AppTheme.primaryColor,
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                      decoration: BoxDecoration(
                                        color: _product!.stock > 5 ? Colors.green.shade50 : Colors.red.shade50,
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(
                                          color: _product!.stock > 5 ? Colors.green.shade300 : Colors.red.shade300,
                                        ),
                                      ),
                                      child: Row(
                                        children: [
                                          Icon(
                                            _product!.stock > 5 ? Icons.check_circle : Icons.warning,
                                            size: 16,
                                            color: _product!.stock > 5 ? Colors.green.shade700 : Colors.red.shade700,
                                          ),
                                          const SizedBox(width: 6),
                                          Text(
                                            'Stok Tersedia: ${_product!.stock}',
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 13,
                                              color: _product!.stock > 5 ? Colors.green.shade800 : Colors.red.shade800,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 24),
                                const Divider(),
                                const SizedBox(height: 16),

                                // Deskripsi Menu
                                const Text(
                                  'Deskripsi Menu',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.textDark,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  (_product!.description != null && _product!.description!.isNotEmpty)
                                      ? _product!.description!
                                      : 'Tidak ada deskripsi tambahan untuk produk ini.',
                                  style: const TextStyle(fontSize: 14, color: Color(0xFF455A64), height: 1.5),
                                ),
                                const SizedBox(height: 28),

                                // Informasi Role & Hak Akses
                                if (!isAdmin)
                                  Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: Colors.blue.shade50,
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: Colors.blue.shade200),
                                    ),
                                    child: const Row(
                                      children: [
                                        Icon(Icons.info, color: Colors.blueAccent),
                                        SizedBox(width: 10),
                                        Expanded(
                                          child: Text(
                                            'Anda login sebagai KASIR. Untuk mengubah harga, stok, atau menghapus menu, silakan hubungi Admin.',
                                            style: TextStyle(fontSize: 12, color: Colors.blueGrey),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
      // Tombol Aksi di Bawah (Khusus Admin)
      bottomNavigationBar: isAdmin && _product != null
          ? Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.06),
                    blurRadius: 10,
                    offset: const Offset(0, -3),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        side: const BorderSide(color: Colors.redAccent),
                      ),
                      icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
                      label: const Text('Hapus Menu', style: TextStyle(color: Colors.redAccent)),
                      onPressed: _confirmDelete,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                      ),
                      icon: const Icon(Icons.edit),
                      label: const Text('Edit Menu'),
                      onPressed: () async {
                        await Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => ProductFormScreen(product: _product),
                          ),
                        );
                        _loadProductDetail();
                      },
                    ),
                  ),
                ],
              ),
            )
          : null,
    );
  }

  Widget _buildPlaceholder() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: const [
          Icon(Icons.image_not_supported_outlined, size: 54, color: AppTheme.textMuted),
          SizedBox(height: 8),
          Text('Belum ada foto menu', style: TextStyle(color: AppTheme.textMuted)),
        ],
      ),
    );
  }
}

