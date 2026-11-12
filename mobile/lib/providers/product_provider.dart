import 'dart:io';
import 'package:flutter/material.dart';
import '../models/product_model.dart';
import '../services/api_service.dart';

class ProductProvider with ChangeNotifier {
  List<ProductModel> _products = [];
  bool _isLoading = false;
  String? _errorMessage;
  int? _selectedCategoryId;
  String _searchQuery = '';

  List<ProductModel> get products => _products;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  int? get selectedCategoryId => _selectedCategoryId;
  String get searchQuery => _searchQuery;

  // Filter Kategori
  void setCategoryFilter(int? categoryId) {
    _selectedCategoryId = categoryId;
    fetchProducts();
  }

  // Set Search Query
  void setSearchQuery(String query) {
    _searchQuery = query;
    fetchProducts();
  }

  Future<void> fetchProducts() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final res = await ApiService.getProducts(
      categoryId: _selectedCategoryId,
      search: _searchQuery.isNotEmpty ? _searchQuery : null,
    );
    _isLoading = false;

    if (res.success && res.data != null) {
      _products = (res.data as List).map((e) => ProductModel.fromJson(e)).toList();
    } else {
      _errorMessage = res.message;
    }
    notifyListeners();
  }

  Future<bool> addProduct({
    required int categoryId,
    required String name,
    String? description,
    required double price,
    required int stock,
    File? imageFile,
  }) async {
    _isLoading = true;
    notifyListeners();

    final res = await ApiService.createProduct(
      categoryId: categoryId,
      name: name,
      description: description,
      price: price,
      stock: stock,
      imageFile: imageFile,
    );
    _isLoading = false;

    if (res.success) {
      await fetchProducts();
      return true;
    } else {
      _errorMessage = res.message;
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateProduct({
    required int id,
    required int categoryId,
    required String name,
    String? description,
    required double price,
    required int stock,
    File? imageFile,
  }) async {
    _isLoading = true;
    notifyListeners();

    final res = await ApiService.updateProduct(
      id: id,
      categoryId: categoryId,
      name: name,
      description: description,
      price: price,
      stock: stock,
      imageFile: imageFile,
    );
    _isLoading = false;

    if (res.success) {
      await fetchProducts();
      return true;
    } else {
      _errorMessage = res.message;
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteProduct(int id) async {
    _isLoading = true;
    notifyListeners();

    final res = await ApiService.deleteProduct(id);
    _isLoading = false;

    if (res.success) {
      _products.removeWhere((item) => item.id == id);
      notifyListeners();
      return true;
    } else {
      _errorMessage = res.message;
      notifyListeners();
      return false;
    }
  }
}

