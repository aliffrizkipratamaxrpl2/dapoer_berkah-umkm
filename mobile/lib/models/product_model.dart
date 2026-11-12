import 'package:intl/intl.dart';

class ProductModel {
  final int id;
  final int categoryId;
  final String categoryName;
  final String name;
  final String? description;
  final double price;
  final int stock;
  final String? imageUrl;
  final String? imageFullUrl;
  final String? createdAt;
  final String? updatedAt;

  ProductModel({
    required this.id,
    required this.categoryId,
    required this.categoryName,
    required this.name,
    this.description,
    required this.price,
    required this.stock,
    this.imageUrl,
    this.imageFullUrl,
    this.createdAt,
    this.updatedAt,
  });

  String get formattedPrice {
    final formatter = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);
    return formatter.format(price);
  }

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      categoryId: json['category_id'] is int 
          ? json['category_id'] 
          : int.parse(json['category_id'].toString()),
      categoryName: json['category_name'] ?? 'Kategori Umum',
      name: json['name'] ?? '',
      description: json['description'],
      price: json['price'] != null ? double.tryParse(json['price'].toString()) ?? 0.0 : 0.0,
      stock: json['stock'] != null ? int.tryParse(json['stock'].toString()) ?? 0 : 0,
      imageUrl: json['image_url'],
      imageFullUrl: json['image_full_url'],
      createdAt: json['created_at'],
      updatedAt: json['updated_at'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'category_id': categoryId,
      'name': name,
      'description': description,
      'price': price,
      'stock': stock,
      'image_url': imageUrl,
    };
  }
}

