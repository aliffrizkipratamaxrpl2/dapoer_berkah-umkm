import 'dart:async';
import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../models/product_model.dart';
import '../../services/api_service.dart';
import 'order_history_screen.dart';

enum OrderStatusPhase {
  paymentConfirmed,
  cooking,
  readyToServe,
}

class OrderProcessScreen extends StatefulWidget {
  final ProductModel product;
  final int quantity;
  final double totalPrice;
  final String paymentMethod;
  final String orderNumber;

  const OrderProcessScreen({
    Key? key,
    required this.product,
    required this.quantity,
    required this.totalPrice,
    required this.paymentMethod,
    required this.orderNumber,
  }) : super(key: key);

  @override
  State<OrderProcessScreen> createState() => _OrderProcessScreenState();
}

class _OrderProcessScreenState extends State<OrderProcessScreen> with SingleTickerProviderStateMixin {
  OrderStatusPhase _phase = OrderStatusPhase.cooking;
  int _remainingSeconds = 180; // 3 Menit estimasi memasak
  final int _totalSeconds = 180;
  Timer? _timer;
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 0.95, end: 1.08).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _startCookingTimer();
  }

  void _startCookingTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      if (_remainingSeconds > 1) {
        setState(() {
          _remainingSeconds--;
        });
      } else {
        _finishCooking();
      }
    });
  }

  void _finishCooking() {
    _timer?.cancel();
    if (!mounted) return;
    setState(() {
      _remainingSeconds = 0;
      _phase = OrderStatusPhase.readyToServe;
    });

    // Otomatis sinkronkan status pesanan ke backend menjadi 'Siap Dihidangkan'
    ApiService.updateOrderStatus(widget.orderNumber, 'Siap Dihidangkan').catchError((_) {
      return ApiResponse(success: false, message: 'Gagal update status');
    });
  }

  // Tombol simulasi cepat untuk demonstrasi saat ujian di depan penguji
  void _skipTimerForDemo() {
    _finishCooking();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pulseController.dispose();
    super.dispose();
  }

  String _formatTime(int totalSeconds) {
    final minutes = (totalSeconds ~/ 60).toString().padLeft(2, '0');
    final seconds = (totalSeconds % 60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  String _formatRupiah(double amount) {
    return 'Rp ${amount.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}';
  }

  @override
  Widget build(BuildContext context) {
    final isReady = _phase == OrderStatusPhase.readyToServe;
    final progress = (_totalSeconds - _remainingSeconds) / _totalSeconds;

    return WillPopScope(
      onWillPop: () async {
        if (!isReady) {
          final shouldLeave = await showDialog<bool>(
            context: context,
            builder: (ctx) => AlertDialog(
              title: const Text('Pesanan Sedang Diproses'),
              content: const Text(
                'Pesanan Anda sedang dimasak di dapur. Anda tetap bisa kembali ke menu utama, stok sudah otomatis berkurang.',
              ),
              actions: [
                TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Tetap Di Sini')),
                ElevatedButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Kembali ke Menu')),
              ],
            ),
          );
          return shouldLeave ?? false;
        }
        return true;
      },
      child: Scaffold(
        backgroundColor: isReady ? const Color(0xFFF1F8E9) : const Color(0xFFF9FBFD),
        appBar: AppBar(
          title: Text(isReady ? 'Pesanan Siap Dihidangkan' : 'Status Pesanan Makanan'),
          backgroundColor: isReady ? Colors.green.shade700 : AppTheme.primaryColor,
          elevation: 0,
          automaticallyImplyLeading: isReady,
        ),
        body: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Kartu Nomor Pesanan & Pembayaran
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.04),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'NOMOR PESANAN',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            widget.orderNumber,
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF263238)),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.green.shade50,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.green.shade300),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.check_circle, size: 16, color: Colors.green),
                            const SizedBox(width: 6),
                            Text(
                              'Bayar: ${widget.paymentMethod}',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: Colors.green.shade800,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Animasi Ikon Status (Memasak vs Siap Dihidangkan)
                ScaleTransition(
                  scale: isReady ? const AlwaysStoppedAnimation(1.0) : _pulseAnimation,
                  child: Container(
                    width: 140,
                    height: 140,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isReady ? Colors.green.shade100 : Colors.orange.shade50,
                      border: Border.all(
                        color: isReady ? Colors.green.shade400 : AppTheme.primaryColor,
                        width: 3,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: (isReady ? Colors.green : AppTheme.primaryColor).withOpacity(0.2),
                          blurRadius: 20,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    child: Center(
                      child: isReady
                          ? const Icon(Icons.restaurant, size: 75, color: Colors.green)
                          : const Icon(Icons.outdoor_grill_outlined, size: 75, color: AppTheme.primaryColor),
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                // Judul Status Utama
                Text(
                  isReady ? '🎉 MENU SUDAH JADI & SIAP DIHIDANGKAN!' : '🍳 PESANAN SEDANG DIMASAK...',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: isReady ? Colors.green.shade800 : AppTheme.primaryColor,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  isReady
                      ? 'Hidangan lezat Anda telah selesai dimasak oleh koki. Silakan ambil di meja kasir / tunggu pelayan mengantarkan ke meja Anda. Selamat menikmati!'
                      : 'Koki Dapoer Berkah sedang meracik hidangan pesanan Anda dengan bumbu rempah pilihan. Mohon tunggu beberapa menit ya!',
                  textAlign: TextAlign.center,
                  style: const TextStyle(fontSize: 13, color: Color(0xFF546E7A), height: 1.5),
                ),
                const SizedBox(height: 24),

                // Timer & Progress Bar (Jika masih proses memasak)
                if (!isReady) ...[
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.orange.shade200),
                    ),
                    child: Column(
                      children: [
                        const Text(
                          'Estimasi Waktu Memasak:',
                          style: TextStyle(fontSize: 13, color: Colors.grey),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          _formatTime(_remainingSeconds),
                          style: const TextStyle(
                            fontSize: 38,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFD84315),
                            letterSpacing: 2,
                          ),
                        ),
                        const SizedBox(height: 12),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: LinearProgressIndicator(
                            value: progress,
                            minHeight: 10,
                            backgroundColor: Colors.grey.shade200,
                            valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryColor),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Proses: ${(progress * 100).toInt()}% selesai',
                          style: const TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Tombol Simulasi Cepat (Sangat Berguna Saat Ujian di Depan Penguji)
                  OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppTheme.secondaryColor,
                      side: BorderSide(color: AppTheme.secondaryColor),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    icon: const Icon(Icons.flash_on, size: 18),
                    label: const Text('⚡ Percepat Memasak (Simulasi Uji Level)'),
                    onPressed: _skipTimerForDemo,
                  ),
                ],

                // Kartu Sukses Siap Santap (Jika sudah selesai masak)
                if (isReady) ...[
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.green.shade300, width: 1.5),
                    ),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.check_circle_outline, color: Colors.green, size: 28),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    widget.product.name,
                                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '${widget.quantity} Porsi • Total: ${_formatRupiah(widget.totalPrice)}',
                                    style: TextStyle(fontSize: 13, color: Colors.green.shade800, fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const Divider(height: 24),
                        Row(
                          children: const [
                            Icon(Icons.room_service_outlined, size: 20, color: Colors.green),
                            SizedBox(width: 8),
                            Text(
                              'Status: Siap Disajikan di Meja Anda',
                              style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.green),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.indigo.shade600,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      icon: const Icon(Icons.receipt_long, color: Colors.white),
                      label: const Text(
                        'Lihat di Riwayat Pesanan',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                      onPressed: () {
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(builder: (_) => const OrderHistoryScreen()),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 10),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        side: BorderSide(color: Colors.green.shade700, width: 1.5),
                      ),
                      icon: Icon(Icons.done_all, color: Colors.green.shade700),
                      label: Text(
                        'Pesanan Selesai (Kembali ke Beranda)',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.green.shade700),
                      ),
                      onPressed: () {
                        Navigator.pop(context, true);
                      },
                    ),
                  ),
                ],

                const SizedBox(height: 24),
                // Stepper Visual Alur Pesanan
                _buildOrderStepper(isReady),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // Visual Stepper 3 Langkah
  Widget _buildOrderStepper(bool isReady) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Alur Transaksi & Penyajian:',
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF37474F)),
          ),
          const SizedBox(height: 14),
          _buildStepRow(
            icon: Icons.payment,
            title: '1. Pembayaran Berhasil',
            subtitle: 'Metode: ${widget.paymentMethod} • Stok terpotong otomatis',
            isCompleted: true,
            isActive: false,
          ),
          _buildStepDivider(isCompleted: true),
          _buildStepRow(
            icon: Icons.soup_kitchen,
            title: '2. Sedang Dimasak di Dapur',
            subtitle: isReady ? 'Selesai dimasak dengan sempurna' : 'Koki sedang mempersiapkan pesanan',
            isCompleted: isReady,
            isActive: !isReady,
          ),
          _buildStepDivider(isCompleted: isReady),
          _buildStepRow(
            icon: Icons.flatware,
            title: '3. Siap Dihidangkan',
            subtitle: isReady ? 'Menu siap dinikmati di meja Anda!' : 'Menunggu makanan matang',
            isCompleted: isReady,
            isActive: isReady,
          ),
        ],
      ),
    );
  }

  Widget _buildStepRow({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool isCompleted,
    required bool isActive,
  }) {
    Color color = Colors.grey;
    if (isCompleted) {
      color = Colors.green;
    } else if (isActive) {
      color = AppTheme.primaryColor;
    }

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: color.withOpacity(0.12),
          ),
          child: Icon(icon, size: 20, color: color),
        ),
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
                  color: isCompleted ? Colors.green.shade800 : (isActive ? AppTheme.primaryColor : Colors.grey.shade700),
                ),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
              ),
            ],
          ),
        ),
        if (isCompleted)
          const Icon(Icons.check, size: 18, color: Colors.green)
        else if (isActive)
          SizedBox(
            width: 14,
            height: 14,
            child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.primaryColor),
          ),
      ],
    );
  }

  Widget _buildStepDivider({required bool isCompleted}) {
    return Container(
      margin: const EdgeInsets.only(left: 15, top: 4, bottom: 4),
      height: 18,
      width: 2,
      color: isCompleted ? Colors.green : Colors.grey.shade300,
    );
  }
}
