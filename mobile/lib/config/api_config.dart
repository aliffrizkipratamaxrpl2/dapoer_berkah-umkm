import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class ApiConfig {
  static String? _workingBaseUrl;

  // Daftar kemungkinan URL yang dapat diakses oleh Emulator, HP Fisik, maupun Browser
  static List<String> get candidateUrls {
    if (kIsWeb) return ['http://localhost:5000'];
    return [
      'http://172.16.1.2:5000',       // Jalur Khusus LDPlayer ke PC Host (Permanen & Cepat)
      'http://127.0.0.1:5000',       // Localhost (Jalur adb reverse)
      'http://192.168.100.165:5000', // Wi-Fi Rumah saat ini
      'http://10.0.2.2:5000',        // Jalur Android Studio AVD ke PC Host
      'http://10.2.15.2:5000',       // Wi-Fi Sekolah
      'http://10.0.3.2:5000',        // Genymotion
      'http://localhost:5000',
    ];
  }

  static String get baseUrl {
    if (_workingBaseUrl != null) {
      return _workingBaseUrl!;
    }
    if (kIsWeb) {
      return 'http://localhost:5000';
    }
    // Default tercepat untuk LDPlayer
    return 'http://172.16.1.2:5000';
  }

  static void setWorkingBaseUrl(String url) {
    _workingBaseUrl = url;
  }

  static bool get isConnected => _workingBaseUrl != null;

  // Tes ulang koneksi ke semua candidate URLs secara langsung
  static Future<bool> pingBackend() async {
    _workingBaseUrl = null;
    for (final url in candidateUrls) {
      try {
        final res = await http.get(Uri.parse(url)).timeout(const Duration(milliseconds: 1200));
        if (res.statusCode == 200) {
          _workingBaseUrl = url;
          debugPrint('[ApiConfig] Berhasil terhubung ke: $url');
          return true;
        }
      } catch (_) {}
    }
    return false;
  }

  // Otomatis mendeteksi IP yang aktif merespon
  static Future<String> detectWorkingBaseUrl() async {
    if (_workingBaseUrl != null) return _workingBaseUrl!;

    for (final url in candidateUrls) {
      try {
        final res = await http.get(Uri.parse(url)).timeout(const Duration(milliseconds: 1500));
        if (res.statusCode == 200) {
          _workingBaseUrl = url;
          debugPrint('[ApiConfig] Terhubung ke backend: $url');
          return url;
        }
      } catch (_) {
        // Coba url berikutnya
      }
    }
    return baseUrl;
  }

  // Endpoints
  static String get loginUrl => '$baseUrl/api/auth/login';
  static String get registerUrl => '$baseUrl/api/auth/register';
  static String get profileUrl => '$baseUrl/api/auth/profile';
  static String get categoriesUrl => '$baseUrl/api/categories';
  static String get productsUrl => '$baseUrl/api/products';
}
