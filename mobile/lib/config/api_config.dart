import 'package:flutter/foundation.dart';

class ApiConfig {
  static String? _workingBaseUrl;

  // Daftar kemungkinan URL yang dapat diakses oleh Emulator, HP Fisik, maupun Browser
  static List<String> get candidateUrls {
    if (kIsWeb) return ['http://localhost:5000'];
    return [
      'http://127.0.0.1:5000',
      'http://10.2.15.2:5000',
      'http://10.0.2.2:5000',
      'http://localhost:5000',
      'http://10.2.11.97:5000',
    ];
  }

  static String get baseUrl {
    if (_workingBaseUrl != null) {
      return _workingBaseUrl!;
    }
    if (kIsWeb) {
      return 'http://localhost:5000';
    }
    return 'http://127.0.0.1:5000';
  }

  static void setWorkingBaseUrl(String url) {
    _workingBaseUrl = url;
  }

  // Endpoints
  static String get loginUrl => '$baseUrl/api/auth/login';
  static String get registerUrl => '$baseUrl/api/auth/register';
  static String get profileUrl => '$baseUrl/api/auth/profile';
  static String get categoriesUrl => '$baseUrl/api/categories';
  static String get productsUrl => '$baseUrl/api/products';
}
