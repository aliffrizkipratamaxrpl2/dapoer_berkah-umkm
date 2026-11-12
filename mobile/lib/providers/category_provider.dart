import 'package:flutter/material.dart';
import '../models/category_model.dart';
import '../services/api_service.dart';

class CategoryProvider with ChangeNotifier {
  List<CategoryModel> _categories = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<CategoryModel> get categories => _categories;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchCategories({String? search}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final res = await ApiService.getCategories(search: search);
    _isLoading = false;

    if (res.success && res.data != null) {
      _categories = (res.data as List).map((e) => CategoryModel.fromJson(e)).toList();
    } else {
      _errorMessage = res.message;
    }
    notifyListeners();
  }

  Future<bool> addCategory(String name, String? description) async {
    _isLoading = true;
    notifyListeners();

    final res = await ApiService.createCategory(name, description);
    _isLoading = false;

    if (res.success) {
      await fetchCategories();
      return true;
    } else {
      _errorMessage = res.message;
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateCategory(int id, String name, String? description) async {
    _isLoading = true;
    notifyListeners();

    final res = await ApiService.updateCategory(id, name, description);
    _isLoading = false;

    if (res.success) {
      await fetchCategories();
      return true;
    } else {
      _errorMessage = res.message;
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteCategory(int id) async {
    _isLoading = true;
    notifyListeners();

    final res = await ApiService.deleteCategory(id);
    _isLoading = false;

    if (res.success) {
      _categories.removeWhere((item) => item.id == id);
      notifyListeners();
      return true;
    } else {
      _errorMessage = res.message;
      notifyListeners();
      return false;
    }
  }
}

