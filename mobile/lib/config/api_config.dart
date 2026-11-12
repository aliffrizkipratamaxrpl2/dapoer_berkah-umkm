import 'package:flutter/foundation.dart';

class ApiConfig {
  // Catatan koneksi:
  // - Flutter Web (Chrome) & Windows Desktop: http://localhost:5000
  // - Android Emulator: http://10.0.2.2:5000
  // - HP Fisik: Gunakan IP Laptop/PC lokal (misal: http://192.168.1.X:5000)
  static String get baseUrl {
    if (kIsWeb) {
      return 'http://localhost:5000';
    }
    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:5000';
    }
    return 'http://localhost:5000';
  }

  // Endpoints
  static String get loginUrl => '$baseUrl/api/auth/login';
  static String get registerUrl => '$baseUrl/api/auth/register';
  static String get profileUrl => '$baseUrl/api/auth/profile';
  static String get categoriesUrl => '$baseUrl/api/categories';
  static String get productsUrl => '$baseUrl/api/products';
}
