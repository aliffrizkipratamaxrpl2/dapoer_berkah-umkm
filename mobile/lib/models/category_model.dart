class CategoryModel {
  final int id;
  final String name;
  final String? description;
  final int totalProducts;
  final String? createdAt;
  final String? updatedAt;

  CategoryModel({
    required this.id,
    required this.name,
    this.description,
    this.totalProducts = 0,
    this.createdAt,
    this.updatedAt,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
      name: json['name'] ?? '',
      description: json['description'],
      totalProducts: json['total_products'] != null 
          ? int.tryParse(json['total_products'].toString()) ?? 0 
          : 0,
      createdAt: json['created_at'],
      updatedAt: json['updated_at'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
    };
  }
}

