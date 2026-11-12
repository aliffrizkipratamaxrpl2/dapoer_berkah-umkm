import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  UserModel? _user;
  bool _isLoading = false;
  String? _errorMessage;

  UserModel? get user => _user;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isAuthenticated => _user != null;
  bool get isAdmin => _user?.isAdmin ?? false;

  // Inisialisasi status autentikasi dari token tersimpan
  Future<bool> checkAuthStatus() async {
    final token = await ApiService.getToken();
    if (token == null || token.isEmpty) {
      _user = null;
      notifyListeners();
      return false;
    }

    _isLoading = true;
    notifyListeners();

    final res = await ApiService.getProfile();
    _isLoading = false;

    if (res.success && res.data != null) {
      _user = UserModel.fromJson(res.data!);
      notifyListeners();
      return true;
    } else {
      await ApiService.removeToken();
      _user = null;
      notifyListeners();
      return false;
    }
  }

  // Login
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final res = await ApiService.login(email, password);
    _isLoading = false;

    if (res.success && res.data != null) {
      _user = UserModel.fromJson(res.data!['user']);
      notifyListeners();
      return true;
    } else {
      _errorMessage = res.message;
      notifyListeners();
      return false;
    }
  }

  // Register
  Future<bool> register({
    required String name,
    required String email,
    required String password,
    required String role,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final res = await ApiService.register(
      name: name,
      email: email,
      password: password,
      role: role,
    );
    _isLoading = false;

    if (res.success && res.data != null) {
      _user = UserModel.fromJson(res.data!['user']);
      notifyListeners();
      return true;
    } else {
      _errorMessage = res.message;
      notifyListeners();
      return false;
    }
  }

  // Logout
  Future<void> logout() async {
    await ApiService.removeToken();
    _user = null;
    _errorMessage = null;
    notifyListeners();
  }
}

