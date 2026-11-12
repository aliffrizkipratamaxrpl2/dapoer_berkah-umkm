import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';

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
    try {
      final response = await http.post(
        Uri.parse(ApiConfig.loginUrl),
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      final body = jsonDecode(response.body);
      if (response.statusCode == 200 && body['success'] == true) {
        final token = body['data']['token'];
        await saveToken(token);
        return ApiResponse(success: true, message: body['message'], data: body['data']);
      } else {
        return ApiResponse(success: false, message: body['message'] ?? 'Login gagal.');
      }
    } catch (e) {
      return ApiResponse(success: false, message: 'Koneksi error: $e');
    }
  }

  static Future<ApiResponse<Map<String, dynamic>>> register({
    required String name,
    required String email,
    required String password,
    required String role,
  }) async {
    try {
      final response = await http.post(
        Uri.parse(ApiConfig.registerUrl),
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        body: jsonEncode({
          'name': name,
          'email': email,
          'password': password,
          'role': role,
        }),
      );

      final body = jsonDecode(response.body);
      if (response.statusCode == 201 && body['success'] == true) {
        final token = body['data']['token'];
        await saveToken(token);
        return ApiResponse(success: true, message: body['message'], data: body['data']);
      } else {
        return ApiResponse(success: false, message: body['message'] ?? 'Registrasi gagal.');
      }
    } catch (e) {
      return ApiResponse(success: false, message: 'Koneksi error: $e');
    }
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
  // PRODUCTS SERVICES (CRUD + File Upload)
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

  // Upload Produk Baru (Multipart Form Data untuk gambar, kompatibel Mobile & Web)
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
        request.files.add(
          http.MultipartFile.fromBytes('image', bytes, filename: imageFile.name),
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
        request.files.add(
          http.MultipartFile.fromBytes('image', bytes, filename: imageFile.name),
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
}
