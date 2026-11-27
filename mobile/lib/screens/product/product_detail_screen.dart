import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/product_provider.dart';
import '../../config/theme.dart';
import '../../models/product_model.dart';
import '../../services/api_service.dart';
import 'product_form_screen.dart';
import '../order/order_process_screen.dart';

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
  int _buyQuantity = 1;
  bool _isBuying = false;

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
        _buyQuantity = 1;
      });
    } else {
      setState(() {
        _errorMessage = res.message;
        _isLoading = false;
      });
    }
  }

  void _confirmBuyProduct() {
    if (_product == null) return;
    if (_product!.stock <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Maaf, stok menu ini sedang habis!'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    final totalBayar = _product!.price * _buyQuantity;
    String selectedPayment = 'Tunai';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom: MediaQuery.of(context).viewInsets.bottom + 20,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.shopping_bag_outlined, color: AppTheme.secondaryColor, size: 26),
                      const SizedBox(width: 10),
                      const Expanded(
                        child: Text(
                          'Konfirmasi Pesanan & Pembayaran',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.pop(ctx),
                      ),
                    ],
                  ),
                  const Divider(),
                  const SizedBox(height: 8),

                  // Detail Menu & Porsi
                  Text(
                    _product!.name,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '$_buyQuantity porsi x ${_product!.formattedPrice}',
                        style: const TextStyle(fontSize: 14, color: Colors.blueGrey),
                      ),
                      Text(
                        'Rp ${totalBayar.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 17, color: AppTheme.primaryColor),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),

                  // Pilihan Metode Pembayaran
                  const Text(
                    'Pilih Metode Pembayaran:',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF263238)),
                  ),
                  const SizedBox(height: 10),

                  // 1. Tunai (Bayar di Kasir)
                  _buildPaymentOption(
                    title: 'Tunai (Bayar di Kasir)',
                    subtitle: 'Bayar langsung dengan uang tunai saat mengambil makanan',
                    icon: Icons.payments_outlined,
                    value: 'Tunai',
                    groupValue: selectedPayment,
                    onChanged: (val) => setModalState(() => selectedPayment = val!),
                  ),

                  // 2. QRIS (E-Wallet)
                  _buildPaymentOption(
                    title: 'QRIS (GoPay, OVO, DANA, ShopeePay)',
                    subtitle: 'Pindai barcode QRIS langsung dari aplikasi e-wallet Anda',
                    icon: Icons.qr_code_scanner,
                    value: 'QRIS',
                    groupValue: selectedPayment,
                    onChanged: (val) => setModalState(() => selectedPayment = val!),
                  ),

                  // 3. Transfer Bank
                  _buildPaymentOption(
                    title: 'Transfer Bank (BCA, Mandiri, BRI)',
                    subtitle: 'Transfer ke rekening operasional UMKM Dapoer Berkah',
                    icon: Icons.account_balance_outlined,
                    value: 'Transfer Bank',
                    groupValue: selectedPayment,
                    onChanged: (val) => setModalState(() => selectedPayment = val!),
                  ),

                  const SizedBox(height: 12),
                  const Row(
                    children: [
                      Icon(Icons.access_time, size: 16, color: Colors.orange),
                      SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          'Setelah bayar, pesanan langsung dimasak & dihidangkan saat selesai.',
                          style: TextStyle(fontSize: 11, color: Colors.grey),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Tombol Konfirmasi & Bayar
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.secondaryColor,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      icon: const Icon(Icons.check_circle_outline, color: Colors.white),
                      label: Text(
                        'Konfirmasi & Bayar ($selectedPayment)',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.white),
                      ),
                      onPressed: () async {
                        Navigator.pop(ctx);
                        setState(() {
                          _isBuying = true;
                        });

                        final provider = Provider.of<ProductProvider>(context, listen: false);
                        final result = await provider.buyProduct(
                          _product!.id,
                          _buyQuantity,
                          paymentMethod: selectedPayment,
                        );

                        if (!mounted) return;
                        setState(() {
                          _isBuying = false;
                        });

                        if (result['success'] == true) {
                          final transaction = result['data']?['transaction'] ?? {};
                          final orderNumber = transaction['order_number'] ?? 'DB-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';

                          // Buka Layar Alur Menunggu Memasak & Penyajian Menu
                          await Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => OrderProcessScreen(
                                product: _product!,
                                quantity: _buyQuantity,
                                totalPrice: totalBayar,
                                paymentMethod: selectedPayment,
                                orderNumber: orderNumber,
                              ),
                            ),
                          );

                          // Segarkan data produk setelah kembali
                          _loadProductDetail();
                        } else {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(result['message'] ?? 'Pembelian gagal.'),
                              backgroundColor: Colors.redAccent,
                            ),
                          );
                        }
                      },
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildPaymentOption({
    required String title,
    required String subtitle,
    required IconData icon,
    required String value,
    required String groupValue,
    required ValueChanged<String?> onChanged,
  }) {
    final isSelected = value == groupValue;
    return GestureDetector(
      onTap: () => onChanged(value),
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? Colors.green.shade50 : Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? AppTheme.secondaryColor : Colors.grey.shade300,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(icon, color: isSelected ? AppTheme.secondaryColor : Colors.grey.shade700, size: 22),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? AppTheme.secondaryColor : Colors.black87,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                  ),
                ],
              ),
            ),
            Radio<String>(
              value: value,
              groupValue: groupValue,
              activeColor: AppTheme.secondaryColor,
              onChanged: onChanged,
            ),
          ],
        ),
      ),
    );
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
    final user = authProvider.user;
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
                                      color: (user?.isPelanggan == true) ? Colors.green.shade50 : Colors.blue.shade50,
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(
                                        color: (user?.isPelanggan == true) ? Colors.green.shade300 : Colors.blue.shade200,
                                      ),
                                    ),
                                    child: Row(
                                      children: [
                                        Icon(
                                          (user?.isPelanggan == true) ? Icons.shopping_bag_outlined : Icons.info,
                                          color: (user?.isPelanggan == true) ? AppTheme.secondaryColor : Colors.blueAccent,
                                        ),
                                        const SizedBox(width: 10),
                                        Expanded(
                                          child: Text(
                                            (user?.isPelanggan == true)
                                                ? 'Anda masuk sebagai PELANGGAN. Atur jumlah pesanan di bawah, lalu klik "Beli Sekarang". Stok barang akan berkurang otomatis!'
                                                : 'Anda login sebagai KASIR. Untuk mengubah harga, stok, atau menghapus menu, silakan hubungi Admin.',
                                            style: const TextStyle(fontSize: 12, color: Colors.blueGrey),
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
      // Tombol Aksi di Bawah (Admin: Edit/Hapus, Pelanggan & Kasir: Beli Menu dengan Counter)
      bottomNavigationBar: _product == null
          ? null
          : isAdmin
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
              : Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.08),
                        blurRadius: 10,
                        offset: const Offset(0, -3),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      // Counter Jumlah Pesanan
                      Container(
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.grey.shade300),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            IconButton(
                              icon: const Icon(Icons.remove, size: 18),
                              onPressed: (_buyQuantity > 1 && !_isBuying)
                                  ? () => setState(() => _buyQuantity--)
                                  : null,
                            ),
                            Text(
                              '$_buyQuantity',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                            IconButton(
                              icon: const Icon(Icons.add, size: 18),
                              onPressed: (_product!.stock > _buyQuantity && !_isBuying)
                                  ? () => setState(() => _buyQuantity++)
                                  : null,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      // Tombol Beli Sekarang
                      Expanded(
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: _product!.stock > 0 ? AppTheme.secondaryColor : Colors.grey,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                          ),
                          icon: _isBuying
                              ? const SizedBox(
                                  width: 18,
                                  height: 18,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                )
                              : const Icon(Icons.shopping_cart_checkout),
                          label: Text(
                            _product!.stock > 0 ? 'Beli Sekarang' : 'Stok Habis',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                          onPressed: (_product!.stock > 0 && !_isBuying)
                              ? _confirmBuyProduct
                              : null,
                        ),
                      ),
                    ],
                  ),
                ),
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

