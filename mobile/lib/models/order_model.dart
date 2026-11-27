class OrderModel {
  final int id;
  final String orderNumber;
  final int? userId;
  final String buyerName;
  final int productId;
  final String productName;
  final int quantity;
  final double pricePerItem;
  final double totalPrice;
  final String paymentMethod;
  final String status;
  final int estimatedMinutes;
  final String createdAt;

  OrderModel({
    required this.id,
    required this.orderNumber,
    this.userId,
    required this.buyerName,
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.pricePerItem,
    required this.totalPrice,
    required this.paymentMethod,
    required this.status,
    required this.estimatedMinutes,
    required this.createdAt,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()) ?? 0,
      orderNumber: json['order_number'] ?? '',
      userId: json['user_id'] is int ? json['user_id'] : int.tryParse(json['user_id']?.toString() ?? ''),
      buyerName: json['buyer_name'] ?? 'Pelanggan',
      productId: json['product_id'] is int ? json['product_id'] : int.tryParse(json['product_id'].toString()) ?? 0,
      productName: json['product_name'] ?? 'Menu Makanan',
      quantity: json['quantity'] is int ? json['quantity'] : int.tryParse(json['quantity'].toString()) ?? 1,
      pricePerItem: double.tryParse(json['price_per_item']?.toString() ?? '0') ?? 0.0,
      totalPrice: double.tryParse(json['total_price']?.toString() ?? '0') ?? 0.0,
      paymentMethod: json['payment_method'] ?? 'Tunai',
      status: json['status'] ?? 'Sedang Dimasak',
      estimatedMinutes: json['estimated_minutes'] is int ? json['estimated_minutes'] : 3,
      createdAt: json['created_at'] ?? '',
    );
  }

  String get formattedTotalPrice {
    return 'Rp ${totalPrice.toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.')}';
  }

  String get formattedDate {
    if (createdAt.isEmpty) return '-';
    try {
      final dt = DateTime.parse(createdAt).toLocal();
      final day = dt.day.toString().padLeft(2, '0');
      final monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
      ];
      final month = monthNames[dt.month - 1];
      final year = dt.year;
      final hour = dt.hour.toString().padLeft(2, '0');
      final min = dt.minute.toString().padLeft(2, '0');
      return '$day $month $year, $hour:$min WIB';
    } catch (_) {
      return createdAt;
    }
  }
}
