import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/category_provider.dart';
import '../../config/theme.dart';
import '../../models/category_model.dart';
import 'category_form_screen.dart';

class CategoryListScreen extends StatefulWidget {
  const CategoryListScreen({super.key});

  @override
  State<CategoryListScreen> createState() => _CategoryListScreenState();
}

class _CategoryListScreenState extends State<CategoryListScreen> {
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<CategoryProvider>(context, listen: false).fetchCategories();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _confirmDelete(BuildContext context, CategoryModel category) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hapus Kategori?'),
        content: Text(
          'Apakah Anda yakin ingin menghapus kategori "${category.name}"?\nSemua produk dalam kategori ini juga akan terhapus.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () async {
              Navigator.pop(ctx);
              final provider = Provider.of<CategoryProvider>(context, listen: false);
              final success = await provider.deleteCategory(category.id);

              if (!mounted) return;
              if (success) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Kategori berhasil dihapus.'),
                    backgroundColor: AppTheme.secondaryColor,
                  ),
                );
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(provider.errorMessage ?? 'Gagal menghapus kategori.'),
                    backgroundColor: Colors.redAccent,
                  ),
                );
              }
            },
            child: const Text('Hapus'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.watch<AuthProvider>(context);
    final catProvider = Provider.watch<CategoryProvider>(context);
    final isAdmin = authProvider.isAdmin;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Kelola Kategori'),
      ),
      floatingActionButton: isAdmin
          ? FloatingActionButton.extended(
              backgroundColor: AppTheme.primaryColor,
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const CategoryFormScreen()),
                );
              },
              icon: const Icon(Icons.add, color: Colors.white),
              label: const Text('Tambah Kategori', style: TextStyle(color: Colors.white)),
            )
          : null,
      body: Column(
        children: [
          // Bar Pencarian Kategori
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.white,
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Cari kategori...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          catProvider.fetchCategories();
                        },
                      )
                    : null,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
              onSubmitted: (val) {
                catProvider.fetchCategories(search: val.trim());
              },
            ),
          ),

          // Pesan jika role Kasir
          if (!isAdmin)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              color: Colors.amber.shade100,
              width: double.infinity,
              child: const Row(
                children: [
                  Icon(Icons.lock_outline, size: 16, color: Colors.brown),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Mode Kasir: Anda hanya dapat melihat daftar kategori.',
                      style: TextStyle(fontSize: 12, color: Colors.brown),
                    ),
                  ),
                ],
              ),
            ),

          // Daftar Kategori
          Expanded(
            child: catProvider.isLoading
                ? const Center(child: CircularProgressIndicator())
                : catProvider.categories.isEmpty
                    ? const Center(child: Text('Tidak ada kategori ditemukan.'))
                    : RefreshIndicator(
                        onRefresh: () => catProvider.fetchCategories(),
                        child: ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: catProvider.categories.length,
                          itemBuilder: (context, index) {
                            final category = catProvider.categories[index];
                            return Card(
                              margin: const EdgeInsets.only(bottom: 12),
                              child: ListTile(
                                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                leading: CircleAvatar(
                                  backgroundColor: AppTheme.primaryColor.withOpacity(0.12),
                                  child: const Icon(Icons.category, color: AppTheme.primaryColor),
                                ),
                                title: Text(
                                  category.name,
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                ),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    if (category.description != null && category.description!.isNotEmpty)
                                      Text(
                                        category.description!,
                                        style: const TextStyle(fontSize: 13, color: AppTheme.textMuted),
                                      ),
                                    const SizedBox(height: 4),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: Colors.grey.shade200,
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        '${category.totalProducts} Produk Terkait',
                                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                                      ),
                                    ),
                                  ],
                                ),
                                trailing: isAdmin
                                    ? Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          IconButton(
                                            icon: const Icon(Icons.edit, color: Colors.blueAccent),
                                            tooltip: 'Edit',
                                            onPressed: () {
                                              Navigator.push(
                                                context,
                                                MaterialPageRoute(
                                                  builder: (_) => CategoryFormScreen(category: category),
                                                ),
                                              );
                                            },
                                          ),
                                          IconButton(
                                            icon: const Icon(Icons.delete, color: Colors.redAccent),
                                            tooltip: 'Hapus',
                                            onPressed: () => _confirmDelete(context, category),
                                          ),
                                        ],
                                      )
                                    : null,
                              ),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}

