import 'dart:convert';
import 'dart:async';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../models/order_model.dart';

class ApiResponse<T> {
  final bool success;
  final String message;
  final T? data;

  ApiResponse({
    required this.success,
    required this.message,
    this.data,
  });
}

// Helper untuk mendeteksi content type gambar secara otomatis
MediaType _getImageContentType(String filename) {
  final ext = filename.split('.').last.toLowerCase();
  switch (ext) {
    case 'png':
      return MediaType('image', 'png');
    case 'webp':
      return MediaType('image', 'webp');
    case 'gif':
      return MediaType('image', 'gif');
    case 'bmp':
      return MediaType('image', 'bmp');
    case 'svg':
      return MediaType('image', 'svg+xml');
    default:
      return MediaType('image', 'jpeg');
  }
}

class ApiService {
  static const String _tokenKey = 'auth_token';

  // Menyimpan token ke lokal storage
  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tokenKey, token);
  }

  // Mengambil token dari lokal storage
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_tokenKey);
  }

  // Menghapus token saat logout
  static Future<void> removeToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
  }

  // Header standar dengan Bearer token
  static Future<Map<String, String>> _getHeaders({bool isJson = true}) async {
    final token = await getToken();
    final Map<String, String> headers = {
      'Accept': 'application/json',
    };
    if (isJson) {
      headers['Content-Type'] = 'application/json';
    }
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  // ------------------------------------------------------------------------
  // AUTH SERVICES
  // ------------------------------------------------------------------------
  static Future<ApiResponse<Map<String, dynamic>>> login(String email, String password) async {
    final urlsToTry = [
      ApiConfig.baseUrl,
      ...ApiConfig.candidateUrls.where((u) => u != ApiConfig.baseUrl)
    ];

    String lastError = '';

    for (final base in urlsToTry) {
      try {
        final response = await http.post(
          Uri.parse('$base/api/auth/login'),
          headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
          body: jsonEncode({'email': email, 'password': password}),
        ).timeout(const Duration(seconds: 4));

        final body = jsonDecode(response.body);
        if (response.statusCode == 200 && body['success'] == true) {
          ApiConfig.setWorkingBaseUrl(base);
          final token = body['data']['token'];
          await saveToken(token);
          return ApiResponse(success: true, message: body['message'], data: body['data']);
        } else {
          return ApiResponse(success: false, message: body['message'] ?? 'Login gagal.');
        }
      } catch (e) {
        lastError = e.toString();
        continue;
      }
    }

    if (lastError.contains('Connection refused') || lastError.contains('Failed host lookup') || lastError.contains('TimeoutException')) {
      return ApiResponse(success: false, message: 'Gagal terhubung ke backend. Pastikan server backend ("npm run dev") sudah dijalankan.');
    }
    return ApiResponse(success: false, message: 'Koneksi error: $lastError');
  }

  static Future<ApiResponse<Map<String, dynamic>>> register({
    required String name,
    required String email,
    required String password,
    required String role,
  }) async {
    final urlsToTry = [
      ApiConfig.baseUrl,
      ...ApiConfig.candidateUrls.where((u) => u != ApiConfig.baseUrl)
    ];

    String lastError = '';

    for (final base in urlsToTry) {
      try {
        final response = await http.post(
          Uri.parse('$base/api/auth/register'),
          headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
          body: jsonEncode({
            'name': name,
            'email': email,
            'password': password,
            'role': role,
          }),
        ).timeout(const Duration(seconds: 4));

        final body = jsonDecode(response.body);
        if (response.statusCode == 201 && body['success'] == true) {
          ApiConfig.setWorkingBaseUrl(base);
          final token = body['data']['token'];
          await saveToken(token);
          return ApiResponse(success: true, message: body['message'], data: body['data']);
        } else {
          return ApiResponse(success: false, message: body['message'] ?? 'Registrasi gagal.');
        }
      } catch (e) {
        lastError = e.toString();
        continue;
      }
    }

    return ApiResponse(success: false, message: 'Koneksi error: $lastError');
  }

  static Future<ApiResponse<Map<String, dynamic>>> getProfile() async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(Uri.parse(ApiConfig.profileUrl), headers: headers);
      final body = jsonDecode(response.body);
      if (response.statusCode == 200 && body['success'] == true) {
        return ApiResponse(success: true, message: body['message'], data: body['data']);
      }
      return ApiResponse(success: false, message: body['message'] ?? 'Gagal memuat profil.');
    } catch (e) {
      return ApiResponse(success: false, message: 'Koneksi error: $e');
    }
  }

  // ------------------------------------------------------------------------
  // CATEGORIES SERVICES (CRUD)
  // ------------------------------------------------------------------------
  static Future<ApiResponse<List<dynamic>>> getCategories({String? search}) async {
    try {
      final headers = await _getHeaders();
      String url = ApiConfig.categoriesUrl;
      if (search != null && search.isNotEmpty) {
        url += '?search=${Uri.encodeComponent(search)}';
      }
      final response = await http.get(Uri.parse(url), headers: headers);
      final body = jsonDecode(response.body);
      if (response.statusCode == 200 && body['success'] == true) {
        return ApiResponse(success: true, message: body['message'], data: body['data']);
      }
      return ApiResponse(success: false, message: body['message'] ?? 'Gagal memuat kategori.');
    } catch (e) {
      return ApiResponse(success: false, message: 'Koneksi error: $e');
    }
  }

  static Future<ApiResponse<Map<String, dynamic>>> createCategory(String name, String? description) async {
    try {
      final headers = await _getHeaders();
      final response = await http.post(
        Uri.parse(ApiConfig.categoriesUrl),
        headers: headers,
        body: jsonEncode({'name': name, 'description': description}),
      );
      final body = jsonDecode(response.body);
      if (response.statusCode == 201 && body['success'] == true) {
        return ApiResponse(success: true, message: body['message'], data: body['data']);
      }
      return ApiResponse(success: false, message: body['message'] ?? 'Gagal menambah kategori.');
    } catch (e) {
      return ApiResponse(success: false, message: 'Koneksi error: $e');
    }
  }

  static Future<ApiResponse<Map<String, dynamic>>> updateCategory(int id, String name, String? description) async {
    try {
      final headers = await _getHeaders();
      final response = await http.put(
        Uri.parse('${ApiConfig.categoriesUrl}/$id'),
        headers: headers,
        body: jsonEncode({'name': name, 'description': description}),
      );
      final body = jsonDecode(response.body);
      if (response.statusCode == 200 && body['success'] == true) {
        return ApiResponse(success: true, message: body['message'], data: body['data']);
      }
      return ApiResponse(success: false, message: body['message'] ?? 'Gagal memperbarui kategori.');
    } catch (e) {
      return ApiResponse(success: false, message: 'Koneksi error: $e');
    }
  }

  static Future<ApiResponse<void>> deleteCategory(int id) async {
    try {
      final headers = await _getHeaders();
      final response = await http.delete(
        Uri.parse('${ApiConfig.categoriesUrl}/$id'),
        headers: headers,
      );
      final body = jsonDecode(response.body);
      if (response.statusCode == 200 && body['success'] == true) {
        return ApiResponse(success: true, message: body['message']);
      }
      return ApiResponse(success: false, message: body['message'] ?? 'Gagal menghapus kategori.');
    } catch (e) {
      return ApiResponse(success: false, message: 'Koneksi error: $e');
    }
  }

  // ------------------------------------------------------------------------
  // PRODUCTS SERVICES (CRUD + File Upload Bebas)
  // ------------------------------------------------------------------------
  static Future<ApiResponse<List<dynamic>>> getProducts({int? categoryId, String? search}) async {
    try {
      final headers = await _getHeaders();
      String url = ApiConfig.productsUrl;
      List<String> queryParams = [];
      if (categoryId != null) queryParams.add('category_id=$categoryId');
      if (search != null && search.isNotEmpty) queryParams.add('search=${Uri.encodeComponent(search)}');

      if (queryParams.isNotEmpty) {
        url += '?${queryParams.join('&')}';
      }

      final response = await http.get(Uri.parse(url), headers: headers);
      final body = jsonDecode(response.body);
      if (response.statusCode == 200 && body['success'] == true) {
        return ApiResponse(success: true, message: body['message'], data: body['data']);
      }
      return ApiResponse(success: false, message: body['message'] ?? 'Gagal memuat produk.');
    } catch (e) {
      return ApiResponse(success: false, message: 'Koneksi error: $e');
    }
  }

  static Future<ApiResponse<Map<String, dynamic>>> getProductById(int id) async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(Uri.parse('${ApiConfig.productsUrl}/$id'), headers: headers);
      final body = jsonDecode(response.body);
      if (response.statusCode == 200 && body['success'] == true) {
        return ApiResponse(success: true, message: body['message'], data: body['data']);
      }
      return ApiResponse(success: false, message: body['message'] ?? 'Gagal memuat detail produk.');
    } catch (e) {
      return ApiResponse(success: false, message: 'Koneksi error: $e');
    }
  }

  // Upload Produk Baru (Multipart Form Data untuk gambar, bebas jenis gambar)
  static Future<ApiResponse<Map<String, dynamic>>> createProduct({
    required int categoryId,
    required String name,
    String? description,
    required double price,
    required int stock,
    XFile? imageFile,
  }) async {
    try {
      final token = await getToken();
      final uri = Uri.parse(ApiConfig.productsUrl);
      final request = http.MultipartRequest('POST', uri);

      if (token != null && token.isNotEmpty) {
        request.headers['Authorization'] = 'Bearer $token';
      }
      request.headers['Accept'] = 'application/json';

      // Field teks
      request.fields['category_id'] = categoryId.toString();
      request.fields['name'] = name;
      if (description != null) request.fields['description'] = description;
      request.fields['price'] = price.toString();
      request.fields['stock'] = stock.toString();

      // Field file gambar (jika dipilih)
      if (imageFile != null) {
        final bytes = await imageFile.readAsBytes();
        final fileName = imageFile.name.isNotEmpty 
            ? imageFile.name 
            : 'produk_${DateTime.now().millisecondsSinceEpoch}.jpg';
        request.files.add(
          http.MultipartFile.fromBytes(
            'image', 
            bytes, 
            filename: fileName,
            contentType: _getImageContentType(fileName),
          ),
        );
      }

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);
      final body = jsonDecode(response.body);

      if (response.statusCode == 201 && body['success'] == true) {
        return ApiResponse(success: true, message: body['message'], data: body['data']);
      }
      return ApiResponse(success: false, message: body['message'] ?? 'Gagal menambahkan produk.');
    } catch (e) {
      return ApiResponse(success: false, message: 'Koneksi error: $e');
    }
  }

  // Update Produk (Bisa menyertakan gambar baru atau mempertahankan yang lama)
  static Future<ApiResponse<Map<String, dynamic>>> updateProduct({
    required int id,
    required int categoryId,
    required String name,
    String? description,
    required double price,
    required int stock,
    XFile? imageFile,
  }) async {
    try {
      final token = await getToken();
      final uri = Uri.parse('${ApiConfig.productsUrl}/$id');
      final request = http.MultipartRequest('PUT', uri);

      if (token != null && token.isNotEmpty) {
        request.headers['Authorization'] = 'Bearer $token';
      }
      request.headers['Accept'] = 'application/json';

      request.fields['category_id'] = categoryId.toString();
      request.fields['name'] = name;
      if (description != null) request.fields['description'] = description;
      request.fields['price'] = price.toString();
      request.fields['stock'] = stock.toString();

      if (imageFile != null) {
        final bytes = await imageFile.readAsBytes();
        final fileName = imageFile.name.isNotEmpty 
            ? imageFile.name 
            : 'produk_${DateTime.now().millisecondsSinceEpoch}.jpg';
        request.files.add(
          http.MultipartFile.fromBytes(
            'image', 
            bytes, 
            filename: fileName,
            contentType: _getImageContentType(fileName),
          ),
        );
      }

      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);
      final body = jsonDecode(response.body);

      if (response.statusCode == 200 && body['success'] == true) {
        return ApiResponse(success: true, message: body['message'], data: body['data']);
      }
      return ApiResponse(success: false, message: body['message'] ?? 'Gagal memperbarui produk.');
    } catch (e) {
      return ApiResponse(success: false, message: 'Koneksi error: $e');
    }
  }

  // Hapus Produk
  static Future<ApiResponse<void>> deleteProduct(int id) async {
    try {
      final headers = await _getHeaders();
      final response = await http.delete(
        Uri.parse('${ApiConfig.productsUrl}/$id'),
        headers: headers,
      );
      final body = jsonDecode(response.body);
      if (response.statusCode == 200 && body['success'] == true) {
        return ApiResponse(success: true, message: body['message']);
      }
      return ApiResponse(success: false, message: body['message'] ?? 'Gagal menghapus produk.');
    } catch (e) {
      return ApiResponse(success: false, message: 'Koneksi error: $e');
    }
  }

  // Beli Produk (Otomatis Mengurangi Stok di Database & Pilihan Metode Pembayaran)
  static Future<ApiResponse<Map<String, dynamic>>> buyProduct(
    int id,
    int quantity, {
    String paymentMethod = 'Tunai',
    String notes = '',
  }) async {
    try {
      final headers = await _getHeaders(isJson: true);
      final response = await http.post(
        Uri.parse('${ApiConfig.productsUrl}/$id/buy'),
        headers: headers,
        body: jsonEncode({
          'quantity': quantity,
          'payment_method': paymentMethod,
          'notes': notes,
        }),
      ).timeout(const Duration(seconds: 10));

      final body = jsonDecode(response.body);
      if (response.statusCode == 200 && body['success'] == true) {
        return ApiResponse(
          success: true,
          message: body['message'],
          data: body['data'] is Map<String, dynamic> ? body['data'] : null,
        );
      }
      return ApiResponse(success: false, message: body['message'] ?? 'Pembelian gagal.');
    } catch (e) {
      return ApiResponse(success: false, message: 'Koneksi error: $e');
    }
  }

  // ------------------------------------------------------------------------
  // ORDERS / RIWAYAT PESANAN SERVICES
  // ------------------------------------------------------------------------
  static Future<ApiResponse<List<OrderModel>>> getOrders() async {
    try {
      final headers = await _getHeaders();
      final response = await http.get(
        Uri.parse('${ApiConfig.productsUrl}/orders/list'),
        headers: headers,
      ).timeout(const Duration(seconds: 10));

      final body = jsonDecode(response.body);
      if (response.statusCode == 200 && body['success'] == true) {
        final List<dynamic> list = body['data'] ?? [];
        final orders = list.map((item) => OrderModel.fromJson(item)).toList();
        return ApiResponse(success: true, message: body['message'], data: orders);
      }
      return ApiResponse(success: false, message: body['message'] ?? 'Gagal memuat riwayat pesanan.');
    } catch (e) {
      return ApiResponse(success: false, message: 'Koneksi error: $e');
    }
  }

  static Future<ApiResponse<void>> updateOrderStatus(String orderIdOrNumber, String newStatus) async {
    try {
      final headers = await _getHeaders(isJson: true);
      final response = await http.put(
        Uri.parse('${ApiConfig.productsUrl}/orders/$orderIdOrNumber/status'),
        headers: headers,
        body: jsonEncode({'status': newStatus}),
      ).timeout(const Duration(seconds: 10));

      final body = jsonDecode(response.body);
      if (response.statusCode == 200 && body['success'] == true) {
        return ApiResponse(success: true, message: body['message']);
      }
      return ApiResponse(success: false, message: body['message'] ?? 'Gagal mengubah status.');
    } catch (e) {
      return ApiResponse(success: false, message: 'Koneksi error: $e');
    }
  }
}
