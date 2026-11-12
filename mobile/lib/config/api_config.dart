import 'dart:io';

class ApiConfig {
  // Catatan koneksi:
  // - Android Emulator: 10.0.2.2
  // - iOS Simulator: localhost / 127.0.0.1
  // - Perangkat Fisik (HP): Gunakan IP Laptop/PC lokal (misal: 192.168.1.X)
  static String get baseUrl {
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:5000';
    } else {
      return 'http://localhost:5000';
    }
  }

  // Endpoints
  static String get loginUrl => '$baseUrl/api/auth/login';
  static String get registerUrl => '$baseUrl/api/auth/register';
  static String get profileUrl => '$baseUrl/api/auth/profile';
  static String get categoriesUrl => '$baseUrl/api/categories';
  static String get productsUrl => '$baseUrl/api/products';
}

